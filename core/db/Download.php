<?php
$baseDir = __DIR__ . '/../../assets/files/';
$passwords = include('password.php');

$file = $_GET['file'] ?? '';
$inputPassword = $_POST['password'] ?? '';

if (!$file) {
    die("File not specified.");
}

// مسیر کامل فایل
$filePath = realpath($baseDir . $file);

// جلوگیری از Path Traversal
if (!$filePath || strpos($filePath, realpath($baseDir)) !== 0) {
    die("Access denied.");
}

if (!file_exists($filePath)) {
    die("File not found.");
}

// بررسی رمز برای فایل‌های خاص
$relativeForPass = str_replace(realpath($baseDir) . '/', '', $filePath);
if (isset($passwords[$relativeForPass])) {
    if (!$inputPassword) {
        echo '<form method="POST"><input type="password" name="password" placeholder="رمز"><button type="submit">ورود</button></form>';
        exit;
    }
    if ($inputPassword !== $passwords[$relativeForPass]) {
        die("❌ رمز اشتباه است.");
    }
}

// ارسال فایل برای دانلود
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;
?>