async function getLeastViewedVideoId() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbz0y0g3Kp0t0g0g0g0g0g0g0g0g0g0g0g/exec");
        const videos = await response.json();

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

    const playerContainer = document.getElementById("mini-player");

    playerContainer.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
            allowfullscreen
            allow="autoplay"
        ></iframe>
    `;

    new Plyr('#mini-player', {
        autoplay: true,
        controls: [],
        muted: true
    });
});
