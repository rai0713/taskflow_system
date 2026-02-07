<?php
  $HOSTNAME = 'localhost';
  $USERNAME = 'root';
  $DATABASE = 'taskflow_db';
  $PASSWORD = '';
  
  $conn = new mysqli($HOSTNAME, $USERNAME, $PASSWORD, $DATABASE);
  
  if ($conn->connect_error) {
      die('Connection failed: ' . $conn->connect_error);
  }
?>