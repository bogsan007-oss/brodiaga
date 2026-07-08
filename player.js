/* ============================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================ */
let allVideos = [];
let videosPerPage = 14; // 14 видео + реклама = 15 элементов
let currentIndex = 0;

import { apiKey, playlistId } from "./keys.js";

/* ============================
   ЗАГРУЗКА МИНИ-ПРЕВЬЮ
============================ */

async function loadLeastViewedVideo() {
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
        console.error("Ошибка loadLeastViewedVideo:", e);
    }
}


/* ============================
   ЗАГРУЗКА ВСЕХ ВИДЕО
============================ */
async function loadVideoCards() {
    try {
        let nextPageToken = "";
        allVideos = [];

        while (true) {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50&pageToken=${nextPageToken}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!data.items) break;

            allVideos = allVideos.concat(data.items);

            if (!data.nextPageToken) break;
            nextPageToken = data.nextPageToken;
        }

        if (document.getElementById("video-list")) {
            renderMoreVideos();
            updateShowMoreButton();
        }

    } catch (e) {
        console.error("Ошибка loadVideoCards:", e);
    }
}



/* ============================
   ОТРИСОВКА ПОРЦИИ (14 видео + реклама)
============================ */
function renderMoreVideos() {
    const container = document.getElementById("video-list");
    if (!container) return;

    const end = currentIndex + videosPerPage;
    const slice = allVideos.slice(currentIndex, end);

    const finalItems = [];

    slice.forEach((item, i) => {
        // Вставляем рекламу на 6-е место (после 5 видео)
        if (i === 5) {
            finalItems.push({ type: "ad" });
        }
        finalItems.push(item);
    });

    finalItems.forEach(item => {
        if (item.type === "ad") {

            /* ⭐ ИСПРАВЛЕННЫЙ РЕКЛАМНЫЙ БЛОК ДЛЯ КАРТОЧКИ ⭐ */
          const adCard = document.createElement("div");
adCard.className = "video-card ad-card";

adCard.innerHTML = `
    <ins class="adsbygoogle"
         style="display:block;"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="YYYYYYYYYY"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
`;

container.appendChild(adCard);

try {
    (adsbygoogle = window.adsbygoogle || []).push({});
} catch {}  

        } else {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;
            const thumb = item.snippet.thumbnails.medium.url;

            const card = document.createElement("div");
            card.className = "video-card";
            card.onclick = () => {
                window.location.href = `watch.html?id=${videoId}`;
            };

            card.innerHTML = `
                <img class="video-thumb" src="${thumb}">
                <div class="video-title">${title}</div>
            `;

            container.appendChild(card);
        }
    });

    currentIndex = end; // увеличиваем только на 14 видео
}


/* ============================
   КНОПКА "ПОКАЗАТЬ БОЛЬШЕ"
============================ */
function updateShowMoreButton() {
    const btn = document.getElementById("show-more");
    if (btn) btn.style.display = "block";
}

const showMoreBtn = document.getElementById("show-more");
if (showMoreBtn) {
    showMoreBtn.onclick = () => {
        renderMoreVideos();
        updateShowMoreButton();
    };
}


/* ============================
   ЗАПУСК
============================ */
loadLeastViewedVideo();
loadVideoCards();
