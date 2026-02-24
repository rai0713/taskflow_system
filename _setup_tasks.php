<?php
require 'php/connect.php';

$sql = "CREATE TABLE IF NOT EXISTS tasks_tbl (
    TaskID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    Deadline DATE,
    Status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES usraccount_tbl(AccountID) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Table tasks_tbl created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}
$conn->close();
?>
