<?php
require_once '../session_guard.php';
requireLogin();
require_once '../connect.php';

header('Content-Type: application/json');

$account_id = $_SESSION['account_id'];

// Create table if not exists (GoalID, AccountID, Title, Description, TargetDate, Status, Progress, CreatedAt)
$conn->query("CREATE TABLE IF NOT EXISTS goals_tbl (
    GoalID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    TargetDate DATE,
    Status ENUM('In Progress', 'Achieved') DEFAULT 'In Progress',
    Progress INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES usraccount_tbl(AccountID) ON DELETE CASCADE
)");

$sql = "SELECT * FROM goals_tbl WHERE AccountID = ? ORDER BY CreatedAt DESC";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $account_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $goals = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['success' => true, 'goals' => $goals]);
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
$conn->close();
?>
