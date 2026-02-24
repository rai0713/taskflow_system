<?php
require_once '../session_guard.php';
requireSuperAdmin();
require_once '../connect.php';

header('Content-Type: application/json');

try {
    // Pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    // Initialize WHERE clause for Logins only
    $whereClause = "WHERE l.action = 'Login'";
    $params = [];
    $types = "";

    // Search logic
    if ($search) {
        $whereClause .= " AND (u.Username LIKE ? OR l.ip_address LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "ss";
    }

    // Query to get Logins and find the NEXT logout for that user
    $query = "SELECT 
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
              $whereClause
              ORDER BY l.created_at DESC
              LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($query);

    // Bind params
    if ($types) {
        // Unpack params array + limit + offset
        $bindParams = array_merge($params, [$limit, $offset]);
        $stmt->bind_param($types . "ii", ...$bindParams);
    } else {
        $stmt->bind_param("ii", $limit, $offset);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $logs = $result->fetch_all(MYSQLI_ASSOC);

    // Count total for pagination (Logins only)
    $countQuery = "SELECT COUNT(*) as total 
                   FROM login_logs l 
                   JOIN usraccount_tbl u ON l.AccountID = u.AccountID 
                   $whereClause";
    
    if ($types) {
        $stmtCount = $conn->prepare($countQuery);
        $stmtCount->bind_param($types, ...$params);
        $stmtCount->execute();
        $totalResult = $stmtCount->get_result();
        $totalLogs = $totalResult->fetch_assoc()['total'];
    } else {
        $totalResult = $conn->query($countQuery);
        $totalLogs = $totalResult->fetch_assoc()['total'];
    }

    $totalPages = ceil($totalLogs / $limit);

    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_logs' => $totalLogs
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
