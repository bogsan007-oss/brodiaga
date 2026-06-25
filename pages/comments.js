.mini-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #111;
    padding: 8px 12px;
    border-bottom: 1px solid #333;
    height: 60px;
    box-sizing: border-box;
    overflow: hidden; /* не даём логотипу вылезать */
}

.mini-logo {
    height: 45px;      /* фиксируем высоту */
    width: auto;       /* ширина подстраивается */
    max-width: 120px;  /* не даём убежать вправо */
    object-fit: contain;
}

.back-btn {
    color: #fac115;
    font-size: 16px;
    cursor: pointer;
    white-space: nowrap;
}

document.getElementById('write-to-author').onclick = () => {
    document.getElementById('private-form').style.display = 'block';
};
