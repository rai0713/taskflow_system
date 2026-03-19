const loginForm = document.getElementById('login-form');
const loginButton = loginForm.querySelector('button[type="submit"]');
const registerLink = document.querySelector('a[href="registration.html"]');
const bottomRegisterLink = document.querySelector('a[href="registration.html"].btn-outline-primary');
const homeLink = document.querySelector('a[href="#"]')
const messageDisplay = document.createElement('div');
const inputFields = document.querySelectorAll('input');
const passwordField = document.querySelector('#login-password');
const passwordIcon = document.getElementById('passwordIcon');

messageDisplay.id = 'message-display';
messageDisplay.className = 'mt-3';
loginForm.appendChild(messageDisplay);

// Always clear frontend session storage when arriving at the login page
// This prevents ghost sessions bouncing the user from the registration page after logging out
sessionStorage.removeItem('username');
sessionStorage.removeItem('role');

function showMessage(type, text, iconClass = 'bi-info-circle-fill') {
    const alertType = type === 'success' ? 'alert-success' : 'alert-danger';
    messageDisplay.innerHTML = `
        <div class="alert ${alertType} d-flex align-items-center" role="alert">
            <i class="bi ${iconClass} flex-shrink-0 me-2"></i>
            <div>${text}</div>
        </div>
    `;
}

function showRegistrationSuccessNotice() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('registered')) return;

    const msg = params.get('msg') || 'Registration successful. Please log in.';

    if (window.TaskFlowToast && typeof window.TaskFlowToast.show === 'function') {
        window.TaskFlowToast.show({
            type: 'success',
            title: 'Success',
            message: msg
        });
    } else {
        showMessage('success', msg, 'bi-check-circle-fill');
    }

    // Clean URL so the message does not repeat on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Target existing link instead of creating new
const existingForgotLink = document.querySelector('a[href="forgot_password.html"]');
if (existingForgotLink) existingForgotLink.style.display = 'none'; // Default hidden

let loginAttempts = Number(localStorage.getItem('loginAttempts')) || 0;
let lockoutTime = Number(localStorage.getItem('lockoutTime')) || 0;

function updateForgotLinkVisibility() {
    if (!existingForgotLink) return;

    // Logic based on cycle (Modulo 3):
    // Attempts % 3 == 0 (0, 3, 6, 9...): Hide (Lockout or Reset)
    // Attempts % 3 == 1 (1, 4, 7...): Hide (1st attempt of cycle)
    // Attempts % 3 == 2 (2, 5, 8...): Show (2nd attempt of cycle)

    // Adjust logic based on user request "2nd and 3rd attempt show".
    // 2nd Attempt (1 prev fail -> fail -> attempts=2): Show.
    // 3rd Attempt (2 prev fails -> fail -> attempts=3): Hide (Lockout).

    // So we only show if we HAVE FAILED 2 times (and not yet 3). 
    // Wait, user says "2nd attempt forgot password". 
    // If I fail my 1st attempt, attempts=1. Next is 2nd attempt. Link should be hidden?
    // "1st attempt hide". Matches.
    // "2nd attempt forgot password". 
    // If I fail my 2nd attempt, attempts=2. Link should be Shown.

    // Revised based on "2nd attempt forgot password":
    // If attempts == 2 (failed twice, about to try 3rd), Show.
    // User says "3rd forgot password show". 
    // This implies link is visible FOR the 3rd attempt.
    // If attempts == 2, we show it.

    // So:
    // 0: Hide
    // 1: Hide
    // 2: Show
    // 3: Hide (Lockout)

    // 4: Hide
    // 5: Show
    // 6: Hide (Lockout)

    const remainder = loginAttempts % 3;
    if (remainder === 2 && !lockoutTime) {
        existingForgotLink.style.display = 'inline';
    } else {
        existingForgotLink.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const currentTime = Date.now();

    // Check if lockout is active
    if (lockoutTime) {
        if (currentTime < lockoutTime) {
            const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000);
            // Ensure hidden during lockout check
            if (existingForgotLink) existingForgotLink.style.display = 'none';

            showMessage('error', `Too many failed attempts. Try again in ${remainingTime} seconds.`, 'bi-hourglass-split');
            disableLogin(true, 'grey');
            startLockoutTimer(lockoutTime);
            return;
        } else {
            // Lockout expired
            lockoutTime = 0;
            localStorage.removeItem('lockoutTime');
            disableLogin(false, 'rgb(13, 110, 253)');
            updateForgotLinkVisibility();
        }
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
            showMessage('success', 'Login successful! Redirecting...', 'bi-check-circle-fill');
            sessionStorage.setItem('username', emailOrUsername);

            if (data.role) sessionStorage.setItem('role', data.role);

            resetAttempts();
            setTimeout(() => {
                if (data.role === 'super_admin' || data.role === 'admin') {
                    window.location.href = '../php/admin/dashboard.php';
                } else {
                    window.location.href = '../php/home.php';
                }
            }, 800);
        } else {
            handleFailedAttempt(data.error);
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage('error', 'An error occurred while logging in. Please try again.', 'bi-exclamation-triangle-fill');
    }
}

