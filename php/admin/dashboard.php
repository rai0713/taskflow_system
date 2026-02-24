<?php
require_once '../session_guard.php';
requireLogin();
requireAdmin(); // Defines access for Admin/Super Admin

$title = 'Admin Dashboard - TaskFlow';
$view_css = '/css/admin.css';
$view_js = '/js/admin/dashboard.js?v=1.1';

require_once '../layouts/app_top.php';
?>

<div class="admin-layout">
    <?php include 'components/sidebar.php'; ?>

    <main class="admin-main">
        <div class="page-header">
            <h1 class="page-title">Dashboard</h1>
            <p class="text-muted">Overview of system activity and statistics.</p>
        </div>

        <div class="stats-grid" id="stats-container">
            <!-- Loaded via JS -->
            <div class="stat-card">
                <div class="stat-info">
                    <h3>...</h3>
                    <p>Total Users</p>
                </div>
                <div class="stat-icon">👥</div>
            </div>
            <div class="stat-card">
                <div class="stat-info">
                    <h3>...</h3>
                    <p>Logins Today</p>
                </div>
                <div class="stat-icon">🔓</div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card table-card">
                    <div class="card-body">
                        <h5 class="card-title">Recent Logins</h5>
                        <div class="table-responsive">
                            <table class="table table-hover" id="recent-logs-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>IP Address</th>
                                        <th>User Agent</th>
                                        <th>Login Time</th>
                                        <th>Logout Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </main>
</div>

<?php require_once '../layouts/app_bottom.php'; ?>
