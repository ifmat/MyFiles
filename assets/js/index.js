const container = document.getElementById("file-container");

// تابع کمکی برای تعیین آیکون فایل بر اساس نوع
function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
        case 'pdf': return 'assets/images/icon/pdf.jpg';
        case 'doc': return 'assets/images/icon/word.png';
        case 'docx': return 'assets/images/icon/word.png';
        case 'xls': return 'assets/images/icon/xls.png';
        case 'xlsx': return 'assets/images/icon/xls.png';
        case 'jpg': return 'assets/images/icon/jpg.png';
        case 'jpeg': return 'assets/images/icon/jpg.png';
        case 'png': return 'assets/images/icon/jpg.png';
        case 'mp4': return 'assets/images/icon/movies.png';
        case 'mkv': return 'assets/images/icon/movies.png';
        case 'gif': return 'assets/images/icon/gif.png';
        case 'txt': return 'assets/images/icon/text.png';
        default: return 'assets/images/icon/box.ico'; // آیکون پیش‌فرض
    }
}

// تابع بازگشتی برای رندر کردن درخت فایل‌ها
// node: داده‌های فعلی (پوشه یا فایل)
// parentElement: عنصری که باید گره فعلی به آن اضافه شود
// basePath: مسیر نسبی فعلی برای ساخت URL فایل‌ها
function renderTree(node, parentElement, basePath = '') {
    // اگر node یک پوشه است و دارای فرزندان است
    if (node.type === "folder" && node.children && node.children.length > 0) {
        node.children.forEach(item => {
            const div = document.createElement("div");
            div.classList.add(item.type); // 'folder' یا 'file'

            // ساخت مسیر کامل برای آیتم فعلی
            // اگر node.path از PHP آمده باشد، می توان از آن استفاده کرد
            // در غیر این صورت، مسیر را بر اساس basePath و نام آیتم می‌سازیم
            const currentItemPath = item.path ? item.path : (basePath ? `${basePath}/${item.name}` : item.name);
            // توجه: اگر PHP مسیر نسبی صحیح را برمی‌گرداند، از item.path استفاده کنید.
            // در غیر این صورت، این خطوط مسیر را می‌سازند:
            // const currentItemPath = basePath ? `${basePath}/${item.name}` : item.name;


            if (item.type === "folder") {
                // آیکون پوشه - می‌توان آن را بر اساس وضعیت باز/بسته بودن تغییر داد
                // در ابتدا، فرض می‌کنیم پوشه بسته است
                let folderIconSrc = 'assets/images/icon/vampire.ico'; // آیکون پیش‌فرض پوشه بسته

                div.innerHTML = `<img class="icon" src="${folderIconSrc}" alt="Folder Icon">
                               <span>${item.name}</span>`;

                div.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const subfolderElement = div.querySelector(".subfolder");
                    const iconElement = div.querySelector('.icon');

                    if (subfolderElement) {
                        // پوشه باز است، آن را ببند
                        subfolderElement.remove();
                        iconElement.src = 'assets/images/icon/vampire.ico'; // آیکون پوشه بسته
                    } else {
                        // پوشه بسته است، آن را باز کن
                        const subfolder = document.createElement("div");
                        subfolder.classList.add("subfolder");
                        // فراخوانی مجدد renderTree برای فرزندان این پوشه
                        // مسیر پایه برای فرزندان، مسیر فعلی آیتم است
                        renderTree(item, subfolder, currentItemPath);
                        div.appendChild(subfolder);
                        iconElement.src = 'assets/images/icon/pirate.ico'; // آیکون پوشه باز
                    }
                });
            } else { // item.type === "file"
                const fileIcon = getFileIcon(item.name);
                // استفاده از مسیر کامل فایل برای لینک
                // اگر PHP کلید 'path' را برمی‌گرداند، از آن استفاده کنید.
                // در غیر این صورت، مسیر را از basePath و نام فایل می‌سازیم.
                const fileUrl = item.path ? `./assets/files/${item.path}` : `./assets/files/${currentItemPath}`;
                // اگر PHP مستقیما URL قابل دسترسی را بدهد، از آن استفاده کنید:
                // const fileUrl = item.url;

                div.innerHTML = `<img class="icon" src="${fileIcon}" alt="File Icon">
                <a href="core/db/download.php?file=${item.relativePath}" target="_blank">${item.name}</a>`;
            }
            parentElement.appendChild(div);
        });
    } else if (node.type === "file") {
        // اگر گره فعلی خودش یک فایل باشد (که در ساختار فعلی کمتر پیش می‌آید مگر اینکه root یک فایل باشد)
        // این بخش ممکن است نیاز به تنظیمات بیشتری داشته باشد
    }
}


function initExplorer() {
    // مسیر PHP خود را اینجا تنظیم کنید. اگر در همان پوشه است، 'list.php' کافیست.
    // اگر در پوشه دیگری است، مسیر کامل را بدهید.
    fetch('core/db/list.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            container.innerHTML = ""; // پاک کردن پیام بارگذاری

            if (data.error) {
                container.innerHTML = `<div class="error">${data.error}</div>`;
            } else {
                // شروع رندر از ریشه، با استفاده از مسیر پایه 'assets/files'
                // اگر PHP کلید 'path' برای ریشه برگرداند، از آن استفاده کنید.
                // اگر PHP کلید 'path' را برگرداند: renderTree(data, container, data.path);
                renderTree(data, container, 'assets/files');
            }
        })
        .catch(error => {
            console.error('Error fetching file list:', error);
            container.innerHTML = `<div class="error">خطا در بارگذاری لیست فایل‌ها: ${error.message}</div>`;
        });
}

// اطمینان از اینکه DOM آماده است
document.addEventListener('DOMContentLoaded', initExplorer);