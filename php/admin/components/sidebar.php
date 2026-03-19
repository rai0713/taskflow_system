<?php
// BASE is available via session_guard -> config.php path, or include directly
if (!defined('BASE')) {
    require_once __DIR__ . '/../config.php';
}

$current_page = basename($_SERVER['PHP_SELF']);
$role = $_SESSION['role'] ?? 'user';
?>
<aside class="admin-sidebar">
    <div class="admin-sidebar-header">
        <a href="<?= BASE ?>/php/admin/dashboard.php" class="admin-logo">Task<span>Flow</span></a>
    </div>

    <nav class="admin-nav">
        <a href="<?= BASE ?>/php/admin/dashboard.php" class="nav-link <?= $current_page == 'dashboard.php' ? 'active' : '' ?>">
            <i>📊</i> Dashboard
        </a>
        <?php if ($role === 'super_admin'): ?>
        <a href="<?= BASE ?>/php/admin/logs.php" class="nav-link <?= in_array($current_page, ['logs.php', 'activity_logs.php']) ? 'active' : '' ?>">
            <i>📜</i> Logs
        </a>
        <?php endif; ?>

        <?php if ($role === 'super_admin' || $role === 'admin'): ?>
        <a href="<?= BASE ?>/php/admin/accounts.php" class="nav-link <?= $current_page == 'accounts.php' ? 'active' : '' ?>">
            <i>👥</i> Account Management
        </a>
        <?php endif; ?>
    </nav>

    <div class="admin-user-profile">    
        <div class="user-avatar">
            <?= strtoupper(substr($_SESSION['username'] ?? 'U', 0, 1)) ?>
        </div>
        <div class="user-info">
            <div class="user-name"><?= htmlspecialchars($_SESSION['username'] ?? 'User') ?></div>
            <div class="user-role"><?= str_replace('_', ' ', htmlspecialchars($role)) ?></div>
        </div>
        <form action="<?= BASE ?>/php/logout.php" method="POST" style="margin:0; width: 100%;">
            <button type="submit" class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2" title="Logout">
                🚪 Logout
            </button>
        </form>
    </div>
</aside>
