document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('video-list');
    if (!container) return;

    try {
        const response = await fetch('/posts/');
        const text = await response.text();

        const parser = new DOMParser();
        const html = parser.parseFromString(text, 'text/html');
        const links = [...html.querySelectorAll('a')];

        const postFiles = links
            .map(a => a.getAttribute('href'))
            .filter(href =>
                href.endsWith('.html') &&
                !href.includes('example') &&
                !href.includes('index')
            );

        for (const file of postFiles) {
            const postUrl = '/posts/' + file;

            const postResp = await fetch(postUrl);
            const postText = await postResp.text();
            const postDoc = parser.parseFromString(postText, 'text/html');

            const title = postDoc.querySelector('h1')?.innerText || 'Без названия';
            const img = postDoc.querySelector('img')?.getAttribute('src') || '/images/default-post.jpg';

            const card = document.createElement('div');
            card.className = 'video-card';
            card.onclick = () => location.href = postUrl;

            card.innerHTML = `
                <img src="${img}" class="video-thumb">
                <div class="video-title">${title}</div>
            `;

            container.appendChild(card);
        }

    } catch (err) {
        console.error('Ошибка загрузки постов:', err);
    }
});
/* rebuild */
