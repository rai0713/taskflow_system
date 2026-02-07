const id = document.getElementById('id');
const email = document.getElementById('email');
const usersname = document.getElementById('username');
const form = document.getElementById('registerForm');

const debounce = (func, delay) => {
  let timer;

  return (...args) =>{
    clearTimeout(timer);
    
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay)
  }
}

async function checkIdExistence(id) {
    try {
      const response = await fetch('fetchers/check_id.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + encodeURIComponent(id)
      });
      const data = await response.json();
      return data.exists; // Return whether the ID exists in the database
    } catch (error) {
      console.error('Error checking ID existence:', error);
      return false; // In case of an error, return false as if the ID doesn't exist
    }
  }



function showValidationFeedback(inputId, isValid, message = "") {
  var inputElement = document.getElementById(inputId);
  var errorMessage = document.getElementById(inputId + '-error');  // Dynamically get error message element by ID
  
  if (isValid) {
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
    errorMessage.style.color = 'rgb(25, 135, 84)';
    errorMessage.classList.remove('text-danger');  // Remove error class
    errorMessage.classList.add('text-success');    // Add success class
    errorMessage.textContent = message;


  } else {  
    inputElement.classList.remove('is-valid');
    inputElement.classList.add('is-invalid');
    errorMessage.classList.remove('text-success');  // Remove error class
    errorMessage.classList.add('text-danger');  
    errorMessage.textContent = message; // Display custom error message
  }
}

function hasWhitespace(input) {
  return /\s{2,}/.test(input);  // Checks for two or more consecutive whitespaces
}


function hasThreeConsecutiveIdenticalLetters(input) {
  return /(.)\1\1/i.test(input);  // Checks for three consecutive identical characters
}

function isProperlyCapitalized(input) {
  // Trim extra whitespace
  const trimmedInput = input.trim();

  // Pattern: Words with only letters must start with one capital letter followed by lowercase letters.
  // Words with numbers are allowed as is.
  const namePattern = /^([A-Z][a-z]*|\d+)(?: ([A-Z][a-z]*|\d+))*$/;

  return namePattern.test(trimmedInput);
}


function isAlphabetic(input) {
  const alphabetPattern = /^[A-Za-z\s]+$/;  // Only allows alphabet letters and spaces
  return alphabetPattern.test(input);
}






const checkID = async () => {
  const idValue = document.getElementById('id').value;
  let idPattern = /^\d{4}-\d{4}$/; 
  // Validate ID format
  if (!idPattern.test(idValue)) {
    showValidationFeedback('id', false, "Please enter a valid ID in the format xxxx-xxxx.");
    return false;
  } 

  // Check if the ID already exists in the database
  const exists = await checkIdExistence(idValue);
  if (exists) {
    showValidationFeedback('id', false, "ID already exists, please use a different one.");
    return false;
  }
  
  // If ID does not exist in the database, proceed with a successful validation
  showValidationFeedback('id', true, "");
  return true;
}

const checkEmail = async () => {
  let emailValue = email.value; // Get email value and trim extra spaces

  // Validate if the email has correct format
  const emailPattern = /^[a-z0-9]+(\.[a-z0-9]+)*@[a-z0-9]+(\.[a-z]{2,})+$/;
  if (!emailPattern.test(emailValue)) {
    showValidationFeedback('email', false, "Please enter a valid email. The email should be all small letters and alphanumeric");
    return false;
  }

  // Make an AJAX request to the server to check if the email exists
  try{
    const response = await fetch('fetchers/check_email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'email=' + encodeURIComponent(emailValue),
    });

    const data = await response.json();
    if (data.exists) {
        showValidationFeedback('email', false, "Email already exists, please use a different one.");
        return false;
      } else {
        showValidationFeedback('email', true, "");  // Success message (valid email)
        return true;
      }
    }
  catch(e){
    showValidationFeedback('email', false, "There was an error checking the email.");
    return false;
  }
  
};

