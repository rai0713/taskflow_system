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
        let url = 'api_activity_logs.php?page=' + page;
        if (search) url += '&search=' + encodeURIComponent(search);

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            renderLogs(data.logs);
            renderPagination(data.pagination);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error: ' + data.error + '</td></tr>';
        }
    } catch (err) {
        console.error('Error fetching activity logs:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load logs.</td></tr>';
    }
}

function renderLogs(logs) {
    const tbody = document.getElementById('logs-table-body');
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
