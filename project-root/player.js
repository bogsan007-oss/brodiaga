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

    // сохраняем станцию
    currentStation.url = streamUrl;
    currentStation.preview = previewUrl;

    // меняем поток
    playerDesktop.src = streamUrl;

    // меняем превью
    if (previewImg) {
        previewImg.src = previewUrl;
    }
}

/* ============================
   КНОПКА PLAY (ПК)
============================ */

if (btnDesktop && playerDesktop) {
    btnDesktop.addEventListener("click", () => {

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
   ВИЗУАЛИЗАТОР (ПК)
============================ */

const canvasDesktop = document.getElementById("visualizer-desktop");

if (canvasDesktop && playerDesktop) {

    const ctx = canvasDesktop.getContext("2d");

    canvasDesktop.width = canvasDesktop.clientWidth;
    canvasDesktop.height = canvasDesktop.clientHeight;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(playerDesktop);
    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

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

    playerDesktop.onplay = () => {
        audioCtx.resume();
        draw();
    };
}
