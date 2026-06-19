async function loadVideo() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";

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
}

loadVideo();
