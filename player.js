async function loadLeastViewedVideo() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

    try {
        // 1. Получаем список видео
        const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (!listData.items) {
            console.error("Ошибка: список видео пуст");
            return;
        }

        const videoIds = listData.items
            .map(v => v.snippet?.resourceId?.videoId)
            .filter(Boolean)
            .join(",");

        // 2. Получаем статистику
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics,snippet`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        if (!statsData.items) {
            console.error("Ошибка: статистика не получена");
            return;
        }

        // 3. Фильтруем только корректные видео
        const validVideos = statsData.items.filter(v =>
            v.statistics?.viewCount &&
            v.snippet?.thumbnails?.medium?.url
        );

        if (!validVideos.length) {
            console.error("Нет валидных видео");
            return;
        }

        // 4. Находим самое мало просматриваемое
        let leastViewed = validVideos.reduce((min, v) =>
            Number(v.statistics.viewCount) < Number(min.statistics.viewCount) ? v : min
        );

        const videoId = leastViewed.id;
        const title = leastViewed.snippet.title;
        const thumb = leastViewed.snippet.thumbnails.medium.url;

        // 5. Подставляем в HTML
        document.getElementById("preview-thumb").src = thumb;
        document.getElementById("preview-title").textContent = title;

        // 6. Клик → страница просмотра
        document.getElementById("header-preview").onclick = () => {
            window.location.href = `watch.html?id=${videoId}`;
        };

    } catch (e) {
        console.error("Ошибка выполнения:", e);
    }
}

loadLeastViewedVideo();
