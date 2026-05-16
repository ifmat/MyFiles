<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// مسیر صحیح فایل‌ها
$baseDir = __DIR__ . '/../../assets/files/';

function scandir_recursive($path, $relativePath = '') {
    $files = [];
    if (!is_dir($path)) return $files;

    $items = scandir($path);
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;

        $fullPath = $path . '/' . $item;
        $relative = $relativePath ? $relativePath . '/' . $item : $item;

        if (is_dir($fullPath)) {
            $files[] = [
                'type' => 'folder',
                'name' => $item,
                'path' => $relative,
                'children' => scandir_recursive($fullPath, $relative)
            ];
        } else {
            $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            $files[] = [
                'type' => 'file',
                'name' => $item,
                'path' => $relative,
                'size' => filesize($fullPath),
                'extension' => $ext,
                'previewable' => in_array($ext, ['jpg','jpeg','png','gif','mp4','webm','pdf','txt'])
            ];
        }
    }
    return $files;
}

if (is_dir($baseDir)) {
    echo json_encode([
        'type' => 'folder',
        'name' => 'files',
        'path' => '',
        'children' => scandir_recursive($baseDir)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Directory not found: ' . $baseDir]);
}
?>