const fname = document.querySelector('#first-name');
const mname = document.querySelector('#middle-name');
const lname = document.querySelector('#last-name');
const uname = document.querySelector('#user-name')
const passwordField = document.querySelector('#password')
const form = document.querySelector('#sign-up-form');
const confirmPasswordField = document.querySelector('#confirm-password');
const emailField = document.getElementById('email-form');
const countryField = document.querySelector('#country-form');
const zipCodeField = document.querySelector('#zipCode');
const cityField = document.querySelector('#city-form')
const barangayField = document.querySelector('#barangay');
const purokField = document.querySelector('#purok-street');
const sexField = document.querySelector('#sex');
const idNumberField = document.querySelector('#id-no');
const selectOptions = document.querySelectorAll('.select-option');
const dropdownButton = document.getElementById('extension-name');
const inputField = document.getElementById('other-extension');
const inputSubmenu = document.querySelector('.input-submenu');
const errorMessage = document.getElementById('error-message');
const ordinalNumber = document.getElementById('ordinal-number');
const submitButton = document.getElementById('submit-btn');
const provinceField = document.querySelector('#province');

// Security Answers
const sa1Field = document.getElementById('security-answer-1');
const sa2Field = document.getElementById('security-answer-2');
const sa3Field = document.getElementById('security-answer-3');

const toggleSA1Btn = document.getElementById('toggleSA1');
const sa1Icon = document.getElementById('sa1Icon');
const toggleSA2Btn = document.getElementById('toggleSA2');
const sa2Icon = document.getElementById('sa2Icon');
const toggleSA3Btn = document.getElementById('toggleSA3');
const sa3Icon = document.getElementById('sa3Icon');

const showError = (el, message) => {
  let errMessage;
  el.classList.add('is-invalid');
  el.classList.remove('is-valid');
  errMessage = el.parentElement.querySelector('.invalid-feedback');
  errMessage.textContent = message;
}

const showSuccess = (el, message) => {
  let errMessage;
  el.classList.add('is-valid');
  el.classList.remove('is-invalid');
  errMessage = el.parentElement.querySelector('.invalid-feedback');

  errMessage.textContent = message;

}

const debounce = (func, delay) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay)
  }
}

const hasDoubleSpace = (input) => {
  const doubleSpaceRegEx = /\s{2,}/g;
  return doubleSpaceRegEx.test(input);
}

const hasThreeConsecutiveLetters = (input) => {
  const threeConsecutiveRegEx = /(.)\1{2,}/i;
  return threeConsecutiveRegEx.test(input);
}

const isAlphabet = (input) => {
  const specialCharacterRegex = /^[A-Za-z\s]+$/;
  return specialCharacterRegex.test(input);
}

const isIdNumberTaken = async (idNumber) => {

  try {
    const res = await fetch(`../php/check_idnumber.php?id_no=${encodeURIComponent(idNumber)}`);
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error('Error fetching idnumber:', error);
    return false;
  }
};

const validateIdNo = async () => {
  const idValue = idNumberField.value;
  const idRegex = /^\d{4}-\d{4}$/;
  const taken = await isIdNumberTaken(idValue);

  if (idValue.length === 0) {
    showError(idNumberField, "ID No. is required.");
    return false;
  }

  if (idValue.includes(" ")) {
    showError(idNumberField, "ID No. must not contain spaces.");
    return false;
  }

  if (!idRegex.test(idValue)) {
    showError(idNumberField, "ID No. must follow the format (Ex. XXXX-XXXX)");
    return false;
  }

  if (taken) {
    showError(idNumberField, "ID number is already taken.");
    return false;
  }

  showSuccess(idNumberField, "");
  return true;
};

idNumberField.addEventListener('keydown', function (event) {
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

  if (event.key === '-' && idNumberField.value.includes('-')) {
    event.preventDefault();
  }
});

// const capitalChecker = (field, nameWords, fieldname) => {
//   for (let word of nameWords) {
//     if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
//       showError(field, `All words of every ${fieldname} must start with a capital letter`);
//       return false;
//     }

//     const restOfWord = word.slice(1);
//     if (restOfWord.match(/[A-Z]/)) {
//       showError(field, `Each word in  ${fieldname} must begin with a capital letter, and the remaining letters must be lowercase.`);
//       return false;
//     }
//   }
//   return true;
// }

const capitalChecker = (field, nameWords, fieldname) => {
  const wordsToFix = [];  // Array to store words that need capitalization
  const errorMessages = [];  // Array to store error messages

  // Loop through each word
  for (let i = 0; i < nameWords.length; i++) {
    let word = nameWords[i];

    // Check if the first letter is uppercase
    if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
      wordsToFix.push(i + 1);  // Store the position of the word (1-based index)
    }

    // Check if any subsequent letters are uppercase
    const restOfWord = word.slice(1);
    if (restOfWord.match(/[A-Z]/)) {
      wordsToFix.push(i + 1);  // Store the position of the word (1-based index)
      break;  // No need to check further once we find an invalid word
    }
  }

  // If there are words to fix, generate the error message
  if (wordsToFix.length > 0) {
    // Generate a more specific error message
    if (wordsToFix.length === 1) {
      errorMessages.push(`Your ${getOrdinal(wordsToFix[0])} word of your ${fieldname} must be capitalized.`);
    } else {
      const wordList = wordsToFix.map(index => getOrdinal(index)).join(", ");
      errorMessages.push(`Your ${wordList} words of your ${fieldname} must be capitalized.`);
    }

    showError(field, errorMessages.join(' '));  // Show the generated error message
    return false;
  }

  return true;
}

// Helper function to convert numbers to ordinal (1 -> 'first', 2 -> 'second')
const getOrdinal = (num) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};


