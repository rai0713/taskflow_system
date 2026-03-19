<?php
// Shared layout bottom
// BASE is already defined via app_top.php -> config.php
?>

<button type="button" class="tf-theme-toggle" data-theme-toggle aria-label="Toggle theme" title="Toggle theme" style="position:fixed;right:18px;bottom:18px;z-index:9999;display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border-radius:999px;border:1px solid var(--tf-border-2);background:var(--tf-surface-2);color:var(--tf-text);font-weight:800;font-size:0.92rem;cursor:pointer;opacity:0.8;box-shadow:0 16px 40px rgba(0,0,0,0.35);backdrop-filter:blur(12px);">
    <span class="tf-theme-toggle__icon" data-theme-icon>🌙</span>
    <span class="tf-theme-toggle__label" data-theme-label>Dark</span>
</button>

<script src="<?= BASE ?>/bootstrap/js/jquery-3.7.1.min.js"></script>
<script src="<?= BASE ?>/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="<?= BASE ?>/js/components/toast.js"></script>
<script src="<?= BASE ?>/js/theme.js"></script>
<?php if (!empty($view_js)): ?>
<script src="<?= BASE . htmlspecialchars($view_js) ?>"></script>
<?php endif; ?>
<?php if (!empty($extra_js) && is_array($extra_js)): ?>
<?php foreach($extra_js as $js): ?>
<script src="<?= BASE . htmlspecialchars($js) ?>"></script>
<?php endforeach; ?>
<?php endif; ?>
</body>
</html>
