fetch('../assets/videos.json')
    .then(response => response.json())
    .then(videos => {
        const shuffled = videos.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        const container = document.getElementById('recommend-cards');

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
    });
