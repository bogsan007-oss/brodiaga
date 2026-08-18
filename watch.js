console.log("watch.js загружен");

/* ============================
   КЛЮЧИ ИЗ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ
============================ */
let apiKey = window.apiKey;
let playlistId = window.playlistId;

/* ============================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
============================ */
function updateOG(videoId, title) {
    const url = window.location.href;
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const ogImage = document.getElementById("og-image");
    const twImage = document.getElementById("tw-image");
    const ogTitle = document.getElementById("og-title");
    const twTitle = document.getElementById("tw-title");
    const ogDesc = document.getElementById("og-description");
    const twDesc = document.getElementById("tw-description");
    const ogUrl = document.getElementById("og-url");

    // Проверка доступности maxresdefault
    const img = new Image();
    img.onload = () => {
        if (ogImage) ogImage.content = thumbnail;
        if (twImage) twImage.content = thumbnail;
    };
    img.onerror = () => {
        if (ogImage) ogImage.content = fallback;
        if (twImage) twImage.content = fallback;
    };
    img.src = thumbnail;

    if (ogTitle) ogTitle.content = title;
    if (twTitle) twTitle.content = title;

    if (ogDesc) ogDesc.content = "Смотрите видео на Radio Brodiaga";
    if (twDesc) twDesc.content = "Смотрите видео на Radio Brodiaga";

    if (ogUrl) ogUrl.content = url;
}

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

        // Обновляем OG-теги
        updateOG(videoId, video.snippet.title);

        // Кнопки поделиться
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

    } catch (e) {
        console.error("Ошибка loadVideo:", e);
    }
}



        /* ============================
           ВСТАВЛЯЕМ SEO-МЕТАТЕГИ
        ============================ */

        // TITLE
        document.title = video.snippet.title;

        // META DESCRIPTION
        const metaDesc = document.getElementById("dynamic-description");
        if (metaDesc) metaDesc.content = video.snippet.description;

        // OG TITLE
        const ogTitle = document.getElementById("og-title");
        if (ogTitle) ogTitle.content = video.snippet.title;

        // OG DESCRIPTION
        const ogDesc = document.getElementById("og-description");
        if (ogDesc) ogDesc.content = video.snippet.description;

        // OG IMAGE
        const ogImg = document.getElementById("og-image");
        if (ogImg) ogImg.content = video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url;

        // CANONICAL
        const canonical = document.getElementById("canonical-link");
        if (canonical) canonical.href = `https://radio.brodiaga.com/watch.html?id=${videoId}`;

        /* ============================
           JSON-LD VideoObject
        ============================ */
        const jsonLd = document.getElementById("video-jsonld");
        if (jsonLd) {
            const jsonData = {
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": video.snippet.title,
                "description": video.snippet.description,
                "thumbnailUrl": video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
                "uploadDate": video.snippet.publishedAt,
                "embedUrl": `https://www.youtube.com/embed/${videoId}`,
                "contentUrl": `https://radio.brodiaga.com/watch.html?id=${videoId}`
            };
            jsonLd.textContent = JSON.stringify(jsonData);
        }

        /* ============================
           ВСТАВЛЯЕМ ТЕКСТ НА СТРАНИЦУ
        ============================ */

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
    // Берём реальный URL страницы, а не собираем вручную
    const url = window.location.href;

    // Функция безопасного назначения href
    function safeSetHref(id, href) {
        const el = document.getElementById(id);
        if (el) el.href = href;
    }

    safeSetHref("shareVK",
        `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`);

    safeSetHref("shareTG",
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);

    safeSetHref("shareWA",
        `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`);

    safeSetHref("shareFB",
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);

    safeSetHref("okShare",
        `https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(url)}`);

    // Instagram — нет прямого шаринга, копируем ссылку
    const ig = document.getElementById("igShare");
    if (ig) ig.onclick = () => {
        navigator.clipboard.writeText(url);
        alert("Ссылка скопирована! Вставьте её в Instagram.");
    };

    // TikTok — тоже нет прямого шаринга
    const tt = document.getElementById("ttShare");
    if (tt) tt.onclick = () => {
        navigator.clipboard.writeText(url);
        alert("Ссылка скопирована! TikTok не принимает ссылки напрямую.");
    };
}


/* ============================
   АВТОЗАПУСК initShare()
============================ */
document.addEventListener("DOMContentLoaded", () => {
    const params  = new URLSearchParams(window.location.search);
    const videoId = params.get("id");
    const title   = document.title;

    initShare(videoId, title);
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
