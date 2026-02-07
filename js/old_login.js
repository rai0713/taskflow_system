const loginForm = document.getElementById('login-form');
const loginButton = loginForm.querySelector('button[type="submit"]');
const registerLink = document.querySelector('a[href="registration/index.html"]');
const messageDisplay = document.createElement('div');
const loginPasswordIcon = document.querySelector('#paswordIcon');
const passwordField = document.querySelector('#login-password');
messageDisplay.id = 'message-display';
loginForm.appendChild(messageDisplay);

const forgotPasswordLink = document.createElement('a');
forgotPasswordLink.href = '#';
forgotPasswordLink.textContent = 'Forgot Password? Reset';
forgotPasswordLink.style.display = 'none';
forgotPasswordLink.style.color = 'blue';
forgotPasswordLink.style.cursor = 'pointer';
loginForm.appendChild(forgotPasswordLink);

let loginAttempts = Number(localStorage.getItem('loginAttempts')) || 0;
let lockoutTime = Number(localStorage.getItem('lockoutTime')) || 0;

async function handleLogin(e) {
    e.preventDefault();
    const currentTime = Date.now();

    // Check if lockout is active
    if (lockoutTime && currentTime < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000);
        messageDisplay.textContent = `Too many failed attempts. Try again in ${remainingTime} seconds.`;
        messageDisplay.style.color = 'red';
        disableLogin(true, 'grey');
        
        const interval = setInterval(() => {
            const timeLeft = Math.ceil((lockoutTime - Date.now()) / 1000);
            if (timeLeft > 0) {
                messageDisplay.textContent = `Too many failed attempts. Try again in ${timeLeft} seconds.`;
            } else {
                clearInterval(interval);
                messageDisplay.textContent = '';
                disableLogin(false, 'blue');
            }
        }, 1000);
        return;
    }

    const emailOrUsername = document.querySelector('#username-email').value;
    const password = document.querySelector('#login-password').value;

    try {
        const res = await fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: `username_email=${encodeURIComponent(emailOrUsername)}&password=${encodeURIComponent(password)}`
        });

        const data = await res.json();
        console.log(data);
        if (data.success) {
            messageDisplay.textContent = 'Login successful!';
            messageDisplay.style.color = 'green';
            resetAttempts();
            setTimeout(() => {
                window.location.href = 'homepage/index.html';
            }, 2000);
        } else {
            handleFailedAttempt();
        }
    } catch (err) {
        console.error('Error:', err);
        messageDisplay.textContent = 'An error occurred while logging in. Please try again.';
        messageDisplay.style.color = 'red';
    }
}

function handleFailedAttempt() {
    loginAttempts += 1;
    localStorage.setItem('loginAttempts', loginAttempts);

    const cycleAttempt = loginAttempts % 3;
    forgotPasswordLink.style.display = (cycleAttempt === 2) ? 'inline' : 'none';

    if (cycleAttempt === 0) { 
        let lockDuration = 0;
        
        if (loginAttempts >= 9) {
            lockDuration = 60000; 
        } else if (loginAttempts >= 6) {
            lockDuration = 30000;
        } else {
            lockDuration = 15000;
        }

        lockoutTime = Date.now() + lockDuration;
        localStorage.setItem('lockoutTime', lockoutTime);

        messageDisplay.textContent = `Too many failed attempts. Please wait ${lockDuration / 1000} seconds.`;
        messageDisplay.style.color = 'red';
        disableLogin(true, 'grey');

        const interval = setInterval(() => {
            const timeLeft = Math.ceil((lockoutTime - Date.now()) / 1000);
            if (timeLeft > 0) {
                messageDisplay.textContent = `Too many failed attempts. Try again in ${timeLeft} seconds.`;
            } else {
                clearInterval(interval);
                messageDisplay.textContent = '';
                disableLogin(false, 'blue');
            }
        }, 1000);

    } else {
        messageDisplay.textContent = 'Invalid credentials. Please try again.';
        messageDisplay.style.color = 'red';
    }
}

function resetAttempts() {
    loginAttempts = 0;
    lockoutTime = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
    forgotPasswordLink.style.display = 'none';
}

function disableLogin(disable, color) {
    loginButton.disabled = disable;
    registerLink.style.pointerEvents = disable ? 'none' : 'auto';
    registerLink.style.color = color;
}

