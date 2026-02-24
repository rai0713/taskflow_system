<?php

require_once 'connect.php';
session_start();

header('Content-Type: application/json; charset=utf-8');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
  try{
    $email = $_POST['username_email'];
    $password = $_POST['password'];

    // Basic .env parser
    $env_file = dirname(__DIR__) . '/.env';
    if (file_exists($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($env_name, $env_value) = explode('=', $line, 2);
                $_ENV[trim($env_name)] = trim($env_value, " \t\n\r\0\x0B\"'");
            }
        }
    }

    // Default Superadmin override check
    if (isset($_ENV['DEFAULT_SUPERADMIN_USER']) && isset($_ENV['DEFAULT_SUPERADMIN_PASS'])) {
        if ($email === $_ENV['DEFAULT_SUPERADMIN_USER'] && $password === $_ENV['DEFAULT_SUPERADMIN_PASS']) {
            $_SESSION['user_id'] = 'SYS-SA';
            $_SESSION['account_id'] = 0; // system reserved ID
            $_SESSION['username'] = 'System SuperAdmin';
            $_SESSION['role'] = 'super_admin';
            
            // Log fallback login
            $ip_address = $_SERVER['REMOTE_ADDR'];
            $user_agent = $_SERVER['HTTP_USER_AGENT'];
            $log_sql = "INSERT INTO login_logs (AccountID, ip_address, user_agent, browser_name, action) VALUES (0, ?, ?, 'Fallback', 'login')";
            $log_stmt = $conn->prepare($log_sql);
            $log_stmt->bind_param("ss", $ip_address, $user_agent);
            $log_stmt->execute();
            $log_stmt->close();

            echo json_encode(['success' => true, 'role' => 'super_admin']);
            exit();
        }
    }

    $sql_account = "SELECT AccountID, Username, Password, id_no, role, Status FROM `usraccount_tbl` WHERE Username = ? OR Email = ?";

    $stmt = $conn->prepare($sql_account);
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows === 1){
      $user = $result->fetch_assoc();
      
      // Check if blocked
      if (isset($user['Status']) && $user['Status'] === 'blocked') {
        echo json_encode(['success' => false, 'error' => 'Your account has been blocked. Please contact support.']);
        exit();
      }

      // Check if pending approval
      if (isset($user['Status']) && $user['Status'] === 'pending') {
        echo json_encode(['success' => false, 'error' => 'Wait for Administrator to approval, check your email if you are already approved']);
        exit();
      }

      if(password_verify($password, $user['Password'])){
        // Set Session
        $_SESSION['user_id'] = $user['id_no'];
        $_SESSION['account_id'] = $user['AccountID'];
        $_SESSION['username'] = $user['Username'];
        $_SESSION['role'] = $user['role'];

        // Log Login Event
        $ip_address = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        
        // Simple browser detection
        $browser = 'Unknown';
        if (strpos($user_agent, 'Firefox') !== false) $browser = 'Firefox';
        elseif (strpos($user_agent, 'Chrome') !== false) $browser = 'Chrome';
        elseif (strpos($user_agent, 'Safari') !== false) $browser = 'Safari';
        elseif (strpos($user_agent, 'Edge') !== false) $browser = 'Edge';
        elseif (strpos($user_agent, 'MSIE') !== false || strpos($user_agent, 'Trident/') !== false) $browser = 'Internet Explorer';

        $log_sql = "INSERT INTO login_logs (AccountID, ip_address, user_agent, browser_name, action) VALUES (?, ?, ?, ?, 'login')";
        $log_stmt = $conn->prepare($log_sql);
        $log_stmt->bind_param("isss", $user['AccountID'], $ip_address, $user_agent, $browser);
        $log_stmt->execute();
        $log_stmt->close();

        // Return Data
        echo json_encode(['success' => true, 'role' => $user['role']]);
        exit();
      } else {
        echo json_encode(['success' => false, 'error' => 'Incorrect username/email or password']);
      }
    }
    else {
      $error_message = "Username or email not found.";
      echo json_encode(['success' => false, 'error' => $error_message]);
    }
  }catch(Exception $e){
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
  } // Removed echo before closure

  if (isset($stmt)) $stmt->close();
  $conn->close();
}
?>