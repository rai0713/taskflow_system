document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
});

function getBase() {
    return window.TFBASE || ''; // Defined in layout or standard helper
}

async function loadAccounts() {
    const tbody = document.getElementById('accounts-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const res = await fetch('api_accounts.php');
        const data = await res.json();

        if (data.success) {
            renderAccounts(data.accounts);
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${data.error}</td></tr>`;
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load accounts</td></tr>';
    }
}

function renderAccounts(accounts) {
    const tbody = document.getElementById('accounts-table-body');
    tbody.innerHTML = '';

    if (accounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No accounts found</td></tr>';
        return;
    }

    accounts.forEach(acc => {
        const isBlocked = acc.Status === 'blocked';
        const statusBadge = isBlocked
            ? '<span class="badge bg-danger">Blocked</span>'
            : '<span class="badge bg-success">Active</span>';

        let actionButtons = `<button class="btn btn-sm btn-info me-1" onclick="viewAccount(${acc.AccountID})" title="View Details">👁</button>`;

        // Hierarchy Security:
        // Super Admins can edit/block anyone
        // Standard Admins can only edit/block base 'user' roles
        const canEdit = window.userRole === 'super_admin' || acc.role === 'user';

        if (canEdit) {
            actionButtons += `<button class="btn btn-sm btn-secondary me-1" onclick="editAccount(${acc.AccountID})" title="Edit User">✎</button>`;

            if (isBlocked) {
                actionButtons += `<button class="btn btn-sm btn-outline-success" onclick="updateStatus(${acc.AccountID}, 'active')" title="Unblock">✓</button>`;
            } else {
                actionButtons += `<button class="btn btn-sm btn-outline-danger" onclick="updateStatus(${acc.AccountID}, 'blocked')" title="Block">🚫</button>`;
            }
        }

        const row = `
            <tr>
                <td>
                    <strong>${escapeHtml(acc.Username)}</strong><br>
                    <small class="text-muted">${escapeHtml(acc.Email)}</small>
                </td>
                <td><span class="badge bg-role-${acc.role}">${acc.role}</span></td>
                <td>${escapeHtml(acc.id_no)}</td>
                <td>${statusBadge}</td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function loadPendingAccounts() {
    const tbody = document.getElementById('pending-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const res = await fetch('api_accounts.php?tab=pending');
        const data = await res.json();

        if (data.success) {
            renderPendingAccounts(data.accounts);
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${data.error}</td></tr>`;
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load accounts</td></tr>';
    }
}

function renderPendingAccounts(accounts) {
    const tbody = document.getElementById('pending-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (accounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No pending registrations found</td></tr>';
        return;
    }

    accounts.forEach(acc => {
        const statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';

        let actionButtons = `<button class="btn btn-sm btn-info me-1" onclick="viewAccount(${acc.AccountID})" title="View Details">👁</button>`;

        // Hierarchy Security
        const canEdit = window.userRole === 'super_admin' || acc.role === 'user';
        if (canEdit) {
            actionButtons += `
                <button class="btn btn-sm btn-outline-success" onclick="updateStatus(${acc.AccountID}, 'active', true)" title="Approve Account">✓ Approve</button>
                <button class="btn btn-sm btn-outline-danger" onclick="updateStatus(${acc.AccountID}, 'blocked', true)" title="Reject/Block Account">🚫 Reject</button>
            `;
        }

        const row = `
            <tr>
                <td>
                    <strong>${escapeHtml(acc.Username)}</strong><br>
                    <small class="text-muted">${escapeHtml(acc.Email)}</small>
                </td>
                <td><span class="badge bg-role-${acc.role}">${acc.role}</span></td>
                <td>${escapeHtml(acc.id_no)}</td>
                <td>${statusBadge}</td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function openCreateModal() {
    document.getElementById('account-form').reset();
    document.getElementById('acc-id').value = '';
    document.getElementById('accountModalLabel').textContent = 'Create Account';

    document.getElementById('password-help').style.display = 'none';

    // Required fields check (re-enable security inputs)
    document.querySelectorAll('#adminAccountPanels .tf-panel[data-step="3"] input, #adminAccountPanels .tf-panel[data-step="3"] select').forEach(el => el.setAttribute('data-required', '1'));

    // Check Role Dropdown (Admins can only create Users)
    const roleSelect = document.querySelector('select[name="role"]');
    roleSelect.value = 'user';
    if (window.userRole !== 'super_admin') {
        roleSelect.disabled = true;
    } else {
        roleSelect.disabled = false;
    }

    // Remove red rings
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid', 'is-valid'));

    setAccountStep(0);

    const modal = new bootstrap.Modal(document.getElementById('accountModal'));
    modal.show();
}

async function editAccount(id) {
    document.getElementById('account-form').reset();
    document.getElementById('acc-id').value = id;
    document.getElementById('accountModalLabel').textContent = 'Edit Account';

    document.getElementById('password-help').style.display = 'block';

    // Disable security inputs requirement for edit
    document.querySelectorAll('#adminAccountPanels .tf-panel[data-step="3"] input, #adminAccountPanels .tf-panel[data-step="3"] select').forEach(el => el.removeAttribute('data-required'));

    // Remove validation states
    document.querySelectorAll('.is-invalid, .is-valid').forEach(el => el.classList.remove('is-invalid', 'is-valid'));

    setAccountStep(0);

    const modal = new bootstrap.Modal(document.getElementById('accountModal'));
    modal.show();

    try {
        const res = await fetch(`api_accounts.php?id=${id}`);
        const data = await res.json();

        if (data.success) {
            const u = data.user;

            // Personal
            document.querySelector('input[name="first_name"]').value = u.firstName || '';
            document.querySelector('input[name="middle_initial"]').value = u.middleName || '';
            document.querySelector('input[name="last_name"]').value = u.lastName || '';
            document.querySelector('select[name="ext_name"]').value = u.extName || '';
            document.querySelector('select[name="sex"]').value = u.sex || 'Male';
            document.querySelector('input[name="birthdate"]').value = u.DOB || '';

            // Address
            document.querySelector('input[name="purok"]').value = u['Prk/Barangay'] || '';
            document.querySelector('input[name="barangay"]').value = ''; // merged into purok in DB
            document.querySelector('input[name="city"]').value = u['City/Municipality'] || '';
            document.querySelector('input[name="province"]').value = u.Province || '';
            document.querySelector('input[name="country"]').value = u.Country || 'Philippines';
            document.querySelector('input[name="zip"]').value = u['Zip Code'] || '';

            // Account
            document.querySelector('input[name="username"]').value = u.Username || '';
            document.querySelector('input[name="email"]').value = u.Email || '';

            const roleSelect = document.querySelector('select[name="role"]');
            roleSelect.value = u.role || 'user';

            // Lock role dropdown if not superadmin
            if (window.userRole !== 'super_admin') {
                roleSelect.disabled = true;
            } else {
                roleSelect.disabled = false;
            }

            document.querySelector('input[name="id_no"]').value = u.id_no || '';

            if (typeof window.validateAndSetAge === 'function') {
                window.validateAndSetAge();
                // Strip the visual validation checkmarks immediately so it looks clean on load
                document.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
            }

        } else {
            alert("Error loading user data: " + data.error);
            modal.hide();
        }
    } catch (err) {
        console.error(err);
        alert("Failed to load user info");
        modal.hide();
    }
}

async function saveAccount() {
    if (!(await validateCurrentPanel())) return;

    const form = document.getElementById('account-form');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = document.getElementById('acc-id').value;

    if (id) {
        data.account_id = id;
    }

    // If the role dropdown was disabled (Admin doing the edit/create), it won't be in the FormData
    // We must manually inject it or explicitly pass 'user' so the backend doesn't throw a missing fields error
    if (!data.role) {
        const roleSelect = document.querySelector('select[name="role"]');
        data.role = roleSelect ? roleSelect.value : 'user';
    }

    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch('api_accounts.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.success) {
            alert(result.message);
            location.reload();
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Operation failed');
    }
}

async function updateStatus(id, status, isApproving = false) {
    if (status === 'blocked' && window.userRole === 'super_admin' && !isApproving) {
        // Superadmin requires a Basis to block active users
        // However, if isApproving is true, they are simply REJECTING a pending application
        // which deletes the data entirely, so no basis is required.
        document.getElementById('basis-form').reset();
        document.getElementById('basis-target-id').value = id;
        document.getElementById('basis-action').value = 'blocked';
        new bootstrap.Modal(document.getElementById('basisModal')).show();
        return;
    }

    let actionText = status === 'blocked' ? 'BLOCK' : 'UNBLOCK';
    if (isApproving) {
        actionText = status === 'blocked' ? 'REJECT' : 'APPROVE';
    }

    if (!confirm(`Are you sure you want to ${actionText} this account?`)) return;

    try {
        const res = await fetch('api_accounts.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_id: id, status: status })
        });
        const result = await res.json();

        if (result.success) {
            // Live reload both tables so the row disappears from pending 
            // and instantly appears in the active/blocked list without a page refresh
            loadAccounts();
            loadPendingAccounts();
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Operation failed');
    }
}

async function submitBasisAction() {
    const form = document.getElementById('basis-form');
    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    try {
        const res = await fetch('api_accounts_basis.php', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (result.success) {
            new bootstrap.Modal(document.getElementById('basisModal')).hide();
            document.querySelector('#basisModal .btn-close').click(); // Hard close
            loadAccounts();
        } else {
            alert(result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Operation failed');
    }
}

async function viewAccount(id) {
    const body = document.getElementById('view-user-body');
    body.innerHTML = '<div class="text-center py-4">Loading details...</div>';

    const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
    modal.show();

    try {
        const res = await fetch(`api_accounts.php?id=${id}`);
        const data = await res.json();

        if (data.success) {
            const u = data.user;
            // Build nice view
            let privilegeDesc = '';
            if (u.role === 'super_admin') {
                privilegeDesc = `
                    <ul class="mb-0 ps-3">
                        <li><strong>Full System Control</strong></li>
                        <li>Manage All Accounts (Create, Block, Edit)</li>
                        <li>View All System Logs</li>
                        <li>Access Dashboard Statistics</li>
                        <li>Delete Records</li>
                    </ul>`;
            } else if (u.role === 'admin') {
                privilegeDesc = `
                    <ul class="mb-0 ps-3">
                        <li><strong>Administrative Access</strong></li>
                        <li>View Dashboard & Logs</li>
                        <li>Manage User Accounts</li>
                        <li><em>Cannot create other Admins</em></li>
                    </ul>`;
            } else {
                privilegeDesc = `
                    <ul class="mb-0 ps-3">
                        <li><strong>Standard User Access</strong></li>
                        <li>Create & Manage Own Tasks</li>
                        <li>Update Task Status</li>
                        <li>Delete Own Tasks</li>
                        <li>View Personal Profile</li>
                    </ul>`;
            }

            let html = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <h6>Account</h6>
                        <p>
                            <strong>Username:</strong> ${escapeHtml(u.Username)}<br>
                            <strong>Email:</strong> ${escapeHtml(u.Email)}<br>
                            <strong>Role:</strong> ${escapeHtml(u.role)}<br>
                            <strong>ID No:</strong> ${escapeHtml(u.id_no)}<br>
                            <strong>Status:</strong> ${escapeHtml(u.Status)}
                        </p>
                        <h6>Privileges</h6>
                        <div class="text-muted small border rounded p-2 bg-light">
                            ${privilegeDesc}
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <h6>Personal Info</h6>
                        <p>
                            <strong>Name:</strong> ${escapeHtml(u.firstName)} ${escapeHtml(u.middleName || '')} ${escapeHtml(u.lastName)} ${escapeHtml(u.extName || '')}<br>
                            <strong>Sex:</strong> ${escapeHtml(u.sex)}<br>
                            <strong>DOB:</strong> ${escapeHtml(u.DOB)}
                        </p>
                    </div>
                    <div class="col-12">
                        <h6>Address</h6>
                        <p>
                            ${escapeHtml(u['Prk/Barangay'])}, ${escapeHtml(u['City/Municipality'])}, ${escapeHtml(u.Province)}<br>
                            ${escapeHtml(u.Country)}, ${escapeHtml(u['Zip Code'])}
                        </p>
                    </div>
                </div>
            `;
            body.innerHTML = html;
        } else {
            body.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        }
    } catch (err) {
        body.innerHTML = `<div class="alert alert-danger">Failed to load details</div>`;
    }
}

function escapeHtml(text) {
    if (!text && text !== 0) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ==========================================
// Admin Modal Stepper Logic
// ==========================================
let currentStep = 0;

function setAccountStep(idx) {
    const panels = document.querySelectorAll('#adminAccountPanels .tf-panel');
    const steps = document.querySelectorAll('.tf-step');
    const bar = document.getElementById('tf-stepper-bar');
    const btnNext = document.getElementById('btn-modal-next');
    const btnPrev = document.getElementById('btn-modal-prev');
    const btnSubmit = document.getElementById('btn-modal-submit');

    const isEditing = document.getElementById('acc-id').value !== '';
    const maxSteps = 4; // Always 4 steps (Security is optional on edit)
    if (idx >= maxSteps) idx = maxSteps - 1;
    if (idx < 0) idx = 0;

    currentStep = idx;

    panels.forEach((p) => {
        p.classList.toggle('is-active', parseInt(p.dataset.step) === idx);
    });

    steps.forEach((s) => {
        const stepNum = parseInt(s.dataset.step);
        s.style.display = 'inline-block';

        const isActive = stepNum === idx;
        s.classList.toggle('tf-step--active', isActive);
        if (isActive) s.setAttribute('aria-current', 'step');
        else s.removeAttribute('aria-current');
    });

    if (bar) bar.style.width = (idx / (maxSteps - 1) * 100) + '%';

    btnPrev.style.display = (idx === 0) ? 'none' : 'inline-block';

    const isLast = idx === (maxSteps - 1);
    btnNext.style.display = isLast ? 'none' : 'inline-block';
    btnSubmit.style.display = isLast ? 'inline-block' : 'none';
}

async function validateCurrentPanel() {
    const panel = document.querySelector(`.tf-panel[data-step="${currentStep}"]`);
    if (!panel) return true;

    let isValid = true;
    let firstInvalid = null;
    const isEditing = document.getElementById('acc-id').value !== '';

    // Delegate to script.js functions if they exist (hooks shared with registration)
    if (currentStep === 0) {
        if (typeof window.validateIdNo === 'function' && !(await window.validateIdNo())) isValid = false;
        if (typeof window.checkFirstName === 'function' && !window.checkFirstName()) isValid = false;
        if (typeof window.checkLastName === 'function' && !window.checkLastName()) isValid = false;
        if (typeof window.validateAndSetAge === 'function' && !window.validateAndSetAge()) isValid = false;

        const ageErr = document.getElementById('age-error');
        if (ageErr && ageErr.textContent && ageErr.textContent.trim() !== '') isValid = false;
        const dobErr = document.getElementById('birthdate-error');
        if (dobErr && dobErr.textContent && dobErr.textContent.trim() !== '') isValid = false;
    } else if (currentStep === 1) {
        if (typeof window.validateZipCode === 'function' && document.getElementById('zipCode').value && !window.validateZipCode()) isValid = false;
    } else if (currentStep === 2) {
        if (typeof window.validateEmail === 'function' && !(await window.validateEmail())) isValid = false;
        if (typeof window.checkUserName === 'function' && !(await window.checkUserName())) isValid = false;

        if (!isEditing) {
            if (typeof window.passwordValidator === 'function' && !(await window.passwordValidator())) isValid = false;
            if (typeof window.confirmPassword === 'function' && !window.confirmPassword()) isValid = false;
        } else {
            // Password fields sync checks for editing
            const pw = document.getElementById('password').value;
            const cpw = document.getElementById('confirm-password').value;
            if (pw !== '') {
                if (typeof window.passwordValidator === 'function' && !(await window.passwordValidator())) isValid = false;
                if (pw !== cpw) {
                    isValid = false;
                    document.getElementById('confirm-password').classList.add('is-invalid');
                    firstInvalid = document.getElementById('confirm-password');
                } else if (typeof window.confirmPassword === 'function' && !window.confirmPassword()) {
                    isValid = false;
                }
            }
        }
    } else if (currentStep === 3) {
        const sqFilled = Array.from(panel.querySelectorAll('input[type="password"], select')).some(el => el.value.trim() !== '');
        if (isEditing && !sqFilled) {
            // Optional when editing and completely untouched
        } else {
            if (typeof window.validateAllSecurityQuestions === 'function' && !window.validateAllSecurityQuestions()) isValid = false;
        }
    }

    // Native HTML5 UI checks
    const requiredInputs = panel.querySelectorAll('input[data-required="1"], select[data-required="1"]');
    requiredInputs.forEach(el => {
        if (!el.value.trim()) {
            isValid = false;
            el.classList.add('is-invalid');
            if (!firstInvalid) firstInvalid = el;
        } else {
            if (!el.classList.contains('is-invalid') && typeof el.checkValidity === 'function' && !el.checkValidity()) {
                isValid = false;
                el.classList.add('is-invalid');
                if (!firstInvalid) firstInvalid = el;
            }
        }
    });

    if (panel.querySelector('.is-invalid')) {
        isValid = false;
        firstInvalid = panel.querySelector('.is-invalid') || firstInvalid;
    }

    if (!isValid) {
        if (firstInvalid) {
            try { firstInvalid.focus(); } catch (e) { }
        }
        if (typeof window.TaskFlowToast !== 'undefined') {
            window.TaskFlowToast.show({ type: 'error', title: 'Error', message: 'Please fix the highlighted fields.' });
        } else {
            alert('Please complete the highlighted fields correctly.');
        }
    }

    return isValid;
}

document.addEventListener('DOMContentLoaded', () => {
    const btnNext = document.getElementById('btn-modal-next');
    const btnPrev = document.getElementById('btn-modal-prev');
    const steps = document.querySelectorAll('.tf-step');

    if (btnNext) btnNext.addEventListener('click', async () => {
        if (await validateCurrentPanel()) {
            setAccountStep(currentStep + 1);
        }
    });

    if (btnPrev) btnPrev.addEventListener('click', () => {
        setAccountStep(Math.max(0, currentStep - 1));
    });

    steps.forEach(s => {
        s.addEventListener('click', async () => {
            const target = parseInt(s.dataset.step);
            if (target > currentStep) {
                if (!(await validateCurrentPanel())) return; // Prevent skipping forward if invalid
            }
            setAccountStep(target);
        });
    });

    // Remove red rings on input
    document.querySelectorAll('#account-form input, #account-form select').forEach(el => {
        el.addEventListener('input', () => {
            el.classList.remove('is-invalid');
        });
    });

    // Real-time duplicate existence checks on blur
    const usernameInput = document.getElementById('user-name');
    if (usernameInput && typeof window.checkUserName === 'function') {
        usernameInput.addEventListener('blur', window.checkUserName);
    }

    const emailInput = document.getElementById('email-form');
    if (emailInput && typeof window.validateEmail === 'function') {
        emailInput.addEventListener('blur', window.validateEmail);
    }

    const idInput = document.getElementById('id-no');
    if (idInput && typeof window.validateIdNo === 'function') {
        idInput.addEventListener('blur', window.validateIdNo);
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput && typeof window.passwordValidator === 'function') {
        passwordInput.addEventListener('blur', window.passwordValidator);
    }
});

// ==============================================
// Transfer Master Superadmin Logic
// ==============================================

function openTransferMasterModal() {
    document.getElementById('transfer-master-form').reset();
    const modal = new bootstrap.Modal(document.getElementById('transferMasterModal'));
    modal.show();
}

function toggleTransferPassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

async function submitTransferMaster() {
    const username = document.getElementById('new-master-username').value.trim();
    const password = document.getElementById('new-master-password').value;
    const confirmPassword = document.getElementById('confirm-master-password').value;

    if (!username || !password || !confirmPassword) {
        alert('All fields are required.');
        return;
    }

    if (password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    if (!confirm('Are you absolutely sure? Your current system founder credentials will be permanently erased.')) {
        return;
    }

    try {
        const res = await fetch('api_transfer_master.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            alert('Transfer successful! You will now be logged out. Please log in using your new System Founder credentials.');
            window.location.href = '../logout.php';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('A network error occurred.');
    }
}
