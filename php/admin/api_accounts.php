<?php
require_once '../session_guard.php';
requireAdmin(); // Both admins and super_admins can reach this

require_once '../connect.php';
require_once '../log_helper.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// Helper to get input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            // Fetch Single User Details (Full)
            $id = $_GET['id'];
            $sql = "SELECT 
                        u.AccountID, u.Username, u.Email, u.role, u.id_no, u.Status,
                        i.firstName, i.middleName, i.lastName, i.extName, i.sex, i.DOB,
                        a.`Prk/Barangay`, a.`City/Municipality`, a.Province, a.Country, a.`Zip Code`        
                    FROM usraccount_tbl u
                    LEFT JOIN usrinfo_tbl i ON u.AccountID = i.AccountID
                    LEFT JOIN usraddress_tbl a ON u.AccountID = a.AccountID
                    WHERE u.AccountID = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                echo json_encode(['success' => true, 'user' => $row]);
            } else {
                echo json_encode(['success' => false, 'error' => 'User not found']);
            }
        } else {
            // List Accounts with Status
            $tab = $_GET['tab'] ?? 'active'; // Default to active/blocked

            if ($tab === 'pending') {
                $sql = "SELECT AccountID, Username, Email, role, id_no, Status FROM usraccount_tbl WHERE Status = 'pending' ORDER BY AccountID DESC";
            } else {
                $sql = "SELECT AccountID, Username, Email, role, id_no, Status FROM usraccount_tbl WHERE Status IN ('active', 'blocked') ORDER BY AccountID DESC";
            }
            
            $res = $conn->query($sql);
            $accounts = [];
            while($row = $res->fetch_assoc()) {
                $accounts[] = $row;
            }
            echo json_encode(['success' => true, 'accounts' => $accounts]);
        }
    }
    
    elseif ($method === 'POST') {
        // Create Account - Full Validation keying off register.php logic
        $data = getJsonInput();
        
        // Required fields mapping
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $id_no = trim($data['id_no'] ?? '');
        $role = $data['role'] ?? 'user';

        if ($_SESSION['role'] !== 'super_admin' && $role !== 'user') {
            throw new Exception("Admins can only create 'User' accounts.");
        }

        // Personal
        $fname = trim($data['first_name'] ?? '');
        $lname = trim($data['last_name'] ?? '');
        $mname = trim($data['middle_initial'] ?? ''); // optional
        $extname = trim($data['ext_name'] ?? '');     // optional
        $sex = trim($data['sex'] ?? '');
        $dob = trim($data['birthdate'] ?? '');

        // Address
        $purok = trim($data['purok'] ?? '');
        $barangay = trim($data['barangay'] ?? '');
        $city = trim($data['city'] ?? '');
        $province = trim($data['province'] ?? '');
        $country = trim($data['country'] ?? '');
        $zip = trim($data['zip'] ?? '');

        // Security
        $sq1 = trim($data['sq1'] ?? ''); $sa1 = trim($data['sa1'] ?? '');
        $sq2 = trim($data['sq2'] ?? ''); $sa2 = trim($data['sa2'] ?? '');
        $sq3 = trim($data['sq3'] ?? ''); $sa3 = trim($data['sa3'] ?? '');
        
        // Basic Checks
        if (!$username || !$email || !$password || !$id_no) throw new Exception("Missing account fields");
        if (!$fname || !$lname || !$sex || !$dob) throw new Exception("Missing personal fields");
        if (!$purok || !$city || !$province || !$country || !$zip) throw new Exception("Missing address fields");
        if (!$sq1 || !$sa1 || !$sq2 || !$sa2 || !$sq3 || !$sa3) throw new Exception("Missing security questions");

        // Duplicate Check
        $stmt = $conn->prepare("SELECT AccountID FROM usraccount_tbl WHERE Username=? OR Email=?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) throw new Exception("Username or Email already exists");

        // ID Check
        if (!preg_match('/^\d{4}-\d{4}$/', $id_no)) throw new Exception('Invalid ID format (####-####)');

        $conn->begin_transaction();

        // 1. Account
        $hashedInfo = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO usraccount_tbl (Username, Password, Email, role, id_no, Status) VALUES (?, ?, ?, ?, ?, 'active')");
        $stmt->bind_param("sssss", $username, $hashedInfo, $email, $role, $id_no);
        $stmt->execute();
        $newId = $conn->insert_id;

        // 2. Info
        $stmt = $conn->prepare("INSERT INTO usrinfo_tbl (AccountID, firstName, middleName, lastName, extName, sex, DOB) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssss", $newId, $fname, $mname, $lname, $extname, $sex, $dob);
        $stmt->execute();

        // 3. Address
        $stmt = $conn->prepare("INSERT INTO usraddress_tbl (AccountID, `Prk/Barangay`, `City/Municipality`, Province, Country, `Zip Code`) VALUES (?, ?, ?, ?, ?, ?)");
        $intZip = (int)$zip;
        $stmt->bind_param("issssi", $newId, $purok, $city, $province, $country, $intZip);
        $stmt->execute();

        // 4. Security (Answers should be hashed)
        // Note: register.js sends already-hashed answers (SHA256)? No, register.js sends hex.
        // register.php hashes them AGAIN with bcrypt.
        // We will assume admin sends raw or hex, we hash with bcrypt here.
        // For consistency with register.php:
        $hsa1 = password_hash($sa1, PASSWORD_DEFAULT);
        $hsa2 = password_hash($sa2, PASSWORD_DEFAULT);
        $hsa3 = password_hash($sa3, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO usrsecurity_tbl (AccountID, Question1, Answer1, Question2, Answer2, Question3, Answer3) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssss", $newId, $sq1, $hsa1, $sq2, $hsa2, $sq3, $hsa3);
        $stmt->execute();
        
        // 5. Log Activity
        log_activity($conn, $_SESSION['account_id'], 'Created Account', "Created new {$role} account for {$username} ({$id_no})");

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Account created successfully']);
    }
    
    elseif ($method === 'PUT') {
        // Update Account or Status
        $data = getJsonInput();
        $id = $data['account_id'];
        
        if (!$id) throw new Exception("ID required");

        // Status Update (Unblock or Admin Block)
        // Status Update (Unblock, Approve, or Admin Block)
        // Superadmin blocks usually go through api_accounts_basis.php, but if they unblock, it comes here.
        if (isset($data['status'])) {
            $status = $data['status']; // 'active' or 'blocked', (or pending, but usually moving FROM pending to active)
            if (!in_array($status, ['active', 'blocked', 'pending'])) throw new Exception("Invalid status");
            
            // Prevent self-block
            if ($id == $_SESSION['account_id']) throw new Exception("Cannot block your own account");

            $stmtTarget = $conn->prepare("SELECT Username, Email, role, Status FROM usraccount_tbl WHERE AccountID=?");
            $stmtTarget->bind_param("i", $id);
            $stmtTarget->execute();
            $targetUser = $stmtTarget->get_result()->fetch_assoc();
            if (!$targetUser) throw new Exception("User not found");

            if ($_SESSION['role'] === 'admin') {
                if ($targetUser['role'] === 'admin' || $targetUser['role'] === 'super_admin') {
                    throw new Exception("Admins cannot alter the status of other Admins or Super Admins");
                }
            }

            // --- REJECTION LOGIC ---
            // If the user was pending and the admin clicked "Reject" (sent status='blocked')
            if ($targetUser['Status'] === 'pending' && $status === 'blocked') {
                require_once '../mail_helper.php';
                
                // 1. Update the Account to Blocked
                $stmt = $conn->prepare("UPDATE usraccount_tbl SET Status='blocked' WHERE AccountID=?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                
                // 2. Send Rejection Email
                send_registration_rejected_email($targetUser['Email'], $targetUser['Username']);
                
                log_activity($conn, $_SESSION['account_id'], 'Rejected Application', "Rejected pending registration for {$targetUser['Username']} (Marked as Blocked)");
                
                echo json_encode(['success' => true, 'message' => "Application Rejected and Account Blocked"]);
                exit;
            }
            // -----------------------

            $stmt = $conn->prepare("UPDATE usraccount_tbl SET Status=? WHERE AccountID=?");
            $stmt->bind_param("si", $status, $id);
            $stmt->execute();
            
            // --- APPROVAL EMAIL LOGIC ---
            if ($targetUser['Status'] === 'pending' && $status === 'active') {
                require_once '../mail_helper.php';
                send_registration_approved_email($targetUser['Email'], $targetUser['Username']);
            }
            // ----------------------------
            
            log_activity($conn, $_SESSION['account_id'], 'Updated Account Status', "Changed status of account ID {$id} to {$status}");
            
            $actionWord = ($status === 'active' && $targetUser['Status'] === 'pending') ? 'Approved' : ucfirst($status);
            echo json_encode(['success' => true, 'message' => "Account $actionWord"]);
            exit;
        }

        // Role Update (Promote/Demote)
        if (isset($data['new_role'])) {
            if ($_SESSION['role'] !== 'super_admin') {
                throw new Exception("Only Super Admins can change roles.");
            }
            $newRole = $data['new_role'];
            if (!in_array($newRole, ['user', 'admin', 'super_admin'])) throw new Exception("Invalid role");

            if ($id == $_SESSION['account_id']) throw new Exception("Cannot change your own role");

            $stmt = $conn->prepare("UPDATE usraccount_tbl SET role=? WHERE AccountID=?");
            $stmt->bind_param("si", $newRole, $id);
            $stmt->execute();
            
            log_activity($conn, $_SESSION['account_id'], 'Updated Account Role', "Changed role of account ID {$id} to {$newRole}");
            
            echo json_encode(['success' => true, 'message' => "Role updated to " . strtoupper($newRole)]);
            exit;
        }
        
        // Full Update
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $role = $data['role'] ?? 'user';
        $id_no = trim($data['id_no'] ?? '');

        if (!$username || !$email || !$id_no) throw new Exception("Missing account fields");

        $stmtTarget = $conn->prepare("SELECT role FROM usraccount_tbl WHERE AccountID=?");
        $stmtTarget->bind_param("i", $id);
        $stmtTarget->execute();
        $targetUser = $stmtTarget->get_result()->fetch_assoc();
        if (!$targetUser) throw new Exception("User not found");

        if ($_SESSION['role'] !== 'super_admin') {
            if ($targetUser['role'] === 'super_admin' || $targetUser['role'] === 'admin') {
                if ($id != $_SESSION['account_id']) {
                    throw new Exception("Admins cannot edit other Admins or Super Admins.");
                }
            }
            if ($role !== $targetUser['role']) {
                throw new Exception("Only Super Admins can change roles.");
            }
            
            // Force the role to remain exactly as it was, even if the JS form tampered with it
            $role = $targetUser['role'];
        }

        // Duplicate Check (excluding current user)
        $stmt = $conn->prepare("SELECT AccountID FROM usraccount_tbl WHERE (Username=? OR Email=?) AND AccountID != ?");
        $stmt->bind_param("ssi", $username, $email, $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) throw new Exception("Username or Email already exists on another account");

        $conn->begin_transaction();

        // 1. Account Update
        if (!empty($data['password'])) {
            $sql = "UPDATE usraccount_tbl SET Username=?, Email=?, role=?, id_no=?, Password=? WHERE AccountID=?";
            $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssssi", $username, $email, $role, $id_no, $hashed, $id);
        } else {
            $sql = "UPDATE usraccount_tbl SET Username=?, Email=?, role=?, id_no=? WHERE AccountID=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssi", $username, $email, $role, $id_no, $id);
        }
        $stmt->execute();

        // 2. Info Update
        $fname = trim($data['first_name'] ?? '');
        $lname = trim($data['last_name'] ?? '');
        $mname = trim($data['middle_initial'] ?? '');
        $extname = trim($data['ext_name'] ?? '');
        $sex = trim($data['sex'] ?? 'Male');
        $dob = trim($data['birthdate'] ?? '');

        if ($fname && $lname) {
            $stmt = $conn->prepare("UPDATE usrinfo_tbl SET firstName=?, middleName=?, lastName=?, extName=?, sex=?, DOB=? WHERE AccountID=?");
            $stmt->bind_param("ssssssi", $fname, $mname, $lname, $extname, $sex, $dob, $id);
            $stmt->execute();
        }

        // 3. Address Update
        $purok = trim($data['purok'] ?? '');
        $city = trim($data['city'] ?? '');
        $province = trim($data['province'] ?? '');
        $country = trim($data['country'] ?? 'Philippines');
        $zip = trim($data['zip'] ?? '0');

        if ($purok && $city && $province) {
            $intZip = (int)$zip;
            $stmt = $conn->prepare("UPDATE usraddress_tbl SET `Prk/Barangay`=?, `City/Municipality`=?, Province=?, Country=?, `Zip Code`=? WHERE AccountID=?");
            $stmt->bind_param("ssssii", $purok, $city, $province, $country, $intZip, $id);
            $stmt->execute();
        }

        // 4. Security Update (Optional)
        $sq1 = trim($data['sq1'] ?? ''); $sa1 = trim($data['sa1'] ?? '');
        $sq2 = trim($data['sq2'] ?? ''); $sa2 = trim($data['sa2'] ?? '');
        $sq3 = trim($data['sq3'] ?? ''); $sa3 = trim($data['sa3'] ?? '');
        
        if ($sq1 && $sa1 && $sq2 && $sa2 && $sq3 && $sa3) {
            $hsa1 = password_hash($sa1, PASSWORD_DEFAULT);
            $hsa2 = password_hash($sa2, PASSWORD_DEFAULT);
            $hsa3 = password_hash($sa3, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("UPDATE usrsecurity_tbl SET Question1=?, Answer1=?, Question2=?, Answer2=?, Question3=?, Answer3=? WHERE AccountID=?");
            $stmt->bind_param("ssssssi", $sq1, $hsa1, $sq2, $hsa2, $sq3, $hsa3, $id);
            $stmt->execute();
        }

        log_activity($conn, $_SESSION['account_id'], 'Updated Account Profile', "Updated details for Account ID {$id}");

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Account successfully updated']);
    }
    
    elseif ($method === 'DELETE') {
        // Soft delete / Block for Super Admin as per request
        // "Super Admins should block only, not delete"
        // But maybe they want to ACTUALLY block when they click "Block".
        // If they click "Delete" (which we will replace with "Block" in UI), we send DELETE or PUT?
        // Let's support DELETE as "Block" to be safe if UI calls it.
        
        $data = getJsonInput();
        $id = $data['account_id'];
        if (!$id) throw new Exception("ID required");
        if ($id == $_SESSION['account_id']) throw new Exception("Cannot block your own account");

        // Similar check for Admin hitting DELETE
        $stmtTarget = $conn->prepare("SELECT role FROM usraccount_tbl WHERE AccountID=?");
        $stmtTarget->bind_param("i", $id);
        $stmtTarget->execute();
        $targetUser = $stmtTarget->get_result()->fetch_assoc();
        
        if ($_SESSION['role'] === 'admin') {
            if ($targetUser && ($targetUser['role'] === 'admin' || $targetUser['role'] === 'super_admin')) {
                throw new Exception("Admins cannot block other Admins or Super Admins");
            }
        }

        $stmt = $conn->prepare("UPDATE usraccount_tbl SET Status='blocked' WHERE AccountID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Account information blocked']);
    }

} catch (Exception $e) {
    if (isset($conn) && $conn->errno) $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
