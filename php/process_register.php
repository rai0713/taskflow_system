<?php
include_once('connect.php');

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = $_POST['id'];
    $firstName = $_POST['firstName'];
    $middleName = $_POST['middleName'];
    $lastName = $_POST['lastName'];
    $extensionName = $_POST['extensionName'];
    $sex = $_POST['sex'];
    $purok = $_POST['purok'];
    $barangay = $_POST['barangay'];
    $municipality = $_POST['municipality'];
    $province = $_POST['province'];
    $country = $_POST['country'];
    $zipCode = $_POST['zip'];
    $username = $_POST['username'];
    $email = $_POST['email'];
    $DOB = $_POST['birthdate'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Hash password

    // Validate ID (assuming it's a numeric value)
    if (!preg_match("/^\d{4}-\d{4}$/", $id)) {
        echo "Invalid ID format.";
        exit;
    }

    // Insert user data into the 'users' table
    $sql = "INSERT INTO users (id, first_name, middle_name, last_name, extension_name, sex, purok, barangay, municipality, province, country, zip_code)
            VALUES ('$id', '$firstName', '$middleName', '$lastName', '$extensionName', '$sex', '$purok', '$barangay', '$municipality', '$province', '$country', '$zipCode')";
    
    if ($conn->query($sql) === TRUE) {
        // Insert user account data into the 'users_account' table
        $userInfoId = $conn->insert_id; // Get the last inserted user ID
        $sql = "INSERT INTO users_account (userinfo_id, username, email, password)
                VALUES ('$userInfoId', '$username', '$email', '$password')";

        if ($conn->query($sql) === TRUE) {
            echo "Registration successful!";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
}