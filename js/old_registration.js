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

  return (...args) =>{
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
  const threeConsecutiveRegEx =  /(.)\1{2,}/i;
  return threeConsecutiveRegEx.test(input); 
}

const isAlphabet = (input) =>{
  const specialCharacterRegex = /^[A-Za-z\s]+$/;
  return specialCharacterRegex.test(input);
}

const isIdNumberTaken = async (idNumber) => {

  try{
    const res = await fetch(`../php/check_idnumber.php?id_no=${encodeURIComponent(idNumber)}`);
    const data = await res.json();
    return data.exists;
  }catch(err){
    console.error('Error fetching idnumber:', error);
    return false;
  }
};

const validateIdNo = async () => {
  const idValue = idNumberField.value;
  const idRegex = /^\d{4}-\d{4}$/;
  const taken = await isIdNumberTaken(idValue);

  if(idValue.length === 0){
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

  if(taken){
    showError(idNumberField, "ID number is already taken.");
    return false;
  }

  showSuccess(idNumberField, "");
  return true;
};

idNumberField.addEventListener('keydown', function(event) {
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

const capitalChecker = (field, nameWords, fieldname) => {
  for (let word of nameWords) {
    if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
      showError(field, `All words of every ${fieldname} must start with a capital letter`);
      return false;
    }

    const restOfWord = word.slice(1);
    if (restOfWord.match(/[A-Z]/)) {
      showError(field, `Only the first of every ${fieldname} letter of each name should be capitalized`);
      return false;
    }
  }
  return true;
}

const checkFirstName = () =>{
  const firstName = fname.value;
  const min = 2, max = 20;


  if(firstName.length === 0){
    showError(fname, "First name is required.");
    return false;
  }

  if(firstName.length < min || firstName.length > max){
    showError(fname, "First name must be between 2 and 20 character");
    return false;
  }

  if(hasThreeConsecutiveLetters(firstName)){
    showError(fname, "First name must not contain 3 consecutive letters or more");
    return false
  }

  if(hasDoubleSpace(firstName)){
    showError(fname, "First name must not have double space");
    return false
  }

  if(firstName.charAt(0) !== firstName.charAt(0).toUpperCase()){
    showError(fname, "First letter of name must be a capital letter")
    return false;
  }

  const nameWords = firstName.split(" ");

  if (!capitalChecker(fname, nameWords, "first name")) {
    return false;
  }
  
  if(!isAlphabet(firstName)){
    showError(fname, "First name must not contain an special character");
    return false;
  }

  showSuccess(fname, "");
  return true;
}

const checkLastName = () =>{
  const lastName = lname.value
  const min = 2, max = 20;

  if(lastName.length === 0){
    showError(lname, "Last name is required.");
    return false;
  }


  if(lastName.length < min || lastName.length > max){
    showError(lname, "Last name must be between 2 and 20 character");
    if(lastName.length > 20){
      lastName.slice(0, 20);
    }
    return false;
  }

  if(hasThreeConsecutiveLetters(lastName)){
    showError(lname, "Last name must not contain 3 consecutive letters or more");
    return false
  }

  if(hasDoubleSpace(lastName)){
    showError(lname, "Last name must not have double space");
    return false;
  }

  const nameWords = lastName.split(" ");

  if (!capitalChecker(lname, nameWords, "last name")) {
    return false;
  }

  if(!isAlphabet(lastName)){
    showError(lname, "Last name must not contain an special character");
    return false;
  }

  showSuccess(lname, "");
  return true;
}

const checkMiddleName = () =>{
  const middleNameField = mname.value;
  const min = 2, max = 20;

  if(middleNameField.length === 0){
    mname.classList.remove('is-valid', 'is-invalid');
    return true;
  }
  
  if(middleNameField.length < min || middleNameField.length > max){
    showError(mname, "Middle Name must be between 2 and 20 character");
    if(middleNameField.length > 20){
      middleNameField.slice(0, 20);
    }
    return false;
  }

  if(hasThreeConsecutiveLetters(middleNameField)){
    showError(mname, "Middle Name must not contain 3 consecutive letters or more");
    return false;
  }

  if(hasDoubleSpace(middleNameField)){
    showError(mname, "Middle Name must not have double space");
    return false;
  }

  const nameWords = middleNameField.split(" ");
  
  if (!capitalChecker(mname, nameWords, "middle name")) {
    return false;
  }

  if(!isAlphabet(middleNameField)){
    showError(mname, "Middle name must not contain an special character");
    return false;
  }

  showSuccess(mname, "");
  return true;

}

const isUsernameTaken = async (username) => {

  try{
    const res = await fetch(`../php/checkusername.php?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    return data.exists;
  }catch(err){
    console.error('Error fetching username:', err);
    return false;
  }
};



const checkUserName = async () => {
  const username = uname.value
  const validUserRegEx = /^(?!_)(?!.*__)[A-Za-z0-9_.]+(?<!_)$/;
  const min = 3, max = 10;
  const taken = await isUsernameTaken(username)

  if(username.length === 0){
    showError(uname, "Username is required.");
    return false;
  }


  if (username.includes(' ')) {
    showError(uname, "Username must not contain spaces.");
    return false;
  }
  
  if(username.length < min || username.length > max){
    showError(uname, `Username must be between ${min} and ${max} characters long.`);
    return false;
  }

  if (!validUserRegEx.test(username)) {
    showError(uname, 'Username can only contain letters, numbers, dot, and underscores, and cannot start or end with an underscore.');
    return false;
  }

  if(taken){
    showError(uname, "Username is already taken.");
    return false;
  }


  showSuccess(uname, "Username is available")
  return true;

}

const indicator = document.querySelector('.password-indicator');
// const bars = document.querySelectorAll('.bar');

const passwordValidator = () => {
  const password = passwordField.value;
  let strength = 0;

  indicator.innerHTML = "";
  indicator.className = "password-indicator";
  // bars.forEach(bar => bar.className = "bar");


  if (password.length === 0) {
    showError(passwordField, "Password is required.");

    // toggleStrengthBars(false);
    return false;
  }
  

  const lengthValid = password.length >= 8 && password.length <= 20;


  // toggleStrengthBars(lengthValid);

 
  if (!lengthValid) {
    showError(passwordField, "Password must contain at least 8 to 20 characters");
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

  // if (strength >= 1) bars[0].classList.add('red'); 
  // if (strength >= 3) bars[1].classList.add('orange'); 
  // if (strength === 5) bars[2].classList.add('green'); 

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

  indicator.innerHTML = `${strengthText}<span class="${colorClass}">${strengthLevel}</span>`;


  return true;
};

// const toggleStrengthBars = (show) => {
//   const strengthBars = document.querySelector('.strength-bars');
//   if (show) {
//     strengthBars.style.display = 'flex'; 
//   } else {
//     strengthBars.style.display = 'none'; 
//   }
// };

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

const confirmPassword = () => {
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;
  
  if(confirmPassword.length < 1){
    showError(confirmPasswordField, 'Confirm password is required.');
    return false;
  }

  if(password !== confirmPassword){
    showError(confirmPasswordField, "Password do not match");
    return false
  }

  showSuccess(confirmPasswordField, "")
  return true;

}

const validateSex = () => {
  const sex = sexField.value;

  if(sex === ""){
    showError(sexField, "Sex is required");
    return false;
  }

  showSuccess(sexField, "");
  return true;
}


const isEmailTaken = async (email) => {

  try{
    const res = await fetch(`../php/checkemail.php?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    
    return data.exists;
  }catch(err){
    console.error('Error fetching email:', err);
    return false;
  }
};



const validateEmail = async () => {
  const email = emailField.value;
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._]*@[a-zA-Z]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  const emailMin = 4;
  const emailMax = 60;
  const emailTaken =  await isEmailTaken(email);

  if(email.length === 0){
    showError(emailField, "Email is required.");
    return false;
  }
  if (email.includes(' ')) {
    showError(emailField, "Email must not contain spaces.");
    return false;
  }

  if(email.length < emailMin || email.length > emailMax){
    showError(emailField, `Email must have ${emailMin} to ${emailMax} characters.`);
    return false;
  }

  if (!emailRegex.test(email)) {
    showError(emailField, "Please enter a valid email address.");
    return false;
  }
  
  if (emailTaken){
    showError(emailField, "Email is already taken.");
    return false;
  }

  showSuccess(emailField, "Email is available")
  return true;
};

const validateCountry = () => {
  const country = countryField.value;
  const countryMin = 3;
  const countryMax = 60;

  if(country.length === 0){
    showError(countryField, "Country is required.");
    return false;
  }

  if(country.length < countryMin || country.length > countryMax){
    showError(countryField, "Country must have atleast 3 to 60 characters")
    return false;
  }

  if(hasDoubleSpace(country)){
    showError(countryField, "Country name must not have double space");
    return false;
  }

  if(hasThreeConsecutiveLetters(country)){
    showError(countryField, "Country name must not have three consecutive letters");
    return false
  }  

  const countryWords = country.split(" ");
  
  for (let word of countryWords) {
    if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
      showError(countryField, "All country names must start with a capital letter");
      return false;
    }

    const restOfWord = word.slice(1);
    if (restOfWord.match(/[A-Z]/)) {
      showError(countryField, "Only the first letter of each name of country should be capitalized");
      return false;
    }
  }

  if(!isAlphabet(country)){
    showError(countryField, "Country name must not contain an special character");
    return false;
  }

  showSuccess(countryField, "")
  return true;
}

const validateZipCode = () => {
  const zipCode = zipCodeField.value;
  const zipMin = 4;
  const zipMax = 10;
  const zipCodePattern = /^[A-Z0-9]{4,}( [A-Z0-9]+)?$/;

  if(zipCode.length === 0){
    showError(zipCodeField, "ZIP Code is required.");
    return false;
  }

  if (zipCode.length < zipMin || zipCode.length > zipMax) {
    showError(zipCodeField, "ZIP Code must have at least 4 to 10 characters");
    return false;
  }

  if (!zipCodePattern.test(zipCode)) {
    showError(zipCodeField, "ZIP Code must only contain numbers and uppercase letters");
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

  if(city.length === 0){
    showError(cityField, "City is required.");
    return false;
  }

  if(city.length < cityMin || city.length > cityMax){
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


  for (let word of cityWords) {
    if (word.charAt(0) !== word.charAt(0).toUpperCase()) {
      showError(cityField, "All city names must start with a capital letter");
      return false;
    }

    const restOfWord = word.slice(1);
    if (restOfWord.match(/[A-Z]/)) {
      showError(cityField, "Only the first letter of each name of city should be capitalized");
      return false;
    }
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


const validateBarangayName = () => {
  const barangay = barangayField.value;
  const barangayMin = 4;
  const barangayMax = 20;
  const barangayWords = barangay.split(" ");

  if(barangay.length === 0){
    showError(barangayField, "Barangay is required.");
    return false;
  }

  if(barangay.length < barangayMin || barangay.length > barangayMax){
    showError(barangayField, `Barangay should have at least ${barangayMin} to ${barangayMax} character`);
    return false;
  }

  if(hasDoubleSpace(barangay)){
    showError(barangayField, "Barangay should not have double spaces");
    return false;
  }

  if(!isAlphabet(barangay)){
    showError(barangayField, "First name must not contain an special character");
    return false;
  }

  if(hasThreeConsecutiveLetters(barangay)){
    showError(barangayField, "First name must not contain 3 consecutive letters or more");
    return false
  }

  for(let brgywords of barangayWords){
    if(brgywords.charAt(0) !== brgywords.charAt(0).toUpperCase()){
      showError(barangayField, "All barangay names must start with a capital letter");
      return false;
    }

    const barangayRestWords = brgywords.slice(1);
    if(barangayRestWords.match(/[A-Z]/)){
      showError(barangayField, "Only the first words of barangay should have capital");
      return false;
    }
  }

  const subsequentWords = barangayWords.slice(1);
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

  showSuccess(barangayField, "")
  return true;
}

const purokValidator = () => {
  const purok = purokField.value;
  const purokMin = 2;
  const purokMax = 20;
  const purokWords = purok.split(" ");

  if(purok.length === 0){
    showError(purokField, "Purok is required.");
    return false;
  }

  if(purok.length < purokMin || purok.length > purokMax){
    showError(purokField, `Purok must contain at least ${purokMin} to ${purokMax} characters.`)
    return false;
  }

  if(hasDoubleSpace(purok)){
    showError(purokField, "Purok must not have double space");
    return false;
  }

  if(hasThreeConsecutiveLetters(purok)){
    showError(purokField, "First name must not contain 3 consecutive letters or more");
    return false
  }

  for(let prkWords of purokWords){
    if(prkWords.charAt(0) !== prkWords.charAt(0).toUpperCase()){
      showError(purokField, "Purok words must start with a capital letter");
      return false;
    }

    const purokRestWords = prkWords.slice(1);
    if(purokRestWords.match(/[A-Z]/)){
      showError(purokField, "Only the first words of purok should have capital");
      return false;
    }
  }

  showSuccess(purokField, "")
  return true;

}

const validateProvince = () =>{
  const province = provinceField.value;
  const provinceMin = 3;
  const provinceMax = 20;
  const provinceWords = province.split(" ");

  if(province.length === 0){
    showError(provinceField, "Province is required.");
    return false;
  }

  if(province.length < provinceMin || province.length > provinceMax){
    showError(provinceField, `Province must contain at least ${provinceMin} to ${provinceMax} characters.`)
    return false;
  }

  if(hasDoubleSpace(province)){
    showError(provinceField, "Province name must not have double space");
    return false;
  }

  if(!isAlphabet(province)){
    showError(provinceField, "First name must not contain an special character");
    return false;
  }

  if(hasThreeConsecutiveLetters(province)){
    showError(provinceField, "First name must not contain 3 consecutive letters or more");
    return false
  }

  for(let prvnceword of provinceWords){
    if(prvnceword.charAt(0) !== prvnceword.charAt(0).toUpperCase()){
      showError(provinceField, "Province words must start with a capital letter");
      return false;
    }

    const provinceRestWords = prvnceword.slice(1);
    if(provinceRestWords.match(/[A-Z]/)){
      showError(provinceField, "Only the first words of purok should have capital");
      return false;
    }
  }

  showSuccess(provinceField, "")
  return true;
}

passwordField.addEventListener('input', function(e) {
  if(confirmPasswordField.value !== ''){
    confirmPassword();
  }
})

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  let isValid = true;

  if (!validateIdNo()) isValid = false;
  if (!checkFirstName()) isValid = false;
  if (!checkLastName()) isValid = false;

  isValid = await checkUserName() && isValid;
  

  if (!passwordValidator()) isValid = false;
  if (!confirmPassword()) isValid = false;
  if (!validateEmail()) isValid = false;
  if (!validateSex()) isValid = false;
  if (!purokValidator()) isValid = false;
  if (!validateBarangayName()) isValid = false;
  if (!validateCity()) isValid = false;
  if (!validateCountry()) isValid = false;
  if (!validateZipCode()) isValid = false;
  if (!validateProvince()) isValid = false;

  if (isValid) {
    alert('Register Successfully!');
    form.submit();
  }else{
    alert('Please fill out the form correctly');
  }
});


const validateFormInput = (e) => {
  switch(e.target.id){
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
  }
};


form.addEventListener('input', debounce(validateFormInput, 400));
form.addEventListener('change', validateFormInput);

$(document).ready(function() {
  $('.select-option').on("click", function(e) {
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

  $('.dropdown-submenu a.test').on("click", function(e) {
    var inputField = $(this).siblings('.input-submenu');
    inputField.toggle();
    e.stopPropagation();
    e.preventDefault();
  });

  $('#other-extension').on('input', function() {
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


  $('.input-submenu .submit-btn').on('click', function() {
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

window.onload = function () {
  if(sessionStorage.getItem('username')){
      window.location.href = 'homepage/index.html';
      return;
  }

  // if (document.referrer.includes('registration/index.html')) {
  //   history.replaceState(null, null, location.href);
  //   history.pushState(null, null, location.href);
  //   window.addEventListener('popstate', function () {
  //       history.pushState(null, null, location.href);
  //   });
  //   }

  // const currentTime = Date.now();
  // const lockoutTime = localStorage.getItem('lockoutTime');

  // if (lockoutTime && currentTime < lockoutTime) {
  //     const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000);
  //     alert(`You cannot access the registration page right now. Try again in ${remainingTime} seconds.`);
  //     window.location.href = 'login.html';
  // }

      // Prevent back navigation to the registration page
  // if (document.referrer.includes('../index.html')) {
  //       history.replaceState(null, null, location.href);
  //       history.pushState(null, null, location.href);
  //       window.addEventListener('popstate', function () {
  //           history.pushState(null, null, location.href);
  //       });
  //   }

    // Check for lockout time in localStorage
    const currentTime = Date.now();
    const lockoutTime = localStorage.getItem('lockoutTime');

    if (lockoutTime && currentTime < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000);       
        // Redirect to the last visited page or a default (login.html)
        const lastPage = sessionStorage.getItem('currentPage') || '../index.html';
        window.location.href = lastPage;
    }
  
}