loginForm.addEventListener('submit', handleLogin);


const showError = (el, message) => {
  let errMessage;
  el.classList.add('is-invalid');
  el.classList.remove('is-valid');
  if(el === passwordField){
    let old_errMessage = el.closest('.password-wrapper').nextElementSibling.nextElementSibling.nextElementSibling;
    old_errMessage.textContent = "";
    errMessage = el.closest('.password-wrapper').nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling
    errMessage.style.display = 'block';
  }else{
    errMessage = el.parentElement.querySelector('.invalid-feedback');
  }

  errMessage.textContent = message;
}

const showSuccess = (el, message) => {
  let errMessage;
  el.classList.add('is-valid');
  el.classList.remove('is-invalid');
  if(el === passwordField){
    let old_errMessage = el.closest('.password-wrapper').nextElementSibling.nextElementSibling.nextElementSibling;
    old_errMessage.textContent = "";
    errMessage = el.closest('.password-wrapper').nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling
    errMessage.style.display = 'block';
  }else{
    errMessage = el.parentElement.querySelector('.invalid-feedback');
  }

  errMessage.textContent = message;
}





// const emailField = document.getElementById('username-email');
// const validateEmail = async () => {
//     const email = emailField.value;
//     const emailRegex = /^[a-zA-Z][a-zA-Z0-9._]*@[a-zA-Z]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
//     const emailMin = 4;
//     const emailMax = 60;
  
//     if(email.length === 0){
//       showError(emailField, "Email is required.");
//       return false;
//     }
//     if (email.includes(' ')) {
//       showError(emailField, "Email must not contain spaces.");
//       return false;
//     }
  
//     if(email.length < emailMin || email.length > emailMax){
//       showError(emailField, `Email must have ${emailMin} to ${emailMax} characters.`);
//       return false;
//     }
  
//     if (!emailRegex.test(email)) {
//       showError(emailField, "Please enter a valid email address.");
//       return false;
//     }
  
//     showSuccess(emailField, "")
//     return true;
// };

// emailField.addEventListener('input', function(){
//     validateEmail();
// });

const toggleStrengthBars = (show) => {
    const strengthBars = document.querySelector('.strength-bars');
    if (show) {
      strengthBars.style.display = 'flex'; 
    } else {
      strengthBars.style.display = 'none'; 
    }
  };

const indicator = document.querySelector('.password-indicator');
const bars = document.querySelectorAll('.bar');
const passwordValidator = () => {
    const password = passwordField.value;
    let strength = 0;
  
    indicator.innerHTML = "";
    indicator.className = "password-indicator";
    bars.forEach(bar => bar.className = "bar");
  
  
    if (password.length === 0) {
      showError(passwordField, "Password is required.");
  
      toggleStrengthBars(false);
      return false;
    }
  
    const lengthValid = password.length >= 8 && password.length <= 20;
  
  
    toggleStrengthBars(lengthValid);
  
   
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
  
    if (strength >= 1) bars[0].classList.add('red'); 
    if (strength >= 3) bars[1].classList.add('orange'); 
    if (strength === 5) bars[2].classList.add('green'); 
  
    let strengthText = "Password strength: ";
    let strengthLevel = "";
    let colorClass = ""; 
    if (strength < 3) {
      strengthLevel = "Weak";
      colorClass = "text-danger";
    } else if (strength >= 3 && strength < 5) {
      strengthLevel = "Medium";
      colorClass = "text-warning";
    } else if (strength === 5) {
      strengthLevel = "Strong";
      colorClass = "text-success";
      showSuccess(passwordField, "");
    }
  
    indicator.innerHTML = `${strengthText}<span class="${colorClass}">${strengthLevel}</span>`;
  
  
    return true;
  };

passwordField.addEventListener('input', function() {
    passwordValidator();
});

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


const showPassword = (inputField, icon) =>{
    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
    inputField.setAttribute('type', type);
    
    if(type === 'text'){
        icon.src = 'assets/icons/visibility_off.svg';
        icon.alt = 'Hide Password'
    }else{
        icon.src = 'assets/icons/visibility_on.svg';
        icon.alt = 'Show Password'
    }
}

const toggleButtonPassword = document.querySelector('.toggle-password');

