document.addEventListener('DOMContentLoaded', function () {
    loadTasks();
    loadGoals();
    loadStats();
});

// --- CORE FETCH WRAPPER ---
async function sendRequest(url, method, data) {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);

        const res = await fetch(url, options);
        let result;
        try {
            result = await res.json();
        } catch (e) {
            // Not JSON
        }

        if (!res.ok) {
            if (result && result.error) {
                return result; // Backend provided a specific error reason
            }
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return result;
    } catch (err) {
        console.error('Request failed:', err);
        return { success: false, error: 'Connection failed' };
    }
}

// --- STATS & ACTIVITY ---
async function loadStats() {
    const res = await fetch('api_home_stats.php'); // Relative to php/home.php
    const data = await res.json();

    if (data.success) {
        // 1. Task Counts
        if (document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = data.stats.pending || 0;
        if (document.getElementById('stat-progress')) document.getElementById('stat-progress').textContent = data.stats.in_progress || 0;
        if (document.getElementById('stat-completed')) document.getElementById('stat-completed').textContent = data.stats.completed || 0;

        // 2. Recent Activity
        const activityList = document.getElementById('recent-activity-list');
        if (activityList) {
            activityList.innerHTML = '';
            if (data.recent_activity && data.recent_activity.length > 0) {
                data.recent_activity.forEach(task => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';

                    let badgeClass = 'bg-secondary';
                    if (task.Status === 'Completed') badgeClass = 'bg-success';
                    else if (task.Status === 'In Progress') badgeClass = 'bg-info';
                    else if (task.Status === 'Pending') badgeClass = 'bg-warning text-dark';

                    li.innerHTML = `
                        <span>${escapeHtml(task.Title)}</span>
                        <span class="badge ${badgeClass} rounded-pill">${task.Status}</span>
                    `;
                    activityList.appendChild(li);
                });
            } else {
                activityList.innerHTML = '<li class="list-group-item text-center text-muted">No recent activity</li>';
            }
        }

        // 3. Goals Stats
        if (document.getElementById('stat-goals-achieved')) document.getElementById('stat-goals-achieved').textContent = data.goals_stats.achieved || 0;
        if (document.getElementById('stat-goals-total')) document.getElementById('stat-goals-total').textContent = data.goals_stats.total || 0;
    }
}

