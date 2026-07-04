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

function initVisualizer() {
    if (!audio) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        bars.forEach((bar, i) => {
            const value = dataArray[i] / 2;   // высота верх/низ
            bar.querySelector(".top").style.height = value + "px";
            bar.querySelector(".bottom").style.height = value + "px";
        });
    }

    draw();
}

// Запуск визуализатора строго после начала воспроизведения
audio.addEventListener("play", () => {
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    if (!audioCtx) {
        initVisualizer();
    }
});

