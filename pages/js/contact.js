async function loadRecommendedVideos() {
    const apiKey = "AIzaSyDJAfqTtSmIfxH_BMKKuBVMp0qnz7Q5lOg";
    const playlistId = "UUIRgBQwdKyIY5Sr0JDn4uPQ"; // твой плейлист

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=120`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const videos = data.items.map(item => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        const shuffled = videos.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        const container = document.getElementById('recommend-cards');
        container.innerHTML = "";

        selected.forEach(video => {
            const card = document.createElement('a');
            card.href = `../watch.html?id=${video.id}`;
            card.className = 'card';

            card.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="card-info">
                    <h3>${video.title}</h3>
                    <p>${video.description || ''}</p>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Ошибка загрузки YouTube API:", error);
    }
}

loadRecommendedVideos();
