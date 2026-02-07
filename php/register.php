<?php
require_once 'connect.php';

// Begin transaction
$conn->begin_transaction();

try {
    // Assuming POST data from the form
    $account_username = $_POST['username'];
    $account_id_no = $_POST['id-no'];
    $account_password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $account_email = $_POST['email'];

    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $middle_initial = $_POST['middle_initial'];
    $extname = $_POST['selected-extension'];
    $gender = $_POST['sex'];
    $DOB = $_POST['birthdate'];

    $purok_barangay = $_POST['purok_barangay'];
    $city_municipality = $_POST['city_municipality'];
    $province = $_POST['province'];
    $country = $_POST['country'];
    $zip_code = $_POST['zip_code'];

    // Insert into Accounts table
    $sql_account = "INSERT INTO usraccount_tbl (Username, id_no, Password, Email) VALUES (?, ?, ?, ?)";
    $stmt_account = $conn->prepare($sql_account);
    $stmt_account->bind_param("ssss", $account_username, $account_id_no,  $account_password, $account_email);

    if (!$stmt_account->execute()) {
        throw new Exception("Failed to insert into usraccount_tbl: " . $stmt_account->error);
    }

    // Get the last inserted AccountID
    $account_id = $conn->insert_id;

    // Insert into PersonalInfo table
    $sql_personal_info = "INSERT INTO usrinfo_tbl (AccountID, firstName, lastName, middleName, extName, sex, DOB) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt_personal_info = $conn->prepare($sql_personal_info);
    $stmt_personal_info->bind_param("issssss", $account_id, $first_name, $last_name, $middle_initial, $extname, $gender, $DOB);

    if (!$stmt_personal_info->execute()) {
        throw new Exception("Failed to insert into usrinfo_tbl: " . $stmt_personal_info->error);
    }

    // Insert into Address table
    $sql_address = "INSERT INTO usraddress_tbl (AccountID, `Prk/Barangay`, `City/Municipality`, Province, Country, `Zip Code`) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt_address = $conn->prepare($sql_address);
    $stmt_address->bind_param("isssss", $account_id, $purok_barangay, $city_municipality, $province, $country, $zip_code);

    if (!$stmt_address->execute()) {
        throw new Exception("Failed to insert into usraddress_tbl: " . $stmt_address->error);
    }

    // If everything was successful, commit the transaction
    $conn->commit();
    echo "Account, personal information, and address successfully saved!";
    header('Location: ../html/index.html');
} catch (Exception $e) {
    // If there was an error, roll back the transaction
    $conn->rollback();
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>
