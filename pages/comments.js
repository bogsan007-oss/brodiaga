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


document.getElementById('write-to-author').onclick = () => {
    document.getElementById('private-form').style.display = 'block';
};