// Function to check if username exists and validate for whitespaces
async function checkUsernameExistence() {
  let username = usersname.value;
  const minLength = 4;
  const maxLength = 15;

  if (!username) {
    showValidationFeedback('username', false, "Username cannot be empty.");
    return false;
  }

  if (hasWhitespace(username)) {
    showValidationFeedback('username', false, "Username cannot contain spaces.");
    return false;
  }

  if (username.length < minLength || username.length > maxLength) {
    showValidationFeedback('username', false, `Username must be between ${minLength} and ${maxLength} characters.`);
    return false;
  }

  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    showValidationFeedback('username', false, "Username can only contain alphabetic characters and numbers.");
    return false;
  }

  try {
    const response = await fetch('fetchers/check_username.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=' + encodeURIComponent(username)
    });

    const data = await response.json();
    if (data.exists) {
      showValidationFeedback('username', false, "Username already exists, please choose a different one.");
      return false;
    } else {
      showValidationFeedback('username', true, "");
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    showValidationFeedback('username', false, "An error occurred while validating the username.");
    return false;
  }
}



id.addEventListener('keydown', function(event) {
  const allowedKeys = [
    'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', '-', 'Delete',
    'Control', 'Meta', 'Shift' 
  ];

  const isNumberKey = event.key >= '0' && event.key <= '9';
  const isCtrlA = event.ctrlKey && event.key === 'a';
  const isCtrlC = event.ctrlKey && event.key === 'c';
  const isCtrlV = event.ctrlKey && event.key === 'v'; 
  const isCtrlX = event.ctrlKey && event.key === 'x'; 

  if (!isNumberKey && 
      !allowedKeys.includes(event.key) && 
      !isCtrlA && !isCtrlC && !isCtrlV && !isCtrlX) {
    event.preventDefault();
  }

  if (event.key === '-' && id.value.includes('-')) {
    event.preventDefault();
  }
});

const checkFirstName = () => {
  const firstName = document.getElementById('firstName').value;
  let min = 3, max = 15;
  
  if(firstName.length === 0){
    showValidationFeedback('firstName', false, 'First Name is required');
    return false;
  }

  if(hasWhitespace(firstName)){
    showValidationFeedback('firstName', false, `First name must not have double spaces`);
    return false
  }

  if(firstName.length < min || firstName.length > max){
    showValidationFeedback('firstName', false, `First name length must be ${min} and ${max} character`);
    return false;
  }

  if(hasThreeConsecutiveIdenticalLetters(firstName)){
    showValidationFeedback('firstName', false, `First name must not have three identical letters`);
    return false;
  }

  if(!isAlphabetic(firstName)){
    showValidationFeedback('firstName', false, `First name must be alphabetic`)
    return false;
  }

  if(!isProperlyCapitalized(firstName)){
    showValidationFeedback('firstName', false, `Only every first letter of the word must be capitalized only`);
    return false;
  }


  showValidationFeedback('firstName', true)
  return true

}

const checkLastName = () => {
  const lastName = document.getElementById('lastName').value;
  let min = 3, max = 15;

  // Check if the last name is empty
  if(lastName.length === 0){
    showValidationFeedback('lastName', false, 'Last Name is required');
    return false;
  }

  // Check for double spaces
  if(hasWhitespace(lastName)){
    showValidationFeedback('lastName', false, `Last name must not have double spaces`);
    return false;
  }

  // Check if length is within the required range
  if(lastName.length < min || lastName.length > max){
    showValidationFeedback('lastName', false, `Last name length must be between ${min} and ${max} characters`);
    return false;
  }

  // Check for three consecutive identical letters
  if(hasThreeConsecutiveIdenticalLetters(lastName)){
    showValidationFeedback('lastName', false, `Last name must not have three identical letters`);
    return false;
  }

  if(!isAlphabetic(lastName)){
    showValidationFeedback('lastName', false, `Last name must be alphabetic`);
    return false;
  }
  // Check if the capitalization is proper (first letter capitalized only)
  if(!isProperlyCapitalized(lastName)){
    showValidationFeedback('lastName', false, `Only every first letter of the word must be capitalized only`);
    return false;
  }

  // If all validations pass, return success
  showValidationFeedback('lastName', true);
  return true;
}