const checkFirstName = () => {
  const firstName = fname.value;
  const min = 2, max = 20;


  if (firstName.length === 0) {
    showError(fname, "First name is required.");
    return false;
  }

  if (firstName.indexOf(0) == " ") {
    showError(fname, "First name must not start with space.");
    return false
  }

  if (/\d.*[a-zA-Z]/.test(firstName)) {
    showError(fname, "First name must not contain a letter after a number.");
    return false;
  }

  if (/^\d/.test(firstName)) {
    showError(fname, "First name must not start with a number.");
    return false;
  }


  if (hasDoubleSpace(firstName)) {
    showError(fname, "First name must not have double space");
    return false
  }

  if (/^[^a-zA-Z0-9]/.test(firstName)) {
    showError(fname, "First name must not start with a special character.");
    return false;
  }

  // if (/[^a-zA-Z0-9]$/.test(firstName)) {
  //   showError(fname, "First name must not end with a special character.");
  //   return false;
  // }

  if (/\d$/.test(firstName)) {
    showError(fname, "First name must not end with a number.");
    return false;
  }



  if (firstName.length < min || firstName.length > max) {
    showError(fname, "First name must be between 2 and 20 character");
    console.log('helllo')
    return false;
  }



  if (hasThreeConsecutiveLetters(firstName)) {
    showError(fname, "First name must not contain 3 consecutive letters or more");
    return false
  }

  // if(firstName.charAt(0) !== firstName.charAt(0).toUpperCase()){
  //   showError(fname, "First letter of name must be a capital letter")
  //   return false;
  // }

  const nameWords = firstName.split(" ");

  if (!capitalChecker(fname, nameWords, "first name")) {
    return false;
  }

  if (!isAlphabet(firstName)) {
    showError(fname, "First name must not contain an special character or a number");
    return false;
  }

  showSuccess(fname, "");
  return true;
}

const checkLastName = () => {
  const lastName = lname.value
  const min = 2, max = 20;

  if (lastName.length === 0) {
    showError(lname, "Last name is required.");
    return false;
  }

  if (/\d.*[a-zA-Z]/.test(lastName)) {
    showError(lname, "Last name must not contain a letter after a number.");
    return false;
  }

  if (hasThreeConsecutiveLetters(lastName)) {
    showError(lname, "Last name must not contain 3 consecutive letters or more");
    return false
  }

  if (hasDoubleSpace(lastName)) {
    showError(lname, "Last name must not have double space");
    return false;
  }

  if (/^\d/.test(lastName)) {
    showError(lname, "Last name must not start with a number.");
    return false;
  }

  if (/^[^a-zA-Z0-9]/.test(lastName)) {
    showError(lname, "Last name must not start with a special character.");
    return false;
  }

  // if (/[^a-zA-Z0-9]$/.test(lastName)) {
  //   showError(lname, "Last name must not end with a special character.");
  //   return false;
  // }

  if (/\d$/.test(lastName)) {
    showError(lname, "Last name must not end with a number.");
    return false;
  }


  if (lastName.length < min || lastName.length > max) {
    showError(lname, "Last name must be between 2 and 20 character");
    if (lastName.length > 20) {
      lastName.slice(0, 20);
    }
    return false;
  }




  const nameWords = lastName.split(" ");

  if (!capitalChecker(lname, nameWords, "last name")) {
    return false;
  }

  if (!isAlphabet(lastName)) {
    showError(lname, "Last name must not contain an special character or a number");
    return false;
  }

  showSuccess(lname, "");
  return true;
}

const checkMiddleName = () => {
  const middleNameField = mname.value;
  const min = 2, max = 20;

  if (middleNameField.length === 0) {
    mname.classList.remove('is-valid', 'is-invalid');
    return true;
  }

  if (/\d.*[a-zA-Z]/.test(middleNameField)) {
    showError(mname, "Middle name must not contain a letter after a number.");
    return false;
  }

  if (/^\d/.test(middleNameField)) {
    showError(mname, "Middle name must not start with a number.");
    return false;
  }
  if (hasThreeConsecutiveLetters(middleNameField)) {
    showError(mname, "Middle Name must not contain 3 consecutive letters or more");
    return false;
  }

  if (hasDoubleSpace(middleNameField)) {
    showError(mname, "Middle Name must not have double space");
    return false;
  }

  if (/^[^a-zA-Z0-9]/.test(middleNameField)) {
    showError(mname, "Middle name must not start with a special character.");
    return false;
  }

  // if (/[^a-zA-Z0-9]$/.test(middleNameField)) {
  //   showError(mname, "Middle name must not end with a special character.");
  //   return false;
  // }

  if (/\d$/.test(middleNameField)) {
    showError(mname, "Middle name must not end with a number.");
    return false;
  }

  if (middleNameField.length < min || middleNameField.length > max) {
    showError(mname, "Middle Name must be between 2 and 20 character");
    if (middleNameField.length > 20) {
      middleNameField.slice(0, 20);
    }
    return false;
  }


  const nameWords = middleNameField.split(" ");

  if (!capitalChecker(mname, nameWords, "middle name")) {
    return false;
  }

  if (!isAlphabet(middleNameField)) {
    showError(mname, "Middle name must not contain an special character or a number");
    return false;
  }

  showSuccess(mname, "");
  return true;

}

