// === Мини-плеер: самое мало просматриваемое видео ===

async function loadLeastViewedVideo() {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${AIzaSyDczpmgcrlq2cUQ8BY_i7jnxCaO2DHf5MI
}&channelId=${UCIRgBQwdKyIY5Sr0JDn4uPQ}&part=snippet,id&maxResults=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        let videos = [];

        for (let item of data.items) {
            if (!item.id.videoId) continue;

            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${item.id.videoId}&key=${API_KEY}`;
            const statsRes = await fetch(statsUrl);
            const statsData = await statsRes.json();

            const views = Number(statsData.items[0].statistics.viewCount);

            videos.push({
                id: item.id.videoId,
                views: views
            });
        }

        // сортируем по просмотрам
        videos.sort((a, b) => a.views - b.views);

        const leastViewed = videos[0].id;

        document.getElementById("mini-frame").src =
            `https://www.youtube.com/embed/${leastViewed}`;

    } catch (e) {
        console.error("Ошибка мини-плеера:", e);
    }
}

loadLeastViewedVideo();
