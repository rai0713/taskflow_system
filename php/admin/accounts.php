<?php
require_once '../session_guard.php';
requireLogin();
requireSuperAdmin();
require_once '../connect.php';

$title = 'Account Management - TaskFlow';
$view_css = '/css/admin.css';
$view_js = '/js/admin/accounts.js';

require_once '../layouts/app_top.php';
?>

<div class="admin-layout">
    <?php include 'components/sidebar.php'; ?>

    <main class="admin-main">
        <div class="page-header">
            <h1 class="page-title">Account Management</h1>
            <p class="text-muted">Manage user accounts, roles, and privileges.</p>
        </div>

        <div class="card table-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="card-title mb-0">Registered Accounts</h5>
                    <button class="btn btn-primary" onclick="openCreateModal()">
                        <i>+</i> Create New Account
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover" id="accounts-table">
                        <thead>
                            <tr>
                                <th>Account Info</th>
                                <th>Role</th>
                                <th>ID No.</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="accounts-table-body">
                            <tr><td colspan="5" class="text-center">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Create/Edit Account Modal -->
<div class="modal fade" id="accountModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="accountModalLabel">Create Account</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="account-form">
                    <input type="hidden" id="acc-id" name="account_id">
                    
                    <!-- Tabs for cleaner UI -->
                    <ul class="nav nav-tabs mb-3" id="accountTabs" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" id="personal-tab" data-bs-toggle="tab" data-bs-target="#personal" type="button" role="tab">Personal</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="address-tab" data-bs-toggle="tab" data-bs-target="#address" type="button" role="tab">Address</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" type="button" role="tab">Account</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="security-tab" data-bs-toggle="tab" data-bs-target="#security" type="button" role="tab">Security Details</button>
                        </li>
                    </ul>

                    <div class="tab-content" id="accountTabsContent">
                        <!-- Personal Info -->
                        <div class="tab-pane fade show active" id="personal" role="tabpanel">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label class="form-label">First Name</label>
                                    <input type="text" class="form-control" name="first_name" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Middle Initial</label>
                                    <input type="text" class="form-control" name="middle_initial" maxlength="2">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" class="form-control" name="last_name" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Extension Name</label>
                                    <select class="form-select" name="ext_name">
                                        <option value="">None</option>
                                        <option value="Jr.">Jr.</option>
                                        <option value="Sr.">Sr.</option>
                                        <option value="III">III</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Sex</label>
                                    <select class="form-select" name="sex" required>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Date of Birth</label>
                                    <input type="date" class="form-control" name="birthdate" required>
                                </div>
                            </div>
                        </div>

                        <!-- Address -->
                        <div class="tab-pane fade" id="address" role="tabpanel">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Purok</label>
                                    <input type="text" class="form-control" name="purok" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Barangay</label>
                                    <input type="text" class="form-control" name="barangay" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">City/Municipality</label>
                                    <input type="text" class="form-control" name="city" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Province</label>
                                    <input type="text" class="form-control" name="province" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Country</label>
                                    <input type="text" class="form-control" name="country" value="Philippines" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Zip Code</label>
                                    <input type="number" class="form-control" name="zip" required>
                                </div>
                            </div>
                        </div>

                        <!-- Account -->
                        <div class="tab-pane fade" id="account" role="tabpanel">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" name="username" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Role</label>
                                    <select class="form-select" name="role" required>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">ID No.</label>
                                    <input type="text" class="form-control" name="id_no" placeholder="####-####" required pattern="\d{4}-\d{4}">
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" minlength="8">
                                    <div class="form-text">Leave blank to keep current password (editing only). Required for new accounts.</div>
                                </div>
                            </div>
                        </div>

                        <!-- Security Questions -->
                        <div class="tab-pane fade" id="security" role="tabpanel">
                            <div class="alert alert-info py-2">Required for password recovery.</div>
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label">Question 1</label>
                                    <select class="form-select mb-2" name="sq1" required>
                                        <option value="">Select...</option>
                                        <option value="pet">What is the name of your first pet?</option>
                                        <option value="school">What elementary school did you attend?</option>
                                        <option value="city">In what city were you born?</option>
                                    </select>
                                    <input type="text" class="form-control" name="sa1" placeholder="Answer 1" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Question 2</label>
                                    <select class="form-select mb-2" name="sq2" required>
                                        <option value="">Select...</option>
                                        <option value="mother">What is your mother's maiden name?</option>
                                        <option value="street">What is the name of the street you grew up on?</option>
                                        <option value="book">What is your favorite book?</option>
                                    </select>
                                    <input type="text" class="form-control" name="sa2" placeholder="Answer 2" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Question 3</label>
                                    <select class="form-select mb-2" name="sq3" required>
                                        <option value="">Select...</option>
                                        <option value="car">What was the make of your first car?</option>
                                        <option value="food">What is your favorite food?</option>
                                        <option value="movie">What is your favorite movie?</option>
                                    </select>
                                    <input type="text" class="form-control" name="sa3" placeholder="Answer 3" required>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="saveAccount()">Save Account</button>
            </div>
        </div>
    </div>
</div>

<!-- View User Modal -->
<div class="modal fade" id="viewUserModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">User Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="view-user-body">
                <div class="text-center py-4">Loading...</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<!-- Basis Modal -->
<div class="modal fade" id="basisModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Action Basis Required</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="basis-form">
                    <input type="hidden" id="basis-target-id" name="target_id">
                    <input type="hidden" id="basis-action" name="action">
                    <div class="alert alert-warning">This action requires a formal basis.</div>
                    <div class="mb-3">
                        <label class="form-label required">Court Number / Reference</label>
                        <input type="text" class="form-control" name="court_number" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Reason</label>
                        <textarea class="form-control" name="reason" rows="3" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Attachment (PDF/Image)</label>
                        <input type="file" class="form-control" name="attachment" accept=".pdf,image/*" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="submitBasisAction()">Confirm Action</button>
            </div>
        </div>
    </div>
</div>

<script>
    window.userRole = "<?= $_SESSION['role'] ?? 'user' ?>";
</script>

<?php require_once '../layouts/app_bottom.php'; ?>
