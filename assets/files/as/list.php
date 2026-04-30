<?php
header('Content-Type: application/json');

// مسیر دایرکتوری فایل‌ها
$dir = __DIR__ . '../../../assets/files'; // این مسیر رو دقیق تنظیم کن

// تابع بازگشتی برای خواندن دایرکتوری
function scandir_recursive($path) {
    $files = [];
    $items = scandir($path);

    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;

        $item_path = $path . '/' . $item;

        if (is_dir($item_path)) {
            $files[] = [
                'type' => 'folder',
                'name' => $item,
                'children' => scandir_recursive($item_path)
            ];
        } else {
            $files[] = [
                'type' => 'file',
                'name' => $item,
                // اینجا می‌تونی مسیر کامل فایل رو هم اضافه کنی اگر لازم بود
                // 'url' => str_replace($_SERVER['DOCUMENT_ROOT'], '', $item_path)
            ];
        }
    }
    return $files;
}

// اگر دایرکتوری وجود داشت، محتویاتش رو برگردون
if (is_dir($dir)) {
    echo json_encode([
        'type' => 'folder',
        'name' => 'root',
        'children' => scandir_recursive($dir)
    ]);
} else {
    // اگر دایرکتوری نبود، پیغام خطا
    http_response_code(500);
    echo json_encode(['error' => 'Directory not found or is not accessible.']);
}
?>
