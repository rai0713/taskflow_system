<?php

require_once 'connect.php';

function sanitizeUsername($username) {
    return htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
}

if (isset($_GET['username'])) {
    $username = sanitizeUsername($_GET['username']);

    error_log("Checking for username: $username");

    $stmt = $conn->prepare('SELECT `Username` FROM usraccount_tbl WHERE Username = ?');
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['exists' => true]);
    } else {
        echo json_encode(['exists' => false]);
    }

    $stmt->close();
}


?>
