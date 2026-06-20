/* ============================
   ЗАГРУЗКА МИНИ-ПРЕВЬЮ (самое непопулярное видео)
============================ */
async function loadLeastViewedVideo() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

    try {
        // 1. Получаем список видео из плейлиста
        const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (!listData.items) return;

        const videoIds = listData.items
            .map(v => v.snippet?.resourceId?.videoId)
            .filter(Boolean)
            .join(",");

        // 2. Получаем статистику
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics,snippet`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        if (!statsData.items) return;

        // 3. Фильтруем корректные видео
        const validVideos = statsData.items.filter(v =>
            v.statistics?.viewCount &&
            v.snippet?.thumbnails?.medium?.url
        );

        if (!validVideos.length) return;

        // 4. Находим самое мало просматриваемое
        const leastViewed = validVideos.reduce((min, v) =>
            Number(v.statistics.viewCount) < Number(min.statistics.viewCount) ? v : min
        );

        const videoId = leastViewed.id;
        const title = leastViewed.snippet.title;
        const thumb = leastViewed.snippet.thumbnails.medium.url;

        // 5. Подставляем в HTML
        const thumbEl = document.getElementById("preview-thumb");
        const titleEl = document.getElementById("preview-title");
        const previewEl = document.getElementById("header-preview");

        if (thumbEl) thumbEl.src = thumb;
        if (titleEl) titleEl.textContent = title;

        // 6. Клик → переход на просмотр
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
   ЗАГРУЗКА КАРТОЧЕК НА ГЛАВНОЙ
============================ */
async function loadVideoCards() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const res = await fetch(url);
        const data = await res.json();

        const container = document.getElementById("video-list");
        if (!container) return;

        container.innerHTML = "";

        if (!data.items) return;

        data.items.forEach(item => {
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

    } catch (e) {
        console.error("Ошибка выполнения loadVideoCards:", e);
    }
}

loadVideoCards();
function insertAdCard() {
    const list = document.getElementById("video-list");
    if (!list) return;

    // создаём рекламную карточку
    const adCard = document.createElement("div");
    adCard.className = "video-card ad-card";

    adCard.innerHTML = `
        <div class="ad-container">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-XXXXXX"
                 data-ad-slot="YYYYYY"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    `;

    // вставляем после второй карточки
    const secondCard = list.children[1];
    if (secondCard) {
        list.insertBefore(adCard, secondCard.nextSibling);
    } else {
        // если карточек меньше двух — просто добавляем в конец
        list.appendChild(adCard);
    }

    // запускаем рекламу
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.log("AdSense error:", e);
    }
}

// вызываем после загрузки видео
insertAdCard();
