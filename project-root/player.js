// =========================
// ПЛЕЕР
// =========================

// Кнопка ▶
const btn = document.querySelector('.play-btn');

// Аудио из HTML
const player = document.getElementById('player');

// Название станции
const stationTitle = document.querySelector('.station-title');

// Текущая станция (пока одна)
let currentStation = {
    name: "Название радио",
    url: "https://radio.brodiaga.com/%D0%9F%D1%80%D0%BE%D1%81%D1%82%D0%B8%20%D0%93%D0%B0%D0%B3%D0%B0%D1%80%D0%B8%D0%BD.mp3"
};

// Устанавливаем название
stationTitle.textContent = currentStation.name;

// Обработчик кнопки ▶
btn.addEventListener('click', () => {
    if (player.paused) {
        player.src = currentStation.url;
        player.play();
        btn.classList.add('pause');
    } else {
        player.pause();
        btn.classList.remove('pause');
    }
});


// =========================
// ВИЗУАЛИЗАТОР
// =========================

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
        const barHeight = dataArray[i] / 5;

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
