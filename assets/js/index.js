    // کل کد جاوااسکریپت
    const container = document.getElementById("file-container");
    const breadcrumbDiv = document.getElementById("breadcrumb");
    let currentPath = '';
    let currentPathParts = [];

    function getFileIcon(fileName, extension, isFolder) {
    if (isFolder) return '📁';
    const icons = {
    'pdf': '📕', 'doc': '📘', 'docx': '📘', 'xls': '📗', 'xlsx': '📗',
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🎞️',
    'mp4': '🎬', 'mkv': '🎬', 'webm': '🎬',
    'mp3': '🎵', 'wav': '🎵',
    'txt': '📄', 'zip': '🗜️', 'rar': '🗜️'
};
    return icons[extension] || '📄';
}

    function formatSize(bytes) {
    if (!bytes || bytes === 0) return 'نامشخص';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

    function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
});
}

    function updateBreadcrumb() {
    if (!breadcrumbDiv) return;
    let html = '📍 مسیر: ';
    if (currentPathParts.length === 0) {
    html += '<span onclick="goToRoot()">ریشه</span>';
} else {
    html += '<span onclick="goToRoot()">ریشه</span>';
    let fullPath = '';
    for (let i = 0; i < currentPathParts.length; i++) {
    fullPath += (fullPath ? '/' : '') + currentPathParts[i];
    html += ' / <span onclick="goToPath(\'' + fullPath + '\')">' + escapeHtml(currentPathParts[i]) + '</span>';
}
}
    breadcrumbDiv.innerHTML = html;
}

    window.goToRoot = function() {
    loadFiles('');
};

    window.goToPath = function(path) {
    loadFiles(path);
};

    function previewFile(file) {
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewContent');
    const ext = file.extension;
    const url = 'core/db/download.php?file=' + encodeURIComponent(file.path);

    if (!modal || !content) return;

    if (['jpg','jpeg','png','gif'].includes(ext)) {
    content.innerHTML = '<img src="' + url + '" style="max-width:100%; border-radius:10px;">';
} else if (['mp4','webm'].includes(ext)) {
    content.innerHTML = '<video controls autoplay style="width:100%"><source src="' + url + '"></video>';
} else if (['mp3','wav'].includes(ext)) {
    content.innerHTML = '<audio controls style="width:100%"><source src="' + url + '"></audio>';
} else if (ext === 'pdf') {
    content.innerHTML = '<iframe src="' + url + '" style="width:100%; height:500px;"></iframe>';
} else {
    content.innerHTML = '<p>پیش‌نمایش این فایل ممکن نیست. <a href="' + url + '" download>دانلود فایل</a></p>';
}
    modal.classList.add('active');
}

    function renderFiles(filesArray) {
    if (!filesArray || filesArray.length === 0) {
    container.innerHTML = '<div class="empty-message">📭 پوشه خالی است</div>';
    return;
}

    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'file-grid';

    const filteredFiles = filesArray.filter(item => {
    return !['list.php', 'download.php', 'admin.php', 'password.php'].includes(item.name);
});

    if (filteredFiles.length === 0) {
    container.innerHTML = '<div class="empty-message">📭 پوشه خالی است</div>';
    return;
}

    filteredFiles.forEach(item => {
    const card = document.createElement("div");
    card.className = "file-card";
    const isFolder = (item.type === "folder");
    const icon = getFileIcon(item.name, isFolder ? 'folder' : item.extension, isFolder);
    const itemPath = item.path || item.name;

    let actionButtons = '';
    if (isFolder) {
    actionButtons = '<button class="open-folder-btn" data-path="' + itemPath + '">📂 باز کردن</button>';
} else {
    let previewBtn = '';
    if (item.previewable) {
    previewBtn = '<button class="preview-btn" data-path="' + itemPath + '" data-ext="' + (item.extension || '') + '">👁️ پیش‌نمایش</button>';
}
    actionButtons = '<button class="download-btn" data-path="' + itemPath + '">⬇️ دانلود</button> ' + previewBtn;
}

    card.innerHTML =
    `<div class="file-icon">${icon}</div>
            <div class="file-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            ${!isFolder && item.size ? '<div class="file-meta">📏 ' + formatSize(item.size) + '</div>' : ''}
            <div class="file-actions">${actionButtons}</div>`
    ;

    grid.appendChild(card);
});

    container.appendChild(grid);

    // اتصال رویدادها
    document.querySelectorAll('.download-btn').forEach(btn => {
    btn.onclick = function(e) {
    e.stopPropagation();
    const path = this.getAttribute('data-path');
    if (path) {
    window.location.href = 'core/db/download.php?file=' + encodeURIComponent(path);
}
    return false;
};
});

    document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.onclick = function(e) {
    e.stopPropagation();
    const path = this.getAttribute('data-path');
    const ext = this.getAttribute('data-ext');
    if (path) {
    previewFile({path: path, extension: ext});
}
    return false;
};
});

    document.querySelectorAll('.open-folder-btn').forEach(btn => {
    btn.onclick = function(e) {
    e.stopPropagation();
    const path = this.getAttribute('data-path');
    if (path) {
    loadFiles(path);
}
    return false;
};
});
}

    function loadFiles(subPath = '') {
    currentPath = subPath;

    // به‌روزرسانی breadcrumb
    if (subPath && subPath !== '') {
    currentPathParts = subPath.split('/').filter(p => p);
} else {
    currentPathParts = [];
}
    updateBreadcrumb();

    container.innerHTML = '<div class="loading">🌀 بارگذاری فایل‌ها...</div>';

    let url = 'core/db/list.php';
    if (subPath && subPath !== '') {
    url += '?path=' + encodeURIComponent(subPath);
}

    fetch(url)
    .then(res => res.json())
    .then(data => {
    if (data.error) {
    container.innerHTML = '<div class="error-message">❌ ' + data.error + '</div>';
    return;
}

    if (data.children && data.children.length > 0) {
    renderFiles(data.children);
} else {
    container.innerHTML = '<div class="empty-message">📂 این پوشه خالی است</div>';
}
})
    .catch(err => {
    console.error('Error:', err);
    container.innerHTML = '<div class="error-message">❌ خطا در بارگذاری: ' + err.message + '</div>';
});
}

    // پنل مدیریت
    document.getElementById('adminBtn').onclick = () => {
    document.getElementById('adminModal').classList.add('active');
};

    document.getElementById('closeAdminModal').onclick = () => {
    document.getElementById('adminModal').classList.remove('active');
};

    document.getElementById('closePreviewBtn').onclick = () => {
    document.getElementById('previewModal').classList.remove('active');
};

    document.getElementById('loginAdminBtn').onclick = () => {
    const pass = document.getElementById('adminPassword').value;
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.innerHTML = 'در حال بررسی...';

    fetch('core/db/admin.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'action=login&password=' + encodeURIComponent(pass)
})
    .then(res => res.json())
    .then(data => {
    if (data.success) {
    document.getElementById('adminPanel').style.display = 'block';
    statusDiv.innerHTML = '✅ ورود موفق!';
} else {
    statusDiv.innerHTML = '❌ رمز اشتباه است';
}
})
    .catch(err => {
    statusDiv.innerHTML = '❌ خطا: ' + err.message;
});
};

    document.getElementById('uploadBtn').onclick = () => {
    const fileInput = document.getElementById('uploadFile');
    const statusDiv = document.getElementById('uploadStatus');

    if (!fileInput.files[0]) {
    statusDiv.innerHTML = '❌ لطفاً فایل را انتخاب کنید';
    return;
}

    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('file', fileInput.files[0]);
    if (currentPath) {
    formData.append('folder', currentPath);
}

    statusDiv.innerHTML = 'در حال آپلود...';

    fetch('core/db/admin.php', {
    method: 'POST',
    body: formData
})
    .then(res => res.json())
    .then(data => {
    if (data.success) {
    statusDiv.innerHTML = '✅ آپلود موفق!';
    setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
    loadFiles(currentPath);
    fileInput.value = '';
} else {
    statusDiv.innerHTML = '❌ خطا: ' + (data.error || 'نامشخص');
}
})
    .catch(err => {
    statusDiv.innerHTML = '❌ خطا: ' + err.message;
});
};

    document.getElementById('createFolderBtn').onclick = () => {
    const name = document.getElementById('folderName').value;
    const statusDiv = document.getElementById('folderStatus');

    if (!name) {
    statusDiv.innerHTML = '❌ لطفاً نام پوشه را وارد کنید';
    return;
}

    statusDiv.innerHTML = 'در حال ساخت...';

    fetch('core/db/admin.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'action=create_folder&name=' + encodeURIComponent(name) + '&path=' + encodeURIComponent(currentPath || '')
})
    .then(res => res.json())
    .then(data => {
    if (data.success) {
    statusDiv.innerHTML = '✅ پوشه ساخته شد!';
    setTimeout(() => { statusDiv.innerHTML = ''; }, 3000);
    document.getElementById('folderName').value = '';
    loadFiles(currentPath);
} else {
    statusDiv.innerHTML = '❌ خطا: ' + (data.error || 'نامشخص');
}
})
    .catch(err => {
    statusDiv.innerHTML = '❌ خطا: ' + err.message;
});
};

    document.getElementById('refreshBtn').onclick = () => {
    loadFiles(currentPath);
};

    window.onclick = (e) => {
    const adminModal = document.getElementById('adminModal');
    const previewModal = document.getElementById('previewModal');
    if (e.target === adminModal) adminModal.classList.remove('active');
    if (e.target === previewModal) previewModal.classList.remove('active');
};

    // شروع برنامه
    loadFiles('');
