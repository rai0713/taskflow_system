<?php
require_once '../session_guard.php';
requireLogin();
require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

// Check ownership
$check = $conn->prepare("SELECT GoalID FROM goals_tbl WHERE GoalID = ? AND AccountID = ?");
$check->bind_param("ii", $goal_id, $account_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized or Not Found']);
    exit;
}
$check->close();

$updates = [];
$params = [];
$types = "";

if (isset($input['title'])) { $updates[] = "Title = ?"; $params[] = $input['title']; $types .= "s"; }
if (isset($input['description'])) { $updates[] = "Description = ?"; $params[] = $input['description']; $types .= "s"; }
if (isset($input['target_date'])) { $updates[] = "TargetDate = ?"; $params[] = $input['target_date']; $types .= "s"; }
if (isset($input['status'])) { $updates[] = "Status = ?"; $params[] = $input['status']; $types .= "s"; }
if (isset($input['progress'])) { $updates[] = "Progress = ?"; $params[] = $input['progress']; $types .= "i"; }

if (empty($updates)) {
    echo json_encode(['success' => true, 'message' => 'No changes']);
    exit;
}

$sql = "UPDATE goals_tbl SET " . implode(", ", $updates) . " WHERE GoalID = ? AND AccountID = ?";
$params[] = $goal_id;
$params[] = $account_id;
$types .= "ii";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    log_activity($conn, $account_id, 'Updated Goal', "Updated details for Goal ID: {$goal_id}");
    echo json_encode(['success' => true, 'message' => 'Goal updated']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Update failed']);
}
$stmt->close();
$conn->close();
?>
