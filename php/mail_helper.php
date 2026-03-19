<?php
/**
 * mail_helper.php
 * Sends OTP emails via PHPMailer + Gmail SMTP.
 *
 * ── CONFIGURATION ──────────────────────────────────────────────────────────
 * Fill in GMAIL_USER and GMAIL_APP_PASSWORD below.
 *
 * To get a Gmail App Password:
 *   1. myaccount.google.com → Security → 2-Step Verification (must be ON)
 *   2. Search "App Passwords" → create one (Mail / Windows)
 *   3. Copy the 16-character code and paste it as GMAIL_APP_PASSWORD
 * ──────────────────────────────────────────────────────────────────────────
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ── Brevo SMTP credentials ────────────────────────────────────────────────
define('SMTP_HOST',     'smtp-relay.brevo.com');
define('SMTP_PORT',     587);
define('SMTP_USER',     'a2c222001@smtp-brevo.com');
define('SMTP_PASS',     'xsmtpsib-ad1c7283ebe07087dc9b011d12ed0dee78510554d49f6bbde215afc0ab75b9db-HK1Erj5bwM1Z1OTp');
define('MAIL_FROM',     'hikari.netto07@gmail.com'); // verified Brevo sender
define('MAIL_FROM_NAME','TaskFlow');
// ─────────────────────────────────────────────────────────────────────────

function send_otp_email(string $to, string $otp): bool {

    // Always log OTP for local reference
    $logFile = __DIR__ . '/otp_debug.log';
    $entry   = date('Y-m-d H:i:s') . " | To: {$to} | OTP: {$otp}\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);

    $subject = 'TaskFlow - Password Reset OTP';
    $body    = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#111827;border-radius:16px;">
          <tr>
            <td style="background-color:#c9a227;padding:18px 32px;border-radius:16px 16px 0 0;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#111827;">TaskFlow</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Password Reset OTP</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Use the code below to reset your password. It expires in <strong style="color:#ffffff;">5 minutes</strong>.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#1f2937;border-radius:12px;padding:16px 20px;border:2px solid #c9a227;">
                          <p style="margin:0;font-size:30px;font-weight:900;letter-spacing:8px;color:#c9a227;text-align:center;">' . $otp . '</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-size:13px;color:#6b7280;text-align:center;">If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0b0f14;padding:14px 32px;border-radius:0 0 16px 16px;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">© 2024 TaskFlow System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    try {
        $mail = new PHPMailer(true);

        // Server settings
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->Timeout    = 15;

        // Recipients
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = "Your TaskFlow OTP code is: {$otp}\n\nThis code expires in 5 minutes.";

        $mail->send();

        // Log success
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | SENT OK to {$to}\n", FILE_APPEND | LOCK_EX);
        return true;
    } catch (Exception $e) {
        // Log the actual error so we can debug it
        $errMsg = $e->getMessage();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | MAIL ERROR: {$errMsg}\n", FILE_APPEND | LOCK_EX);
        error_log('PHPMailer error: ' . $errMsg);
        return false;
    }
}

function send_registration_pending_email(string $to, string $name): bool {
    $logFile = __DIR__ . '/otp_debug.log';
    $entry   = date('Y-m-d H:i:s') . " | To: {$to} | REGISTRATION PENDING EMAIL\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);

    $subject = 'TaskFlow - Registration Pending Approval';
    $body    = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#111827;border-radius:16px;">
          <tr>
            <td style="background-color:#c9a227;padding:18px 32px;border-radius:16px 16px 0 0;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#111827;">TaskFlow</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Registration Received</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Hello <strong style="color:#ffffff;">' . htmlspecialchars($name) . '</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Your registration was successful. However, your account is currently <strong style="color:#c9a227;">pending approval</strong> by a System Administrator.</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">You will not be able to log in until your account is approved. You will receive another email once your account is activated.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="#" style="background-color:#c9a227;color:#111827;padding:12px 24px;text-decoration:none;font-weight:700;border-radius:8px;">Thank you for your patience</a>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-size:13px;color:#6b7280;text-align:center;">If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0b0f14;padding:14px 32px;border-radius:0 0 16px 16px;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">© 2024 TaskFlow System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    try {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->Timeout    = 15;

        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = "Hello {$name},\n\nYour registration was successful, but your account is pending approval by the Administrator. You cannot log in yet.\n\nThank you.";

        $mail->send();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | SENT OK to {$to}\n", FILE_APPEND | LOCK_EX);
        return true;
    } catch (Exception $e) {
        $errMsg = $e->getMessage();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | MAIL ERROR: {$errMsg}\n", FILE_APPEND | LOCK_EX);
        error_log('PHPMailer error: ' . $errMsg);
        return false;
    }
}

function send_registration_rejected_email(string $to, string $name): bool {
    $logFile = __DIR__ . '/otp_debug.log';
    $entry   = date('Y-m-d H:i:s') . " | To: {$to} | REGISTRATION REJECTED EMAIL\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);

    $subject = 'TaskFlow - Registration Application Rejected';
    $body    = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#111827;border-radius:16px;">
          <tr>
            <td style="background-color:#dc3545;padding:18px 32px;border-radius:16px 16px 0 0;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;">TaskFlow</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Application Updated</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Hello <strong style="color:#ffffff;">' . htmlspecialchars($name) . '</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Thank you for your interest in the TaskFlow system. After reviewing your account registration request, a System Administrator has <strong style="color:#dc3545;">declined</strong> your application.</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">As a result, your account has been placed into a <strong>Blocked</strong> status. You will not be able to log in to the TaskFlow dashboard.</p>
              <p style="margin:8px 0 0;font-size:13px;color:#6b7280;text-align:center;">Thank you for understanding.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0b0f14;padding:14px 32px;border-radius:0 0 16px 16px;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">© 2024 TaskFlow System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    try {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->Timeout    = 15;

        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = "Hello {$name},\n\nYour recent registration request to TaskFlow has been declined by an Administrator. Your account is now blocked and you will not be able to log in.\n\nThank you.";

        $mail->send();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | SENT OK to {$to}\n", FILE_APPEND | LOCK_EX);
        return true;
    } catch (Exception $e) {
        $errMsg = $e->getMessage();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | MAIL ERROR: {$errMsg}\n", FILE_APPEND | LOCK_EX);
        error_log('PHPMailer error: ' . $errMsg);
        return false;
    }
}

function send_registration_approved_email(string $to, string $name): bool {
    $logFile = __DIR__ . '/otp_debug.log';
    $entry   = date('Y-m-d H:i:s') . " | To: {$to} | REGISTRATION APPROVED EMAIL\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);

    $subject = 'TaskFlow - Account Approved!';
    $body    = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#111827;border-radius:16px;">
          <tr>
            <td style="background-color:#198754;padding:18px 32px;border-radius:16px 16px 0 0;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;">TaskFlow</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Application Approved</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Hello <strong style="color:#ffffff;">' . htmlspecialchars($name) . '</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">Great news! A System Administrator has <strong style="color:#198754;">approved</strong> your registration application. Your account is now fully active.</p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">You may now log into the TaskFlow dashboard using the credentials you created during registration.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="http://localhost/taskflow_system/html/index.html" style="background-color:#198754;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:700;border-radius:8px;">Sign In Now</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0b0f14;padding:14px 32px;border-radius:0 0 16px 16px;">
              <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;">© 2024 TaskFlow System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

    try {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->Timeout    = 15;

        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = "Hello {$name},\n\nGreat news! A System Administrator has approved your registration application. You may now log in.\n\nThank you.";

        $mail->send();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | SENT OK to {$to}\n", FILE_APPEND | LOCK_EX);
        return true;
    } catch (Exception $e) {
        $errMsg = $e->getMessage();
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | MAIL ERROR: {$errMsg}\n", FILE_APPEND | LOCK_EX);
        error_log('PHPMailer error: ' . $errMsg);
        return false;
    }
}

