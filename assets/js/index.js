const container = document.getElementById("file-container");
let currentPath = '';

function getFileIcon(fileName, extension) {
    const icons = {
        'pdf': '📕', 'doc': '📘', 'docx': '📘', 'xls': '📗', 'xlsx': '📗',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🎞️',
        'mp4': '🎬', 'mkv': '🎬', 'webm': '🎬',
        'mp3': '🎵', 'wav': '🎵',
        'txt': '📄', 'zip': '🗜️', 'rar': '🗜️',
        'folder': '📁'
    };
    if (extension === 'folder') return '📁';
    return icons[extension] || '📄';
}

function formatSize(bytes) {
    if (!bytes) return 'نامشخص';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function previewFile(file) {
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewContent');
    const ext = file.extension;
    const url = `core/db/download.php?file=${encodeURIComponent(file.path)}`;

    if (['jpg','jpeg','png','gif'].includes(ext)) {
        content.innerHTML = `<img src="${url}" style="max-width:100%; border-radius:10px;">`;
    } else if (['mp4','webm'].includes(ext)) {
        content.innerHTML = `<video controls autoplay style="width:100%"><source src="${url}"></video>`;
    } else if (['mp3','wav'].includes(ext)) {
        content.innerHTML = `<audio controls style="width:100%"><source src="${url}"></audio>`;
    } else if (ext === 'pdf') {
        content.innerHTML = `<iframe src="${url}" style="width:100%; height:500px;"></iframe>`;
    } else {
        content.innerHTML = `<p>پیش‌نمایش این فایل ممکن نیست. <a href="${url}" download>دانلود فایل</a></p>`;
    }
    modal.classList.add('active');
}

function renderTree(node, parentElement, currentPath = '') {
    if (node.type === "folder" && node.children) {
        node.children.forEach(item => {
            const card = document.createElement("div");
            card.className = "file-card";
            const icon = getFileIcon(item.name, item.type === 'folder' ? 'folder' : item.extension);
            const itemPath = item.path;

            card.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${escapeHtml(item.name)}</div>
                ${item.type === 'file' ? `<div class="file-meta">📏 ${formatSize(item.size)}</div>` : ''}
                <div class="file-actions">
                    ${item.type === 'file' ? `
                        <button class="download-btn" data-path="${itemPath}">⬇️ دانلود</button>
                        ${item.previewable ? `<button class="preview-btn" data-path="${itemPath}" data-ext="${item.extension}">👁️ پیش‌نمایش</button>` : ''}
                    ` : `
                        <button class="open-folder" data-path="${itemPath}">📂 باز کردن</button>
                    `}
                </div>
            `;

            parentElement.appendChild(card);
        });
    }
}

function loadFiles() {
    container.innerHTML = '<div class="loading">🌀 بارگذاری فایل‌ها...</div>';

    fetch('core/db/list.php')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'file-grid';

            if (data.error) {
                container.innerHTML = `<div class="error">${data.error}</div>`;
                return;
            }

            renderTree(data, grid, '');
            container.appendChild(grid);

            // افزودن رویداد به دکمه‌ها
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const path = btn.dataset.path;
                    window.location.href = `core/db/download.php?file=${encodeURIComponent(path)}`;
                });
            });

            document.querySelectorAll('.preview-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const path = btn.dataset.path;
                    const ext = btn.dataset.ext;
                    previewFile({path: path, extension: ext});
                });
            });

            document.querySelectorAll('.open-folder').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    alert('🚧 قابلیت باز کردن فولدر در حال توسعه است');
                });
            });
        })
        .catch(err => {
            container.innerHTML = `<div class="error">❌ خطا: ${err.message}</div>`;
        });
}

// پنل مدیریت
let adminLoggedIn = false;

document.getElementById('adminBtn').addEventListener('click', () => {
    document.getElementById('adminModal').classList.add('active');
});

document.getElementById('loginAdminBtn').addEventListener('click', () => {
    const pass = document.getElementById('adminPassword').value;
    fetch('core/db/admin.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=login&password=${encodeURIComponent(pass)}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                adminLoggedIn = true;
                document.getElementById('adminPanel').style.display = 'block';
                alert('ورود موفق!');
            } else {
                alert('رمز اشتباه است');
            }
        });
});

document.getElementById('uploadBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('uploadFile');
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('file', fileInput.files[0]);

    fetch('core/db/admin.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('آپلود موفق!');
                loadFiles();
            } else {
                alert('خطا: ' + data.error);
            }
        });
});

document.getElementById('createFolderBtn').addEventListener('click', () => {
    const name = document.getElementById('folderName').value;
    if (!name) return;

    fetch('core/db/admin.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=create_folder&name=${encodeURIComponent(name)}&path=`
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('پوشه ساخته شد!');
                loadFiles();
            } else {
                alert('خطا: ' + data.error);
            }
        });
});

document.getElementById('refreshBtn').addEventListener('click', loadFiles);
document.querySelectorAll('.modal .modal-content button:last-child').forEach(btn => {
    if(btn.id !== 'closePreviewBtn') return;
    btn.addEventListener('click', () => {
        document.getElementById('previewModal').classList.remove('active');
    });
});

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.addEventListener('DOMContentLoaded', loadFiles);
