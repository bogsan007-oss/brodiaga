/* ============================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================ */
let allVideos = [];
let videosPerPage = 14;
let currentIndex = 0;


/* ============================
   ЗАГРУЗКА МИНИ-ПРЕВЬЮ
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

        document.getElementById("preview-thumb").src = thumb;
        document.getElementById("preview-title").textContent = title;

        document.getElementById("header-preview").onclick = () => {
            window.location.href = `watch.html?id=${videoId}`;
        };

    } catch (e) {
        console.error("Ошибка выполнения loadLeastViewedVideo:", e);
    }
}

loadLeastViewedVideo();


/* ============================
   ЗАГРУЗКА ВСЕХ ВИДЕО
============================ */
async function loadVideoCards() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=100`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.items) return;

        allVideos = data.items;

        renderMoreVideos();   // первые 15
        insertAdCard();       // реклама после 2-й карточки
        updateShowMoreButton();

    } catch (e) {
        console.error("Ошибка выполнения loadVideoCards:", e);
    }
}

loadVideoCards();


/* ============================
   ОТРИСОВКА ПОРЦИИ
============================ */
function renderMoreVideos() {
    const container = document.getElementById("video-list");
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
            <img class="video-thumb" src="${thumb}">
            <div class="video-title">${title}</div>
        `;

        container.appendChild(card);
    });

    currentIndex = end;
}


/* ============================
   РЕКЛАМА ПОСЛЕ 6-Й КАРТОЧКИ
============================ */
function insertAdCard() {
    const list = document.getElementById("video-list");

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

    const index = 6; // вставляем рекламу после 6-й карточки
    if (list.children[index]) {
        list.insertBefore(adCard, list.children[index]);
    } else {
        list.appendChild(adCard);
    }

    setTimeout(() => {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch {}
    }, 300);
}

/* ============================
   КНОПКА "ПОКАЗАТЬ БОЛЬШЕ"
============================ */
function updateShowMoreButton() {
    const btn = document.getElementById("show-more");

    if (allVideos.length > videosPerPage) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
}

document.getElementById("show-more").onclick = () => {
    renderMoreVideos();
    updateShowMoreButton();
};
