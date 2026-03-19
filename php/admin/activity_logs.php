<?php
require_once '../session_guard.php';
requireLogin();
requireSuperAdmin();

$title = 'Activity Logs - TaskFlow Admin';
$view_css = '/css/admin.css';
$view_js = '/js/admin/activity_logs.js';

require_once '../layouts/app_top.php';
?>

<div class="admin-layout">
    <?php include 'components/sidebar.php'; ?>

    <main class="admin-main">
        <div class="page-header d-flex justify-content-between align-items-center">
            <div>
                <h1 class="page-title">Activity Logs</h1>
                <p class="text-muted">A full audit trail of all user actions across the system.</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary" onclick="loadLogs(1)">🔄 Refresh</button>
            </div>
        </div>

        <div class="card table-card">
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-4">
                        <input type="text" id="log-search" class="form-control" placeholder="Search username, IP...">
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover" id="logs-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                                <th>IP Address</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody id="logs-table-body">
                            <tr><td colspan="5" class="text-center">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <nav aria-label="Page navigation" class="mt-4">
                    <ul class="pagination justify-content-center" id="logs-pagination">
                        <!-- Loaded via JS -->
                    </ul>
                </nav>
            </div>
        </div>
    </main>
</div>

<?php require_once '../layouts/app_bottom.php'; ?>
