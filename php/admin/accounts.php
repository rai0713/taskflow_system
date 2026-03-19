<?php
require_once '../session_guard.php';
requireLogin();
requireAdmin();
require_once '../connect.php';

$title = 'Account Management - TaskFlow';
$view_css = '/css/admin.css';
$view_js = '/js/admin/accounts.js';
$extra_js = ['/js/script.js'];

require_once '../layouts/app_top.php';
?>

<link rel="stylesheet" href="<?= BASE ?>/css/register.css?v=<?= time() ?>">
<link rel="stylesheet" href="<?= BASE ?>/css/pages/registration.css?v=<?= time() ?>">
<link rel="stylesheet" href="<?= BASE ?>/css/admin_fixes.css?v=<?= time() ?>">

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
                    <div>
                        <?php if (isset($_SESSION['account_id']) && $_SESSION['account_id'] === 0): ?>
                        <button class="btn btn-warning me-2" onclick="openTransferMasterModal()">
                            <i>👑</i> Transfer System Founder
                        </button>
                        <?php endif; ?>
                        <button class="btn btn-primary" onclick="openCreateModal()">
                            <i>+</i> Create New Account
                        </button>
                    </div>
                </div>

                <!-- Tabs for Active vs Pending Accounts -->
                <ul class="nav nav-tabs mb-3" id="accountTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="active-tab" data-bs-toggle="tab" data-bs-target="#active-view" type="button" role="tab" aria-controls="active-view" aria-selected="true" onclick="loadAccounts()">Active / Blocked</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pending-tab" data-bs-toggle="tab" data-bs-target="#pending-view" type="button" role="tab" aria-controls="pending-view" aria-selected="false" onclick="loadPendingAccounts()">Pending Approvals</button>
                    </li>
                </ul>

                <div class="tab-content" id="accountTabsContent">
                    <!-- Tab 1: Active/Blocked -->
                    <div class="tab-pane fade show active" id="active-view" role="tabpanel" aria-labelledby="active-tab">
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

                    <!-- Tab 2: Pending Approvals -->
                    <div class="tab-pane fade" id="pending-view" role="tabpanel" aria-labelledby="pending-tab">
                        <div class="table-responsive">
                            <table class="table table-hover" id="pending-table">
                                <thead>
                                    <tr>
                                        <th>Account Info</th>
                                        <th>Role</th>
                                        <th>ID No.</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="pending-table-body">
                                    <tr><td colspan="5" class="text-center">Loading...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                <form id="account-form" autocomplete="off">
                    <input type="hidden" id="acc-id" name="account_id">
                    
                    <!-- Stepper -->
                    <div class="tf-stepper mb-3" aria-label="Registration progress">
                        <div class="tf-stepper__track" aria-hidden="true"><span class="tf-stepper__bar" id="tf-stepper-bar"></span></div>
                        <div class="tf-stepper__steps" role="list">
                            <button type="button" class="tf-step tf-step--active" data-step="0" aria-current="step">Personal</button>
                            <button type="button" class="tf-step" data-step="1">Address</button>
                            <button type="button" class="tf-step" data-step="2">Account</button>
                            <button type="button" class="tf-step" data-step="3">Security</button>
                        </div>
                    </div>

                    <div class="tf-panels" id="adminAccountPanels">
                        
                        <!-- Step 1: Personal -->
                        <div class="tf-panel is-active" data-step="0">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label for="first-name" class="form-label required">First name</label>
                                    <input type="text" class="form-control" id="first-name" name="first_name" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="middle-name" class="form-label">Middle Name <span style="color: red;">(Optional)</span></label>
                                    <input type="text" class="form-control" id="middle-name" name="middle_initial">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="last-name" class="form-label required">Last name</label>
                                    <input type="text" class="form-control" id="last-name" name="last_name" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="extension-name" class="form-label">Extension Name <span style="color: red;">(Optional)</span></label>
                                    <select class="form-select" id="extension-name" name="ext_name">
                                        <option value="">None</option>
                                        <option value="Jr.">Jr.</option>
                                        <option value="Sr.">Sr.</option>
                                        <option value="III">III</option>
                                    </select>
                                </div>
                                <!-- Required for script.js to bind successfully -->
                                <input type="hidden" id="other-extension">
                                <div id="error-message" style="display:none;"></div>
                                <div id="ordinal-number" style="display:none;"></div>

                                <div class="col-md-4 form-group">
                                    <label for="birthdate" class="form-label required">Birthdate</label>
                                    <input type="date" id="birthdate" class="form-control" name="birthdate" data-required="1">
                                    <div id="birthdate-error" class="form-text"></div>
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4 form-group">
                                    <label for="age" class="form-label required">Age</label>
                                    <input type="text" id="age" class="form-control" name="age" readonly>
                                    <div id="age-error" class="form-text"></div>
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="email-form" class="form-label required">Email</label>
                                    <input type="email" class="form-control" id="email-form" name="email" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="sex" class="form-label required">Sex</label>
                                    <select class="form-select" id="sex" name="sex" data-required="1">
                                        <option selected disabled value="">Choose...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Address -->
                        <div class="tf-panel" data-step="1">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label for="purok-street" class="form-label required">Purok</label>
                                    <input type="text" class="form-control" id="purok-street" name="purok" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <!-- In admin logic purok and barangay are split in UI but merged to purok on POST or something?
                                     Let's keep barangay for script.js to bind -->
                                <div class="col-md-4">
                                    <label for="barangay" class="form-label required">Barangay</label>
                                    <input type="text" class="form-control" id="barangay" name="barangay" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="city-form" class="form-label required">City/Municipality</label>
                                    <input type="text" class="form-control" id="city-form" name="city" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="province" class="form-label required">Province</label>
                                    <input type="text" class="form-control" id="province" name="province" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="country-form" class="form-label required">Country</label>
                                    <input type="text" class="form-control" id="country-form" name="country" value="Philippines" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="zipCode" class="form-label required">Zip Code</label>
                                    <input type="text" class="form-control" id="zipCode" name="zip" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Account -->
                        <div class="tf-panel" data-step="2">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label for="user-name" class="form-label required">Username</label>
                                    <div class="input-group has-validation">
                                        <input type="text" class="form-control" id="user-name" name="username" style="border-radius: 12px;" data-required="1">
                                        <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <label for="password" class="form-label required">Password</label>
                                    <div class="input-group has-validation password-wrapper">
                                        <input type="password" class="form-control" id="password" name="password" data-required="1">
                                        <button type="button" id="togglePassword" class="toggle-password btn btn-outline-secondary" tabindex="-1">👁</button>
                                        <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                    </div>
                                    <!-- Only shown when editing -->
                                    <div class="form-text" id="password-help" style="display:none;">Leave blank to keep current password.</div>
                                    <div class="password-indicator"></div>
                                </div>
                                <div class="col-md-4">
                                    <label for="confirm-password" class="form-label required">Confirm Password</label>
                                    <div class="input-group has-validation password-wrapper">
                                        <input type="password" class="form-control" id="confirm-password" data-required="1">
                                        <button type="button" id="toggleConfirmPassword" class="toggle-password btn btn-outline-secondary" tabindex="-1">👁</button>
                                        <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <label for="id-no" class="form-label required">ID No.</label>
                                    <input type="text" class="form-control" id="id-no" name="id_no" placeholder="Ex. ####-####" data-required="1">
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label required">Role</label>
                                    <select class="form-select" name="role" data-required="1">
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Step 4: Security -->
                        <div class="tf-panel" data-step="3">
                            <div class="alert alert-info py-2">Required for password recovery.</div>
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label for="security-question-1" class="form-label required">Question 1</label>
                                    <select class="form-select security-question" id="security-question-1" name="sq1" data-required="1">
                                        <option value="" selected disabled>Choose a question...</option>
                                        <option value="pet">What is the name of your first pet?</option>
                                        <option value="school">What was the name of your elementary school?</option>
                                        <option value="city">In what city were you born?</option>
                                        <option value="mother_maiden">What is your mother's maiden name?</option>
                                        <option value="bestfriend">What is the name of your childhood best friend?</option>
                                        <option value="favorite_teacher">What is the name of your favorite teacher?</option>
                                    </select>
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-8">
                                    <label for="security-answer-1" class="form-label required">Answer 1</label>
                                    <div class="input-group has-validation password-wrapper">
                                        <input type="password" class="form-control" id="security-answer-1" name="sa1" data-required="1">
                                        <button type="button" class="toggle-password btn btn-outline-secondary" id="toggleSA1" tabindex="-1">👁</button>
                                        <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <label for="security-question-2" class="form-label required">Question 2</label>
                                    <select class="form-select security-question" id="security-question-2" name="sq2" data-required="1">
                                        <option value="" selected disabled>Choose a question...</option>
                                        <option value="pet">What is the name of your first pet?</option>
                                        <option value="school">What was the name of your elementary school?</option>
                                        <option value="city">In what city were you born?</option>
                                        <option value="mother_maiden">What is your mother's maiden name?</option>
                                        <option value="bestfriend">What is the name of your childhood best friend?</option>
                                        <option value="favorite_teacher">What is the name of your favorite teacher?</option>
                                    </select>
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-8">
                                    <label for="security-answer-2" class="form-label required">Answer 2</label>
                                    <div class="input-group has-validation password-wrapper">
                                        <input type="password" class="form-control" id="security-answer-2" name="sa2" data-required="1">
                                        <button type="button" class="toggle-password btn btn-outline-secondary" id="toggleSA2" tabindex="-1">👁</button>
                                        <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <label for="security-question-3" class="form-label required">Question 3</label>
                                    <select class="form-select security-question" id="security-question-3" name="sq3" data-required="1">
                                        <option value="" selected disabled>Choose a question...</option>
                                        <option value="pet">What is the name of your first pet?</option>
                                        <option value="school">What was the name of your elementary school?</option>
                                        <option value="city">In what city were you born?</option>
                                        <option value="mother_maiden">What is your mother's maiden name?</option>
                                        <option value="bestfriend">What is the name of your childhood best friend?</option>
                                        <option value="favorite_teacher">What is the name of your favorite teacher?</option>
                                    </select>
                                    <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                </div>
                                <div class="col-md-8">
                                    <label for="security-answer-3" class="form-label required">Answer 3</label>
                                    <div class="input-group has-validation password-wrapper">
                                        <input type="password" class="form-control" id="security-answer-3" name="sa3" data-required="1">
                                        <button type="button" class="toggle-password btn btn-outline-secondary" id="toggleSA3" tabindex="-1">👁</button>
                                        <div class="valid-feedback"></div><div class="invalid-feedback"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
            <div class="modal-footer d-flex justify-content-between">
                <div>
                    <button type="button" class="btn btn-outline-secondary" id="btn-modal-prev" style="display:none;">Back</button>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="btn-modal-close">Cancel</button>
                    <button type="button" class="btn btn-primary" id="btn-modal-next">Next</button>
                    <button type="button" class="btn btn-success" id="btn-modal-submit" style="display:none;" onclick="saveAccount()">Save Account</button>
                </div>
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

