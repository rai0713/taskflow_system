// Dashboard Stats & Recent Activity
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

function getBase() {
    return window.TFBASE || '';
}

async function loadDashboardStats() {
    try {
        const res = await fetch(getBase() + '/php/admin/api_dashboard.php');
        const data = await res.json();

        if (data.success) {
            updateStatsUI(data.stats);
            updateRecentLogsUI(data.recentLogs);
        } else {
            console.error('Failed to load stats:', data.error);
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

function updateStatsUI(stats) {
    const container = document.getElementById('stats-container');
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-info">
                <h3>${stats.totalUsers}</h3>
                <p>Total Users</p>
            </div>
            <div class="stat-icon">👥</div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3>${stats.totalAdmins}</h3>
                <p>Admins</p>
            </div>
            <div class="stat-icon">🛡️</div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3>${stats.loginsToday}</h3>
                <p>Logins Today</p>
            </div>
            <div class="stat-icon">🔓</div>
        </div>
    `;
}

function updateRecentLogsUI(logs) {
    const tbody = document.querySelector('#recent-logs-table tbody');
    tbody.innerHTML = '';

    if (!logs || logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent activity.</td></tr>';
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

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