const checkMiddleName = () => {
const middleName = document.getElementById('middleName').value;

let min = 3, max = 15;

// If no input is provided, skip validation (since it's optional)
if(middleName.length === 0) {
  // showValidationFeedback('middleName', true); 
  document.getElementById('middleName').classList.remove('is-invalid', 'is-valid');
  document.getElementById('middleName-error').textContent = '';
  return  true// No error, as it's optional
}

// Check for double spaces
if(hasWhitespace(middleName)){
  showValidationFeedback('middleName', false, `Middle name must not have double spaces`);
  return false;
}

// Check if length is within the required range
if(middleName.length < min || middleName.length > max){
  showValidationFeedback('middleName', false, `Middle name length must be between ${min} and ${max} characters`);
  return false;
}

// Check for three consecutive identical letters
if(hasThreeConsecutiveIdenticalLetters(middleName)){
  showValidationFeedback('middleName', false, `Middle name must not have three identical letters`);
  return false;
}

// Check if the middle name contains only alphabetic characters
if(!isAlphabetic(middleName)){
  showValidationFeedback('middleName', false, `Middle name must be alphabetic`);
  return false;
}
// Check if the capitalization is correct (first letter capitalized only)
if(!isProperlyCapitalized(middleName)){
  showValidationFeedback('middleName', false, `Only every first letter of the word must be capitalized only`);
  return false;
}


// If all validations pass, return success
showValidationFeedback('middleName', true);
return true;
}

const checkPurok = () => {
const purok = document.getElementById('purok').value;
const min = 1, max = 20; // Adjust length range as needed

// Check if the field is empty
if (purok.length === 0) {
    showValidationFeedback('purok', false, 'Purok is required');
    return false;
}

// Check for double spaces
if (hasWhitespace(purok)) {
  showValidationFeedback('purok', false, 'Purok must not have double spaces');
  return false;
}

// Check if length is within the required range
if (purok.length < min || purok.length > max) {
    showValidationFeedback('purok', false, `Purok length must be between ${min} and ${max} characters`);
    return false;
}

// Check for three consecutive identical characters
if (hasThreeConsecutiveIdenticalLetters(purok)) {
    showValidationFeedback('purok', false, 'Purok must not have three identical characters');
    return false;
}

// Check if it is alphanumeric (letters and numbers only)
if (!/^[a-zA-Z0-9\s]+$/.test(purok)) {
    showValidationFeedback('purok', false, 'Purok must be alphanumeric');
    return false;
}

if (!isProperlyCapitalized(purok)) {
  showValidationFeedback('purok', false, 'Only first letter of each word must be capitalized only');
  return false;
}


// If all validations pass
showValidationFeedback('purok', true, '');
return true;
};


const checkBarangay = () => {
const barangay = document.getElementById('barangay').value;
let min = 3, max = 30;

if (barangay.length === 0) {
  showValidationFeedback('barangay', false, 'Barangay is required');
  return false;
}

if (hasWhitespace(barangay)) {
  showValidationFeedback('barangay', false, 'Barangay must not have double spaces');
  return false;
}

if (barangay.length < min || barangay.length > max) {
  showValidationFeedback('barangay', false, `Barangay length must be between ${min} and ${max} characters`);
  return false;
}

if (hasThreeConsecutiveIdenticalLetters(barangay)) {
  showValidationFeedback('barangay', false, 'Barangay must not have three identical letters');
  return false;
}

if (!/^[a-zA-Z0-9\s]+$/.test(barangay)) {
    showValidationFeedback('barangay', false, 'Barangay must be alphanumeric');
    return false;
}

if (!isProperlyCapitalized(barangay)) {
  showValidationFeedback('barangay', false, 'Only first letter of each word must be capitalized only');
  return false;
}


showValidationFeedback('barangay', true);
return true;
};

