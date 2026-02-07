<?php

require_once 'connect.php';
session_start();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
  try{
    $email = $_POST['username_email'];
    $password = $_POST['password'];

    $sql_account = "SELECT * FROM `usraccount_tbl` WHERE Username = ? OR Email = ?";

    $stmt = $conn->prepare($sql_account);
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows === 1){
      $user = $result->fetch_assoc();
      if(password_verify($password, $user['Password'])){
        $_SESSION['user_id'] = $user['id_no'];
        $_SESSION['username'] = $user['Username'];
        echo json_encode(['success' => true]);
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
    echo 'You have an error: '.  $e->getMessage();
  }


  $stmt->close();
  $conn->close();
}

?>