console.log("watch.js загружен");

/* ============================
   КЛЮЧИ ИЗ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ
============================ */
const apiKey = window.apiKey;
const playlistId = window.playlistId;

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
        if (titleEl) {
            titleEl.textContent = video.snippet.title;
        }

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
   ЗВЁЗДЫ РЕЙТИНГА
============================ */
const starsContainer = document.getElementById('ratingStars');
if (starsContainer) {
    const stars = starsContainer.querySelectorAll('span');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');

            stars.forEach(s => {
                s.classList.remove('active');
                if (s.getAttribute('data-value') <= value) {
                    s.classList.add('active');
                }
            });

            console.log("Оценка:", value);
        });
    });
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

    window.location.href = "/pages/comments.html?video=" + videoId;
}

/* ============================
   ОТКРЫТИЕ ПРИВАТНОЙ ФОРМЫ
============================ */
function openPrivateForm() {
    alert("Открываем приватную форму… (позже сделаем красиво)");
}

/* ============================
   СТАРТ
============================ */
loadVideo();
