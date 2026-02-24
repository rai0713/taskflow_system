<?php
/**
 * forgot_verify_identity.php
 * Step 1: Verify email or ID number exists, return security questions.
 */
session_start();
require_once 'connect.php';

header('Content-Type: application/json; charset=utf-8');

function json_out(bool $success, string $message, array $extra = []): void {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(false, 'Invalid request method.');
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = trim($input['identifier'] ?? '');

if ($identifier === '') {
    json_out(false, 'Please enter your email or ID number.');
}

// Search by email OR id_no
$stmt = $conn->prepare("SELECT AccountID, Email FROM usraccount_tbl WHERE Email = ? OR id_no = ? LIMIT 1");
$stmt->bind_param('ss', $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_out(false, 'No account found with that email or ID number.');
}

$account = $result->fetch_assoc();
$accountId = (int)$account['AccountID'];

// Ensure security table exists
$conn->query("
    CREATE TABLE IF NOT EXISTS usrsecurity_tbl (
        SecurityID INT AUTO_INCREMENT PRIMARY KEY,
        AccountID INT NOT NULL,
        Question1 VARCHAR(100) NOT NULL,
        Answer1 VARCHAR(255) NOT NULL,
        Question2 VARCHAR(100) NOT NULL,
        Answer2 VARCHAR(255) NOT NULL,
        Question3 VARCHAR(100) NOT NULL,
        Answer3 VARCHAR(255) NOT NULL,
        FOREIGN KEY (AccountID) REFERENCES usraccount_tbl(AccountID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Fetch security questions
$stmt2 = $conn->prepare("SELECT Question1, Question2, Question3 FROM usrsecurity_tbl WHERE AccountID = ? LIMIT 1");
$stmt2->bind_param('i', $accountId);
$stmt2->execute();
$secResult = $stmt2->get_result();

if ($secResult->num_rows === 0) {
    json_out(false, 'No security questions found for this account. Please contact support.');
}

$sec = $secResult->fetch_assoc();

// Store account ID in session for next steps
$_SESSION['reset_account_id'] = $accountId;
$_SESSION['reset_email'] = $account['Email'];

// Clear any previous OTP state
unset($_SESSION['reset_otp'], $_SESSION['reset_otp_time'], $_SESSION['reset_otp_verified'], $_SESSION['reset_otp_attempts']);

json_out(true, 'Account found.', [
    'questions' => [$sec['Question1'], $sec['Question2'], $sec['Question3']]
]);
