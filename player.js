<script>
async function loadLeastViewedVideo() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ";

    // 1. Получаем список видео
    const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    const videoIds = listData.items
        .map(v => v.snippet.resourceId.videoId)
        .join(",");

    // 2. Получаем статистику
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics,snippet`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    // 3. Фильтруем только видео с просмотрами
    const validVideos = statsData.items.filter(v => v.statistics && v.statistics.viewCount);

    if (!validVideos.length) {
        console.error("Нет видео со статистикой");
        return;
    }

    // 4. Находим самое мало просматриваемое
    let leastViewed = validVideos.reduce((min, v) => {
        return Number(v.statistics.viewCount) < Number(min.statistics.viewCount) ? v : min;
    });

    const videoId = leastViewed.id;
    const title = leastViewed.snippet.title;
    const thumb = leastViewed.snippet.thumbnails.medium.url;

    // 5. Подставляем в HTML
    document.getElementById("preview-thumb").src = thumb;
    document.getElementById("preview-title").textContent = title;

    document.getElementById("header-preview").onclick = () => {
        window.location.href = `watch.html?id=${videoId}`;
    };
}

loadLeastViewedVideo();
</script>
