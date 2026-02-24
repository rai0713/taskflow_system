<?php
require_once 'session_guard.php';
requireLogin();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow - Dashboard</title>
    <link rel="stylesheet" href="../bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../css/theme.css">
    <link rel="stylesheet" href="../css/admin.css"> <!-- Reusing Admin CSS for Stats/Cards -->
    <style>
        body {
            background-color: var(--tf-bg);
            padding-bottom: 50px;
        }
        .main-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .navbar-custom {
            background-color: var(--tf-surface);
            border-bottom: 1px solid var(--tf-border);
            padding: 15px 0;
            margin-bottom: 30px;
        }
        .navbar-brand {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--tf-text);
        }
        .navbar-brand span {
            color: var(--tf-accent);
        }
        .nav-tabs {
            border-bottom-color: var(--tf-border);
            margin-bottom: 20px;
        }
        .nav-link {
            color: var(--tf-muted);
            border: none;
            border-bottom: 2px solid transparent;
            font-weight: 500;
        }
        .nav-link:hover {
            color: var(--tf-text);
            border-color: transparent;
        }
        .nav-link.active {
            background: transparent !important;
            color: var(--tf-accent) !important;
            border-bottom-color: var(--tf-accent);
            font-weight: 600;
        }
        .tab-content {
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Dark Mode Dropdown Fix */
        .form-select option {
            background-color: var(--tf-surface);
            color: var(--tf-text);
        }
    </style>
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar navbar-custom">
        <div class="container main-container d-flex justify-content-between align-items-center">
            <a class="navbar-brand" href="#">Task<span>Flow</span></a>
            
            <div class="d-flex align-items-center gap-3">
                <div class="text-end d-none d-md-block">
                    <div class="fw-bold"><?= htmlspecialchars($_SESSION['username'] ?? 'User') ?></div>
                    <small class="text-muted">User</small>
                </div>
                <form action="logout.php" method="POST" style="margin:0;">
                    <button type="submit" class="btn btn-outline-danger btn-sm" onclick="return confirm('Logout?');">
                        <i class="bi bi-box-arrow-right"></i> Logout
                    </button>
                </form>
            </div>
        </div>
    </nav>

    <div class="main-container">
        
        <!-- Stats Row (Always Visible or just for Tasks?) -->
        <!-- Let's put global stats here or inside tabs. Inside tabs is better for context. -->

        <!-- Tabs -->
        <ul class="nav nav-tabs" id="dashboardTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="tasks-tab" data-bs-toggle="tab" data-bs-target="#tasks-pane" type="button" role="tab" aria-controls="tasks-pane" aria-selected="true">
                    <i class="bi bi-list-check me-2"></i> My Tasks
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="goals-tab" data-bs-toggle="tab" data-bs-target="#goals-pane" type="button" role="tab" aria-controls="goals-pane" aria-selected="false">
                    <i class="bi bi-bullseye me-2"></i> My Goals
                </button>
            </li>
        </ul>

        <div class="tab-content" id="dashboardTabsContent">
            
            <!-- TASKS TAB -->
            <div class="tab-pane fade show active" id="tasks-pane" role="tabpanel" aria-labelledby="tasks-tab">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="mb-0"><i class="bi bi-kanban me-2"></i> Task Board</h3>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#taskModal" onclick="resetTaskForm()">
                        <i class="bi bi-plus-lg"></i> New Task
                    </button>
                </div>

                <!-- Task Stats -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3 id="stat-pending">0</h3>
                            <p>Pending</p>
                        </div>
                        <div class="stat-icon bg-warning text-dark"><i class="bi bi-hourglass-split"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3 id="stat-progress">0</h3>
                            <p>In Progress</p>
                        </div>
                        <div class="stat-icon bg-info text-white"><i class="bi bi-arrow-repeat"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3 id="stat-completed">0</h3>
                            <p>Completed</p>
                        </div>
                        <div class="stat-icon bg-success text-white"><i class="bi bi-check-lg"></i></div>
                    </div>
                </div>

                <!-- Task Table -->
                <div class="table-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th><i class="bi bi-card-text me-1"></i> Task</th>
                                    <th><i class="bi bi-flag me-1"></i> Priority</th>
                                    <th><i class="bi bi-calendar-event me-1"></i> Deadline</th>
                                    <th><i class="bi bi-info-circle me-1"></i> Status</th>
                                    <th><i class="bi bi-gear me-1"></i> Actions</th>
                                </tr>
                            </thead>
                            <tbody id="task-list-body">
                                <tr><td colspan="5" class="text-center p-4">Loading tasks...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- GOALS TAB -->
            <div class="tab-pane fade" id="goals-pane" role="tabpanel" aria-labelledby="goals-tab">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="mb-0"><i class="bi bi-trophy me-2"></i> Goal Tracker</h3>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#goalModal" onclick="resetGoalForm()">
                        + New Goal
                    </button>
                </div>

                 <!-- Goal Stats -->
                 <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3 id="stat-goals-total">0</h3>
                            <p>Total Goals</p>
                        </div>
                        <div class="stat-icon bg-primary text-white"><i class="bi bi-list-stars"></i></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3 id="stat-goals-achieved">0</h3>
                            <p>Achieved</p>
                        </div>
                        <div class="stat-icon bg-success text-white"><i class="bi bi-trophy"></i></div>
                    </div>
                 </div>

                <!-- Goal Table -->
                <div class="table-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th><i class="bi bi-bullseye me-1"></i> Goal</th>
                                    <th><i class="bi bi-calendar-check me-1"></i> Target Date</th>
                                    <th><i class="bi bi-graph-up me-1"></i> Progress</th>
                                    <th><i class="bi bi-info-circle me-1"></i> Status</th>
                                    <th><i class="bi bi-gear me-1"></i> Actions</th>
                                </tr>
                            </thead>
                            <tbody id="goal-list-body">
                                <tr><td colspan="5" class="text-center p-4">Loading goals...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
        </div> <!-- End Tab Content -->

    </div> <!-- End Main Container -->

    <!-- Modals -->
    <!-- Task Modal -->
    <div class="modal fade" id="taskModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="taskModalLabel">Add New Task</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="task-form">
                        <input type="hidden" id="task-id">
                        <div class="mb-3">
                            <label for="task-title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="task-title" required>
                        </div>
                        <div class="mb-3">
                            <label for="task-desc" class="form-label">Description</label>
                            <textarea class="form-control" id="task-desc" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="task-priority" class="form-label">Priority</label>
                            <select class="form-select" id="task-priority">
                                <option value="Low">Low</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="task-deadline" class="form-label">Deadline</label>
                            <input type="date" class="form-control" id="task-deadline">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="saveTask()">Save Task</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Goal Modal -->
    <div class="modal fade" id="goalModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="goalModalLabel">Add New Goal</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="goal-form">
                        <input type="hidden" id="goal-id">
                        <div class="mb-3">
                            <label for="goal-title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="goal-title" required>
                        </div>
                        <div class="mb-3">
                            <label for="goal-desc" class="form-label">Description</label>
                            <textarea class="form-control" id="goal-desc" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="goal-deadline" class="form-label">Target Date</label>
                            <input type="date" class="form-control" id="goal-deadline">
                        </div>
                        <div class="mb-3">
                             <label for="goal-progress" class="form-label">Progress (%)</label>
                             <input type="number" class="form-control" id="goal-progress" min="0" max="100" value="0">
                        </div>
                        <div class="mb-3">
                             <label for="goal-status" class="form-label">Status</label>
                             <select class="form-select" id="goal-status">
                                 <option value="In Progress">In Progress</option>
                                 <option value="Achieved">Achieved</option>
                             </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="saveGoal()">Save Goal</button>
                </div>
            </div>
        </div>
    </div>

    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../js/homepage.js"></script>
</body>
</html>
