<?php
require_once '../session_guard.php';
requireLogin();

require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$task_id = $input['task_id'];
$account_id = $_SESSION['account_id'];

if (!$task_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Task ID required']);
    exit;
}

// Ensure the task belongs to the user
$check = $conn->prepare("SELECT TaskID FROM tasks_tbl WHERE TaskID = ? AND AccountID = ?");
$check->bind_param("ii", $task_id, $account_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized or Task Not Found']);
    exit;
}
$check->close();

// Update fields dynamically? For simplicity, we update specific ones if present
$updates = [];
$params = [];
$types = "";

if (isset($input['status'])) {
    $updates[] = "Status = ?";
    $params[] = $input['status'];
    $types .= "s";
}
if (isset($input['title'])) {
    $updates[] = "Title = ?";
    $params[] = $input['title'];
    $types .= "s";
}
if (isset($input['description'])) {
    $updates[] = "Description = ?";
    $params[] = $input['description'];
    $types .= "s";
}
if (isset($input['priority'])) {
    $updates[] = "Priority = ?";
    $params[] = $input['priority'];
    $types .= "s";
}
if (isset($input['deadline'])) {
    $deadline_date = date('Y-m-d', strtotime($input['deadline']));
    $current_date = date('Y-m-d');
    
    if ($deadline_date < $current_date) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Deadline cannot be in the past.']);
        exit;
    }

    $updates[] = "Deadline = ?";
    $params[] = $input['deadline'];
    $types .= "s";
}

if (empty($updates)) {
    echo json_encode(['success' => true, 'message' => 'No changes made']);
    exit;
}

$sql = "UPDATE tasks_tbl SET " . implode(", ", $updates) . " WHERE TaskID = ? AND AccountID = ?";
$params[] = $task_id;
$params[] = $account_id;
$types .= "ii";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    log_activity($conn, $account_id, 'Updated Task', "Updated task details for Task ID {$task_id}");
    echo json_encode(['success' => true, 'message' => 'Task updated']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Update failed: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>
