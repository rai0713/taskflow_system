<?php
require_once '../session_guard.php';
requireLogin();
requireAdmin();
require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

try {
    if ($_SESSION['role'] !== 'super_admin') {
        throw new Exception("Only Super Admins can perform Basis actions.");
    }

    $target_id = $_POST['target_id'] ?? null;
    $action = $_POST['action'] ?? null;
    $court_number = trim($_POST['court_number'] ?? '');
    $reason = trim($_POST['reason'] ?? '');

    if (!$target_id || !$action || !$court_number || !$reason) {
        throw new Exception("Missing required fields (Target, Action, Court Number, or Reason).");
    }

    if ($target_id == $_SESSION['account_id']) {
        throw new Exception("Cannot block your own account.");
    }

    if (!isset($_FILES['attachment']) || $_FILES['attachment']['error'] === UPLOAD_ERR_NO_FILE) {
        throw new Exception("An attachment (PDF/Image) is required as a basis.");
    }

    // 1. Create table if not exists (Removed ActionByAdminID FK to allow God Mode ID 0)
    $conn->query("CREATE TABLE IF NOT EXISTS action_basis_tbl (
        BasisID INT AUTO_INCREMENT PRIMARY KEY,
        TargetAccountID INT NOT NULL,
        ActionByAdminID INT NOT NULL,
        CourtNumber VARCHAR(100) NOT NULL,
        Reason TEXT NOT NULL,
        FilePath VARCHAR(255) NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (TargetAccountID) REFERENCES usraccount_tbl(AccountID) ON DELETE CASCADE
    )");

    // Safety fallback: if table exists with old constraint, drop it
    try {
        $conn->query("ALTER TABLE action_basis_tbl DROP FOREIGN KEY action_basis_tbl_ibfk_2");
    } catch (Exception $fallbackE) {
        // Ignore if constraint doesn't exist
    }

    // 2. Upload file
    $uploadDir = dirname(__DIR__, 2) . '/uploads/basis_documents/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileInfo = pathinfo($_FILES['attachment']['name']);
    $extension = strtolower($fileInfo['extension']);
    $allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];

    if (!in_array($extension, $allowedExts)) {
        throw new Exception("Invalid file type. Only PDF and Images are allowed.");
    }

    // Generate unique filename
    $newFileName = 'basis_' . time() . '_' . $target_id . '.' . $extension;
    $targetFilePath = $uploadDir . $newFileName;

    if (!move_uploaded_file($_FILES['attachment']['tmp_name'], $targetFilePath)) {
        throw new Exception("Failed to upload the attachment.");
    }

    $conn->begin_transaction();

    // 3. Insert basis record
    $relativePath = '/uploads/basis_documents/' . $newFileName;
    $stmtBasis = $conn->prepare("INSERT INTO action_basis_tbl (TargetAccountID, ActionByAdminID, CourtNumber, Reason, FilePath) VALUES (?, ?, ?, ?, ?)");
    $stmtBasis->bind_param("iisss", $target_id, $_SESSION['account_id'], $court_number, $reason, $relativePath);
    $stmtBasis->execute();

    // 4. Update the actual account status to blocked
    $stmtBlock = $conn->prepare("UPDATE usraccount_tbl SET Status = ? WHERE AccountID = ?");
    $stmtBlock->bind_param("si", $action, $target_id);
    $stmtBlock->execute();

    log_activity($conn, $_SESSION['account_id'], 'Blocked Account (with Basis)', "Status of Account ID {$target_id} changed to {$action}. Evidence stored at {$relativePath}");

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Action executed with valid basis.']);

} catch (Exception $e) {
    if (isset($conn) && $conn->errno) {
        $conn->rollback();
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
