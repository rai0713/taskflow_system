<?php
function log_activity($conn, $accountId, $action, $details = null) {
    // AccountID 0 is the hardcoded .env superadmin which is not in the database.
    // We cannot log it or it will throw a Foreign Key constraint failure.
    if (!$conn || !$accountId || !$action || $accountId === 0) {
        return false;
    }

    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $query = "INSERT INTO activity_logs (AccountID, Action, Details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("issss", $accountId, $action, $details, $ipAddress, $userAgent);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
    return false;
}
?>