const checkCity = () => {
const city = document.getElementById('municipality').value;
let min = 3, max = 30;

if (!city) {
  showValidationFeedback('municipality', false, 'City is required');
  return false;
}

if (hasWhitespace(city)) {
  showValidationFeedback('municipality', false, 'City must not have double spaces');
  return false;
}

if (city.length < min || city.length > max) {
  showValidationFeedback('municipality', false, `City length must be between ${min} and ${max} characters`);
  return false;
}

if (hasThreeConsecutiveIdenticalLetters(city)) {
  showValidationFeedback('municipality', false, 'City must not have three identical letters');
  return false;
}

if (!isAlphabetic(city)) {
  showValidationFeedback('municipality', false, 'City must be alphabetic');
  return false;
}

if (!isProperlyCapitalized(city)) {
  showValidationFeedback('municipality', false, 'Only first letter of each word must be capitalized only');
  return false;
}


showValidationFeedback('municipality', true);
return true;
};

const checkProvince = () => {
const province = document.getElementById('province').value;
let min = 3, max = 30;

if (province.length === 0) {
  showValidationFeedback('province', false, 'Province is required');
  return false;
}

if (hasWhitespace(province)) {
  showValidationFeedback('province', false, 'Province must not have double spaces');
  return false;
}

if (province.length < min || province.length > max) {
  showValidationFeedback('province', false, `Province length must be between ${min} and ${max} characters`);
  return false;
}

if (hasThreeConsecutiveIdenticalLetters(province)) {
  showValidationFeedback('province', false, 'Province must not have three identical letters');
  return false;
}

if (!isAlphabetic(province)) {
  showValidationFeedback('province', false, 'Province must be alphabetic');
  return false;
}

if (!isProperlyCapitalized(province)) {
  showValidationFeedback('province', false, 'Only first letter of each word must be capitalized only');
  return false;
}


showValidationFeedback('province', true);
return true;
};

const checkCountry = () => {
const country = document.getElementById('country').value;
let min = 3, max = 30;

if (country.length === 0) {
  showValidationFeedback('country', false, 'Country is required');
  return false;
}

if (hasWhitespace(country)) {
  showValidationFeedback('country', false, 'Country must not have double spaces');
  return false;
}

if (country.length < min || country.length > max) {
  showValidationFeedback('country', false, `Country length must be between ${min} and ${max} characters`);
  return false;
}

if (hasThreeConsecutiveIdenticalLetters(country)) {
  showValidationFeedback('country', false, 'Country must not have three identical letters');
  return false;
}

if (!isAlphabetic(country)) {
  showValidationFeedback('country', false, 'Country must be alphabetic');
  return false;
}

if (!isProperlyCapitalized(country)) {
  showValidationFeedback('country', false, 'Only first letter of each word must be capitalized only');
  return false;
}


showValidationFeedback('country', true);
return true;
};

const checkZipCode = () => {
const zipField = document.getElementById('zip');
let zipCode = zipField.value.trim(); // Trim leading/trailing whitespace
const min = 3
const max = 6;

if (!zipCode) {
  showValidationFeedback('zip', false, 'Zip Code is required');
  return false;
}

if (hasWhitespace(zipCode)) {
  showValidationFeedback('zip', false, 'Zip Code must not have double spaces');
  return false;
}

// Convert to uppercase if there are any lowercase letters
if (/[a-z]/.test(zipCode)) {
  zipCode = zipCode.toUpperCase();
  zipField.value = zipCode; // Update the field with uppercase version
  showValidationFeedback('zip', false, 'Letters in the Zip Code must be uppercase; automatically corrected.');
  return false; // Highlight this correction
}

// Allow alphanumeric zip codes (e.g., "1234", "SW1A 1AA")
const zipPattern = /^[A-Z0-9\s-]+$/;
if (!zipPattern.test(zipCode)) {
  showValidationFeedback('zip', false, 'Zip Code must contain only uppercase letters, numbers, spaces, or hyphens');
  return false;
}
extensionName.length  || extensionName.length > max
// Optional: Check length for numeric-only zip codes
if (zipCode.length < min || zipCode.length > max ) {
  showValidationFeedback('zip', false, `Zip Code must be min of ${min} and max of ${max} characters long.`);
  return false;
}

//  /^[A-Za-z0-9\s-]+$/;     alisdan diri ug alphanumeric ang pangayo 
// if (!/^\d+$/.test(zipCode)) {
//   showValidationFeedback('zip', false, "Zip Code must be numeric.");
//   return false;
// }

showValidationFeedback('zip', true, '');
return true;
};


