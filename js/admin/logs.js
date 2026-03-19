let currentTab = 'activity';
let currentPageActivity = 1;
let currentPageLogin = 1;
let searchTimeout = null;
let currentSearch = '';

function getBase() {
    return window.TFBASE || '';
}

document.addEventListener('DOMContentLoaded', () => {
    loadLogs(currentTab, 1);

    const searchInput = document.getElementById('log-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            currentSearch = e.target.value;
            searchTimeout = setTimeout(() => {
                if (currentTab === 'activity') currentPageActivity = 1;
                else currentPageLogin = 1;
                loadLogs(currentTab, 1, currentSearch);
            }, 300);
        });
    }
});

function switchTab(tabName) {
    currentTab = tabName;
    document.getElementById('log-search').value = currentSearch;
    let page = (tabName === 'activity') ? currentPageActivity : currentPageLogin;
    loadLogs(tabName, page, currentSearch);
}

function refreshCurrentTab() {
    let page = (currentTab === 'activity') ? currentPageActivity : currentPageLogin;
    loadLogs(currentTab, page, currentSearch);
}

function changePage(page) {
    if (currentTab === 'activity') currentPageActivity = page;
    else currentPageLogin = page;
    loadLogs(currentTab, page, currentSearch);
}

async function loadLogs(type, page, search = '') {
    const tbodyId = type === 'activity' ? 'activity-logs-table-body' : 'login-logs-table-body';
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const colSpan = type === 'activity' ? 5 : 6;
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center">Loading...</td></tr>`;

    try {
        let endpoint = type === 'activity' ? 'api_activity_logs.php' : 'api_logs.php';
        let url = endpoint + '?page=' + page;
        if (search) url += '&search=' + encodeURIComponent(search);

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            if (type === 'activity') renderActivityLogs(data.logs);
            else renderLoginLogs(data.logs);
            renderPagination(data.pagination);
        } else {
            tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center text-danger">Error: ${data.error}</td></tr>`;
        }
    } catch (err) {
        console.error('Error fetching logs:', err);
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center text-danger">Failed to load logs.</td></tr>`;
    }
}

function renderActivityLogs(logs) {
    const tbody = document.getElementById('activity-logs-table-body');
    tbody.innerHTML = '';
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No logs found</td></tr>';
        return;
    }

    logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        let actionBadgeClass = 'bg-primary';
        if (log.Action.includes('Delete') || log.Action.includes('Block') || log.Action.includes('Archived')) actionBadgeClass = 'bg-danger';
        else if (log.Action.includes('Create') || log.Action.includes('Registered')) actionBadgeClass = 'bg-success';
        else if (log.Action.includes('Update')) actionBadgeClass = 'bg-info text-dark';

        const row = `
            <tr>
                <td>
                    <strong>${escapeHtml(log.Username)}</strong><br>
                    <small class="text-muted">${escapeHtml(log.role)}</small>
                </td>
                <td><span class="badge ${actionBadgeClass}">${escapeHtml(log.Action)}</span></td>
                <td><small>${escapeHtml(log.Details || '-')}</small></td>
                <td><small>${escapeHtml(log.ip_address)}</small></td>
                <td><small class="text-muted">${timestamp}</small></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderLoginLogs(logs) {
    const tbody = document.getElementById('login-logs-table-body');
    tbody.innerHTML = '';
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No logs found</td></tr>';
        return;
    }

    logs.forEach(log => {
        const loginTime = new Date(log.login_time).toLocaleString();
        const logoutTime = log.logout_time ? new Date(log.logout_time).toLocaleString() : '-';
        let statusBadge;
        if (log.logout_time) {
            statusBadge = '<span class="badge bg-secondary">Logged Out</span>';
        } else {
            statusBadge = '<span class="badge bg-success">Active</span>';
        }

        const row = `
            <tr>
                <td>
                    <strong>${escapeHtml(log.Username)}</strong><br>
                    <small class="text-muted">${escapeHtml(log.role)}</small>
                </td>
                <td>${escapeHtml(log.ip_address)}</td>
                <td style="font-size: 0.8em; word-break: break-all;">
                    ${escapeHtml(log.user_agent)}
                </td>
                <td>${loginTime}</td>
                <td>${logoutTime}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderPagination(pagination) {
    const ul = document.getElementById('logs-pagination');
    if (!ul) return;
    ul.innerHTML = '';

    const total = pagination.total_pages;
    const current = pagination.current_page;
    if (total <= 1) return;

    var prevDisabled = current === 1 ? 'disabled' : '';
    ul.insertAdjacentHTML('beforeend', `<li class="page-item ${prevDisabled}"><button class="page-link" onclick="changePage(${current - 1})">Previous</button></li>`);

    for (var i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            var activeClass = current === i ? 'active' : '';
            ul.insertAdjacentHTML('beforeend', `<li class="page-item ${activeClass}"><button class="page-link" onclick="changePage(${i})">${i}</button></li>`);
        } else if (i === current - 2 || i === current + 2) {
            ul.insertAdjacentHTML('beforeend', '<li class="page-item disabled"><span class="page-link">...</span></li>');
        }
    }

    var nextDisabled = current === total ? 'disabled' : '';
    ul.insertAdjacentHTML('beforeend', `<li class="page-item ${nextDisabled}"><button class="page-link" onclick="changePage(${current + 1})">Next</button></li>`);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
