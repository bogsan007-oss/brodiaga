import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Подключение к Supabase
const supabaseUrl = 'https://uyclsolpcfmlhdpvnfji.supabase.co'
const supabaseKey = 'sb_publishable_5RFic9tFvNRGRvYmNnDWnA_QXjuCSDy'
const supabase = createClient(supabaseUrl, supabaseKey)

// Получаем ID видео из URL
const urlParams = new URLSearchParams(window.location.search)
const videoId = urlParams.get('video') || 'default'

// Загружаем комментарии при загрузке страницы
document.addEventListener('DOMContentLoaded', loadComments)

// Функция загрузки комментариев
async function loadComments() {
    const list = document.querySelector('.comments-list')
    list.innerHTML = '<p>Загрузка...</p>'

    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', videoId)
        .order('date', { ascending: true })

    if (error) {
        list.innerHTML = '<p>Ошибка загрузки комментариев</p>'
        console.error(error)
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
            <div class="comment-date">${new Date(c.date).toLocaleString('ru-RU')}</div>
        `
        list.appendChild(div)
    })
}

// Функция отправки комментария
async function sendComment() {
    const textarea = document.getElementById('commentText')
    const text = textarea.value.trim()

    if (!text) return

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
        console.error(error)
        return
    }

    textarea.value = ''
    loadComments()
}

// Показать форму личного сообщения
document.getElementById('write-to-author').onclick = () => {
    document.getElementById('private-form').style.display = 'block'
}

// Делаем функцию доступной для HTML-кнопки
window.sendComment = sendComment;
