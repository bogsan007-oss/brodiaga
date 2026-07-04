const playerDesktop = document.getElementById("player-desktop");
const btnDesktop = document.querySelector(".play-btn-desktop");
const previewImg = document.querySelector(".preview-right img");

let currentStation = {
    url: "",
    preview: ""
};

function setStation(streamUrl, previewUrl) {
    currentStation.url = streamUrl;
    currentStation.preview = previewUrl;

    playerDesktop.src = streamUrl;

    playerDesktop.play().catch(() => {
        console.log("Нужно кликнуть по странице");
    });

    previewImg.src = previewUrl;
}

btnDesktop.addEventListener("click", () => {
    if (playerDesktop.paused) {
        playerDesktop.play();
        btnDesktop.classList.add("pause");
    } else {
        playerDesktop.pause();
        btnDesktop.classList.remove("pause");
    }
});
// === ДВУХСТОРОННИЙ ВИЗУАЛИЗАТОР ===

const audio = document.getElementById("player-desktop");
const visualizer = document.getElementById("visualizer");
const bars = visualizer.querySelectorAll(".bar");

let audioCtx = null;
let analyser = null;
let source = null;

function startVisualizer() {

    // Создаём AudioContext только один раз
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Разблокировка звука
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    // Создаём источник только один раз
    if (!source) {
        source = audioCtx.createMediaElementSource(audio);
    }

    // Создаём анализатор
    analyser = audioCtx.createAnalyser();

    // Подключаем звук и в анализатор, и в динамики
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    const buffer = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(buffer);

        bars.forEach((bar, i) => {
            const v = buffer[i] / 2;
            bar.querySelector(".top").style.height = v + "px";
            bar.querySelector(".bottom").style.height = v + "px";
        });
    }

    draw();
}

// Запуск строго после начала воспроизведения
audio.addEventListener("play", () => {
    startVisualizer();
});
