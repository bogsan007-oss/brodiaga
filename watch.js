console.log("watch.js загружен (v4)");

/* ============================
   КЛЮЧИ
============================ */
let apiKey = window.apiKey;
let playlistId = window.playlistId;

/* ============================
   УНИВЕРСАЛЬНОЕ ОПРЕДЕЛЕНИЕ ID ВИДЕО
============================ */
function getVideoId() {
    // 1. Пробуем из ?id= (старые ссылки watch.html?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const idFromQuery = urlParams.get("id");
    if (idFromQuery) return idFromQuery;

    // 2. Берём из пути (новые ссылки watch/-PSOErrbDM4.html)
    const match = window.location.pathname.match(/\/watch\/([^\/]+)\.html$/);
    if (match) return match[1];

    return null;
}

/* ============================
   ЗАПОЛНЕНИЕ SEO-МЕТАТЕГОВ
============================ */
function updateAllMeta(videoId, video) {
    const snippet = video.snippet;
    const title = snippet.title;
    const description = (snippet.description || "").substring(0, 160);
    const published = snippet.publishedAt;
    const thumbHigh = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "";
    const canonicalUrl = `https://radio.brodiaga.com/watch/${videoId}.html`;

    document.title = title + " — Radio Brodiaga";

    const metaDesc = document.getElementById("dynamic-description");
    if (metaDesc) metaDesc.content = description;

    const canonical = document.getElementById("canonical-link");
    if (canonical) canonical.href = canonicalUrl;

    const ogTitle = document.getElementById("og-title");
    if (ogTitle) ogTitle.content = title;
    const ogDesc = document.getElementById("og-description");
    if (ogDesc) ogDesc.content = description;
    const ogUrl = document.getElementById("og-url");
    if (ogUrl) ogUrl.content = canonicalUrl;
    const ogImage = document.getElementById("og-image");
    if (ogImage) ogImage.content = thumbHigh;

    const twTitle = document.getElementById("tw-title");
    if (twTitle) twTitle.content = title;
    const twDesc = document.getElementById("tw-description");
    if (twDesc) twDesc.content = description;
    const twImage = document.getElementById("tw-image");
    if (twImage) twImage.content = thumbHigh;

    const jsonLd = document.getElementById("video-jsonld");
    if (jsonLd) {
        const jsonData = {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": title,
            "description": description,
            "thumbnailUrl": thumbHigh,
            "uploadDate": published,
            "embedUrl": `https://www.youtube.com/embed/${videoId}`,
            "contentUrl": canonicalUrl
        };
        jsonLd.textContent = JSON.stringify(jsonData);
    }
}

/* ============================
   ПРЕВЬЮ В ШАПКЕ
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
                window.location.href = `/watch/${videoId}.html`;
            };
        }

    } catch (e) {
        console.error("Ошибка loadHeaderPreview:", e);
    }
}

/* ============================
   ОСНОВНОЕ ВИДЕО
============================ */
async function loadVideo() {
    try {
        const videoId = getVideoId();

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

        updateAllMeta(videoId, video);

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
   ПОХОЖИЕ ВИДЕО
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
                window.location.href = `/watch/${videoId}.html`;
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
    const videoId = getVideoId();

    if (!videoId) {
        alert("Ошибка: ID видео не найден");
        return;
    }

    window.location.href = "/pages/comments.html?video=" + videoId;
}

/* ============================
   СТАРТ
============================ */
document.addEventListener("DOMContentLoaded", () => {
    loadVideo();
    loadHeaderPreview();
});
