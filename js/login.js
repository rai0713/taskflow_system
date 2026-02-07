const loginForm = document.getElementById('login-form');
const loginButton = loginForm.querySelector('button[type="submit"]');
const registerLink = document.querySelector('a[href="registration.html"]');
const bottomRegisterLink = document.getElementById('bottomRegister');
const homeLink = document.querySelector('a[href="#"]')
const messageDisplay = document.createElement('div');
const inputFields = document.querySelectorAll('input');
const passwordField = document.querySelector('#login-password');
const passwordIcon = document.getElementById('passwordIcon');
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
                disableLogin(false, 'rgb(13, 110, 253)');
            }
        }, 1000);
        return;
    }

    const emailOrUsername = document.querySelector('#username-email').value;
    const password = document.querySelector('#login-password').value;

    try {
        const res = await fetch('../php/login.php', {
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
            sessionStorage.setItem('username', emailOrUsername)
            resetAttempts();
            setTimeout(() => {
                window.location.href = 'home.html';
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
                disableLogin(false, 'rgb(13, 110, 253)');
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
    // Keep the UI consistent with the dark theme button styles (handled by CSS)
    // Only force a grey look when disabled.
    if (disable) {
        loginButton.style.backgroundColor = color;
        loginButton.style.borderColor = color;
    } else {
        loginButton.style.backgroundColor = '';
        loginButton.style.borderColor = '';
    }
    inputFields.disabled = disable;
    homeLink.style.pointerEvents = disable ? 'none' : 'auto';
    homeLink.style.color = disable ? color : 'rgba(255, 255, 255, 0.55)';
    registerLink.style.pointerEvents = disable ? 'none' : 'auto';
    // Do not force a dim color when enabled (let the header CSS style it)
    registerLink.style.color = disable ? color : '';
    // Keep register link styling consistent (use CSS when enabled)
    bottomRegisterLink.style.color = disable ? color : '';
    bottomRegisterLink.style.pointerEvents = disable ? 'none' : 'auto';
    inputFields.forEach(input => {
        input.disabled = disable;
        input.style.backgroundColor = disable ? '#e9ecef' : '';
    });
}

loginForm.addEventListener('submit', handleLogin);


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
        icon.src = '../assets/icons/visibility_off.svg';
        icon.alt = 'Hide Password'
    }else{
        icon.src = '../assets/icons/visibility_on.svg';
        icon.alt = 'Show Password'
    }
}

const toggleButtonPassword = document.getElementById('togglePassword');
if (toggleButtonPassword && passwordField && passwordIcon) {
  toggleButtonPassword.addEventListener('click', function (e) {
    e.preventDefault();
    showPassword(passwordField, passwordIcon);
  });
}


// function preventBackNavigation() {
//     history.pushState(null, null, location.href);

//     window.addEventListener('popstate', function () {
//         history.pushState(null, null, location.href);
//     });
// }

// preventBackNavigation();
function preventBackNavigation() {
    history.pushState(null, null, location.href); // Push the current state to history

    window.addEventListener('popstate', function () {
        // Prevent going back by pushing the state again
        history.pushState(null, null, location.href);
    });

    // Check lockout status and reapply navigation prevention
    const lockoutCheckInterval = setInterval(() => {
        const currentTime = Date.now();

        if (lockoutTime && currentTime < lockoutTime) {
            // Keep preventing navigation while lockout is active
            history.pushState(null, null, location.href);
        } else {
            // Clear the interval when lockout is over
            clearInterval(lockoutCheckInterval);
        }
    }, 1000);
}

// Call this function to initialize the back navigation prevention
preventBackNavigation();


document.addEventListener('DOMContentLoaded', function () {
    checkLoggedIn()

    const currentTime = Date.now();
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
                disableLogin(false, 'rgb(13, 110, 253)');
            }
        }, 1000);
    } else {
        // Reset lockout state if time has passed
        lockoutTime = 0;
        localStorage.removeItem('lockoutTime');
        disableLogin(false, 'rgb(13, 110, 253)');
    }
})


function checkLoggedIn() {
    if (sessionStorage.getItem('username')) {
        window.location.reload();
        window.location.href = 'home.html';
    }
}

// Block the user from navigating back
window.history.pushState(null, "", window.location.href);

// Listen for popstate efent (back button)
window.onpopstate = function() {
    window.history.pushState(null, "", window.location.href);
};

function destroyHistory() {
    // Initially push 100 states
    for (let i = 0; i < 50; i++) {
        window.history.pushState(null, null, window.location.href);
    }

    // Continuously push the current state into the history every 100 milliseconds
    setInterval(function() {
        window.history.pushState(null, null, window.location.href);
    }, 100);  // Adjust the interval as needed
    
    // Capture the popstate event and prevent back navigation
    window.onpopstate = function() {
        window.history.pushState(null, null, window.location.href);  // Re-push the state to block back navigation
    };
}
destroyHistory();