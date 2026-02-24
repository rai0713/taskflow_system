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

        const blockBtn = isBlocked
            ? `<button class="btn btn-sm btn-outline-success" onclick="updateStatus(${acc.AccountID}, 'active')" title="Unblock">✓</button>`
            : `<button class="btn btn-sm btn-outline-danger" onclick="updateStatus(${acc.AccountID}, 'blocked')" title="Block">🚫</button>`;

        const promoteBtn = (acc.role === 'user' && window.userRole === 'super_admin')
            ? `<button class="btn btn-sm btn-outline-warning me-1" onclick="changeRole(${acc.AccountID}, 'admin')" title="Promote to Admin">⬆️</button>`
            : '';

        const demoteBtn = (acc.role === 'admin' && window.userRole === 'super_admin')
            ? `<button class="btn btn-sm btn-outline-secondary me-1" onclick="changeRole(${acc.AccountID}, 'user')" title="Demote to User">⬇️</button>`
            : '';

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
                    <button class="btn btn-sm btn-info me-1" onclick="viewAccount(${acc.AccountID})">👁</button>
                    ${promoteBtn}
                    ${demoteBtn}
                    ${blockBtn}
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
    // Show password notice
    document.querySelector('input[name="password"]').required = true;

    // Reset tabs
    new bootstrap.Tab(document.querySelector('#personal-tab')).show();

    const modal = new bootstrap.Modal(document.getElementById('accountModal'));
    modal.show();
}

async function saveAccount() {
    const form = document.getElementById('account-form');
    // Check validation of visible inputs
    // Since tabs hide inputs, native validation might not trigger visibly or block submission weirdly.
    // We should do custom check or force check.

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = document.getElementById('acc-id').value;

    // Hash security answers if creating? Ideally yes, but here we just send raw and PHP hashes it.

    const method = id ? 'PUT' : 'POST';
    // If Edit (PUT), we need to structure data differently? api_accounts.php handles basic update.
    // BUT our form has ALL fields. API PUT only handles basic account info.
    // For now, if ID exists, we only send account info updates.

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

async function updateStatus(id, status) {
    if (status === 'blocked' && window.userRole === 'super_admin') {
        // Superadmin requires a Basis to block
        document.getElementById('basis-form').reset();
        document.getElementById('basis-target-id').value = id;
        document.getElementById('basis-action').value = 'blocked';
        new bootstrap.Modal(document.getElementById('basisModal')).show();
        return;
    }

    if (!confirm(`Are you sure you want to ${status === 'blocked' ? 'BLOCK' : 'UNBLOCK'} this account?`)) return;

    try {
        const res = await fetch('api_accounts.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_id: id, status: status })
        });
        const result = await res.json();

        if (result.success) {
            loadAccounts();
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

async function changeRole(id, newRole) {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
        const res = await fetch('api_accounts.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_id: id, new_role: newRole })
        });
        const result = await res.json();

        if (result.success) {
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
