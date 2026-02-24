<?php
require_once '../session_guard.php';
requireLogin();

require_once '../connect.php';

header('Content-Type: application/json');

$account_id = $_SESSION['account_id'];

// Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS tasks_tbl (
    TaskID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Priority VARCHAR(50) DEFAULT 'Medium',
    Deadline DATE NULL,
    Status VARCHAR(50) DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES usraccount_tbl(AccountID) ON DELETE CASCADE
)");

$sql = "SELECT * FROM tasks_tbl WHERE AccountID = ? AND Status != 'Archived' ORDER BY CreatedAt DESC";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $account_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    echo json_encode(['success' => true, 'tasks' => $tasks]);
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}

$conn->close();
?>