const checkAge = () => {
const birthdateInput = document.getElementById('birthdate').value;
const feedbackElement = document.getElementById('birthdateFeedback');

if (!birthdateInput) {
  showValidationFeedback('birthdate', false, 'Birthdate is required.')
  return false;
}

const birthdate = new Date(birthdateInput);
const today = new Date();
const age = today.getFullYear() - birthdate.getFullYear();
const monthDifference = today.getMonth() - birthdate.getMonth();
const dayDifference = today.getDate() - birthdate.getDate();

const actualAge = monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0) ? age : age - 1;

document.getElementById('age').value = actualAge;

if (actualAge < 18) {
  showValidationFeedback('birthdate', false, `Your age is ${actualAge}. You must be 18 years or older to register.`)

  return false;
}

// If age is valid, clear any error messages
showValidationFeedback('birthdate', true, `Your age is ${actualAge}. You are eligble to register`);
return true;
};

const checkExtensionName = () => {
const extensionName = document.getElementById('extensionName').value;
let min = 1, max = 5; 

// Optional: If no extension name is entered, skip validation
if (extensionName.length === 0) {
  document.getElementById('extensionName').classList.remove('is-invalid', 'is-valid');
  document.getElementById('extensionName-error').textContent = ''
  return true;
}

// Check for double spaces
if (hasWhitespace(extensionName)) {
  showValidationFeedback('extensionName', false, 'Extension name must not have double spaces');
  return false;
}

// Check if the length is within the valid range
if (extensionName.length < min || extensionName.length > max) {
  showValidationFeedback('extensionName', false, `Extension name must be between ${min} and ${max} characters`);
  return false;
}

// Check for three consecutive identical letters
// if (hasThreeConsecutiveIdenticalLetters(extensionName)) {
//   showValidationFeedback('extensionName', false, 'Extension name must not have three consecutive identical letters');
//   return false;
// }

// Check for valid extension names like "Sr.", "Jr.", Roman numerals
const validExtensionRegex = /^(Sr\.|Jr\.|I{1,3}|IV|V|VI{0,3}|VII{0,2}|VIII|IX|X)$/;

if (!validExtensionRegex.test(extensionName)) {
  showValidationFeedback('extensionName', false, 'Extension name must be "Sr." or "Jr." exactly as shown.');
  return false;
}


// If the name is properly capitalized
// if (!isProperlyCapitalized(extensionName)) {
//   showValidationFeedback('extensionName', false, 'Extension name must be properly capitalized');
//   return false;
// }

// If all validations pass
showValidationFeedback('extensionName', true);
    return true;
};

async function checkPasswordExistence(password) {
try {
    const response = await fetch('fetchers/check_password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `password=${encodeURIComponent(password)}`
    });
    const data = await response.json();
    return data.exists;  // Return true or false based on the database response
} catch (error) {
    console.error('Error:', error);
    return false; // Return false in case of error
}
}


async function checkPasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthMessage = document.getElementById('password-strength');
  const passwordPatternWeak = /[a-zA-Z]/;
  const passwordPatternMedium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
  const passwordPatternStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  
  if (!password) {
    showValidationFeedback('password', false, 'Password is required.')
    document.getElementById('password-strength').textContent = ''
    return false;
  }
  const passwordExists = await checkPasswordExistence(password);

  if(passwordExists){
    showValidationFeedback('password', false, 'Password exist in database.')
    document.getElementById('password-strength').textContent = ''
    return false;
  }

  if (password.length < 8 || password.length > 20) {
      strengthMessage.textContent = "Password must be between 8 and 20 characters.";
      strengthMessage.className = "text-danger";
      document.getElementById('password').classList.remove('is-invalid', 'is-valid');
      document.getElementById('password-error').textContent = ''
      return false;
  } else if (passwordPatternStrong.test(password)) {
      strengthMessage.textContent = "Password strength: Strong";
      strengthMessage.className = "text-success";
      document.getElementById('password').classList.remove('is-invalid', 'is-valid');
      document.getElementById('password-error').textContent = ''
      showValidationFeedback('password', true);
  } else if (passwordPatternMedium.test(password)) {
      strengthMessage.textContent = "Password strength: Medium";
      strengthMessage.className = "text-warning";
      document.getElementById('password').classList.remove('is-invalid', 'is-valid');
      document.getElementById('password-error').textContent = ''
  } else if (passwordPatternWeak.test(password)) {
      strengthMessage.textContent = "Password strength: Weak";
      strengthMessage.className = "text-danger";
      document.getElementById('password').classList.remove('is-invalid', 'is-valid');
      document.getElementById('password-error').textContent = ''
  }

  
  return true;
}

