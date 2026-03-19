<?php
require_once '../session_guard.php';
requireLogin();

// Strict authorization: Only the System Founder (AccountID 0) can perform this transfer.
if (!isset($_SESSION['account_id']) || $_SESSION['account_id'] !== 0) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Only the System Founder can transfer these credentials.']);
    exit;
}

require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$new_username = trim($data['username'] ?? '');
$new_password = $data['password'] ?? '';

if (empty($new_username) || empty($new_password)) {
    echo json_encode(['success' => false, 'error' => 'Both username and password are required.']);
    exit;
}

if (strlen($new_password) < 8) {
    echo json_encode(['success' => false, 'error' => 'Password must be at least 8 characters.']);
    exit;
}

$env_path = dirname(__DIR__) . '/.env';

$env_content = "";
if (file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES);
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (strpos($trimmed, 'DEFAULT_SUPERADMIN_USER=') === 0) continue;
        if (strpos($trimmed, 'DEFAULT_SUPERADMIN_PASS=') === 0) continue;
        $env_content .= $line . PHP_EOL;
    }
}

// Append new credentials (strip quotes/newlines to prevent breaking the env parser)
$clean_username = str_replace(['"', "'", "\n", "\r"], '', $new_username);
$clean_password = str_replace(['"', "'", "\n", "\r"], '', $new_password);

$env_content .= "DEFAULT_SUPERADMIN_USER=" . $clean_username . PHP_EOL;
$env_content .= "DEFAULT_SUPERADMIN_PASS=" . $clean_password . PHP_EOL;

if (file_put_contents($env_path, $env_content) === false) {
    echo json_encode(['success' => false, 'error' => 'Failed to write to .env file. Check server file permissions.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Credentials transferred successfully.']);
