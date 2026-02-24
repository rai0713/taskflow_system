<?php
require 'php/connect.php';
session_start();

// Mock session for testing
$accRes = $conn->query("SELECT AccountID FROM usraccount_tbl WHERE role='user' LIMIT 1");
if ($accRes->num_rows == 0) die("No user account found to test with.\n");
$accId = $accRes->fetch_assoc()['AccountID'];
$_SESSION['account_id'] = $accId;

echo "Testing with AccountID: $accId\n";

// 1. Create Task
$title = "Test Task " . rand(100,999);
$desc = "Description for test task";
$priority = "High";
$deadline = date('Y-m-d', strtotime('+7 days'));

echo "Creating task: $title... ";
$stmt = $conn->prepare("INSERT INTO tasks_tbl (AccountID, Title, Description, Priority, Deadline, Status) VALUES (?, ?, ?, ?, ?, 'Pending')");
$stmt->bind_param("issss", $accId, $title, $desc, $priority, $deadline);
if (!$stmt->execute()) die("FAIL: " . $stmt->error . "\n");
$taskId = $stmt->insert_id;
echo "OK (ID: $taskId)\n";

// 2. Read Task
echo "Reading task... ";
$res = $conn->query("SELECT * FROM tasks_tbl WHERE TaskID=$taskId");
if ($res->num_rows === 0) die("FAIL: Task not found\n");
$task = $res->fetch_assoc();
echo "OK ({$task['Title']})\n";

// 3. Update Task
echo "Updating task status... ";
$conn->query("UPDATE tasks_tbl SET Status='Completed' WHERE TaskID=$taskId");
$res = $conn->query("SELECT Status FROM tasks_tbl WHERE TaskID=$taskId");
$status = $res->fetch_assoc()['Status'];
if ($status !== 'Completed') die("FAIL: Status not updated (got $status)\n");
echo "OK\n";

// 4. Delete Task
echo "Deleting task... ";
$conn->query("DELETE FROM tasks_tbl WHERE TaskID=$taskId");
$res = $conn->query("SELECT * FROM tasks_tbl WHERE TaskID=$taskId");
if ($res->num_rows > 0) die("FAIL: Task not deleted\n");
echo "OK\n";

echo "\nALL TESTS PASSED.\n";
