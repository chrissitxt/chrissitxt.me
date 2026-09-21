// fills the top bar based on scroll %
const progressBar = document.getElementById('readingProgress');

function updateReadingProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
}

window.addEventListener('scroll', updateReadingProgress);
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();

const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxFilename = document.getElementById('lightboxFilename');
const lightboxMeta = document.getElementById('lightboxMeta');
const lightboxImages = Array.from(document.querySelectorAll('.post-content img'));
let currentLightboxIndex = 0;

// bytes -> readable size string
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// loads a throwaway image just to read its real width/height, then a
// HEAD request for the file size, browsers don't expose that directly.
function updateLightboxInfo(src) {
    const filename = decodeURIComponent(src.split('/').pop());
    lightboxFilename.textContent = filename;
    lightboxFilename.href = src;
    lightboxMeta.textContent = '';

    const tempImg = new Image();
    tempImg.onload = () => {
        lightboxMeta.textContent = `${tempImg.naturalWidth} × ${tempImg.naturalHeight}`;
        fetch(src, { method: 'HEAD' }).then((res) => {
            const size = res.headers.get('content-length');
            if (size) {
                lightboxMeta.textContent = `${tempImg.naturalWidth} × ${tempImg.naturalHeight} · ${formatBytes(parseInt(size, 10))}`;
            }
        }).catch(() => {});
    };
    tempImg.src = src;
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const src = lightboxImages[index].src;
    lightboxImage.src = src;
    updateLightboxInfo(src);
    lightboxOverlay.classList.add('active');
}

function closeLightbox() {
    lightboxOverlay.classList.remove('active');
}

function showLightboxImage(delta) {
    currentLightboxIndex = (currentLightboxIndex + delta + lightboxImages.length) % lightboxImages.length;
    const src = lightboxImages[currentLightboxIndex].src;
    lightboxImage.src = src;
    updateLightboxInfo(src);
}

// click any post image to open, close via x/outside click/esc,
// arrows (buttons + keys) hidden automatically if there's only 1 image.
if (lightboxOverlay && lightboxImages.length > 0) {
    lightboxImages.forEach((img, index) => {
        img.addEventListener('click', () => openLightbox(index));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
    });

    if (lightboxImages.length > 1) {
        lightboxPrev.addEventListener('click', () => showLightboxImage(-1));
        lightboxNext.addEventListener('click', () => showLightboxImage(1));
    } else {
        lightboxPrev.style.display = 'none';
        lightboxNext.style.display = 'none';
    }

    document.addEventListener('keydown', (e) => {
        if (!lightboxOverlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showLightboxImage(-1);
        if (e.key === 'ArrowRight') showLightboxImage(1);
    });
}
