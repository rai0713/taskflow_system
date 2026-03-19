<?php
require_once '../session_guard.php';
requireLogin();
requireSuperAdmin();

$title = 'Logs - TaskFlow Admin';
$view_css = '/css/admin.css';
$view_js = '/js/admin/logs.js';

require_once '../layouts/app_top.php';
?>

<div class="admin-layout">
    <?php include 'components/sidebar.php'; ?>

    <main class="admin-main">
        <div class="page-header d-flex justify-content-between align-items-center">
            <div>
                <h1 class="page-title">System Logs</h1>
                <p class="text-muted">Monitor global user activity and login history.</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary" onclick="refreshCurrentTab()">🔄 Refresh</button>
            </div>
        </div>

        <div class="card table-card">
            <div class="card-body">
                <ul class="nav nav-tabs mb-3" id="logsTab" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="activity-tab" data-bs-toggle="tab" data-bs-target="#activity" type="button" role="tab" aria-controls="activity" aria-selected="true" onclick="switchTab('activity')">Activity Logs</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab" aria-controls="login" aria-selected="false" onclick="switchTab('login')">Login Logs</button>
                  </li>
                </ul>

                <div class="row mb-3">
                    <div class="col-md-4">
                        <input type="text" id="log-search" class="form-control" placeholder="Search logs...">
                    </div>
                </div>

                <div class="tab-content" id="logsTabContent">
                    <div class="tab-pane fade show active" id="activity" role="tabpanel" aria-labelledby="activity-tab">
                        <div class="table-responsive">
                            <table class="table table-hover" id="activity-logs-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                        <th>IP Address</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody id="activity-logs-table-body">
                                    <tr><td colspan="5" class="text-center">Loading...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="login" role="tabpanel" aria-labelledby="login-tab">
                        <div class="table-responsive">
                            <table class="table table-hover" id="login-logs-table">
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
                                <tbody id="login-logs-table-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
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
