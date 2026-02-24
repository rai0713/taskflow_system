<?php
require_once 'connect.php';

header('Content-Type: application/json; charset=utf-8');

function json_response(bool $exists): void
{
    echo json_encode(['exists' => $exists]);
    exit;
}

if (!isset($_GET['id_no'])) {
    json_response(false);
}

// Keep raw value for DB lookup; just trim
$idNumber = trim((string)$_GET['id_no']);

$stmt = $conn->prepare('SELECT 1 FROM usraccount_tbl WHERE id_no = ? LIMIT 1');
$stmt->bind_param('s', $idNumber);
$stmt->execute();
$stmt->store_result();

json_response($stmt->num_rows > 0);
