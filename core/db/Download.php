<?php
$baseDir = __DIR__ . '../../../assets/files/';

$passwords = include('password.php');

$file = $_GET['file'] ?? '';
$inputPassword = $_POST['password'] ?? '';

if (!$file) {
    die("File not specified.");
}

$filePath = realpath($baseDir . $file);

// جلوگیری از دسترسی خارج از پوشه
if (!$filePath || strpos($filePath, realpath($baseDir)) !== 0) {
    die("Access denied.");
}

if (!file_exists($filePath)) {
    die("File not found.");
}

// اگر برای فایل رمز تعریف شده
if (isset($passwords[$file])) {

    // اگر هنوز رمز وارد نشده
    if (!$inputPassword) {
        ?>

        <!DOCTYPE html>
        <html lang="fa">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Explorer | My Subdomain</title>
            <link rel="stylesheet" href="../../assets/css/style.css">
        </head>
        <body>
        <div class="navbar">
            <h1>📁 File Explorer</h1>
        </div>
        <form method="POST">
            <h3>🔒 این فایل رمز دارد</h3>
            <input type="password" name="password" placeholder="رمز را وارد کنید">
            <button type="submit">ورود</button>
        </form>

        </body>
        </html>

        <?php
        exit;
    }

    // بررسی رمز
    if ($inputPassword !== $passwords[$file]) {
        die("❌ رمز اشتباه است.");
    }
}

// ارسال فایل
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;
