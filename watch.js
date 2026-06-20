/* ============================
   ЗАГРУЗКА ОСНОВНОГО ВИДЕО
============================ */
async function loadVideo() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";

    try {
        // Получаем ID из URL
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get("id");

        if (!videoId) {
            document.body.innerHTML = "<h2>Видео не найдено</h2>";
            return;
        }

        // Загружаем данные видео
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet,statistics`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.items || !data.items.length) {
            document.body.innerHTML = "<h2>Видео недоступно</h2>";
            return;
        }

        const video = data.items[0];

        // Настраиваем Plyr
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

        // Заполняем данные
        document.getElementById("video-title").textContent = video.snippet.title;
        document.getElementById("video-description").textContent = video.snippet.description;
        document.getElementById("video-date").textContent =
            "Дата публикации: " + new Date(video.snippet.publishedAt).toLocaleDateString("ru-RU");

        // Загружаем похожие видео
        loadRelatedVideos(videoId);

    } catch (e) {
        console.error("Ошибка loadVideo:", e);
    }
}


/* ============================
   ПОХОЖИЕ ВИДЕО — СЛУЧАЙНЫЕ
============================ */
async function loadRelatedVideos(currentId) {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

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

        // Берём только нормальные элементы
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

        // Честный рандом — выбираем до 6 разных видео
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
   СТАРТ
============================ */
loadVideo();
