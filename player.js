// === Мини-плеер: самое мало просматриваемое видео ===
// === НАСТРОЙКИ ===
const CHANNEL_ID = "UCIRgBQwdKyIY5Sr0JDn4uPQ";
const API_KEY = "AIzaSyDczpmgcrlq2cUQ8BY_i7jnxCaO2DHf5MI";

let leastViewedVideo = null;
let player;

// === 1. Получаем самое малопросматриваемое видео ===
async function loadLeastViewedVideo() {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&maxResults=20`;

    const response = await fetch(searchUrl);
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

    videos.sort((a, b) => a.views - b.views);

    leastViewedVideo = videos[0].id;
}

// === 2. API YouTube вызывает эту функцию автоматически ===
async function onYouTubeIframeAPIReady() {
    await loadLeastViewedVideo();

    player = new YT.Player("mini-player", {
        height: "200",
        width: "350",
        videoId: leastViewedVideo,
        playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1
        },
        events: {
            onReady: onPlayerReady
        }
    });
}

// === 3. Когда плеер готов ===
function onPlayerReady(event) {
    // Можно автозапуск включить, если хочешь:
    // event.target.playVideo();
}

