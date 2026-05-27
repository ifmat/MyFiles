<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$adminPass = 'admin123'; // رمز رو عوض کن!

$baseDir = __DIR__ . '/../../assets/files/';

// لاگین
if ($_POST['action'] == 'login') {
    if ($_POST['password'] == $adminPass) {
        $_SESSION['admin_logged'] = true;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'رمز اشتباه است']);
    }
    exit;
}

// بررسی احراز هویت برای بقیه عملیات‌ها
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized', 'success' => false]);
    exit;
}

// آپلود فایل
if ($_POST['action'] == 'upload') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'error' => 'فایلی ارسال نشده یا خطا در آپلود']);
        exit;
    }

    $uploadFolder = $baseDir;
    if (isset($_POST['folder']) && $_POST['folder']) {
        $uploadFolder .= trim($_POST['folder'], '/') . '/';
    }

    // ایجاد پوشه اگر وجود نداشت
    if (!is_dir($uploadFolder)) {
        mkdir($uploadFolder, 0777, true);
    }

    $fileName = basename($_FILES['file']['name']);
    $targetFile = $uploadFolder . $fileName;

    // جلوگیری از overwrite
    $counter = 1;
    $pathinfo = pathinfo($targetFile);
    while (file_exists($targetFile)) {
        $targetFile = $pathinfo['dirname'] . '/' . $pathinfo['filename'] . '_' . $counter . '.' . $pathinfo['extension'];
        $counter++;
    }

    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        echo json_encode(['success' => true, 'message' => 'فایل آپلود شد']);
    } else {
        echo json_encode(['success' => false, 'error' => 'خطا در ذخیره فایل']);
    }
    exit;
}

// ساخت پوشه
if ($_POST['action'] == 'create_folder') {
    $folderName = trim($_POST['name'] ?? '');
    if (empty($folderName)) {
        echo json_encode(['success' => false, 'error' => 'نام پوشه نمی‌تواند خالی باشد']);
        exit;
    }

    // حذف کاراکترهای خطرناک
    $folderName = preg_replace('/[\/\\\\:*?"<>|]/', '', $folderName);

    $targetPath = $baseDir;
    if (isset($_POST['path']) && $_POST['path']) {
        $targetPath .= trim($_POST['path'], '/') . '/';
    }
    $targetPath .= $folderName;

    if (!is_dir($targetPath)) {
        if (mkdir($targetPath, 0777, true)) {
            echo json_encode(['success' => true, 'message' => 'پوشه ساخته شد']);
        } else {
            echo json_encode(['success' => false, 'error' => 'خطا در ساخت پوشه - بررسی دسترسی']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'پوشه قبلاً وجود دارد']);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'action نامعتبر']);
?>