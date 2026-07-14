console.log("watch.js загружен");

/* ============================
   КЛЮЧИ ИЗ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ
============================ */
let apiKey = window.apiKey;
let playlistId = window.playlistId;

/* ============================
   ПРЕВЬЮ В ШАПКЕ (МИНИ-ВИДЕО)
============================ */
async function loadHeaderPreview() {
    try {
        const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (!listData.items) return;

        const videoIds = listData.items
            .map(v => v.snippet?.resourceId?.videoId)
            .filter(Boolean)
            .join(",");

        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics,snippet`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        if (!statsData.items) return;

        const validVideos = statsData.items.filter(v =>
            v.statistics?.viewCount &&
            v.snippet?.thumbnails?.medium?.url
        );

        if (!validVideos.length) return;

        const leastViewed = validVideos.reduce((min, v) =>
            Number(v.statistics.viewCount) < Number(min.statistics.viewCount) ? v : min
        );

        const videoId = leastViewed.id;
        const title = leastViewed.snippet.title;
        const thumb = leastViewed.snippet.thumbnails.medium.url;

        const thumbEl = document.getElementById("preview-thumb");
        const titleEl = document.getElementById("preview-title");
        const boxEl = document.getElementById("header-preview");

        if (thumbEl) thumbEl.src = thumb;
        if (titleEl) titleEl.textContent = title;
        if (boxEl) {
            boxEl.onclick = () => {
                window.location.href = `watch.html?id=${videoId}`;
            };
        }

    } catch (e) {
        console.error("Ошибка loadHeaderPreview:", e);
    }
}

/* ============================
   ЗАГРУЗКА ОСНОВНОГО ВИДЕО
============================ */
async function loadVideo() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get("id");

        if (!videoId) {
            document.body.innerHTML = "<h2>Видео не найдено</h2>";
            return;
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet,statistics`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.items || !data.items.length) {
            document.body.innerHTML = "<h2>Видео недоступно</h2>";
            return;
        }

        const video = data.items[0];
        initShare(videoId, video.snippet.title);

        const player = new Plyr('#player', {
            youtube: { noCookie: true }
        });

        player.source = {
            type: 'video',
            sources: [
                {
                    src: videoId,
                    provider: 'youtube'
                }
            ]
        };

        const titleEl = document.getElementById("video-title");
        if (titleEl) titleEl.textContent = video.snippet.title;

        function makeLinksClickable(text) {
            return text.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            );
        }

        const descEl = document.getElementById("video-description");
        if (descEl) {
            const cleanDescription = (video.snippet.description || "").replace(/<[^>]+>/g, "");
            descEl.innerHTML = makeLinksClickable(cleanDescription);
        }

        const dateEl = document.getElementById("video-date");
        if (dateEl) {
            dateEl.textContent =
                "Дата публикации: " + new Date(video.snippet.publishedAt).toLocaleDateString("ru-RU");
        }

        loadRelatedVideos(videoId);

    } catch (e) {
        console.error("Ошибка loadVideo:", e);
        document.body.innerHTML = "<h2>Ошибка загрузки видео</h2>";
    }
}
/* ============================
   ПОДЕЛИТЬСЯ В СОЦСЕТЯХ
============================ */
function initShare(videoId, title) {
    const shareBtn = document.getElementById("shareBtn");
    const shareMenu = document.getElementById("shareMenu");

    // Если кнопки нет — выходим
    if (!shareBtn || !shareMenu) return;

    // Формируем URL видео
    const url = `https://radio.brodiaga.com/watch.html?id=${videoId}`;

    // Открытие/закрытие меню
    shareBtn.onclick = () => {
        shareMenu.style.display =
            shareMenu.style.display === "block" ? "none" : "block";
    };

    // VK
    document.getElementById("shareVK").href =
        `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

    // Telegram
    document.getElementById("shareTG").href =
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

    // WhatsApp
    document.getElementById("shareWA").href =
        `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;

    // Facebook
    document.getElementById("shareFB").href =
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    // OK
    document.getElementById("okShare").href =
        `https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(url)}`;

    // Instagram (нет шаринга ссылок)
    document.getElementById("igShare").href =
        "https://www.instagram.com/";

    // TikTok (нет шаринга ссылок)
    document.getElementById("ttShare").href =
        "https://www.tiktok.com/";
}
       const tooltip = document.getElementById("tooltip");

document.querySelectorAll(".social-icon").forEach(icon => {
    icon.addEventListener("mouseenter", (e) => {
        const title = icon.getAttribute("data-title");
        tooltip.textContent = title;

        const rect = icon.getBoundingClientRect();

        tooltip.style.left = rect.left + rect.width / 2 + "px";
        tooltip.style.top = rect.top - 40 + "px"; // НАД кнопкой
        tooltip.style.opacity = 1;
    });

    icon.addEventListener("mouseleave", () => {
        tooltip.style.opacity = 0;
    });
});


/* ============================
   ПОХОЖИЕ ВИДЕО — СЛУЧАЙНЫЕ
============================ */
async function loadRelatedVideos(currentId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const res = await fetch(url);
        const data = await res.json();

        const container = document.getElementById("related-videos");
        if (!container) return;

        container.innerHTML = "";

        if (!data.items || !data.items.length) {
            container.innerHTML = "<p>Нет похожих видео</p>";
            return;
        }

        const items = data.items.filter(item =>
            item.snippet &&
            item.snippet.resourceId &&
            item.snippet.resourceId.videoId &&
            item.snippet.thumbnails &&
            item.snippet.thumbnails.medium
        );

        if (!items.length) {
            container.innerHTML = "<p>Нет похожих видео</p>";
            return;
        }

        const used = new Set();
        const randomVideos = [];

        while (randomVideos.length < 6 && used.size < items.length) {
            const idx = Math.floor(Math.random() * items.length);
            if (used.has(idx)) continue;

            const item = items[idx];
            const videoId = item.snippet.resourceId.videoId;

            if (videoId === currentId) {
                used.add(idx);
                continue;
            }

            randomVideos.push(item);
            used.add(idx);
        }

        if (!randomVideos.length) {
            container.innerHTML = "<p>Нет похожих видео</p>";
            return;
        }

        randomVideos.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;
            const thumb = item.snippet.thumbnails.medium.url;

            const card = document.createElement("div");
            card.className = "related-card";
            card.onclick = () => {
                window.location.href = `watch.html?id=${videoId}`;
            };

            card.innerHTML = `
                <img class="related-thumb" src="${thumb}" alt="">
                <div class="related-title-text">${title}</div>
            `;

            container.appendChild(card);
        });

    } catch (e) {
        console.error("Ошибка loadRelatedVideos:", e);
    }
}

/* ============================
   ПЕРЕХОД В КОММЕНТАРИИ
============================ */
function goToComments() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("id");

    if (!videoId) {
        alert("Ошибка: ID видео не найден");
        return;
    }

    // относительный путь, чтобы на GitHub Pages не ломалось
    window.location.href = "pages/comments.html?video=" + videoId;
}

/* ============================
   ПРИВЯЗКА КНОПКИ КОММЕНТАРИЕВ
============================ */
const commentsBtn = document.getElementById("comments-btn");
if (commentsBtn) {
    commentsBtn.onclick = goToComments;
}

/* ============================
   СТАРТ
============================ */
loadHeaderPreview();
loadVideo();
