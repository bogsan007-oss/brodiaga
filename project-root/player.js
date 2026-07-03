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
   АУДИО-КОНТЕКСТ И ВИЗУАЛИЗАТОР
============================ */

let audioCtx = null;
let analyser = null;
let audioSource = null;

const canvasDesktop = document.getElementById("visualizer-desktop");
let ctx = canvasDesktop ? canvasDesktop.getContext("2d") : null;

/* ============================
   ЗАПУСК ВИЗУАЛИЗАТОРА
============================ */

function startVisualizer() {
    if (!canvasDesktop || !playerDesktop) return;

    // создаём AudioContext только один раз
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // создаём источник только один раз
    if (!audioSource) {
        audioSource = audioCtx.createMediaElementSource(playerDesktop);
        analyser = audioCtx.createAnalyser();

        analyser.fftSize = 256;
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    canvasDesktop.width = canvasDesktop.clientWidth;
    canvasDesktop.height = canvasDesktop.clientHeight;

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
   СМЕНА СТАНЦИИ
============================ */

function setStation(streamUrl, previewUrl) {

    currentStation.url = streamUrl;
    currentStation.preview = previewUrl;

    // меняем поток
    playerDesktop.src = streamUrl;

    // запускаем звук
    playerDesktop.play().then(() => {

        // активируем AudioContext
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        // запускаем визуализатор только после начала звука
        startVisualizer();

    }).catch(() => {
        console.log("Нужно кликнуть по странице");
    });

    // меняем превью
    if (previewImg) {
        previewImg.src = previewUrl;
    }
}

/* ============================
   КНОПКА PLAY
============================ */

if (btnDesktop && playerDesktop) {
    btnDesktop.addEventListener("click", () => {

        // активируем AudioContext
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        if (playerDesktop.paused) {
            playerDesktop.play().then(() => {
                startVisualizer();
            });
            btnDesktop.classList.add("pause");
        } else {
            playerDesktop.pause();
            btnDesktop.classList.remove("pause");
        }
    });
}
