<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/connect.php';
require_once __DIR__ . '/log_helper.php';
session_start();

if (isset($_SESSION['account_id'])) {
    // Only attempt to log into the database if the user actually exists in the DB
    if ($_SESSION['account_id'] !== 0) {
        $ip_address = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        $browser = 'Unknown';
        
        $log_sql = "INSERT INTO login_logs (AccountID, ip_address, user_agent, browser_name, action) VALUES (?, ?, ?, ?, 'logout')";
        $log_stmt = $conn->prepare($log_sql);
        if ($log_stmt) {
            $log_stmt->bind_param("isss", $_SESSION['account_id'], $ip_address, $user_agent, $browser);
            $log_stmt->execute();
            $log_stmt->close();
        }
        
        // Global Activity log
        log_activity($conn, $_SESSION['account_id'], 'System Logout', 'User logged out');
    }
}

session_unset();
session_destroy();
header("Location: " . BASE . "/html/index.html");
exit();
?>
