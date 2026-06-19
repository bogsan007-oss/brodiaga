<script>
async function loadLeastViewedVideo() {
    const apiKey = "AIzaSyDczpmgcrlq2cUQ8BY_i7jnxCaO2DHf5MI";
    const channelId = "UCIRgBQwdKyIY5Sr0JDn4uPQ";

    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=20`;

    const res = await fetch(url);
    const data = await res.json();

    const videoIds = data.items
        .filter(v => v.id.videoId)
        .map(v => v.id.videoId)
        .join(",");

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics,snippet`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    let leastViewed = statsData.items.reduce((min, v) => {
        return Number(v.statistics.viewCount) < Number(min.statistics.viewCount) ? v : min;
    });

    const videoId = leastViewed.id;
    const title = leastViewed.snippet.title;
    const thumb = leastViewed.snippet.thumbnails.medium.url;

    document.getElementById("preview-thumb").src = thumb;
    document.getElementById("preview-title").textContent = title;

    document.getElementById("header-preview").onclick = () => {
        window.location.href = `watch.html?id=${videoId}`;
    };
}

loadLeastViewedVideo();
</script>