const isUsernameTaken = async (username) => {

  try {
    const res = await fetch(`../php/checkusername.php?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error('Error fetching username:', err);
    return false;
  }
};

const checkUserName = async () => {
  const username = uname.value
  // const validUserRegEx = /^(?!_)(?!.*__)[A-Za-z0-9_.]+(?<!_)$/;
  // const validUserRegEx = /^(?!_)(?!.*__)[a-z0-9_.]+(?<!_)$/;
  // const validUserRegEx = /^(?!.*[_.]{2})(?!.*\d[_.])(?!.*[_.]\d)(?!.*\d{2})[a-z]+(?:[._]?[a-z]+)*\d?$/;
  const validUserRegEx = /^(?!.*[_.]{2})(?!.*\d[_.])(?!.*[_.]\d)[a-z]+(?:[._]?[a-z]+)*\d*$/;

  const min = 3, max = 10;
  const taken = await isUsernameTaken(username)

  if (username.length === 0) {
    showError(uname, "Username is required.");
    return false;
  }

  if (/\d.*[a-zA-Z]/.test(username)) {
    showError(uname, "Username must not contain a letter after a number.");
    return false;
  }

  if (/^\d/.test(username)) {
    showError(uname, "Username must not start with a number.");
    return false;
  }

  if (/^[^a-zA-Z0-9]/.test(username)) {
    showError(uname, "Username must not start with a special character.");
    return false;
  }

  // if (/[^a-zA-Z0-9]$/.test(username)) {
  //   showError(uname, "First name must not end with a special character.");
  //   return false;
  // }

  if (hasDoubleSpace(username)) {
    showError(uname, "Username must not have double space");
    return false;
  }

  if (username.includes(' ')) {
    showError(uname, "Username must not contain spaces.");
    return false;
  }

  if (username.length < min || username.length > max) {
    showError(uname, `Username must be between ${min} and ${max} characters long.`);
    return false;
  }

  if (!validUserRegEx.test(username)) {
    showError(uname, 'Username can only contain small letters, numbers, dot, and underscores, and cannot start or end with an underscore.');
    return false;
  }

  if (taken) {
    showError(uname, "Username is already taken.");
    return false;
  }





  showSuccess(uname, "Username is available")
  return true;

}

const indicator = document.querySelector('.password-indicator');

const isPassword = async (password) => {
  try {
    const res = await fetch(`../php/check_password.php?password=${encodeURIComponent(password)}`);
    const data = await res.json();

    return data.exists === "true";
  } catch (err) {
    console.error('Error fetching password:', err);
    return false;
  }
};

const passwordValidator = async () => {
  const password = passwordField.value;
  let strength = 0;
  const passwordTaken = await isPassword(password)

  indicator.innerHTML = "";
  indicator.className = "password-indicator";
  if (password.length === 0) {
    showError(passwordField, "Password is required.");
    return false;
  }

  const lengthValid = password.length >= 8 && password.length <= 20;
  if (!lengthValid) {
    showError(passwordField, "Password must contain at least 8 to 20 characters");
    return false;
  }
  console.log(passwordTaken);
  if (passwordTaken) {
    showError(passwordField, "Password is already taken.");
    return false;
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*_?]/.test(password);

  if (lengthValid) strength += 1;
  if (hasNumber) strength += 1;
  if (hasLowercase) strength += 1;
  if (hasUppercase) strength += 1;
  if (hasSpecialChar) strength += 1;

  let strengthText = "Password strength: ";
  let strengthLevel = "";
  let colorClass = "";
  if (strength < 3) {
    strengthLevel = "Weak";
    colorClass = "text-danger";
    passwordField.classList.remove('is-valid');
    passwordField.classList.remove('is-invalid');
  } else if (strength >= 3 && strength < 5) {
    strengthLevel = "Medium";
    colorClass = "text-warning";
    passwordField.classList.remove('is-valid');
    passwordField.classList.remove('is-invalid');
  } else if (strength === 5) {
    strengthLevel = "Strong";
    colorClass = "text-success";
    showSuccess(passwordField, "");
  }

  indicator.innerHTML = `<span class="${colorClass}"> ${strengthText} ${strengthLevel}</span>`;


  return true;
};

const passwordIcon = document.getElementById('passwordIcon');
const confirmPasswordIcon = document.getElementById('confirmPasswordIcon');

const togglePasswordVisibility = (inputField, icon) => {
  const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
  inputField.setAttribute('type', type);

  if (type === 'text') {
    icon.src = '../assets/icons/visibility_off.svg';
    icon.alt = 'Hide Password';
  } else {
    icon.src = '../assets/icons/visibility_on.svg';
    icon.alt = 'Show Password';
  }
};

const togglePasswordButton = document.getElementById('togglePassword');
togglePasswordButton.addEventListener('click', function () {
  togglePasswordVisibility(passwordField, passwordIcon);
});
const toggleConfirmPasswordButton = document.getElementById('toggleConfirmPassword');
toggleConfirmPasswordButton.addEventListener('click', function () {
  togglePasswordVisibility(confirmPasswordField, confirmPasswordIcon);
});

// Security Answer Toggles
if (toggleSA1Btn && sa1Field && sa1Icon) {
  toggleSA1Btn.addEventListener('click', function () {
    togglePasswordVisibility(sa1Field, sa1Icon);
  });
}
if (toggleSA2Btn && sa2Field && sa2Icon) {
  toggleSA2Btn.addEventListener('click', function () {
    togglePasswordVisibility(sa2Field, sa2Icon);
  });
}
if (toggleSA3Btn && sa3Field && sa3Icon) {
  toggleSA3Btn.addEventListener('click', function () {
    togglePasswordVisibility(sa3Field, sa3Icon);
  });
}

const confirmPassword = () => {
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;

  if (confirmPassword.length < 1) {
    showError(confirmPasswordField, 'Confirm password is required.');
    return false;
  }

  if (password !== confirmPassword) {
    showError(confirmPasswordField, "Password do not match");
    return false
  }

  showSuccess(confirmPasswordField, "")
  return true;

}

const validateSex = () => {
  const sex = sexField.value;

  if (sex === "") {
    showError(sexField, "Sex is required");
    return false;
  }

  showSuccess(sexField, "");
  return true;
}


const isEmailTaken = async (email) => {

  try {
    const res = await fetch(`../php/checkemail.php?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    return data.exists;
  } catch (err) {
    console.error('Error fetching email:', err);
    return false;
  }
};



const validateEmail = async () => {
  const email = emailField.value;
  // const emailRegex = /^[a-zA-Z][a-zA-Z0-9._]*@[a-zA-Z]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  const emailPattern = /^[a-z0-9]+(\.[a-z0-9]+)*@[a-z0-9]+(\.[a-z]{2,})+$/;
  const emailMin = 4;
  const emailMax = 60;
  const emailTaken = await isEmailTaken(email);

  if (email.includes(' ')) {
    showError(emailField, "Email must not contain spaces.");
    return false;
  }

  if (hasDoubleSpace(email)) {
    showError(emailField, "Middle Name must not have double space");
    return false;
  }
  if (email.length === 0) {
    showError(emailField, "Email is required.");
    return false;
  }

  if (emailTaken) {
    showError(emailField, "Email is already taken.");
    return false;
  }

  if (email.length < emailMin || email.length > emailMax) {
    showError(emailField, `Email must have ${emailMin} to ${emailMax} characters.`);
    return false;
  }

  if (!emailPattern.test(email)) {
    showError(emailField, "Please enter a valid email address. It must be all small letter, and can use dot");
    return false;
  }


  showSuccess(emailField, "Email is available")
  return true;
};

const validateCountry = () => {
  const country = countryField.value;
  const countryMin = 3;
  const countryMax = 60;

  if (country.length === 0) {
    showError(countryField, "Country is required.");
    return false;
  }        // Regex for checking if a word starts with a capital letter followed by lowercase letters
  // const capitalAndLowercaseRegex = /^[A-Z][a-z]+$/;
  // const capitalAndLowercaseRegex2 = /^[A-Z][a-z]*(?:-[a-zA-Z0-9]+)*(\s\d+)?$/;


  // // Split names into parts (words)
  // const fnameParts = fname.trim().split(" ");
  // const lnameParts = lname.trim().split(" ");
  // const Purokpart = Purok.trim().split(" ");
  // const barangaypart = barangay.trim().split(" ");
  // const CMpart = CM.trim().split(" ");
  // const provincepart = province.trim().split(" ");
  // const countrypart = country.trim().split(" ");


  // === First Name Validation ===
  // Validate each part of the first name


  // for (let i = 0; i < barangaypart.length; i++) {
  //     // If the first character is a number (0-9)
  //     if (/\d/.test(barangaypart[i][0])) {
  //         // If the string has more than 1 character, check that it's all numbers
  //         if (barangaypart[i].length > 1 && /[a-zA-Z]/.test(barangaypart[i][1])) {
  //             alert(`The word "${barangaypart[i]}" in the Barangay Name should not start with a number and contain a letter immediately after.`);
  //             return false;
  //         }
  //     }
  //     // If the first character is a letter
  //     else if (/[a-zA-Z]/.test(barangaypart[i][0])) {
  //         // Check if the first letter is uppercase and the rest of the string is lowercase
  //         if (!barangaypart[i].match(capitalAndLowercaseRegex2)) {
  //             alert(`The word "${barangaypart[i]}" in the Barangay should start with a capital letter followed by lowercase letters.`);
  //             return false;
  //         }
  //     }
  // }

  if (/^\d/.test(country)) {
    showError(countryField, "Country must not start with a number.");
    return false;
  }

  if (/^[^a-zA-Z0-9]/.test(country)) {
    showError(countryField, "Country must not start with a special character.");
    return false;
  }

  if (hasDoubleSpace(country)) {
    showError(countryField, "Country should not have double spaces.");
    return false;
  }

  // if (country.includes(' ')) {
  //   showError(countryField, "Country must not contain spaces.");
  //   return false;
  // }

  if (country.length < countryMin || country.length > countryMax) {
    showError(countryField, "Country must have atleast 3 to 60 characters")
    return false;
  }

  if (hasDoubleSpace(country)) {
    showError(countryField, "Country name must not have double space");
    return false;
  }

  if (hasThreeConsecutiveLetters(country)) {
    showError(countryField, "Country name must not have three consecutive letters");
    return false
  }

  const countryWords = country.split(" ");

  // for (let word of countryWords) {
  //   if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
  //     showError(countryField, "All country names must start with a capital letter");
  //     return false;
  //   }

  //   const restOfWord = word.slice(1);
  //   if (restOfWord.match(/[A-Z]/)) {
  //     showError(countryField, "Only the first letter of each word in country field should be capitalized");
  //     return false;
  //   }
  // }
  if (!capitalChecker(cityField, countryWords, "country")) {
    return false;
  }

  if (!isAlphabet(country)) {
    showError(countryField, "Country name must not contain an special character");
    return false;
  }

  showSuccess(countryField, "")
  return true;
}

const validateZipCode = () => {
  const zipCode = zipCodeField.value;
  const zipMin = 4;
  const zipMax = 6;
  // const zipCodePattern = /^[A-Z0-9]{4,}( [A-Z0-9]+)?$/;
  const zipCodePattern = /^[0-9]{4,}( [0-9]+)?$/;


  if (zipCode.length === 0) {
    showError(zipCodeField, "ZIP Code is required.");
    return false;
  }

  if (hasDoubleSpace(zipCode)) {
    showError(zipCodeField, "Zip Code should not have double spaces.");
    return false;
  }

  // if (zipCode.includes(' ')) {
  //   showError(zipCodeField, "Zip Code must not contain spaces.");
  //   return false;
  // }

  if (zipCode.length < zipMin || zipCode.length > zipMax) {
    showError(zipCodeField, `ZIP Code must have at least ${zipMin} to ${zipMax} characters`);
    return false;
  }

  if (!zipCodePattern.test(zipCode)) {
    showError(zipCodeField, "ZIP Code must only contain numbers");
    return false;
  }

  if (zipCode.includes("  ")) {
    showError(zipCodeField, "ZIP code must not contain double spaces.");
    return false;
  }

  showSuccess(zipCodeField, "");
  return true;

}

const validateCity = () => {
  const city = cityField.value;
  const cityMin = 4;
  const cityMax = 60;

  if (city.length === 0) {
    showError(cityField, "City is required.");
    return false;
  }

  if (hasDoubleSpace(city)) {
    showError(cityField, "City should not have double spaces.");
    return false;
  }

  // if (city.includes(' ')) {
  //   showError(cityField, "City must not contain spaces.");
  //   return false;
  // }



  if (city.length < cityMin || city.length > cityMax) {
    showError(cityField, "City must have at least 2 to 60 characters");
    return false;
  }

  if (city.includes("  ")) {
    showError(cityField, "City name must not contain double spaces.");
    return false;
  }

  const cityWords = city.split(" ");
  const cityRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[\s\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
  const firstWord = cityWords[0];
  const subsequentWords = cityWords.slice(1);


  if (!cityRegex.test(firstWord)) {
    showError(cityField, "City name must contain only letters, single spaces, or dashes, and each word must start with a capital letter.");
    return false;
  }


  // for (let word of cityWords) {
  //   if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
  //     showError(cityField, "All city names must start with a capital letter");
  //     return false;
  //   }

  //   const restOfWord = word.slice(1);
  //   if (restOfWord.match(/[A-Z]/)) {
  //     showError(cityField, "Only the first letter of each word in city field hould be capitalized");
  //     return false;
  //   }
  // }
  if (!capitalChecker(cityField, cityWords, "city")) {
    return false;
  }

  for (let word of subsequentWords) {
    if (word.includes('-')) {
      showError(cityField, "Only the first word of the city name can contain a hyphen.");
      return false;
    }

    const subsequentWordRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/;
    if (!subsequentWordRegex.test(word)) {
      showError(cityField, "City field words must contain only letters.");
      return false;
    }
  }

  showSuccess(cityField, "");
  return true;
}


// const validateBarangayName = () => {
//   const barangay = barangayField.value;
//   const barangayMin = 4;
//   const barangayMax = 20;
//   const barangayWords = barangay.split(" ");

//   if(barangay.length === 0){
//     showError(barangayField, "Barangay is required.");
//     return false;
//   }

//   if (barangay.includes(" ")) {
//     showError(idNumberField, "ID No. must not contain spaces.");
//     return false;
//   }

//   if(barangay.length < barangayMin || barangay.length > barangayMax){
//     showError(barangayField, `Barangay should have at least ${barangayMin} to ${barangayMax} character`);
//     return false;
//   }

//   if(hasDoubleSpace(barangay)){
//     showError(barangayField, "Barangay should not have double spaces");
//     return false;
//   }

//   // if(!isAlphabet(barangay)){
//   //   showError(barangayField, "Barangay name must not contain an special character");
//   //   return false;
//   // }

//   if(hasThreeConsecutiveLetters(barangay)){
//     showError(barangayField, "Barangay name must not contain 3 consecutive letters or more");
//     return false
//   }

//   for(let brgywords of barangayWords){
//     if(brgywords.charAt(0) !== brgywords.charAt(0).toUpperCase()){
//       showError(barangayField, "All barangay names must start with a capital letter");
//       return false;
//     }

//     const barangayRestWords = brgywords.slice(1);
//     if(barangayRestWords.match(/[A-Z]/)){
//       showError(barangayField, "Only the first words of barangay should have capital");
//       return false;
//     }
//   }

//   const subsequentWords = barangayWords.slice(1);
//   for (let word of subsequentWords) {
//     if (word.includes('-')) {
//       showError(cityField, "Only the first word of the barangay name can contain a hyphen.");
//       return false;
//     }

//     const subsequentWordRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/;
//     if (!subsequentWordRegex.test(word)) {
//       showError(cityField, "Barangay field words must contain only letters.");
//       return false;
//     }
//   }

//   showSuccess(barangayField, "")
//   return true;
// }
const validateBarangayName = () => {
  const capitalAndLowercaseRegex = /^[A-Z][a-z]+$/;
  const capitalAndLowercaseRegex2 = /^[A-Z][a-z]*(?:-[a-zA-Z0-9]+)*(\s\d+)?$/;
  const barangay = barangayField.value;
  const barangayMin = 1;
  const barangayMax = 30;
  const barangayWords = barangay.split(" ");
  const barangaypart = barangay.trim().split(" ");

  if (barangay.length === 0) {
    showError(barangayField, "Barangay is required.");
    return false;
  }

  if (hasDoubleSpace(barangay)) {
    showError(barangayField, "Barangay should not have double spaces.");
    return false;
  }

  // if (barangay.includes(' ')) {
  //   showError(barangayField, "Barangay must not contain spaces.");
  //   return false;
  // }
  if (/^[^a-zA-Z0-9]/.test(barangay)) {
    showError(barangayField, "Barangay must not start with a special character.");
    return false;
  }

  if (/\d.*[a-zA-Z]/.test(barangay)) {
    showError(barangayField, "Barangay  must not contain a letter after a number.");
    return false;
  }
  for (let i = 0; i < barangaypart.length; i++) {
    // If the first character is a number (0-9)
    if (/\d/.test(barangaypart[i][0])) {
      // If the string has more than 1 character, check that it's all numbers
      if (barangaypart[i].length > 1 && /[a-zA-Z]/.test(barangaypart[i][1])) {
        showError(barangayField, `The word "${barangaypart[i]}" in the Barangay Name should not start with a number and contain a letter immediately after.`);
        return false;
      }
    }
    // If the first character is a letter
    else if (/[a-zA-Z]/.test(barangaypart[i][0])) {
      // Check if the first letter is uppercase and the rest of the string is lowercase
      if (!barangaypart[i].match(capitalAndLowercaseRegex2)) {
        showError(barangayField, `The word "${barangaypart[i]}" in the Barangay should start with a capital letter followed by lowercase letters.`);
        return false;
      }
    }
  }

  // if (/^\d/.test(barangay)) {
  //   showError(barangayField, "Barangay must not start with a number.");
  //   return false;
  // }


  if (barangay.length < barangayMin || barangay.length > barangayMax) {
    showError(barangayField, `Barangay should have at least ${barangayMin} to ${barangayMax} characters.`);
    return false;
  }


  if (hasThreeConsecutiveLetters(barangay)) {
    showError(barangayField, "Barangay name must not contain 3 consecutive letters or more.");
    return false;
  }

  // for (let brgyWord of barangayWords) {
  //   if (brgyWord.charAt(0) !== brgyWord.charAt(0).toUpperCase()) {
  //     showError(barangayField, "All words in the Barangay name must start with a capital letter.");
  //     return false;
  //   }

  //   const restOfWord = brgyWord.slice(1);
  //   if (restOfWord.match(/[A-Z]/)) {
  //     showError(barangayField, "Only the first letter of each word in the Barangay name should be capitalized.");
  //     return false;
  //   }
  // }
  // if (!capitalChecker(barangayField,barangayWords, "barangay")) {
  //   return false;
  // }

  // if (!barangayPattern.test(barangay)) {
  //   showError(barangayField, "Barangay name can contain letters, numbers, and a single hyphen.");
  //   return false;
  // }

  // if (!numberOrHyphenPattern.test(barangay)) {
  //   showError(barangayField, "Barangay name can include a number with a hyphen, e.g., Barangay 2-A.");
  //   return false;
  // }


  showSuccess(barangayField, "");
  return true;
};

const purokValidator = () => {
  const purok = purokField.value;
  const purokMin = 1;
  const purokMax = 10;
  const capitalAndLowercaseRegex = /^[A-Z][a-z]+$/;
  const capitalAndLowercaseRegex2 = /^[A-Z][a-z]*(?:-[a-zA-Z0-9]+)*(\s\d+)?$/;
  const purokWords = purok.split(" ");
  const Purokpart = purok.trim().split(" ");
  // const purokPattern = /^[0-9]+-[A-Z]$/;
  // const purokPattern = /^Purok\s[0-9]+-[A-Z]$/;  
  // const purokPattern = /^Purok\s[0-9]+(-[A-Z])?$/;

  if (purok.length === 0) {
    showError(purokField, "Purok is required.");
    return false;
  }

  if (hasDoubleSpace(purok)) {
    showError(purokField, "Purok must not have double space");
    return false;
  }

  // if (purok.includes(' ')) {
  //   showError(purokField, "Purok must not contain spaces.");
  //   return false;
  // }

  if (/\d.*[a-zA-Z]/.test(purok)) {
    showError(purokField, "Purok  must not contain a letter after a number.");
    return false;
  }

  if (/^[^a-zA-Z0-9]/.test(purok)) {
    showError(purokField, "Purok must not start with a special character.");
    return false;
  }
  for (let i = 0; i < Purokpart.length; i++) {
    // If the first character is a number (0-9)
    if (/\d/.test(Purokpart[i][0])) {
      // If the string has more than 1 character, check that it's all numbers
      if (Purokpart[i].length > 1 && /[a-zA-Z]/.test(Purokpart[i][1])) {
        showError(purokField, `The word "${Purokpart[i]}" in the Purok Name should not start with a number and contain a letter immediately after.`);
        return false;
      }
    }
    // If the first character is a letter
    else if (/[a-zA-Z]/.test(Purokpart[i][0])) {
      // Check if the first letter is uppercase and the rest of the string is lowercase
      if (!Purokpart[i].match(capitalAndLowercaseRegex2)) {
        showError(purokField, `The word "${Purokpart[i]}" in the Purok should start with a capital letter followed by lowercase letters.`);
        return false;
      }
    }
  }

  // if (/^\d/.test(purok)) {
  //   showError(purokField, "Purok must not start with a number.");
  //   return false;
  // }


  if (purok.length < purokMin || purok.length > purokMax) {
    showError(purokField, `Purok must contain at least ${purokMin} to ${purokMax} characters.`)
    return false;
  }

  if (hasThreeConsecutiveLetters(purok)) {
    showError(purokField, "Purok must not contain 3 consecutive letters or more");
    return false
  }


  // if (/\d.*[a-zA-Z]/.test(purok)) {
  //   showError(purokField, "Purok  must not contain a letter after a number.");
  //   return false;
  // }

  // if (/[^a-zA-Z0-9]$/.test(purok)) {
  //   showError(purokField, "Purok must not end with a special character.");
  //   return false;
  // }

  // if (/\d$/.test(purok)) {
  //   showError(purokField, "Last name must not end with a number.");
  //   return false;
  // }

  // if (!purokPattern.test(purok)) {
  //   showError(purokField, "Purok must follow the format: Purok 9");
  //   return false;
  // }
  // const purokPattern = /^[A-Za-z\s]*[0-9]+(-[A-Z])?$/;

  // if (!purokPattern.test(purok)) {
  //     showError(purokField, "The input must follow a valid format, such as 'Purok 9', 'Purok 9-A', or 'Purok 9A'.");
  //     return false;
  // }

  // const purokStreetPattern = /^(?:Purok\s)?[0-9]+(-[A-Z])?([A-Za-z\s]+)?(\s(?:St\.|Ave\.|Blvd\.|Rd\.|Dr\.))?$/;

  // if (!purokStreetPattern.test(purok)) {
  //     showError(
  //         purokField,
  //         "The input must follow a valid format, such as 'Purok 9', 'Purok 9-A', '123 Curato St.', or '456 Main Ave.'."
  //     );
  //     return false;
  // }
  // const purokStreetPattern = /^(?:Purok\s)?[Pp]?-?\d+([A-Za-z0-9]?-?[A-Za-z0-9])?$/;
  //   const purokStreetPattern = /^(?:Purok\s)?[Pp]?-?\d+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)?(\s[A-Z][a-zA-Z]*)?$/;

  //   if (!purokStreetPattern.test(purok)) {
  //     showError(
  //         purokField,
  //         "The input must follow a valid format, such as 'Purok 9', 'Purok 9-A', 'P9', 'P-9A'"
  //     );
  //     return false;
  // }



  showSuccess(purokField, "")
  return true;

}

const validateProvince = () => {
  const province = provinceField.value;
  const provinceMin = 3;
  const provinceMax = 20;
  const provinceWords = province.split(" ");

  if (province.length === 0) {
    showError(provinceField, "Province is required.");
    return false;
  }

  if (hasDoubleSpace(province)) {
    showError(provinceField, "Province should not have double spaces.");
    return false;
  }

  // if (province.includes(' ')) {
  //   showError(provinceField, "Province must not contain spaces.");
  //   return false;
  // }

  if (province.length < provinceMin || province.length > provinceMax) {
    showError(provinceField, `Province must contain at least ${provinceMin} to ${provinceMax} characters.`)
    return false;
  }

  if (hasDoubleSpace(province)) {
    showError(provinceField, "Province field must not have double space");
    return false;
  }

  if (!isAlphabet(province)) {
    showError(provinceField, "Province field must not contain an special character");
    return false;
  }

  if (hasThreeConsecutiveLetters(province)) {
    showError(provinceField, "Province field must not contain 3 consecutive letters or more");
    return false
  }

  if (/\d.*[a-zA-Z]/.test(province)) {
    showError(provinceField, "Province  must not contain a letter after a number.");
    return false;
  }

  if (/^\d/.test(province)) {
    showError(provinceField, "Province must not start with a number.");
    return false;
  }

  if (/^[^a-zA-Z0-9]/.test(province)) {
    showError(provinceField, "Province must not start with a special character.");
    return false;
  }

  // if (/[^a-zA-Z0-9]$/.test(province)) {
  //   showError(provinceField, "Province must not end with a special character.");
  //   return false;
  // }

  // if (/\d$/.test(province)) {
  //   showError(provinceField, "Last name must not end with a number.");
  //   return false;
  // }
  // for(let prvnceword of provinceWords){
  //   if(prvnceword.charAt(0) !== prvnceword.charAt(0).toUpperCase()){
  //     showError(provinceField, "Province field words must start with a capital letter");
  //     return false;
  //   }

  //   const provinceRestWords = prvnceword.slice(1);
  //   if(provinceRestWords.match(/[A-Z]/)){
  //     showError(provinceField, "Only the first words of purok should have capital");
  //     return false;
  //   }
  // }
  if (!capitalChecker(provinceField, provinceWords, "province")) {
    return false;
  }

  showSuccess(provinceField, "")
  return true;
}

passwordField.addEventListener('input', function (e) {
  if (confirmPasswordField.value !== '') {
    confirmPassword();
  }
})

// Legacy submit handler removed — registration.js AJAX handler now owns form submission.
// All validation functions above are still called by the AJAX handler and by real-time input events.

// Get references to the birthdate and age input fields
const birthdateInput = document.getElementById('birthdate');
const ageInput = document.getElementById('age');
const birthdateError = document.getElementById('birthdate-error');
const ageError = document.getElementById('age-error');

// Function to calculate age based on birthdate
function calculateAge(birthdate) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Function to validate and update the age
function validateAndSetAge() {
  const birthdateValue = birthdateInput.value;
  const age = calculateAge(birthdateValue);
  const minAge = 18;
  console.log(!birthdateValue)

  // Get the feedback elements
  const birthdateInvalidFeedback = birthdateInput.parentElement.querySelector('.invalid-feedback');
  const ageInvalidFeedback = ageInput.parentElement.querySelector('.invalid-feedback');

  if (!birthdateValue) {
    birthdateError.textContent = 'Birthdate is required. Please enter your birthdate.';
    birthdateError.classList.add('text-danger');
    if (birthdateInvalidFeedback) birthdateInvalidFeedback.textContent = '';
    birthdateInput.classList.add('is-invalid');
    birthdateInput.classList.remove('is-valid');

    ageInput.value = '';
    ageError.textContent = 'Please fill birthdate field correctly to get your age';
    ageError.classList.add('text-danger');
    if (ageInvalidFeedback) ageInvalidFeedback.textContent = '';
    ageInput.classList.add('is-invalid');
    ageInput.classList.remove('is-valid');
    return false;
  } else if (age < minAge) {
    ageInput.value = age;
    birthdateInput.classList.remove('is-invalid');
    birthdateInput.classList.add('is-valid');
    birthdateError.textContent = '';
    birthdateError.classList.remove('text-danger');
    if (birthdateInvalidFeedback) birthdateInvalidFeedback.textContent = '';

    ageError.textContent = `You must be at least ${minAge} years old.`;
    ageError.classList.add('text-danger');
    if (ageInvalidFeedback) ageInvalidFeedback.textContent = '';
    ageInput.classList.add('is-invalid');
    ageInput.classList.remove('is-valid');
    return false;
  } else {
    ageInput.value = age;

    // Clear all birthdate errors
    birthdateInput.classList.remove('is-invalid');
    birthdateInput.classList.add('is-valid');
    birthdateError.textContent = '';
    birthdateError.classList.remove('text-danger');
    if (birthdateInvalidFeedback) birthdateInvalidFeedback.textContent = '';

    // Clear all age errors
    ageInput.classList.remove('is-invalid');
    ageInput.classList.add('is-valid');
    ageError.textContent = '';
    ageError.classList.remove('text-danger');
    if (ageInvalidFeedback) ageInvalidFeedback.textContent = '';
    return true;
  }
}


birthdateInput.addEventListener('change', validateAndSetAge);

// ─── Security Question / Answer Validation ───
const securityQuestion1 = document.getElementById('security-question-1');
const securityQuestion2 = document.getElementById('security-question-2');
const securityQuestion3 = document.getElementById('security-question-3');
const securityAnswer1 = document.getElementById('security-answer-1');
const securityAnswer2 = document.getElementById('security-answer-2');
const securityAnswer3 = document.getElementById('security-answer-3');

const validateSecurityAnswer = (answerField, questionField, label) => {
  const answer = answerField.value;
  const question = questionField.value;
  const min = 2, max = 50;

  // Question must be selected
  if (!question || question === '') {
    showError(questionField, label.replace('Answer', 'Question') + ' is required.');
    return false;
  } else {
    showSuccess(questionField, '');
  }

  // Answer required
  if (answer.length === 0) {
    showError(answerField, label + ' is required.');
    return false;
  }

  // Must not start with space
  if (answer.charAt(0) === ' ') {
    showError(answerField, label + ' must not start with a space.');
    return false;
  }

  // No double spaces
  if (hasDoubleSpace(answer)) {
    showError(answerField, label + ' must not have double spaces.');
    return false;
  }

  // Must not start with a number
  if (/^\d/.test(answer)) {
    showError(answerField, label + ' must not start with a number.');
    return false;
  }

  // Must not start with a special character
  if (/^[^a-zA-Z0-9]/.test(answer)) {
    showError(answerField, label + ' must not start with a special character.');
    return false;
  }

  // Must not end with a number
  if (/\d$/.test(answer)) {
    showError(answerField, label + ' must not end with a number.');
    return false;
  }

  // Length check
  if (answer.length < min || answer.length > max) {
    showError(answerField, label + ' must be between ' + min + ' and ' + max + ' characters.');
    return false;
  }

  // No 3 consecutive identical characters
  if (hasThreeConsecutiveLetters(answer)) {
    showError(answerField, label + ' must not contain 3 consecutive identical characters.');
    return false;
  }

  // Capital letter check (each word must be capitalized)
  const answerWords = answer.split(' ');
  if (!capitalChecker(answerField, answerWords, label.toLowerCase())) {
    return false;
  }

  // Letters and spaces only
  if (!isAlphabet(answer)) {
    showError(answerField, label + ' must contain only letters and spaces.');
    return false;
  }

  showSuccess(answerField, '');
  return true;
};

window.validateAllSecurityQuestions = () => {
  let allValid = true;

  // Validate each pair
  if (!validateSecurityAnswer(securityAnswer1, securityQuestion1, 'Answer 1')) allValid = false;
  if (!validateSecurityAnswer(securityAnswer2, securityQuestion2, 'Answer 2')) allValid = false;
  if (!validateSecurityAnswer(securityAnswer3, securityQuestion3, 'Answer 3')) allValid = false;

  // Check that all 3 questions are different
  const q1 = securityQuestion1.value;
  const q2 = securityQuestion2.value;
  const q3 = securityQuestion3.value;

  if (q1 && q2 && q1 === q2) {
    showError(securityQuestion2, 'Security Question 2 must be different from Question 1.');
    allValid = false;
  }
  if (q1 && q3 && q1 === q3) {
    showError(securityQuestion3, 'Security Question 3 must be different from Question 1.');
    allValid = false;
  }
  if (q2 && q3 && q2 === q3) {
    showError(securityQuestion3, 'Security Question 3 must be different from Question 2.');
    allValid = false;
  }

  return allValid;
};

// Expose for registration.js AJAX handler
window.validateAllSecurityQuestions = validateAllSecurityQuestions;
window.checkFirstName = checkFirstName;
window.checkMiddleName = checkMiddleName;
window.checkLastName = checkLastName;
window.validateIdNo = validateIdNo;
window.checkUserName = checkUserName;
window.validateEmail = validateEmail;
window.passwordValidator = passwordValidator;
window.confirmPassword = confirmPassword;
window.validateSex = validateSex;
window.purokValidator = purokValidator;
window.validateBarangayName = validateBarangayName;
window.validateCity = validateCity;
window.validateCountry = validateCountry;
window.validateZipCode = validateZipCode;
window.validateProvince = validateProvince;
window.validateAndSetAge = validateAndSetAge;

const validateFormInput = (e) => {
  switch (e.target.id) {
    case 'id-no':
      validateIdNo();
      break;
    case 'first-name':
      checkFirstName();
      break;
    case 'middle-name':
      checkMiddleName();
      break;
    case 'last-name':
      checkLastName();
      break;
    case 'user-name':
      checkUserName();
      break;
    case 'password':
      passwordValidator();
      break;
    case 'confirm-password':
      confirmPassword();
      break;
    case 'email-form':
      validateEmail();
      break;
    case 'country-form':
      validateCountry();
      break;
    case 'zipCode':
      validateZipCode();
      break;
    case 'city-form':
      validateCity();
      break;
    case 'barangay':
      validateBarangayName();
      break;
    case 'purok-street':
      purokValidator();
      break;
    case 'sex':
      validateSex();
      break;
    case 'province':
      validateProvince();
      break;
    case 'birthdate':
      validateAndSetAge()
      break;
    case 'security-question-1':
    case 'security-answer-1':
      validateSecurityAnswer(securityAnswer1, securityQuestion1, 'Answer 1');
      break;
    case 'security-question-2':
    case 'security-answer-2':
      validateSecurityAnswer(securityAnswer2, securityQuestion2, 'Answer 2');
      break;
    case 'security-question-3':
    case 'security-answer-3':
      validateSecurityAnswer(securityAnswer3, securityQuestion3, 'Answer 3');
      break;
  }
};


form.addEventListener('input', debounce(validateFormInput, 400));
form.addEventListener('change', validateFormInput);

$(document).ready(function () {
  $('.select-option').on("click", function (e) {
    const selectedValue = $(this).data('value');
    $('#extension-name').text(selectedValue);
    $('#selected-extension').val(selectedValue);
    $('.input-submenu').hide();

    if (selectedValue !== 'Other') {
      $('#other-extension').val('');
      $('#ordinal-number').text('');
      $('#error-message').hide();
    }

    e.preventDefault();
  });

  $('.dropdown-submenu a.test').on("click", function (e) {
    var inputField = $(this).siblings('.input-submenu');
    inputField.toggle();
    e.stopPropagation();
    e.preventDefault();
  });

  $('#other-extension').on('input', function () {
    const value = $(this).val();
    const romanRegex = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    const errorMessage = $('#error-message');
    const ordinalNumber = $('#ordinal-number');

    if (/[a-z]/.test(value)) {
      errorMessage.text('Please use uppercase Roman numerals (I, V, X, L, C, D, M) only.').show();
      ordinalNumber.text('');
    } else if (/\s/.test(value)) {
      errorMessage.text('No spaces are allowed.').show();
      ordinalNumber.text('');
    } else if (/\d/.test(value)) {
      errorMessage.text('No numbers are allowed.').show();
      ordinalNumber.text('');
    } else if (value && !romanRegex.test(value)) {
      errorMessage.text('Invalid Roman numeral.').show();
      ordinalNumber.text('');
    } else {
      errorMessage.hide();

      if (value) {
        const arabicValue = romanToInt(value);
        if (arabicValue > 0) {
          ordinalNumber.text(`You are: ${arabicValue}${getOrdinalSuffix(arabicValue)}`);
        } else {
          ordinalNumber.text('');
        }
      } else {
        ordinalNumber.text('');
      }
    }
  });


  $('.input-submenu .submit-btn').on('click', function () {
    const inputValue = $('#other-extension').val().trim();
    const arabicValue = romanToInt(inputValue);

    if (arabicValue > 0 && /^[IVXLCDM]+$/.test(inputValue) && !/\s/.test(inputValue) && !/\d/.test(inputValue)) {
      $('#extension-name').text(inputValue)
      $('#selected-extension').val(inputValue)
      $('.input-submenu').hide();
      $('#other-extension').val('')
      $('#ordinal-number').text('');
      $('#error-message').hide();
    } else {
      alert('Please enter a valid uppercase Roman numeral (no spaces or numbers) before submitting.');
    }
  });
});

function romanToInt(roman) {
  const romanNumerals = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };
  let total = 0;
  let prevValue = 0;

  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanNumerals[roman[i]] || 0;

    if (currentValue < prevValue) {
      total -= currentValue
    } else {
      total += currentValue;
    }
    prevValue = currentValue;
  }
  return total;
}

