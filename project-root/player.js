// Загружаем аудио
const audio = new Audio();
audio.crossOrigin = "anonymous";

// Кнопка ▶
const playBtn = document.querySelector('.play-btn');

// Название станции
const stationTitle = document.querySelector('.station-title');

// Текущая станция (пока одна, потом добавим JSON)
let currentStation = {
    name: "Название радио",
    url: "https://online-radio-stream-url"
};

// Устанавливаем название
stationTitle.textContent = currentStation.name;

// Обработчик кнопки ▶
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.src = currentStation.url;
        audio.play();
        playBtn.textContent = "⏸"; // пауза
    } else {
        audio.pause();
        playBtn.textContent = "▶"; // play
    }
});
