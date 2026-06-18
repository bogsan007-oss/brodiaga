// === Мини-плеер: самое мало просматриваемое видео ===
// === ТВОИ ДАННЫЕ ===
const CHANNEL_ID = "UCIRgBQwdKyIY5Sr0JDn4uPQ";
const API_KEY = "AIzaSyDczpmgcrlq2cUQ8BY_i7jnxCaO2DHf5MI";

async function getLeastViewedVideoId() {
    try {
        const searchUrl =
            `https://www.googleapis.com/youtube/v3/search` +
            `?key=${API_KEY}` +
            `&channelId=${CHANNEL_ID}` +
            `&part=snippet,id` +
            `&maxResults=20` +
            `&type=video`;

        const res = await fetch(searchUrl);
        const data = await res.json();

        const videos = [];

        for (const item of data.items) {
            if (!item.id || !item.id.videoId) continue;

            const statsUrl =
                `https://www.googleapis.com/youtube/v3/videos` +
                `?part=statistics` +
                `&id=${item.id.videoId}` +
                `&key=${API_KEY}`;

            const statsRes = await fetch(statsUrl);
            const statsData = await statsRes.json();

            if (!statsData.items || !statsData.items[0]) continue;

            const views = Number(statsData.items[0].statistics.viewCount || 0);

            videos.push({
                id: item.id.videoId,
                views: views
            });
        }

        if (!videos.length) return null;

        videos.sort((a, b) => a.views - b.views);
        return videos[0].id;

    } catch (e) {
        console.error("Ошибка:", e);
        return null;
    }
}

getLeastViewedVideoId().then(videoId => {
    if (!videoId) {
        console.error("Видео не найдено");
        return;
    }

    new Playerjs({
        id: "player",
        file: "https://www.youtube.com/watch?v=" + videoId,
        autoplay: 1,
        controls: 1
    });
});


// === ЗАПУСК ПЛЕЕРА ===
getLeastViewedVideoId().then(videoId => {
    if (!videoId) {
        console.error("Видео не найдено");
        return;
    }

    new Playerjs({
        id: "player", // ID контейнера в index.html
        file: "https://www.youtube.com/watch?v=" + videoId,
        autoplay: 1,
        controls: 1
    });
});