function getOrdinalSuffix(num) {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}

// Use 'pageshow' instead of 'onload' to prevent back-forward cache (bfcache) bypass
window.addEventListener('pageshow', function (event) {
  // If event.persisted is true, the page was loaded from cache (e.g., via Back button)
  if (sessionStorage.getItem('username')) {
    // If already logged in, they shouldn't be registering.
    window.location.href = '../php/home.php';
    return;
  }
  const currentTime = Date.now();
  const lockoutTime = localStorage.getItem('lockoutTime');

  if (lockoutTime && currentTime < lockoutTime) {
    // Strictly redirect to login if locked out
    window.location.replace('index.html'); // replace prevents history loop
  }
});
function destroyHistory() {
  // Initially push 100 states
  for (let i = 0; i < 50; i++) {
    window.history.pushState(null, null, window.location.href);
  }

  // Continuously push the current state into the history every 100 milliseconds
  setInterval(function () {
    window.history.pushState(null, null, window.location.href);
  }, 100);  // Adjust the interval as needed

  // Capture the popstate event and prevent back navigation
  window.onpopstate = function () {
    window.history.pushState(null, null, window.location.href);  // Re-push the state to block back navigation
  };
}

// ── Extension Name: dropdown option click handler ─────────────────────────
document.querySelectorAll('.select-option').forEach(function (option) {
  option.addEventListener('click', function (e) {
    e.preventDefault();
    const value = this.getAttribute('data-value');

    if (!value || value === 'None(default)') {
      // None (Reset) selected
      if (dropdownButton) dropdownButton.innerHTML = 'None(default) <span class="caret"></span>';
      const hiddenField = document.getElementById('selected-extension');
      if (hiddenField) hiddenField.value = '';
      if (inputField) inputField.value = '';
      if (errorMessage) { errorMessage.style.display = 'none'; errorMessage.textContent = ''; }
      if (ordinalNumber) { ordinalNumber.style.display = 'none'; ordinalNumber.textContent = ''; }
    } else {
      // Sr. / Jr. selected
      if (dropdownButton) dropdownButton.innerHTML = value + ' <span class="caret"></span>';
      const hiddenField = document.getElementById('selected-extension');
      if (hiddenField) hiddenField.value = value;
    }
  });
});