// --- TASKS ---
async function loadTasks() {
    const tbody = document.getElementById('task-list-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const res = await fetch('tasks/read.php'); // Relative to php/home.php: php/tasks/read.php
        const data = await res.json();

        if (data.success) {
            renderTasks(data.tasks);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading tasks</td></tr>';
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to connect</td></tr>';
    }
}

function renderTasks(tasks) {
    const tbody = document.getElementById('task-list-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-5 bg-transparent" style="background: transparent !important; box-shadow: none;"><i class="bi bi-inbox-fill display-4 d-block mb-3 opacity-50"></i>No tasks found. Add a new task to get started!</td></tr>';
        return;
    }

    tasks.forEach(task => {
        const badgePriority = task.Priority === 'High' ? 'bg-danger' : (task.Priority === 'Medium' ? 'bg-warning text-dark' : 'bg-success');
        const badgeStatus = task.Status === 'Completed' ? 'bg-success' : (task.Status === 'In Progress' ? 'bg-info' : 'bg-secondary');

        // Disable "Mark Complete" if already completed/archived
        const completeBtn = task.Status !== 'Completed' && task.Status !== 'Archived'
            ? `<button class="btn btn-sm btn-outline-success me-1" title="Mark Complete" onclick="updateTaskStatus(${task.TaskID}, 'Completed')"><i class="bi bi-check-lg"></i></button>`
            : '';

        const archiveBtn = task.Status === 'Completed'
            ? `<button class="btn btn-sm btn-outline-info me-1" title="Archive Task" onclick="updateTaskStatus(${task.TaskID}, 'Archived')"><i class="bi bi-archive"></i></button>`
            : '';

        const row = `
            <tr>
                <td>
                    <strong>${escapeHtml(task.Title)}</strong><br>
                    <small class="text-muted">${escapeHtml(task.Description)}</small>
                </td>
                <td><span class="badge ${badgePriority}">${task.Priority}</span></td>
                <td>${task.Deadline || '-'}</td>
                <td><span class="badge ${badgeStatus}">${task.Status}</span></td>
                <td>
                    ${completeBtn}
                    ${archiveBtn}
                    <button class="btn btn-sm btn-outline-secondary me-1" title="Edit" onclick='editTask(${JSON.stringify(task)})'><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="deleteTask(${task.TaskID})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function resetTaskForm() {
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('taskModalLabel').textContent = 'Add New Task';
}

function editTask(task) {
    document.getElementById('task-id').value = task.TaskID;
    document.getElementById('task-title').value = task.Title;
    document.getElementById('task-desc').value = task.Description || '';
    document.getElementById('task-priority').value = task.Priority;
    document.getElementById('task-deadline').value = task.Deadline ? task.Deadline.split(' ')[0] : ''; // Handle datetime if needed
    document.getElementById('taskModalLabel').textContent = 'Edit Task';

    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

async function saveTask() {
    const id = document.getElementById('task-id').value;
    const data = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-deadline').value
    };

    if (!data.title) {
        alert('Title is required');
        return;
    }

    let url = id ? 'tasks/update.php' : 'tasks/create.php';
    let method = id ? 'PUT' : 'POST';
    if (id) data.task_id = id;

    const result = await sendRequest(url, method, data);
    if (result.success) {
        const modalEl = document.getElementById('taskModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadTasks();
        loadStats(); // Update stats
    } else {
        alert('Error: ' + result.error);
    }
}

async function updateTaskStatus(id, status) {
    const result = await sendRequest('tasks/update.php', 'PUT', { task_id: id, status: status });
    if (result.success) {
        loadTasks();
        loadStats();
    }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const result = await sendRequest('tasks/delete.php', 'DELETE', { task_id: id });
    if (result.success) {
        loadTasks();
        loadStats();
    } else {
        alert('Error: ' + result.error);
    }
}

// --- GOALS ---
async function loadGoals() {
    const tbody = document.getElementById('goal-list-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';

    try {
        const res = await fetch('goals/read.php');
        const data = await res.json();
        if (data.success) {
            renderGoals(data.goals);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading goals</td></tr>';
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to connect</td></tr>';
    }
}

function renderGoals(goals) {
    const tbody = document.getElementById('goal-list-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!goals || goals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-5 bg-transparent" style="background: transparent !important; box-shadow: none;"><i class="bi bi-trophy-fill display-4 d-block mb-3 opacity-50"></i>No goals found. Set a new goal!</td></tr>';
        return;
    }

    goals.forEach(goal => {
        const badgeStatus = goal.Status === 'Achieved' ? 'bg-success' : 'bg-primary';

        let editGoalJson = JSON.stringify(goal).replace(/'/g, "&#39;"); // Escape quotes for onclick

        const row = `
            <tr>
                <td>
                    <strong>${escapeHtml(goal.Title)}</strong><br>
                    <small class="text-muted">${escapeHtml(goal.Description)}</small>
                </td>
                <td>${goal.TargetDate || '-'}</td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${goal.Progress}%" aria-valuenow="${goal.Progress}" aria-valuemin="0" aria-valuemax="100">${goal.Progress}%</div>
                    </div>
                </td>
                <td><span class="badge ${badgeStatus}">${goal.Status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary me-1" title="Edit" onclick='editGoal(${editGoalJson})'><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="deleteGoal(${goal.GoalID})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function resetGoalForm() {
    document.getElementById('goal-form').reset();
    document.getElementById('goal-id').value = '';
    document.getElementById('goalModalLabel').textContent = 'Add New Goal';
}

function editGoal(goal) {
    document.getElementById('goal-id').value = goal.GoalID;
    document.getElementById('goal-title').value = goal.Title;
    document.getElementById('goal-desc').value = goal.Description || '';
    document.getElementById('goal-deadline').value = goal.TargetDate || '';
    document.getElementById('goal-progress').value = goal.Progress || 0;
    document.getElementById('goal-status').value = goal.Status || 'In Progress';
    document.getElementById('goalModalLabel').textContent = 'Edit Goal';

    const modal = new bootstrap.Modal(document.getElementById('goalModal'));
    modal.show();
}

async function saveGoal() {
    const id = document.getElementById('goal-id').value;
    const data = {
        title: document.getElementById('goal-title').value,
        description: document.getElementById('goal-desc').value,
        target_date: document.getElementById('goal-deadline').value,
        progress: document.getElementById('goal-progress').value,
        status: document.getElementById('goal-status').value
    };

    if (!data.title) {
        alert('Title is required');
        return;
    }

    let url = id ? 'goals/update.php' : 'goals/create.php';
    let method = id ? 'PUT' : 'POST';
    if (id) data.goal_id = id;

    const result = await sendRequest(url, method, data);
    if (result.success) {
        const modalEl = document.getElementById('goalModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadGoals();
        loadStats();
    } else {
        alert('Error: ' + result.error);
    }
}

async function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    const result = await sendRequest('goals/delete.php', 'DELETE', { goal_id: id });
    if (result.success) {
        loadGoals();
        loadStats();
    } else {
        alert('Error: ' + result.error);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}