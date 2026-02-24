let currentPage = 1;
let searchTimeout = null;

function getBase() {
    return window.TFBASE || '';
}

document.addEventListener('DOMContentLoaded', () => {
    loadLogs(currentPage);

    const searchInput = document.getElementById('log-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadLogs(currentPage, e.target.value);
            }, 300);
        });
    }
});

async function loadLogs(page, search) {
    search = search || '';
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

    try {
        let url = 'api_logs.php?page=' + page;
        if (search) url += '&search=' + encodeURIComponent(search);

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            renderLogs(data.logs);
            renderPagination(data.pagination);
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error: ' + data.error + '</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching logs:', err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load logs.</td></tr>';
    }
}

function renderLogs(logs) {
    const tbody = document.getElementById('logs-table-body');
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
    const current = pagination.current_page; // Ensure API returns current_page
    if (total <= 1) return;

    // Previous
    var prevDisabled = current === 1 ? 'disabled' : '';
    ul.insertAdjacentHTML('beforeend', `<li class="page-item ${prevDisabled}"><button class="page-link" onclick="loadLogs(${current - 1})">Previous</button></li>`);

    for (var i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            var activeClass = current === i ? 'active' : '';
            ul.insertAdjacentHTML('beforeend', `<li class="page-item ${activeClass}"><button class="page-link" onclick="loadLogs(${i})">${i}</button></li>`);
        } else if (i === current - 2 || i === current + 2) {
            ul.insertAdjacentHTML('beforeend', '<li class="page-item disabled"><span class="page-link">...</span></li>');
        }
    }

    // Next
    var nextDisabled = current === total ? 'disabled' : '';
    ul.insertAdjacentHTML('beforeend', `<li class="page-item ${nextDisabled}"><button class="page-link" onclick="loadLogs(${current + 1})">Next</button></li>`);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
