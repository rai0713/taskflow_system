<?php

require_once 'connect.php';

$conn = new mysqli($HOSTNAME, $USERNAME, $PASSWORD, $DATABASE);

if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
}

function sanitizeUsername($username) {
    return htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
}

if(isset($_GET['id_no'])){
    $idNumber = sanitizeUsername($_GET['id_no']);

    error_log("Checking for ID number: $idNumber");

    $stmt = $conn->prepare('SELECT `id_no` FROM usraccount_tbl WHERE id_no = ?');
    $stmt->bind_param("s", $idNumber);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['exists' => true]);
    } else {
        echo json_encode(['exists' => false]);
    }

}
?>
