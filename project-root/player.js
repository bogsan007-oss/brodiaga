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
