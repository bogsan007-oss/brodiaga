// === ПЛЕЕР ===
const playerDesktop = document.getElementById("player-desktop");
const btnDesktop = document.querySelector(".play-btn-desktop");
const previewImg = document.querySelector(".preview-right img");

function setStation(streamUrl, previewUrl) {
    playerDesktop.src = streamUrl;
    previewImg.src = previewUrl;

    playerDesktop.play().catch(() => {
        console.log("Нужно кликнуть по странице");
    });
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


// === ВИЗУАЛИЗАТОР ===

const audio = playerDesktop;
const visualizer = document.getElementById("visualizer");
const bars = visualizer.querySelectorAll(".bar");

let audioCtx = null;
let analyser = null;
let source = null;
let started = false;

function initVisualizer() {

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!source) {
        source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();

        analyser.fftSize = 256;

        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    if (started) return;
    started = true;

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

audio.addEventListener("play", () => {
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    initVisualizer();
});
