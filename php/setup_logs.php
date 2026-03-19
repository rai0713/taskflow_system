<?php
require_once 'connect.php';

$query = "
CREATE TABLE IF NOT EXISTS activity_logs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Action VARCHAR(255) NOT NULL,
    Details TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES usraccount_tbl(AccountID) ON DELETE CASCADE
);
";

if ($conn->query($query)) {
    echo "Activity logs table created successfully.\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}
?>
