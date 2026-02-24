/**
 * forgot_password.js — Client-side logic for the 4-step forgot password wizard.
 *
 * Steps:
 *   0  Identity (email / ID no.)
 *   1  Security questions
 *   2  OTP verification
 *   3  New password + confirm
 */
(function () {
    'use strict';

    // ── Helpers ──────────────────────────────────────────────

    var showToast = (function () {
        if (window.TaskFlowToast) {
            return function (type, message, title) {
                window.TaskFlowToast[type]
                    ? window.TaskFlowToast[type](message, title)
                    : window.TaskFlowToast.show({ type: type, message: message, title: title });
            };
        }
        return function () { };
    })();

    function showError(el, msg) {
        el.classList.remove('is-valid');
        el.classList.add('is-invalid');
        var fb = el.parentNode.querySelector('.invalid-feedback');
        if (!fb) fb = el.closest('.input-group')
            ? el.closest('.input-group').querySelector('.invalid-feedback')
            : null;
        if (fb) fb.textContent = msg;
    }

    function showSuccess(el, msg) {
        el.classList.remove('is-invalid');
        el.classList.add('is-valid');
        var fb = el.parentNode.querySelector('.valid-feedback');
        if (!fb) fb = el.closest('.input-group')
            ? el.closest('.input-group').querySelector('.valid-feedback')
            : null;
        if (fb) fb.textContent = msg || '';
    }

    function clearState(el) {
        el.classList.remove('is-valid', 'is-invalid');
    }

    function setLoading(btn, loading) {
        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    async function sha256(text) {
        var encoder = new TextEncoder();
        var data = encoder.encode(text.trim().toLowerCase());
        var buf = await crypto.subtle.digest('SHA-256', data);
        var arr = Array.from(new Uint8Array(buf));
        return arr.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    // ── Stepper ──────────────────────────────────────────────

    var steps = document.querySelectorAll('.fp-step');
    var lines = document.querySelectorAll('.fp-step__line');
    var panels = document.querySelectorAll('.fp-panel');
    var currentStep = 0;

    function goToStep(n) {
        // Update dots
        for (var i = 0; i < steps.length; i++) {
            steps[i].classList.remove('active');
            if (i < n) {
                steps[i].classList.add('done');
                // Update dot content to checkmark
                steps[i].querySelector('.fp-step__dot').textContent = '✓';
            }
        }
        steps[n].classList.add('active');

        // Update lines
        for (var j = 0; j < lines.length; j++) {
            if (j < n) lines[j].classList.add('done');
            else lines[j].classList.remove('done');
        }

        // Update panels
        for (var k = 0; k < panels.length; k++) {
            panels[k].classList.remove('active');
        }
        panels[n].classList.add('active');

        currentStep = n;
    }

    // ── Question key → readable text map ────────────────────

    var questionMap = {
        pet: 'What is the name of your first pet?',
        school: 'What was the name of your elementary school?',
        city: 'In what city were you born?',
        mother_maiden: "What is your mother's maiden name?",
        bestfriend: 'What is the name of your childhood best friend?',
        favorite_teacher: 'What is the name of your favorite teacher?'
    };

    // ── Step 0: Verify Identity ──────────────────────────────

    var identifierInput = document.getElementById('fp-identifier');
    var verifyIdentityBtn = document.getElementById('fp-verify-identity');

    verifyIdentityBtn.addEventListener('click', async function () {
        var val = identifierInput.value.trim();
        if (!val) {
            showError(identifierInput, 'Please enter your email or ID number.');
            return;
        }
        clearState(identifierInput);
        setLoading(verifyIdentityBtn, true);

        try {
            var res = await fetch('../php/forgot_verify_identity.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ identifier: val })
            });
            var data = await res.json();

            if (data && data.success) {
                showSuccess(identifierInput, '');
                showToast('success', 'Account found. Please answer your security questions.', 'Verified');

                // Populate question labels
                var q1Label = document.getElementById('fp-q1-label');
                var q2Label = document.getElementById('fp-q2-label');
                var q3Label = document.getElementById('fp-q3-label');

                q1Label.textContent = questionMap[data.questions[0]] || data.questions[0];
                q2Label.textContent = questionMap[data.questions[1]] || data.questions[1];
                q3Label.textContent = questionMap[data.questions[2]] || data.questions[2];

                goToStep(1);
            } else {
                showError(identifierInput, (data && data.message) || 'No account found.');
                showToast('error', (data && data.message) || 'No account found.', 'Error');
            }
        } catch (err) {
            showToast('error', 'Network error. Please try again.', 'Error');
        } finally {
            setLoading(verifyIdentityBtn, false);
        }
    });

    // Allow Enter key on identifier
    identifierInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') verifyIdentityBtn.click();
    });

    // ── Step 1: Verify Security Answers ─────────────────────

    var a1 = document.getElementById('fp-a1');
    var a2 = document.getElementById('fp-a2');
    var a3 = document.getElementById('fp-a3');
    var verifyAnswersBtn = document.getElementById('fp-verify-answers');

    verifyAnswersBtn.addEventListener('click', async function () {
        var valid = true;
        if (!a1.value.trim()) { showError(a1, 'Answer is required.'); valid = false; } else clearState(a1);
        if (!a2.value.trim()) { showError(a2, 'Answer is required.'); valid = false; } else clearState(a2);
        if (!a3.value.trim()) { showError(a3, 'Answer is required.'); valid = false; } else clearState(a3);
        if (!valid) return;

        setLoading(verifyAnswersBtn, true);

        try {
            var h1 = await sha256(a1.value);
            var h2 = await sha256(a2.value);
            var h3 = await sha256(a3.value);

            var res = await fetch('../php/forgot_verify_answers.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ answer_1: h1, answer_2: h2, answer_3: h3 })
            });
            var data = await res.json();

            if (data && data.success) {
                showToast('success', 'Answers verified! OTP sent to ' + data.email_hint, 'OTP Sent');
                document.getElementById('fp-email-hint').textContent = data.email_hint;
                goToStep(2);
                startResendTimer();
            } else {
                showToast('error', (data && data.message) || 'Answers incorrect.', 'Error');
                // Mark at least something wrong
                if (data && data.wrong) {
                    if (data.wrong.indexOf(1) !== -1) showError(a1, 'Incorrect answer.');
                    if (data.wrong.indexOf(2) !== -1) showError(a2, 'Incorrect answer.');
                    if (data.wrong.indexOf(3) !== -1) showError(a3, 'Incorrect answer.');
                }
            }
        } catch (err) {
            showToast('error', 'Network error. Please try again.', 'Error');
        } finally {
            setLoading(verifyAnswersBtn, false);
        }
    });

    // ── Step 2: OTP ──────────────────────────────────────────

    var otpInput = document.getElementById('fp-otp');
    var verifyOtpBtn = document.getElementById('fp-verify-otp');
    var resendBtn = document.getElementById('fp-resend-otp');
    var resendTimer = document.getElementById('fp-resend-timer');
    var resendInterval = null;

    // Allow only digits in OTP field
    otpInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
    });

    function startResendTimer() {
        var remaining = 120; // 2 minutes
        resendBtn.disabled = true;
        resendTimer.textContent = '(' + formatTime(remaining) + ')';

        if (resendInterval) clearInterval(resendInterval);
        resendInterval = setInterval(function () {
            remaining--;
            if (remaining <= 0) {
                clearInterval(resendInterval);
                resendBtn.disabled = false;
                resendTimer.textContent = '';
            } else {
                resendTimer.textContent = '(' + formatTime(remaining) + ')';
            }
        }, 1000);
    }

    function formatTime(sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    // Verify OTP
    verifyOtpBtn.addEventListener('click', async function () {
        var otp = otpInput.value.trim();
        if (otp.length !== 6) {
            showError(otpInput, 'Please enter the 6-digit code.');
            return;
        }
        clearState(otpInput);
        setLoading(verifyOtpBtn, true);

        try {
            var res = await fetch('../php/forgot_verify_otp.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ otp: otp })
            });
            var data = await res.json();

            if (data && data.success) {
                showToast('success', 'OTP verified! Set your new password.', 'Verified');
                goToStep(3);
                if (resendInterval) clearInterval(resendInterval);
            } else {
                showError(otpInput, (data && data.message) || 'Invalid OTP.');
                showToast('error', (data && data.message) || 'Invalid OTP.', 'Error');
            }
        } catch (err) {
            showToast('error', 'Network error. Please try again.', 'Error');
        } finally {
            setLoading(verifyOtpBtn, false);
        }
    });

    // Allow Enter key on OTP
    otpInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') verifyOtpBtn.click();
    });

    // Resend OTP
    resendBtn.addEventListener('click', async function () {
        resendBtn.disabled = true;
        try {
            var res = await fetch('../php/forgot_send_otp.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({})
            });
            var data = await res.json();

            if (data && data.success) {
                showToast('success', 'New OTP sent to your email.', 'OTP Resent');
                startResendTimer();
            } else {
                showToast('error', (data && data.message) || 'Could not resend OTP.', 'Error');
                resendBtn.disabled = false;
            }
        } catch (err) {
            showToast('error', 'Network error.', 'Error');
            resendBtn.disabled = false;
        }
    });

    // ── Step 3: New Password ────────────────────────────────

    var newPwInput = document.getElementById('fp-new-password');
    var confirmPwInput = document.getElementById('fp-confirm-password');
    var pwIndicator = document.getElementById('fp-pw-indicator');
    var resetBtn = document.getElementById('fp-reset-password');

    // Password validation — same rules as registration
    function validateNewPassword() {
        var pw = newPwInput.value;
        pwIndicator.innerHTML = '';
        pwIndicator.className = 'password-indicator';

        if (pw.length === 0) {
            showError(newPwInput, 'Password is required.');
            return false;
        }

        if (pw.length < 8 || pw.length > 20) {
            showError(newPwInput, 'Password must contain at least 8 to 20 characters.');
            return false;
        }

        // Strength meter
        var strength = 0;
        var hasLower = /[a-z]/.test(pw);
        var hasUpper = /[A-Z]/.test(pw);
        var hasNumber = /[0-9]/.test(pw);
        var hasSpecial = /[!@#$%^&*_?]/.test(pw);

        if (pw.length >= 8 && pw.length <= 20) strength++;
        if (hasNumber) strength++;
        if (hasLower) strength++;
        if (hasUpper) strength++;
        if (hasSpecial) strength++;

        var text = 'Password strength: ';
        var level = '';
        var cls = '';
        if (strength < 3) {
            level = 'Weak';
            cls = 'text-danger';
            clearState(newPwInput);
        } else if (strength < 5) {
            level = 'Medium';
            cls = 'text-warning';
            clearState(newPwInput);
        } else {
            level = 'Strong';
            cls = 'text-success';
            showSuccess(newPwInput, '');
        }

        pwIndicator.innerHTML = '<span class="' + cls + '">' + text + level + '</span>';
        return true;
    }

    function validateConfirmPassword() {
        var cpw = confirmPwInput.value;
        if (cpw.length < 1) {
            showError(confirmPwInput, 'Confirm password is required.');
            return false;
        }
        if (newPwInput.value !== cpw) {
            showError(confirmPwInput, 'Passwords do not match.');
            return false;
        }
        showSuccess(confirmPwInput, '');
        return true;
    }

    // Real-time validation
    newPwInput.addEventListener('input', validateNewPassword);
    confirmPwInput.addEventListener('input', validateConfirmPassword);

    // Toggle visibility
    function wireToggle(btnId, inputEl, iconEl) {
        var btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', function () {
            var isPassword = inputEl.type === 'password';
            inputEl.type = isPassword ? 'text' : 'password';
            iconEl.src = isPassword
                ? '../assets/icons/visibility_off.svg'
                : '../assets/icons/visibility_on.svg';
            iconEl.alt = isPassword ? 'Hide Password' : 'Show Password';
        });
    }

    wireToggle('fp-toggle-pw', newPwInput, document.getElementById('fp-pw-icon'));
    wireToggle('fp-toggle-cpw', confirmPwInput, document.getElementById('fp-cpw-icon'));
    wireToggle('fp-toggle-a1', document.getElementById('fp-a1'), document.getElementById('fp-a1-icon'));
    wireToggle('fp-toggle-a2', document.getElementById('fp-a2'), document.getElementById('fp-a2-icon'));
    wireToggle('fp-toggle-a3', document.getElementById('fp-a3'), document.getElementById('fp-a3-icon'));

    // Reset password
    resetBtn.addEventListener('click', async function () {
        var pwOk = validateNewPassword();
        var cpwOk = validateConfirmPassword();
        if (!pwOk || !cpwOk) return;

        setLoading(resetBtn, true);

        try {
            var res = await fetch('../php/forgot_reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ password: newPwInput.value })
            });
            var data = await res.json();

            if (data && data.success) {
                showToast('success', data.message || 'Password reset successfully!', 'Success');
                setTimeout(function () {
                    window.location.href = 'index.html?reset=1';
                }, 1200);
            } else {
                showToast('error', (data && data.message) || 'Reset failed.', 'Error');
            }
        } catch (err) {
            showToast('error', 'Network error. Please try again.', 'Error');
        } finally {
            setLoading(resetBtn, false);
        }
    });

})();
