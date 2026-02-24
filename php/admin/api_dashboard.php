<?php
require_once '../session_guard.php';
requireLogin();
requireAdmin();

require_once '../connect.php';

header('Content-Type: application/json');

try {
    // Total Users
    $resUser = $conn->query("SELECT COUNT(*) as cnt FROM usraccount_tbl WHERE role='user'");
    $totalUsers = $resUser->fetch_assoc()['cnt'];

    // Total Admins
    $resAdmin = $conn->query("SELECT COUNT(*) as cnt FROM usraccount_tbl WHERE role IN ('admin', 'super_admin')");
    $totalAdmins = $resAdmin->fetch_assoc()['cnt'];

    // Logins Today
    $today = date('Y-m-d');
    $stmt = $conn->prepare("SELECT COUNT(*) as cnt FROM login_logs WHERE action='login' AND DATE(created_at) = ?");
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $loginsToday = $stmt->get_result()->fetch_assoc()['cnt'];

    // Recent Logs (Limit 5)
    $logs = [];
    $logSql = "SELECT 
                l.LogID, 
                l.ip_address, 
                l.user_agent, 
                l.created_at as login_time, 
                u.Username, 
                u.role,
                (SELECT created_at 
                 FROM login_logs lo 
                 WHERE lo.AccountID = l.AccountID 
                   AND lo.action = 'Logout' 
                   AND lo.created_at > l.created_at 
                 ORDER BY lo.created_at ASC 
                 LIMIT 1) as logout_time
              FROM login_logs l
              JOIN usraccount_tbl u ON l.AccountID = u.AccountID
              WHERE l.action = 'Login'
              ORDER BY l.created_at DESC
              LIMIT 5";
    $logRes = $conn->query($logSql);
    while($row = $logRes->fetch_assoc()) {
        $logs[] = $row;
    }

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalUsers' => $totalUsers,
            'totalAdmins' => $totalAdmins,
            'loginsToday' => $loginsToday
        ],
        'recentLogs' => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