function checkPasswordMatch() {
const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirmPassword').value;
const confirmPasswordError = document.getElementById('confirmPassword-error');

// Check if the passwords match
if (confirmPassword !== password) {
    confirmPasswordError.textContent = "Passwords do not match.";
    confirmPasswordError.className = "text-danger";
    showValidationFeedback('confirmPassword', false, "Passwords do not match.");
} else {
    confirmPasswordError.textContent = "Passwords match.";
    confirmPasswordError.className = "text-success";
    showValidationFeedback('confirmPassword', true, "Passwords match.");
}
return true;
}
document.getElementById('password').addEventListener('input', checkPasswordMatch);


form.addEventListener('submit', async function (e) {
e.preventDefault();

let isValid = true;

const isIdValid = await checkID();
const usernameValid =  await checkUsernameExistence();
const isEmailValid = await checkEmail();
const isPasswordExist = await checkPasswordStrength();
if (!isIdValid) isValid = false;
if (!isEmailValid) isValid = false;
if (!usernameValid) isValid = false;
if (!isPasswordExist) isValid = false;
if (!checkFirstName()) isValid = false;
if (!checkMiddleName()) isValid = false;
if (!checkLastName()) isValid = false;
if (!checkPurok()) isValid = false;
if (!checkBarangay()) isValid = false;
if (!checkCity()) isValid = false;
if (!checkProvince()) isValid = false;
if (!checkCountry()) isValid = false;
if (!checkZipCode()) isValid = false;
if (!checkAge()) isValid = false;
if (!checkExtensionName()) isValid = false;
if (!checkPasswordStrength()) isValid = false;
if (!checkPasswordMatch()) isValid = false;

const formData = new FormData(form);

if (isValid) {
try {
  const response = await fetch('process_register.php', {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();

  if (result.success) {
    alert(result.message);
    if (result.redirect) {
      window.location.href = result.redirect; // Redirect to login page
    }
  } else {
    alert(result.message);
  }
} catch (error) {
  console.error('Error:', error);
  alert('An unexpected error occurred. Please try again.');
}
}else{
alert('Please fill out the form correctly');
}

// console.log(isValid);

//   alert('Register Successfully!');
//   form.submit();
// }else{
//   alert('Please fill out the form correctly');
// }
});

const validateFormInput = (e) => {
  switch(e.target.id){
    case 'id':
      checkID();
      break;
    case 'email':
      checkEmail();
      break;
    case 'username':
      checkUsernameExistence();
      break;
    case 'firstName':
      checkFirstName();
      break;
    case 'lastName':
      checkLastName();
      break;
    case 'middleName':
      checkMiddleName();
      break;
    case 'purok':
      checkPurok();
      break;
    case 'barangay':
      checkBarangay();
      break;
    case 'municipality':
      checkCity();
      break;
    case 'province':
      checkProvince();
      break;
    case 'country':
      checkCountry();
      break;
    case 'zip':
      checkZipCode();
      break;
    case 'birthdate':
      checkAge();
      break;
    case 'extensionName':
      checkExtensionName();
      break;
    case 'password':
      checkPasswordStrength();
      break;
    case 'confirmPassword':
      checkPasswordMatch();
      break;
  }
}

// id.addEventListener('input', checkID);
form.addEventListener('input', debounce(validateFormInput, 400));
form.addEventListener('change', validateFormInput);