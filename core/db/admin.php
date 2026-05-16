<?php
session_start();
$adminPass = 'admin123'; // رمز مدیریت رو عوض کن!

if ($_POST['action'] == 'login') {
    if ($_POST['password'] == $adminPass) {
        $_SESSION['admin_logged'] = true;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'رمز اشتباه است']);
    }
    exit;
}

if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$baseDir = DIR . '/../../assets/files/';

if ($_POST['action'] == 'upload') {
    if (isset($_FILES['file'])) {
        $targetDir = $baseDir . ($_POST['folder'] ?? '');
        if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);

        $targetFile = $targetDir . '/' . basename($_FILES['file']['name']);
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
            echo json_encode(['success' => true, 'message' => 'آپلود موفق']);
        } else {
            echo json_encode(['success' => false, 'error' => 'خطا در آپلود']);
        }
    }
    exit;
}

if ($_POST['action'] == 'create_folder') {
    $folderName = preg_replace('/[^a-zA-Z0-9_\-\p{Persian}]/u', '', $_POST['name']);
    $newFolder = $baseDir . ($_POST['path'] ? $_POST['path'] . '/' : '') . $folderName;
    if (mkdir($newFolder, 0777, true)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'خطا در ساخت پوشه']);
    }
    exit;
}
?>