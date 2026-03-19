<?php
require_once '../session_guard.php';
requireLogin();

require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (empty($data['title'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Title is required']);
    exit;
}

$title = $data['title'];
$description = $data['description'] ?? '';
$priority = $data['priority'] ?? 'Medium';
$deadline = !empty($data['deadline']) ? $data['deadline'] : null;

if ($deadline) {
    $deadlineDate = date('Y-m-d', strtotime($deadline));
    $today = date('Y-m-d');
    if ($deadlineDate < $today) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Deadline cannot be in the past.']);
        exit;
    }
}

$status = 'Pending';
$account_id = $_SESSION['account_id'];

$stmt = $conn->prepare("INSERT INTO tasks_tbl (AccountID, Title, Description, Priority, Deadline, Status) VALUES (?, ?, ?, ?, ?, ?)");
if ($stmt) {
    $stmt->bind_param("isssss", $account_id, $title, $description, $priority, $deadline, $status);
    
    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        log_activity($conn, $account_id, 'Created Task', "Created new task: {$title}");
        echo json_encode(['success' => true, 'message' => 'Task created successfully', 'id' => $newId]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
}

$conn->close();
?>
