// =========================
// ПЛЕЕР (МОБИЛЬНЫЙ)
// =========================

// Кнопка ▶ (мобильная)
const btn = document.querySelector('.play-btn');

// Аудио из HTML (мобильное)
const player = document.getElementById('player');

// Название станции (мобильное)
const stationTitle = document.querySelector('.station-title');

// Текущая станция (пока одна)
let currentStation = {
    name: "Название радио",
    url: "https://radio.brodiaga.com/%D0%9F%D1%80%D0%BE%D1%81%D1%82%D0%B8%20%D0%93%D0%B0%D0%B3%D0%B0%D1%80%D0%B8%D0%BD.mp3"
};

// Устанавливаем название (мобильное)
stationTitle.textContent = currentStation.name;

// Обработчик кнопки ▶ (мобильный)
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
// ПЛЕЕР (ПК-ВЕРСИЯ)
// =========================

// ПК-кнопка ▶
const btnDesktop = document.querySelector('.play-btn-desktop');

// ПК-аудио
const playerDesktop = document.getElementById('player-desktop');

// Обработчик кнопки ▶ (ПК)
if (btnDesktop && playerDesktop) {
    btnDesktop.addEventListener('click', () => {
        if (playerDesktop.paused) {
            playerDesktop.src = currentStation.url;
            playerDesktop.play();
            btnDesktop.classList.add('pause');
        } else {
            playerDesktop.pause();
            btnDesktop.classList.remove('pause');
        }
    });
}


// =========================
// ВИЗУАЛИЗАТОР (МОБИЛЬНЫЙ)
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
// =========================
// ВИЗУАЛИЗАТОР (ПК-ВЕРСИЯ)
// =========================

const canvasDesktop = document.getElementById('visualizer-desktop');
let drawDesktop = null;
let audioCtxDesktop = null;

if (canvasDesktop && playerDesktop) {

    const ctxDesktop = canvasDesktop.getContext('2d');

    // Подгоняем канвас под CSS-ширину и высоту
    canvasDesktop.width = canvasDesktop.clientWidth;
    canvasDesktop.height = canvasDesktop.clientHeight;

    audioCtxDesktop = new (window.AudioContext || window.webkitAudioContext)();
    const sourceDesktop = audioCtxDesktop.createMediaElementSource(playerDesktop);
    const analyserDesktop = audioCtxDesktop.createAnalyser();

    analyserDesktop.fftSize = 256;
    sourceDesktop.connect(analyserDesktop);
    analyserDesktop.connect(audioCtxDesktop.destination);

    drawDesktop = function () {
        requestAnimationFrame(drawDesktop);

        const bufferLength = analyserDesktop.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserDesktop.getByteFrequencyData(dataArray);

        ctxDesktop.clearRect(0, 0, canvasDesktop.width, canvasDesktop.height);

        const barWidth = (canvasDesktop.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 5;

            ctxDesktop.fillStyle = '#ffd700'; // золото
            ctxDesktop.fillRect(
                x,
                canvasDesktop.height - barHeight,
                barWidth,
                barHeight
            );

            x += barWidth + 1;
        }
    };
}


// =========================
// ПРЕВЬЮ (ПК-ВЕРСИЯ)
// =========================

const previewDesktopImg = document.getElementById('preview-desktop-img');
const previewDesktopTitle = document.getElementById('preview-desktop-title');

// Устанавливаем превью при загрузке
if (previewDesktopImg && previewDesktopTitle) {
    previewDesktopImg.src = currentStation.img || "assets/stations/default.png";
    previewDesktopTitle.textContent = currentStation.name;
}
// =========================
// ОБЩИЙ onplay ДЛЯ ПК-ПЛЕЕРА
// =========================

playerDesktop.onplay = () => {

    // Визуализатор
    if (audioCtxDesktop && drawDesktop) {
        audioCtxDesktop.resume();
        drawDesktop();
    }

    // Превью
    if (previewDesktopImg && previewDesktopTitle) {
        previewDesktopImg.src = currentStation.img || "assets/stations/default.png";
        previewDesktopTitle.textContent = currentStation.name;
    }
};


