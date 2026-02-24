<?php
require_once '../session_guard.php';
requireLogin();

require_once '../connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

$stmt = $conn->prepare("DELETE FROM tasks_tbl WHERE TaskID = ? AND AccountID = ?");
$stmt->bind_param("ii", $task_id, $account_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Task deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Task not found or unauthorized']);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Delete failed']);
}

$stmt->close();
$conn->close();
?>
