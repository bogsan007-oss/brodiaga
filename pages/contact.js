const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

async function loadRecommendedVideos() {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const res = await fetch(url);
        const data = await res.json();

        const container = document.getElementById("recommend-cards");
        if (!container) return;

        container.innerHTML = "";

        if (!data.items || !data.items.length) {
            container.innerHTML = "<p>Нет видео</p>";
            return;
        }

        const items = data.items.filter(item =>
            item.snippet &&
            item.snippet.resourceId &&
            item.snippet.resourceId.videoId &&
            item.snippet.thumbnails &&
            item.snippet.thumbnails.high
        );

        const shuffled = items.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        selected.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;
            const thumb = item.snippet.thumbnails.high.url;

            const card = document.createElement("a");
            card.href = `../watch.html?id=${videoId}`;
            card.className = "card";

            card.innerHTML = `
                <img src="${thumb}" alt="">
                <div class="card-info">
                    <h3>${title}</h3>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (e) {
        console.error("Ошибка loadRecommendedVideos:", e);
    }
}

loadRecommendedVideos();
