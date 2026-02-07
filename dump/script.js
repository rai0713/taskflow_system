const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-btn');
const forgotPasswordLink = document.getElementById('forgot-password');
const messageDisplay = document.createElement('div');
loginForm.appendChild(messageDisplay);

let loginAttempts = Number(localStorage.getItem('loginAttempts')) || 0;
let lockoutTime = Number(localStorage.getItem('lockoutTime')) || 0;

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const currentTime = Date.now();

    // Check if lockout is active
    if (lockoutTime && currentTime < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - currentTime) / 1000);
        messageDisplay.textContent = `Too many failed attempts. Try again in ${remainingTime} seconds.`;
        messageDisplay.style.color = 'red';
        disableLogin(true);
        return;
    }

    $.ajax({
        url: 'login.php',
        method: 'POST',
        data: { username: username, password: password },
        success: function(response) {
            if (response.success) {
                messageDisplay.textContent = 'Login successful!';
                messageDisplay.style.color = 'green';
                resetLoginAttempts();
                setTimeout(() => window.location.href = 'home.php', 2000);
            } else {
                handleFailedAttempt();
            }
        },
        error: function(err) {
            console.error('Error:', err);
            messageDisplay.textContent = 'An error occurred while logging in. Please try again.';
            messageDisplay.style.color = 'red';
        }
    });
});

function handleFailedAttempt() {
    loginAttempts += 1;
    localStorage.setItem('loginAttempts', loginAttempts);

    const cycleAttempt = loginAttempts % 3;
    forgotPasswordLink.style.display = (cycleAttempt === 2) ? 'inline' : 'none';

    let lockDuration = 0;
    if (loginAttempts >= 9) {
        lockDuration = 60000;  // 60 seconds lockout
    } else if (loginAttempts >= 6) {
        lockDuration = 30000;  // 30 seconds lockout
    } else {
        lockDuration = 15000;  // 15 seconds lockout
    }

    lockoutTime = Date.now() + lockDuration;
    localStorage.setItem('lockoutTime', lockoutTime);

    messageDisplay.textContent = `Too many failed attempts. Please wait ${lockDuration / 1000} seconds.`;
    messageDisplay.style.color = 'red';
    disableLogin(true);

    const interval = setInterval(() => {
        const timeLeft = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (timeLeft > 0) {
            messageDisplay.textContent = `Too many failed attempts. Try again in ${timeLeft} seconds.`;
        } else {
            clearInterval(interval);
            messageDisplay.textContent = '';
            disableLogin(false);
        }
    }, 1000);
}

function resetLoginAttempts() {
    loginAttempts = 0;
    lockoutTime = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
    forgotPasswordLink.style.display = 'none';
}

function disableLogin(disable) {
    loginButton.disabled = disable;
    loginButton.style.backgroundColor = disable ? 'grey' : 'rgb(13, 110, 253)';
}
