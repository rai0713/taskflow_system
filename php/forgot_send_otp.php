<?php
/**
 * forgot_send_otp.php
 * Resend OTP endpoint — rate-limited to 2 minutes between sends.
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
$answersVerified = $_SESSION['reset_answers_verified'] ?? false;

if (!$accountId || !$answersVerified) {
    json_out(false, 'Session expired. Please start over.');
}

// Rate limit: 2 minutes between sends
$lastSent = $_SESSION['reset_otp_time'] ?? 0;
$elapsed = time() - $lastSent;

if ($elapsed < 120) {
    $remaining = 120 - $elapsed;
    json_out(false, 'Please wait ' . $remaining . ' seconds before resending.');
}

// Generate new 6-digit OTP
$otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);

$_SESSION['reset_otp'] = $otp;
$_SESSION['reset_otp_time'] = time();
$_SESSION['reset_otp_attempts'] = 0;

// Send via mail helper (logs to otp_debug.log in dev mode)
$email = $_SESSION['reset_email'] ?? '';
send_otp_email($email, $otp);

json_out(true, 'New OTP sent to your email.');
