import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Подключение к Supabase
const supabaseUrl = 'https://uyclsolpcfmhldpvnfji.supabase.co'   // ✔ ПРАВИЛЬНО
const supabaseKey = 'sb_publishable_5RFic9tFvNRGRvYmNnDWnA_QXjuCSDy'
const supabase = createClient(supabaseUrl, supabaseKey)

// Получаем ID видео из URL
const urlParams = new URLSearchParams(window.location.search)
const videoId = urlParams.get('video')

// Если ID нет — дальше не работаем
if (!videoId) {
    console.error('Ошибка: videoId не найден в URL')
    alert('Ошибка: ID видео не найден в адресе страницы')
}

// Загружаем комментарии при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (videoId) {
        loadComments()
    }
})

// Функция загрузки комментариев
async function loadComments() {
    const list = document.querySelector('.comments-list')
    if (!list) {
        console.error('Элемент .comments-list не найден')
        return
    }

    list.innerHTML = '<p>Загрузка...</p>'

    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', videoId)
        .order('date', { ascending: true })

    if (error) {
        list.innerHTML = '<p>Ошибка загрузки комментариев</p>'
        console.error('Ошибка загрузки комментариев:', error)
        return
    }

    if (!data || data.length === 0) {
        list.innerHTML = '<p>Комментариев пока нет...</p>'
        return
    }

    list.innerHTML = ''

    data.forEach(c => {
        const div = document.createElement('div')
        div.className = 'comment-item'
        div.innerHTML = `
            <div class="comment-text">${c.text}</div>
            <div class="comment-date">${c.date
                ? new Date(c.date).toLocaleString('ru-RU')
                : ''}</div>
        `
        list.appendChild(div)
    })
}

// Функция отправки комментария
async function sendComment() {
    const textarea = document.getElementById('commentText')
    if (!textarea) {
        console.error('Поле commentText не найдено')
        return
    }

    const text = textarea.value.trim()
    if (!text) return

    if (!videoId) {
        alert('Ошибка: ID видео не найден, комментарий не может быть отправлен')
        return
    }

    const { error } = await supabase
        .from('comments')
        .insert([
            {
                video_id: videoId,
                name: 'Гость',
                text: text,
                date: new Date().toISOString()
            }
        ])

    if (error) {
        alert('Ошибка отправки комментария')
        console.error('Ошибка отправки комментария:', error)
        return
    }

    textarea.value = ''
    loadComments()
}

// Показать форму личного сообщения
const writeBtn = document.getElementById('write-to-author')
if (writeBtn) {
    writeBtn.onclick = () => {
        const form = document.getElementById('private-form')
        if (form) {
            form.style.display = 'block'
        }
    }
}

// Делаем функцию доступной для HTML-кнопки
window.sendComment = sendComment
