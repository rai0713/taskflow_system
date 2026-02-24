<?php
require_once 'connect.php';
require_once 'mail_helper.php';

header('Content-Type: application/json; charset=utf-8');

function json_response(bool $success, string $message, array $extra = []): void
{
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method.');
}

// ── Ensure security questions table exists ──
// Commented out: Schema creation shouldn't run on every public request.
/* $conn->query("
    CREATE TABLE IF NOT EXISTS usrsecurity_tbl (
        SecurityID INT AUTO_INCREMENT PRIMARY KEY,
        AccountID INT NOT NULL,
        Question1 VARCHAR(100) NOT NULL,
        Answer1 VARCHAR(255) NOT NULL,
        Question2 VARCHAR(100) NOT NULL,
        Answer2 VARCHAR(255) NOT NULL,
        Question3 VARCHAR(100) NOT NULL,
        Answer3 VARCHAR(255) NOT NULL,
        FOREIGN KEY (AccountID) REFERENCES usraccount_tbl(AccountID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
"); */

// Begin transaction
$conn->begin_transaction();

try {
    // Required fields
    $account_username = trim((string)($_POST['username'] ?? ''));
    $account_id_no = trim((string)($_POST['id-no'] ?? ''));
    $raw_password = (string)($_POST['password'] ?? '');
    $account_email = trim((string)($_POST['email'] ?? ''));

    $first_name = trim((string)($_POST['first_name'] ?? ''));
    $last_name = trim((string)($_POST['last_name'] ?? ''));
    $middle_initial = trim((string)($_POST['middle_initial'] ?? ''));
    $extname = trim((string)($_POST['selected-extension'] ?? ''));
    $gender = trim((string)($_POST['sex'] ?? ''));
    $DOB = trim((string)($_POST['birthdate'] ?? ''));

    $purok_barangay = trim((string)($_POST['purok_barangay'] ?? ''));
    $barangay = trim((string)($_POST['barangay'] ?? ''));
    $city_municipality = trim((string)($_POST['city_municipality'] ?? ''));
    $province = trim((string)($_POST['province'] ?? ''));
    $country = trim((string)($_POST['country'] ?? ''));
    $zip_code_raw = trim((string)($_POST['zip_code'] ?? ''));

    // Security questions & answers (answers arrive as SHA-256 hex from client)
    $sq1 = trim((string)($_POST['security_question_1'] ?? ''));
    $sa1 = trim((string)($_POST['security_answer_1'] ?? ''));
    $sq2 = trim((string)($_POST['security_question_2'] ?? ''));
    $sa2 = trim((string)($_POST['security_answer_2'] ?? ''));
    $sq3 = trim((string)($_POST['security_question_3'] ?? ''));
    $sa3 = trim((string)($_POST['security_answer_3'] ?? ''));

    // Validation
    if ($account_username === '' || $account_id_no === '' || $raw_password === '' || $account_email === '') {
        json_response(false, 'Please fill out all required account fields.');
    }

    if (!preg_match('/^\d{4}-\d{4}$/', $account_id_no)) {
        json_response(false, 'Invalid ID number format. Use ####-####.');
    }

    if (!filter_var($account_email, FILTER_VALIDATE_EMAIL)) {
        json_response(false, 'Invalid email address.');
    }

    if ($first_name === '' || $last_name === '' || $gender === '' || $DOB === '') {
        json_response(false, 'Please fill out all required personal information fields.');
    }

    if ($purok_barangay === '' || $city_municipality === '' || $province === '' || $country === '' || $zip_code_raw === '') {
        json_response(false, 'Please fill out all required address fields.');
    }

    if (!preg_match('/^\d{4,11}$/', $zip_code_raw)) {
        json_response(false, 'Invalid zip code.');
    }
    $zip_code = (int)$zip_code_raw;

    // Validate security questions
    if ($sq1 === '' || $sq2 === '' || $sq3 === '' || $sa1 === '' || $sa2 === '' || $sa3 === '') {
        json_response(false, 'Please complete all security questions and answers.');
    }

    if ($sq1 === $sq2 || $sq1 === $sq3 || $sq2 === $sq3) {
        json_response(false, 'Each security question must be different.');
    }

    // Friendly duplicate check (Moved BEFORE hashing for performance)
    $sql_dupe = "SELECT AccountID FROM usraccount_tbl WHERE Username = ? OR Email = ? LIMIT 1";
    $stmt_dupe = $conn->prepare($sql_dupe);
    $stmt_dupe->bind_param('ss', $account_username, $account_email);
    $stmt_dupe->execute();
    $stmt_dupe->store_result();
    if ($stmt_dupe->num_rows > 0) {
        $stmt_dupe->close(); // Close statement before rollback
        $conn->rollback();
        json_response(false, 'Username or email already exists.');
    }
    $stmt_dupe->close(); // Close statement on success

    // Enforce user role on public registration
    $role = 'user';
    $status = 'pending'; // New accounts must wait for admin approval

    // Hash passwords and answers ONLY after validation and duplicate checks pass
    $account_password = password_hash($raw_password, PASSWORD_DEFAULT);

    // Hash security answers with bcrypt (they arrive as SHA-256 hex, double-hash for storage)
    $hashed_sa1 = password_hash($sa1, PASSWORD_DEFAULT);
    $hashed_sa2 = password_hash($sa2, PASSWORD_DEFAULT);
    $hashed_sa3 = password_hash($sa3, PASSWORD_DEFAULT);

    // Insert into Accounts table
    $sql_account = "INSERT INTO usraccount_tbl (Username, id_no, Password, Email, role, status) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_account = $conn->prepare($sql_account);
    $stmt_account->bind_param('ssssss', $account_username, $account_id_no, $account_password, $account_email, $role, $status);

    if (!$stmt_account->execute()) {
        throw new Exception('Failed to insert into usraccount_tbl: ' . $stmt_account->error);
    }

    $account_id = $conn->insert_id;

    // Insert into PersonalInfo table
    $sql_personal_info = "INSERT INTO usrinfo_tbl (AccountID, firstName, middleName, lastName, extName, sex, DOB) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt_personal_info = $conn->prepare($sql_personal_info);
    $stmt_personal_info->bind_param('issssss', $account_id, $first_name, $middle_initial, $last_name, $extname, $gender, $DOB);

    if (!$stmt_personal_info->execute()) {
        throw new Exception('Failed to insert into usrinfo_tbl: ' . $stmt_personal_info->error);
    }

    // Insert into Address table
    $sql_address = "INSERT INTO usraddress_tbl (AccountID, `Prk/Barangay`, `City/Municipality`, Province, Country, `Zip Code`) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_address = $conn->prepare($sql_address);
    $stmt_address->bind_param('issssi', $account_id, $purok_barangay, $city_municipality, $province, $country, $zip_code);

    if (!$stmt_address->execute()) {
        throw new Exception('Failed to insert into usraddress_tbl: ' . $stmt_address->error);
    }

    // Insert into Security Questions table
    $sql_security = "INSERT INTO usrsecurity_tbl (AccountID, Question1, Answer1, Question2, Answer2, Question3, Answer3) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt_security = $conn->prepare($sql_security);
    $stmt_security->bind_param('issssss', $account_id, $sq1, $hashed_sa1, $sq2, $hashed_sa2, $sq3, $hashed_sa3);

    if (!$stmt_security->execute()) {
        throw new Exception('Failed to insert into usrsecurity_tbl: ' . $stmt_security->error);
    }

    $conn->commit();

    // Send the "Pending Approval" email
    send_registration_pending_email($account_email, $first_name . ' ' . $last_name);

    json_response(true, 'Registration successful. Please wait for an Administrator to approve your account.');
} catch (Throwable $e) {
    $conn->rollback();
    json_response(false, 'Registration failed. Please try again.', [
        // Keep detailed error for debugging; remove in production
        'debug' => $e->getMessage(),
    ]);
}

