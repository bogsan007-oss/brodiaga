/* ============================
   РЕКОМЕНДАЦИИ НА КОНТАКТАХ
============================ */
async function loadContactVideos() {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const res = await fetch(url);
        const data = await res.json();

        // ✔ правильный контейнер из contact.html
        const container = document.getElementById("recommend-cards");
        if (!container) return;

        container.innerHTML = "";

        if (!data.items || !data.items.length) {
            container.innerHTML = "<p>Нет рекомендаций</p>";
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
            container.innerHTML = "<p>Нет рекомендаций</p>";
            return;
        }

        const used = new Set();
        const randomVideos = [];

        while (randomVideos.length < 6 && used.size < items.length) {
            const idx = Math.floor(Math.random() * items.length);
            if (used.has(idx)) continue;

            const item = items[idx];
            randomVideos.push(item);
            used.add(idx);
        }

        if (!randomVideos.length) {
            container.innerHTML = "<p>Нет рекомендаций</p>";
            return;
        }

        randomVideos.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;
            const thumb = item.snippet.thumbnails.medium.url;

            // ✔ карточка строго под твой CSS (.card)
            const card = document.createElement("a");
            card.className = "card";
            card.href = `watch.html?id=${videoId}`;

            // ✔ структура строго под твой CSS (.card img + .card-info)
            card.innerHTML = `
                <img src="${thumb}" alt="">
                <div class="card-info">
                    <h3>${title}</h3>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (e) {
        console.error("Ошибка loadContactVideos:", e);
    }
}

loadContactVideos();
