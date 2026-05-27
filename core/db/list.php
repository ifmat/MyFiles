<?php
header('Content-Type: application/json');

$baseDir = __DIR__ . '/../../assets/files/';
$path = isset($_GET['path']) ? $_GET['path'] : '';

$fullPath = $baseDir . ($path ? $path . '/' : '');

$result = [];
if (is_dir($fullPath)) {
    $files = scandir($fullPath);
    foreach ($files as $file) {
        if ($file == '.' || $file == '..') continue;
        if ($file == 'list.php' || $file == 'admin.php') continue;

        $fullFilePath = $fullPath . $file;
        $isDir = is_dir($fullFilePath);

        $result[] = [
            'type' => $isDir ? 'folder' : 'file',
            'name' => $file,
            'path' => $path ? $path . '/' . $file : $file,
            'extension' => $isDir ? 'folder' : pathinfo($file, PATHINFO_EXTENSION),
            'previewable' => !$isDir && in_array(pathinfo($file, PATHINFO_EXTENSION), ['jpg','jpeg','png','gif','mp4','webm','mp3','wav','pdf','txt'])
        ];
    }
}

echo json_encode(['children' => $result]);
?>