<!-- Transfer Master Superadmin Modal -->
<div class="modal fade" id="transferMasterModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-warning text-dark">
                <h5 class="modal-title"><i>👑</i> Transfer System Founder</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger">
                    <strong>Warning:</strong> This will permanently overwrite the system's hardcoded master credentials. 
                    You will be instantly logged out and your current credentials will NEVER work again.
                </div>
                <form id="transfer-master-form">
                    <div class="mb-3">
                        <label class="form-label required">New Master Username / Email</label>
                        <input type="text" class="form-control" id="new-master-username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">New Master Password</label>
                        <div class="input-group">
                            <input type="password" class="form-control" id="new-master-password" minlength="8" required>
                            <button type="button" class="btn btn-outline-secondary" onclick="toggleTransferPassword('new-master-password')">👁</button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label required">Confirm Master Password</label>
                        <div class="input-group">
                            <input type="password" class="form-control" id="confirm-master-password" minlength="8" required>
                            <button type="button" class="btn btn-outline-secondary" onclick="toggleTransferPassword('confirm-master-password')">👁</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="submitTransferMaster()">Transfer Now</button>
            </div>
        </div>
    </div>
</div>

<script>
    window.userRole = "<?= $_SESSION['role'] ?? 'user' ?>";
</script>

<?php require_once '../layouts/app_bottom.php'; ?>
