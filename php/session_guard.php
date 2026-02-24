<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// Load config for BASE constant
if (!defined('BASE')) {
    require_once __DIR__ . '/config.php';
}

/**
 * Require user to be logged in. 
 */
function requireLogin() {
    if (!isset($_SESSION['account_id'])) {
        if (isAjaxRequest()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        } else {
            header("Location: " . BASE . "/html/index.html");
            exit;
        }
    }
}

/**
 * Require 'admin' or 'super_admin' role.
 */
function requireAdmin() {
    requireLogin();
    $role = $_SESSION['role'] ?? '';
    if (!in_array($role, ['admin', 'super_admin'])) {
        if (isAjaxRequest()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Forbidden']);
            exit;
        } else {
            header("Location: " . BASE . "/html/home.html");
            exit;
        }
    }
}

/**
 * Require 'super_admin' role.
 */
function requireSuperAdmin() {
    requireLogin();
    if (($_SESSION['role'] ?? '') !== 'super_admin') {
        if (isAjaxRequest()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Forbidden: Super Admin only']);
            exit;
        } else {
            header("Location: " . BASE . "/php/admin/dashboard.php");
            exit;
        }
    }
}

function isAjaxRequest() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}
?>
