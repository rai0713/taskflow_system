<?php
require_once '../session_guard.php';
requireLogin();
require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$goal_id = $input['goal_id'];
$account_id = $_SESSION['account_id'];

if (!$goal_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Goal ID required']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM goals_tbl WHERE GoalID = ? AND AccountID = ?");
$stmt->bind_param("ii", $goal_id, $account_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        log_activity($conn, $account_id, 'Deleted Goal', "Deleted Goal ID: {$goal_id}");
        echo json_encode(['success' => true, 'message' => 'Goal deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Goal not found or unauthorized']);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Delete failed']);
}
$stmt->close();
$conn->close();
?>
