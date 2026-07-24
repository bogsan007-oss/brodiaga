// Находим все картинки песен
const thumbs = document.querySelectorAll('.song-thumb');

// Вешаем обработчик клика на каждую
thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
        const videoPage = thumb.dataset.video;   // Берём страницу из data-video
        if (videoPage) {
            window.location.href = videoPage;    // Переходим на страницу просмотра
        }
    });
});
