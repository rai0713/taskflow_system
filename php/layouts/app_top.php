<?php
// Shared layout top
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/../config.php';

$title = $title ?? 'TaskFlow System';
$view_css = $view_css ?? null;
$view_js  = $view_js  ?? null;
?><!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($title) ?></title>

    <link rel="icon" href="<?= BASE ?>/assets/logo.png">

    <link rel="stylesheet" href="<?= BASE ?>/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?= BASE ?>/css/theme.css">
    <link rel="stylesheet" href="<?= BASE ?>/css/components/toast.css">
    <?php if ($view_css): ?>
        <link rel="stylesheet" href="<?= BASE . htmlspecialchars($view_css) ?>">
    <?php endif; ?>

    <script>window.TFBASE = '<?= BASE ?>';</script>
</head>
<body>
    <div id="app-toast-container" class="tf-toast-container" aria-live="polite" aria-atomic="true"></div>