function handleFailedAttempt(errorMsg = 'Incorrect username or password.') {
    loginAttempts += 1;
    localStorage.setItem('loginAttempts', loginAttempts);

    let lockDuration = 0;

    // Check for Lockout (Every 3rd attempt: 3, 6, 9, 12...)
    if (loginAttempts > 0 && loginAttempts % 3 === 0) {
        if (loginAttempts === 3) {
            lockDuration = 15000; // 15s
        } else if (loginAttempts === 6) {
            lockDuration = 30000; // 30s
        } else {
            lockDuration = 60000; // 60s for 9, 12, 15...
        }
    }

    if (lockDuration > 0) {
        lockoutTime = Date.now() + lockDuration;
        localStorage.setItem('lockoutTime', lockoutTime);

        // Hide link immediately on lockout
        if (existingForgotLink) existingForgotLink.style.display = 'none';

        showMessage('error', `Too many failed attempts. Wait ${lockDuration / 1000}s.`, 'bi-lock-fill');
        disableLogin(true, 'grey');
        startLockoutTimer(lockoutTime);

    } else {
        // Not locked out yet
        updateForgotLinkVisibility();
        showMessage('error', errorMsg, 'bi-exclamation-octagon-fill');
    }
}

function startLockoutTimer(targetTime) {
    // Clear any existing interval if we were to act generic, but here we just start new
    const interval = setInterval(() => {
        const timeLeft = Math.ceil((targetTime - Date.now()) / 1000);
        if (timeLeft > 0) {
            showMessage('error', `Too many failed attempts. Try again in ${timeLeft} seconds.`, 'bi-lock-fill');
        } else {
            clearInterval(interval);
            messageDisplay.innerHTML = '';

            // Lockout finished
            lockoutTime = 0;
            localStorage.removeItem('lockoutTime');
            disableLogin(false, 'rgb(13, 110, 253)');

            // Update link visibility after lockout (should be hidden as we are at 3, 6, 9...)
            updateForgotLinkVisibility();
        }
    }, 1000);
}

function resetAttempts() {
    loginAttempts = 0;
    lockoutTime = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
    if (existingForgotLink) existingForgotLink.style.display = 'none';
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

    // Safety checks
    if (homeLink) {
        homeLink.style.pointerEvents = disable ? 'none' : 'auto';
        homeLink.style.color = disable ? 'grey' : 'rgba(255, 255, 255, 0.55)';
    }
    if (registerLink) {
        registerLink.style.pointerEvents = disable ? 'none' : 'auto';
        registerLink.style.color = disable ? 'grey' : '';
    }
    if (bottomRegisterLink) {
        bottomRegisterLink.style.pointerEvents = disable ? 'none' : 'auto';
        bottomRegisterLink.style.color = disable ? 'grey' : '';
    }

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
    if (errMessage) errMessage.textContent = message;
}

const showSuccess = (el, message) => {
    let errMessage;
    el.classList.add('is-valid');
    el.classList.remove('is-invalid');
    errMessage = el.parentElement.querySelector('.invalid-feedback');
    if (errMessage) errMessage.textContent = message;
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


const showPassword = (inputField, icon) => {
    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
    inputField.setAttribute('type', type);

    if (type === 'text') {
        icon.src = '../assets/icons/visibility_off.svg';
        icon.alt = 'Hide Password'
    } else {
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


function preventBackNavigation() {
    window.history.replaceState(null, null, window.location.href);
    window.addEventListener('popstate', function () {
        window.history.pushState(null, null, window.location.href);
    });
}
// Call once
// preventBackNavigation();


document.addEventListener('DOMContentLoaded', function () {
    showRegistrationSuccessNotice();

    // Check for active lockout on load
    const currentTime = Date.now();
    if (lockoutTime && currentTime < lockoutTime) {
        // Lockout is active logic
        if (existingForgotLink) existingForgotLink.style.display = 'none';

        const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000);
        showMessage('error', `Too many failed attempts. Try again in ${remainingTime} seconds.`, 'bi-hourglass-split');
        disableLogin(true, 'grey');
        startLockoutTimer(lockoutTime);

    } else {
        // No active lockout, check if expired or unrelated
        if (lockoutTime && currentTime >= lockoutTime) {
            lockoutTime = 0;
            localStorage.removeItem('lockoutTime');
        }
        disableLogin(false, 'rgb(13, 110, 253)');
        updateForgotLinkVisibility();
    }
});


function checkLoggedIn() {
    if (sessionStorage.getItem('username')) {
        var role = sessionStorage.getItem('role');
        if (role === 'super_admin' || role === 'admin') {
            window.location.href = '../php/admin/dashboard.php';
        } else {
            window.location.href = '../php/home.php';
        }
    }
}

// -------------------------------------------------------------
// Hardcap logic to ensure links cannot be activated by keyboard
// tabs or script bypasses during an active lockout.
// -------------------------------------------------------------
[homeLink, registerLink, bottomRegisterLink].forEach(link => {
    if (link) {
        link.addEventListener('click', (e) => {
            if (loginButton && loginButton.disabled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
});