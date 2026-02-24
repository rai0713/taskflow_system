<?php
require_once 'session_guard.php';
requireLogin();
require_once 'connect.php';

header('Content-Type: application/json');

$account_id = $_SESSION['account_id'];

// 1. Task Counts
$sql_counts = "SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN Status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as completed
    FROM tasks_tbl WHERE AccountID = ? AND Status != 'Archived'";
$stmt = $conn->prepare($sql_counts);
$stmt->bind_param("i", $account_id);
$stmt->execute();
$counts = $stmt->get_result()->fetch_assoc();
$stmt->close();

// 2. Recent Activity (Latest 5 created tasks)
$sql_recent = "SELECT Title, Status, CreatedAt FROM tasks_tbl WHERE AccountID = ? AND Status != 'Archived' ORDER BY CreatedAt DESC LIMIT 5";
$stmt = $conn->prepare($sql_recent);
$stmt->bind_param("i", $account_id);
$stmt->execute();
$recent_tasks = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// 3. Goals Progress (Simple count)
$sql_goals = "SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN Status = 'Achieved' THEN 1 ELSE 0 END) as achieved
    FROM goals_tbl WHERE AccountID = ?";
$stmt = $conn->prepare($sql_goals);
$stmt->bind_param("i", $account_id);
$stmt->execute();
$goals_stats = $stmt->get_result()->fetch_assoc();
$stmt->close();


echo json_encode([
    'success' => true,
    'stats' => $counts,
    'recent_activity' => $recent_tasks,
    'goals_stats' => $goals_stats
]);

$conn->close();
?>
