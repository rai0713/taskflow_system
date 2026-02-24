<?php
require_once 'connect.php';

try {
    // Check if column exists
    $check = $conn->query("SHOW COLUMNS FROM usraccount_tbl LIKE 'Status'");
    if ($check->num_rows == 0) {
        // Add column
        $sql = "ALTER TABLE usraccount_tbl ADD COLUMN Status ENUM('active', 'blocked') DEFAULT 'active'";
        if ($conn->query($sql) === TRUE) {
            echo "Column 'Status' added successfully.";
        } else {
            echo "Error adding column: " . $conn->error;
        }
    } else {
        echo "Column 'Status' already exists.";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
