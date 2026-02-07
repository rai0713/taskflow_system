$(document).ready(function() {
    // Username validation for uniqueness
    $('#uname').on('input', function() {
        const username = $(this).val().trim();
        const errorId = 'uname-error';

        if (username.length >= 3 && username.length <= 20) {
            $.ajax({
                url: 'check_username.php',
                type: 'POST',
                data: { uname: username },
                success: function(response) {
                    if (response === 'exists') {
                        $('#' + errorId).text('Username is already registered.');
                    } else {
                        $('#' + errorId).text('');
                    }
                }
            });
        } else {
            $('#' + errorId).text('Username must be between 3 and 20 characters.');
        }
    });

    // Validate fields on focus out
    $('#registrationForm').on('focusout', function(event) {
        const target = event.target;
        const errorId = `${target.id}-error`;
        const value = target.value.trim();
        let errorMessage = "";

        // Helper functions
        const hasInvalidCharacters = (str) => /\s{2,}|(.)\1{2,}/.test(str);
        const isValidName = (name) => /^[A-Z][a-z]{2,19}$/.test(name);
        const passwordStrength = (pwd) => {
            if (pwd.length >= 8) return "Strong";
            const medium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,7}$/;
            if (medium.test(pwd)) return "Medium";
            return "Weak";
        };

        // Field-specific validation
        if (target.id === 'email') {
            if (hasInvalidCharacters(value)) {
                errorMessage = "Email must not contain double spaces or three identical letters.";
            } else if (!validateInDatabase(target.id, value)) {
                errorMessage = "Email is already registered.";
            }
        }

        if (target.id === 'fname' || target.id === 'lname' || target.id === 'MI') {
            if (hasInvalidCharacters(value)) {
                errorMessage = "Name must not contain double spaces or three identical letters.";
            } else if (value.length < 3 || value.length > 20) {
                errorMessage = "Name must be between 3 and 20 characters.";
            } else if (!/^[A-Za-z]+$/.test(value)) {
                errorMessage = "Name must contain only alphabetic characters.";
            } else if (!isValidName(value)) {
                errorMessage = "First letter must be capitalized, and others must be lowercase.";
            }
        }

        if (target.id === 'psw') {
            if (value.length < 8 || value.length > 15) {
                errorMessage = "Password must be between 8 and 15 characters.";
            } else {
                const strength = passwordStrength(value);
                if (strength === "Weak") {
                    errorMessage = "Password is weak. It must include upper case, lower case, and digits.";
                } else if (strength === "Medium") {
                    errorMessage = "Password is medium. Consider adding special characters.";
                } else {
                    errorMessage = "Password is strong.";
                }
            }
        }

        if (target.id === 'repsw') {
            const password = document.getElementById('psw').value;
            if (value && value !== password) {
                errorMessage = "Passwords do not match.";
            }
        }

        if (target.id === 'zipcode') {
            if (!/^\d{4,5}$/.test(value)) {
                errorMessage = "Zip Code must be a 4 or 5 digit number.";
            }
        }

        const addressFields = ['purok', 'barangay', 'municipality', 'province', 'country'];
        if (addressFields.includes(target.id)) {
            if (hasInvalidCharacters(value)) {
                errorMessage = `${target.id.charAt(0).toUpperCase() + target.id.slice(1)} must not contain double spaces or three identical letters.`;
            } else if (!/^[A-Z][a-zA-Z\s]*$/.test(value)) {
                errorMessage = `${target.id.charAt(0).toUpperCase() + target.id.slice(1)} must start with a capital letter and contain only alphabetic characters.`;
            }
        }

        // ID field validation
        if (target.id === 'idnumber') {
            if (!/^\d{4}$/.test(value)) {
                errorMessage = "ID must be exactly 4 digits and cannot contain letters.";
                document.getElementById(target.id).style.borderColor = "red";
            } else {
                document.getElementById(target.id).style.borderColor = "";
            }
        }

        // Display error message
        document.getElementById(errorId).textContent = errorMessage;
    });

    // Function to validate data against the database (optional implementation)
    function validateInDatabase(field, value) {
        // Implement AJAX call to validate field in the database
        // Return true if valid, false otherwise
        return true; // Placeholder
    }

    // Gender field: handle "Other" gender input
    window.handleGenderChange = function(select) {
        const otherGenderInput = document.getElementById('otherGender');
        if (select.value === 'other') {
            otherGenderInput.style.display = 'block';
        } else {
            otherGenderInput.style.display = 'none';
        }
    }

    // ID Number Field Validation
    $('#idnumber').on('input', function() {
        const idNumber = $(this).val().trim();
        const errorId = 'idnumber-error';
        const errorMessageElement = $('#' + errorId);

        // Ensure the ID number is exactly 4 digits long and contains only numbers
        if (/^\d{4}$/.test(idNumber)) {
            // If the input is valid, clear the error message and reset the border color
            errorMessageElement.text('');
            $(this).css('border-color', '');
        } else {
            // If the input is invalid, display an error message and change the border color to red
            errorMessageElement.text('ID must be exactly 4 digits and cannot contain letters.');
            $(this).css('border-color', 'red');
        }
    });

    // Submit event handler
    $('#registrationForm').on('submit', function(event) {
        const idNumber = $('#idnumber').val().trim();
        const errorId = 'idnumber-error';
        const errorMessageElement = $('#' + errorId);

        // Check if ID number is exactly 4 digits
        if (!/^\d{4}$/.test(idNumber)) {
            errorMessageElement.text('ID must be exactly 4 digits and cannot contain letters.');
            event.preventDefault(); // Prevent form submission if validation fails
            $('#idnumber').css('border-color', 'red');
        }
    });

});
