console.log("comments.js загружен и выполняется!");

/* -----------------------------
   Подключение к Supabase
----------------------------- */
const supabaseUrl = "https://uyclsolpcfmlhdpvnfji.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y2xzb2xwY2ZtbGhkcHZuZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MjE2MTYsImV4cCI6MjA5ODA5NzYxNn0.j0mM369JxDr7PCNksXlj_y0RrycRlWTP8La9pAQdiaw";

// Правильное создание клиента Supabase
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

/* -----------------------------
   Получаем video_id из URL
----------------------------- */
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("video");

console.log("videoId:", videoId);

/* -----------------------------
   Элементы страницы
----------------------------- */
const sendBtn = document.getElementById("sendComment");
const textArea = document.getElementById("commentText");
const commentsList = document.getElementById("commentsList");

/* -----------------------------
   Проверка элементов
----------------------------- */
if (!sendBtn) console.error("Кнопка sendComment НЕ найдена!");
if (!textArea) console.error("Поле commentText НЕ найдено!");
if (!commentsList) console.error("Блок commentsList НЕ найден!");

/* -----------------------------
   Отправка комментария
----------------------------- */
sendBtn.addEventListener("click", async () => {
    console.log("Кнопка нажата!");

    const text = textArea.value.trim();

    if (!text) {
        alert("Введите текст комментария");
        return;
    }

    if (!videoId) {
        alert("Ошибка: videoId не найден");
        return;
    }

    const { data, error } = await client
        .from("comments")
        .insert([
            {
                video_id: videoId,
                name: "Аноним",
                text: text,
                date: new Date().toISOString()
            }
        ]);

    console.log("data:", data);
    console.log("error:", error);

    if (error) {
        alert("Ошибка отправки: " + error.message);
        return;
    }

    alert("Комментарий отправлен!");
    textArea.value = "";

    loadComments(); // обновляем список
});

/* -----------------------------
   Загрузка комментариев
----------------------------- */
async function loadComments() {
    console.log("Загрузка комментариев...");

    const { data, error } = await client
        .from("comments")
        .select("*")
        .eq("video_id", videoId)
        .order("id", { ascending: false });

    console.log("Полученные комментарии:", data);
    console.log("Ошибка:", error);

    if (error) {
        commentsList.innerHTML = "<p>Ошибка загрузки комментариев</p>";
        return;
    }

    if (!data || data.length === 0) {
        commentsList.innerHTML = "<p>Комментариев пока нет</p>";
        return;
    }

    commentsList.innerHTML = data
        .map(c => `
            <div style="
                background:#f0f0f0;
                padding:12px;
                border-radius:8px;
                margin-bottom:10px;
            ">
                <div style="font-weight:bold;">${c.name}</div>
                <div>${c.text}</div>
                <div style="font-size:12px; color:#666; margin-top:5px;">
                    ${new Date(c.date).toLocaleString()}
                </div>
            </div>
        `)
        .join("");
}

/* -----------------------------
   Загружаем комментарии при старте
----------------------------- */
loadComments();
