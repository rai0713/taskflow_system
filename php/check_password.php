<?php
require_once 'connect.php';

function sanitizePassword($password) {
    return htmlspecialchars($password, ENT_QUOTES, 'UTF-8');
}

if (isset($_GET['password'])) {
    $password = sanitizePassword($_GET['password']);
    
    $sql_check_password = "SELECT password FROM usraccount_tbl"; // Correct SQL query to fetch passwords
    $result_password = $conn->query($sql_check_password);
    
    if ($result_password && $result_password->num_rows > 0) { // Ensure result is valid and contains rows
        // Loop through all passwords in the database
        while ($row = $result_password->fetch_assoc()) {
            if (password_verify($password, $row['password'])) { // Verify if password matches any stored hash
                // Return true if password is found in the database
                echo json_encode(["exists" => "true"]);
                exit();
            }
        }
        // If no match is found after looping, return false
        echo json_encode(["exists" => "false"]);
    } else {
        // If no results from the query, return false
        echo json_encode(["exists" => "false"]);
    }
}
?>
