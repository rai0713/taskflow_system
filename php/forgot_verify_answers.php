<?php
/**
 * forgot_verify_answers.php
 * Step 2: Verify security answers (≥2/3 must be correct), then send OTP.
 */
session_start();
require_once 'connect.php';
require_once 'mail_helper.php';

header('Content-Type: application/json; charset=utf-8');

function json_out(bool $success, string $message, array $extra = []): void {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(false, 'Invalid request method.');
}

$accountId = $_SESSION['reset_account_id'] ?? null;
if (!$accountId) {
    json_out(false, 'Session expired. Please start over.');
}

$input = json_decode(file_get_contents('php://input'), true);
$a1 = trim($input['answer_1'] ?? '');
$a2 = trim($input['answer_2'] ?? '');
$a3 = trim($input['answer_3'] ?? '');

if ($a1 === '' || $a2 === '' || $a3 === '') {
    json_out(false, 'All answers are required.');
}

// Fetch stored hashed answers
$stmt = $conn->prepare("SELECT Answer1, Answer2, Answer3 FROM usrsecurity_tbl WHERE AccountID = ? LIMIT 1");
$stmt->bind_param('i', $accountId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_out(false, 'Security data not found.');
}

$sec = $result->fetch_assoc();

// Verify each answer (SHA-256 hex from client vs bcrypt in DB)
$correct = 0;
$wrong = [];

if (password_verify($a1, $sec['Answer1'])) { $correct++; } else { $wrong[] = 1; }
if (password_verify($a2, $sec['Answer2'])) { $correct++; } else { $wrong[] = 2; }
if (password_verify($a3, $sec['Answer3'])) { $correct++; } else { $wrong[] = 3; }

if ($correct < 2) {
    json_out(false, 'At least 2 out of 3 answers must be correct. You got ' . $correct . ' correct.', [
        'wrong' => $wrong
    ]);
}

// Generate 6-digit OTP
$otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);

$_SESSION['reset_otp'] = $otp;
$_SESSION['reset_otp_time'] = time();
$_SESSION['reset_otp_attempts'] = 0;
$_SESSION['reset_answers_verified'] = true;

// Send OTP via mail helper (logs to otp_debug.log in dev mode)
$email    = $_SESSION['reset_email'] ?? '';
$mailSent = send_otp_email($email, $otp);

// Create masked email hint
$emailParts = explode('@', $email);
$localPart = $emailParts[0];
$domain = $emailParts[1] ?? 'email.com';
$hint = substr($localPart, 0, 1) . str_repeat('*', max(strlen($localPart) - 2, 1)) . substr($localPart, -1) . '@' . $domain;

json_out(true, 'Answers verified. OTP sent.', [
    'email_hint' => $hint,
    'mail_sent' => $mailSent
]);
