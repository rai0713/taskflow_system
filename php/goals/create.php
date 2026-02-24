<?php
require_once '../session_guard.php';
requireLogin();
require_once '../connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['title'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Title is required']);
    exit;
}

$account_id = $_SESSION['account_id'];
$title = $input['title'];
$description = $input['description'] ?? '';
$target_date = !empty($input['target_date']) ? $input['target_date'] : null;
$progress = isset($input['progress']) ? (int)$input['progress'] : 0;
$status = 'In Progress';

$stmt = $conn->prepare("INSERT INTO goals_tbl (AccountID, Title, Description, TargetDate, Progress, Status) VALUES (?, ?, ?, ?, ?, ?)");
if ($stmt) {
    $stmt->bind_param("isssis", $account_id, $title, $description, $target_date, $progress, $status);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Goal created', 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed']);
}
$conn->close();
?>
