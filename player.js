/* ============================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================ */
let allVideos = [];
let videosPerPage = 15; // 3 ряда по 5 карточек
let currentIndex = 0;


/* ============================
   ЗАГРУЗКА МИНИ-ПРЕВЬЮ (самое непопулярное видео)
============================ */
async function loadLeastViewedVideo() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

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
        const previewEl = document.getElementById("header-preview");

        if (thumbEl) thumbEl.src = thumb;
        if (titleEl) titleEl.textContent = title;

        if (previewEl) {
            previewEl.onclick = () => {
                window.location.href = `watch.html?id=${videoId}`;
            };
        }

    } catch (e) {
        console.error("Ошибка выполнения loadLeastViewedVideo:", e);
    }
}

loadLeastViewedVideo();


/* ============================
   ЗАГРУЗКА КАРТОЧЕК НА ГЛАВНОЙ (с подгрузкой)
============================ */
async function loadVideoCards() {
    const container = document.getElementById("video-list");
    if (!container) return; // на watch.html просто выходим

    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.items) return;

        // сохраняем все видео
        allVideos = data.items;

        // показываем первые 15
        renderMoreVideos();

    } catch (e) {
        console.error("Ошибка выполнения loadVideoCards:", e);
    }
}

loadVideoCards();


/* ============================
   ОТРИСОВКА ПОРЦИИ КАРТОЧЕК (15 за раз)
============================ */
function renderMoreVideos() {
    const container = document.getElementById("video-list");
    if (!container) return;

    const end = currentIndex + videosPerPage;
    const slice = allVideos.slice(currentIndex, end);

    slice.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        const thumb = item.snippet.thumbnails.medium.url;

        const card = document.createElement("div");
        card.className = "video-card";
        card.onclick = () => {
            window.location.href = `watch.html?id=${videoId}`;
        };

        card.innerHTML = `
            <img class="video-thumb" src="${thumb}" alt="">
            <div class="video-title">${title}</div>
        `;

        container.appendChild(card);
    });

    currentIndex = end;

    // если видео закончились — скрываем кнопку
    const btn = document.getElementById("show-more");
    if (btn && currentIndex >= allVideos.length) {
        btn.style.display = "none";
    }
}


/* ============================
   РЕКЛАМНАЯ КАРТОЧКА (2-й ряд)
============================ */
function insertAdCard() {
    const list = document.getElementById("video-list");
    if (!list) return;

    const adCard = document.createElement("div");
    adCard.className = "video-card ad-card";

    adCard.innerHTML = `
        <div class="ad-box">
            <ins class="adsbygoogle"
                 style="display:inline-block;width:100%;height:100%;"
                 data-ad-client="ca-pub-7483662712371460"
                 data-ad-slot="1747457051"></ins>
        </div>
    `;

    const secondCard = list.children[1];
    if (secondCard) {
        list.insertBefore(adCard, secondCard.nextSibling);
    } else {
        list.appendChild(adCard);
    }

    // ⭐ Безопасная загрузка рекламы
    setTimeout(() => {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.warn("AdSense blocked — продолжаем работу сайта");
        }
    }, 300);
}



/* ============================
   КНОПКА "ПОКАЗАТЬ БОЛЬШЕ"
============================ */
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("show-more");
    if (btn) {
        btn.onclick = () => {
            renderMoreVideos();
        };
    }
});