toggleButtonPassword.addEventListener('click', function(){
    showPassword(passwordField, passwordIcon);
});


function preventBackNavigation() {
    history.pushState(null, null, location.href);

    window.addEventListener('popstate', function () {
        history.pushState(null, null, location.href);
    });
}

preventBackNavigation();


// const passwordField = document.getElementById('login-password');
// const indicator = document.querySelector('.password-indicator');
// const bars = document.querySelectorAll('.bar');
// const requirementList = document.createElement('ul');
// requirementList.className = 'password-requirements';

// const requirements = [
//   { text: "Must contain at least 8 to 20 characters", check: (pw) => pw.length >= 8 && pw.length <= 20 },
//   { text: "Must contain at least one lowercase letter", check: (pw) => /[a-z]/.test(pw) },
//   { text: "Must contain at least one uppercase letter", check: (pw) => /[A-Z]/.test(pw) },
//   { text: "Must contain at least one number", check: (pw) => /[0-9]/.test(pw) },
//   { text: "Must contain at least one special character (!@#$%^&*_?)", check: (pw) => /[!@#$%^&*_?]/.test(pw) }
// ];

// // Create the requirements list and add it to the DOM
// requirements.forEach(req => {
//   const listItem = document.createElement('li');
//   listItem.className = 'requirement-item';
//   listItem.innerHTML = `<span class="requirement-icon">❌</span> ${req.text}`;
//   requirementList.appendChild(listItem);
// });

// passwordField.parentNode.insertBefore(requirementList, passwordField.nextSibling);

// const toggleStrengthBars = (show) => {
//   const strengthBars = document.querySelector('.strength-bars');
//   strengthBars.style.display = show ? 'flex' : 'none';
// };

// const passwordValidator = () => {
//   const password = passwordField.value;
//   let strength = 0;

//   indicator.innerHTML = "";
//   indicator.className = "password-indicator";
//   bars.forEach(bar => bar.className = "bar");

//   if (password.length === 0) {
//     showError(passwordField, "Password is required.");
//     toggleStrengthBars(false);
//     updateRequirements(password);
//     return false;
//   }

//   const lengthValid = password.length >= 8 && password.length <= 20;
//   toggleStrengthBars(lengthValid);
  
//   if (!lengthValid) {
//     showError(passwordField, "Password must contain at least 8 to 20 characters.");
//     updateRequirements(password);
//     return false;
//   }

//   const hasLowercase = /[a-z]/.test(password);
//   const hasUppercase = /[A-Z]/.test(password);
//   const hasNumber = /[0-9]/.test(password);
//   const hasSpecialChar = /[!@#$%^&*_?]/.test(password);

//   if (lengthValid) strength += 1;
//   if (hasNumber) strength += 1;
//   if (hasLowercase) strength += 1;
//   if (hasUppercase) strength += 1;
//   if (hasSpecialChar) strength += 1;

//   if (strength >= 1) bars[0].classList.add('red');
//   if (strength >= 3) bars[1].classList.add('orange');
//   if (strength === 5) bars[2].classList.add('green');

//   let strengthText = "Password strength: ";
//   let strengthLevel = "";
//   let colorClass = "";
//   if (strength < 3) {
//     strengthLevel = "Weak";
//     colorClass = "text-danger";
//   } else if (strength >= 3 && strength < 5) {
//     strengthLevel = "Medium";
//     colorClass = "text-warning";
//   } else if (strength === 5) {
//     strengthLevel = "Strong";
//     colorClass = "text-success";
//     showSuccess(passwordField, "");
//   }

//   indicator.innerHTML = `${strengthText}<span class="${colorClass}">${strengthLevel}</span>`;
  
//   // Update each requirement with checkmarks or Xs
//   updateRequirements(password);
  
//   return true;
// };

// // Function to update each requirement based on the current password input
// const updateRequirements = (password) => {
//   const requirementItems = document.querySelectorAll('.requirement-item');

//   requirements.forEach((req, index) => {
//     const requirementMet = req.check(password);
//     const icon = requirementItems[index].querySelector('.requirement-icon');
//     icon.textContent = requirementMet ? '✔️' : '❌';
//     icon.style.color = requirementMet ? 'green' : 'red';
//   });
// };

// // Listen for input events to validate the password in real-time
// passwordField.addEventListener('input', passwordValidator);
