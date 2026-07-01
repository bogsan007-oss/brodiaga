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

const btn = document.querySelector('.play-btn');
const player = document.getElementById('player');

btn.addEventListener('click', () => {
    if (player.paused) {
        player.play();
        btn.classList.add('pause');
    } else {
        player.pause();
        btn.classList.remove('pause');
    }
});
const player = document.getElementById('player');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// Подгоняем канвас под CSS-ширину и высоту
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(player);
const analyser = audioCtx.createAnalyser();

analyser.fftSize = 256;
source.connect(analyser);
analyser.connect(audioCtx.destination);

function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 1.2;

        ctx.fillStyle = '#ffd700'; // золото
        ctx.fillRect(
            x,
            canvas.height - barHeight,
            barWidth,
            barHeight
        );

        x += barWidth + 1;
    }
}

player.onplay = () => {
    audioCtx.resume();
    draw();
};
