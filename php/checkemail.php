<?php

require_once 'connect.php';

function sanitizeUsername($email) {
    return htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
}

if (isset($_GET['email'])) {
    $email = sanitizeUsername($_GET['email']);

    error_log("Checking for email: $email");

    $stmt = $conn->prepare('SELECT `Email` FROM usraccount_tbl WHERE Email = ?');
    $stmt->bind_param("s", $email);
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
