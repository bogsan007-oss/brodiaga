/**
 * generate-pages.js
 * 
 * Генерирует статические HTML-страницы для каждого видео YouTube.
 */

const fs = require('fs');
const path = require('path');

// ============================
// КОНФИГУРАЦИЯ
// ============================
const API_KEY = process.env.API_KEY;
const PLAYLISTS = (process.env.PLAYLIST_IDS || '').split(',').map(p => p.trim()).filter(Boolean);
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'watch';
const TEMPLATE_FILE = 'watch-template.html';
const BASE_URL = 'https://radio.brodiaga.com';

// ============================
// ПРОВЕРКА КОНФИГУРАЦИИ
// ============================
if (!API_KEY) {
    console.error('❌ Ошибка: переменная API_KEY не задана');
    process.exit(1);
}
if (!PLAYLISTS.length) {
    console.error('❌ Ошибка: переменная PLAYLIST_IDS пустая');
    process.exit(1);
}
if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`❌ Ошибка: шаблон ${TEMPLATE_FILE} не найден`);
    process.exit(1);
}

// ============================
// ЗАГРУЗКА ШАБЛОНА
// ============================
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
console.log(`✅ Шаблон загружен: ${TEMPLATE_FILE}`);

// ============================
// СОЗДАНИЕ ПАПКИ
// ============================
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Создана папка: ${OUTPUT_DIR}`);
} else {
    console.log(`ℹ️  Папка уже существует: ${OUTPUT_DIR}`);
}

// ============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function truncate(text, maxLength = 160) {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return clean.substring(0, maxLength - 1).trim() + '…';
}

async function fetchPlaylistVideos(playlistId) {
    const videos = [];
    let pageToken = '';

    while (true) {
        const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
        url.searchParams.set('key', API_KEY);
        url.searchParams.set('playlistId', playlistId);
        url.searchParams.set('part', 'snippet,contentDetails');
        url.searchParams.set('maxResults', '50');
        if (pageToken) url.searchParams.set('pageToken', pageToken);

        const res = await fetch(url.toString());
        
        // ИСПРАВЛЕНО: теперь скрипт упадет с ошибкой, если API не ответил
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Ошибка API ${res.status} для плейлиста ${playlistId}: ${errorText}`);
        }

        const data = await res.json();
        if (!data.items || !data.items.length) break;

        for (const item of data.items) {
            const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
            if (!videoId) continue;

            videos.push({
                id: videoId,
                title: item.snippet.title || 'Без названия',
                description: item.snippet.description || '',
                publishedAt: item.snippet.publishedAt || '',
                thumbnail: 
                    item.snippet.thumbnails?.maxres?.url ||
                    item.snippet.thumbnails?.high?.url ||
                    item.snippet.thumbnails?.medium?.url ||
                    ''
            });
        }

        if (!data.nextPageToken) break;
        pageToken = data.nextPageToken;
    }

    return videos;
}

function generatePage(video) {
    const canonicalUrl = `${BASE_URL}/${OUTPUT_DIR}/${video.id}.html`;
    const shortDescription = truncate(video.description, 160);
    const publishDate = video.publishedAt 
        ? new Date(video.publishedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    let html = template
        .replace(/\{\{VIDEO_ID\}\}/g, escapeHtml(video.id))
        .replace(/\{\{VIDEO_TITLE\}\}/g, escapeHtml(video.title))
        .replace(/\{\{VIDEO_DESCRIPTION\}\}/g, escapeHtml(shortDescription))
        .replace(/\{\{VIDEO_THUMB\}\}/g, escapeHtml(video.thumbnail))
        .replace(/\{\{VIDEO_DATE\}\}/g, escapeHtml(publishDate))
        .replace(/\{\{CANONICAL_URL\}\}/g, escapeHtml(canonicalUrl));

    const filePath = path.join(OUTPUT_DIR, `${video.id}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    return filePath;
}

// ============================
// ОСНОВНАЯ ФУНКЦИЯ
// ============================
async function main() {
    console.log('========================================');
    console.log('🚀 Генерация страниц для видео');
    console.log('========================================');
    console.log(`📁 Папка вывода: ${OUTPUT_DIR}`);
    console.log(`📋 Плейлистов: ${PLAYLISTS.length}`);
    console.log('');

    const allVideos = new Map();

    for (let i = 0; i < PLAYLISTS.length; i++) {
        const playlistId = PLAYLISTS[i];
        console.log(`[${i + 1}/${PLAYLISTS.length}] Загрузка плейлиста: ${playlistId}`);
        
        const videos = await fetchPlaylistVideos(playlistId);
        console.log(`   → Найдено: ${videos.length} видео`);

        for (const video of videos) {
            if (!allVideos.has(video.id)) {
                allVideos.set(video.id, video);
            }
        }
    }

    console.log('');
    console.log(`📊 Уникальных видео: ${allVideos.size}`);
    console.log('');

    let created = 0;
    let errors = 0;

    for (const video of allVideos.values()) {
        try {
            generatePage(video);
            created++;
            if (created % 20 === 0 || created === allVideos.size) {
                console.log(`   ✅ Создано: ${created} / ${allVideos.size}`);
            }
        } catch (err) {
            errors++;
            console.error(`   ❌ Ошибка для ${video.id}: ${err.message}`);
        }
    }

    console.log('');
    console.log('========================================');
    console.log(`✅ Готово!`);
    console.log(`   Создано страниц: ${created}`);
    console.log(`   Ошибок: ${errors}`);
    console.log(`   Папка: ${OUTPUT_DIR}/`);
    console.log('========================================');
}

main().catch(err => {
    console.error('❌ Критическая ошибка:', err);
    process.exit(1);
});
