<?php
/**
 * forgot_reset_password.php
 * Step 4: Set new password after OTP verification.
 */
session_start();
require_once 'connect.php';
require_once 'log_helper.php';

header('Content-Type: application/json; charset=utf-8');

function json_out(bool $success, string $message, array $extra = []): void {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(false, 'Invalid request method.');
}

$accountId = $_SESSION['reset_account_id'] ?? null;
$otpVerified = $_SESSION['reset_otp_verified'] ?? false;

if (!$accountId || !$otpVerified) {
    json_out(false, 'Unauthorized. Please complete the verification process first.');
}

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

// Server-side validation (same rules as registration)
if (strlen($password) < 8 || strlen($password) > 20) {
    json_out(false, 'Password must be between 8 and 20 characters.');
}

// Hash the new password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Update in database
$stmt = $conn->prepare("UPDATE usraccount_tbl SET Password = ? WHERE AccountID = ?");
$stmt->bind_param('si', $hashedPassword, $accountId);

if (!$stmt->execute()) {
    json_out(false, 'Failed to update password. Please try again.');
}

// Log Activity
log_activity($conn, $accountId, 'Password Reset', "User reset their password via Forgot Password OTP");

// Clear all reset session variables
unset(
    $_SESSION['reset_account_id'],
    $_SESSION['reset_email'],
    $_SESSION['reset_otp'],
    $_SESSION['reset_otp_time'],
    $_SESSION['reset_otp_attempts'],
    $_SESSION['reset_otp_verified'],
    $_SESSION['reset_answers_verified']
);

json_out(true, 'Password has been reset successfully. You can now login with your new password.');
