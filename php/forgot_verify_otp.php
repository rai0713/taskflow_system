<?php
/**
 * forgot_verify_otp.php
 * Step 3: Verify the 6-digit OTP code.
 */
session_start();

header('Content-Type: application/json; charset=utf-8');

function json_out(bool $success, string $message, array $extra = []): void {
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(false, 'Invalid request method.');
}

$accountId = $_SESSION['reset_account_id'] ?? null;
$storedOtp = $_SESSION['reset_otp'] ?? null;
$otpTime = $_SESSION['reset_otp_time'] ?? 0;
$attempts = $_SESSION['reset_otp_attempts'] ?? 0;

if (!$accountId || !$storedOtp) {
    json_out(false, 'Session expired. Please start over.');
}

// Max 5 attempts
if ($attempts >= 5) {
    // Clear OTP to force resend
    unset($_SESSION['reset_otp']);
    json_out(false, 'Too many attempts. Please resend the OTP.');
}

// Check expiry (5 minutes)
if ((time() - $otpTime) > 300) {
    unset($_SESSION['reset_otp']);
    json_out(false, 'OTP has expired. Please resend.');
}

$input = json_decode(file_get_contents('php://input'), true);
$otp = trim($input['otp'] ?? '');

if ($otp === '' || strlen($otp) !== 6) {
    json_out(false, 'Please enter the 6-digit OTP code.');
}

$_SESSION['reset_otp_attempts'] = $attempts + 1;

if ($otp !== $storedOtp) {
    $remaining = 5 - ($attempts + 1);
    json_out(false, 'Invalid OTP. ' . $remaining . ' attempt(s) remaining.');
}

// OTP verified
$_SESSION['reset_otp_verified'] = true;
unset($_SESSION['reset_otp']); // consume OTP

json_out(true, 'OTP verified successfully.');
