/* ============================
   ГЛАВНЫЕ ЭЛЕМЕНТЫ
============================ */

const playerDesktop = document.getElementById("player-desktop");
const btnDesktop = document.querySelector(".play-btn-desktop");
const previewImg = document.querySelector(".preview-right img");

/* ============================
   ТЕКУЩАЯ СТАНЦИЯ
============================ */

let currentStation = {
    url: "",
    preview: ""
};

/* ============================
   СМЕНА СТАНЦИИ (карточки)
============================ */

function setStation(streamUrl, previewUrl) {

    currentStation.url = streamUrl;
    currentStation.preview = previewUrl;

    // меняем поток
    playerDesktop.src = streamUrl;

    // запускаем звук
    playerDesktop.play().catch(() => {
        console.log("Нужно кликнуть по странице");
    });

    // меняем превью
    if (previewImg) {
        previewImg.src = previewUrl;
    }

    // запускаем визуализатор после смены станции
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

/* ============================
   ВИЗУАЛИЗАТОР (ПК)
============================ */

const canvasDesktop = document.getElementById("visualizer-desktop");
let audioCtx = null;
let analyser = null;
let audioSource = null;

function initVisualizer() {
    if (!canvasDesktop || !playerDesktop) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = canvasDesktop.getContext("2d");

    canvasDesktop.width = canvasDesktop.clientWidth;
    canvasDesktop.height = canvasDesktop.clientHeight;

    // создаём источник ТОЛЬКО ОДИН РАЗ
    if (!audioSource) {
        audioSource = audioCtx.createMediaElementSource(playerDesktop);
        analyser = audioCtx.createAnalyser();

        analyser.fftSize = 256;
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    function draw() {
        requestAnimationFrame(draw);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvasDesktop.width, canvasDesktop.height);

        const barWidth = (canvasDesktop.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 5;

            ctx.fillStyle = "#ffd700";
            ctx.fillRect(
                x,
                canvasDesktop.height - barHeight,
                barWidth,
                barHeight
            );

            x += barWidth + 1;
        }
    }

    draw();
}

/* ============================
   КНОПКА PLAY (ПК)
============================ */

if (btnDesktop && playerDesktop) {
    btnDesktop.addEventListener("click", () => {

        // запускаем AudioContext строго после клика
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        if (playerDesktop.paused) {
            playerDesktop.play();
            btnDesktop.classList.add("pause");
        } else {
            playerDesktop.pause();
            btnDesktop.classList.remove("pause");
        }
    });
}

/* ============================
   АВТО-ИНИЦИАЛИЗАЦИЯ ВИЗУАЛИЗАТОРА
============================ */

initVisualizer();
