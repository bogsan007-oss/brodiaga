function sendComment() {
    const textarea = document.getElementById("commentText");
    const text = textarea.value.trim();
    if (!text) return;

    const comments = JSON.parse(localStorage.getItem(storageKey) || "[]");

    comments.push({
        text,
        date: new Date().toLocaleString("ru-RU")
    });

    localStorage.setItem(storageKey, JSON.stringify(comments));

    textarea.value = "";
    loadComments();
}
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("video") || "test";
const storageKey = "comments_" + videoId;

function loadComments() {
    const list = document.querySelector(".comments-list");
    list.innerHTML = "";
    const comments = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (comments.length === 0) {
        list.innerHTML = "<p>Комментариев пока нет...</p>";
        return;
    }

    comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = `
            <div class="comment-text">${c.text}</div>
            <div class="comment-date">${c.date}</div>
        `;
        list.appendChild(div);
    });
}

function sendComment() {
    const textarea = document.getElementById("commentText");
    const text = textarea.value.trim();
    if (!text) return;

    const comments = JSON.parse(localStorage.getItem(storageKey) || "[]");
    comments.push({ text, date: new Date().toLocaleString("ru-RU") });
    localStorage.setItem(storageKey, JSON.stringify(comments));

    textarea.value = "";
    loadComments();
}

loadComments();


document.getElementById('write-to-author').onclick = () => {
    document.getElementById('private-form').style.display = 'block';
};
