.mini-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #111;
    padding: 8px 12px;
    border-bottom: 1px solid #333;
    height: 60px; /* фиксированная высота, чтобы логотип поместился */
    box-sizing: border-box;
}

.mini-logo {
    height: 45px; /* логотип всегда помещается */
    width: auto;
    object-fit: contain;
}

.back-btn {
    color: #fac115;
    font-size: 16px;
    cursor: pointer;
    white-space: nowrap; /* текст не переносится */
}

document.getElementById('write-to-author').onclick = () => {
    document.getElementById('private-form').style.display = 'block';
};
