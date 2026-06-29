console.log("СКРИПТ ЗАПУСТИЛСЯ!");

const supabaseUrl = "https://uyclsolpcfmlhdpvnfji.supabase.co";
const supabaseKey = "sb-publishable-5RFic9tFvNRGRvYmNnDWnA_QXjuCSDy";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("video");

console.log("videoId:", videoId);

document.getElementById("sendComment").addEventListener("click", async () => {
    console.log("Кнопка нажата!");

    const text = document.getElementById("commentText").value.trim();
    if (!text) return alert("Введите текст комментария");

    const { data, error } = await supabase
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

    if (error) return alert("Ошибка: " + error.message);

    alert("Комментарий отправлен!");
    document.getElementById("commentText").value = "";
});
