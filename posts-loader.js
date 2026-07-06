<script>
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('posts-root');
    if (!container) return;

    try {
        // Получаем список файлов в папке /posts/
        const response = await fetch('/posts/');
        const text = await response.text();

        // Ищем ссылки на HTML-файлы
        const parser = new DOMParser();
        const html = parser.parseFromString(text, 'text/html');
        const links = [...html.querySelectorAll('a')];

        // Фильтруем только посты
        const postFiles = links
            .map(a => a.getAttribute('href'))
            .filter(href =>
                href.endsWith('.html') &&
                !href.includes('example') &&
                !href.includes('index')
            );

        for (const file of postFiles) {
            const postUrl = '/posts/' + file;

            // Загружаем пост
            const postResp = await fetch(postUrl);
            const postText = await postResp.text();
            const postDoc = parser.parseFromString(postText, 'text/html');

            // Берём заголовок
            const title = postDoc.querySelector('h1')?.innerText || 'Без названия';

            // Берём описание — первый абзац
            const desc = postDoc.querySelector('p')?.innerText || 'Описание отсутствует';

            // Создаём карточку
            const card = document.createElement('a');
            card.href = postUrl;
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-card-title">${title}</div>
                <div class="post-card-desc">${desc}</div>
            `;

            container.appendChild(card);
        }

    } catch (err) {
        console.error('Ошибка загрузки постов:', err);
    }
});
</script>
