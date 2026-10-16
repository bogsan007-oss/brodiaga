/**
 * generate-rss.js
 * 
 * Генерирует:
 *   1. rss.xml    — стандартная RSS 2.0 лента
 *   2. rss-js.js  — JSONP-обёртка для виджета (без CORS)
 * 
 * Запуск:
 *   node generate-rss.js
 * 
 * Переменные окружения:
 *   API_KEY      — YouTube Data API v3 key
 *   PLAYLIST_IDS — список плейлистов через запятую
 */

const fs = require('fs');

// ============================
// КОНФИГУРАЦИЯ
// ============================
const API_KEY = process.env.API_KEY;
const PLAYLISTS = (process.env.PLAYLIST_IDS || '').split(',').map(p => p.trim()).filter(Boolean);
const OUTPUT_XML = 'rss.xml';
const OUTPUT_JS  = 'rss-js.js';
const BASE_URL = 'https://radio.brodiaga.com';
const CHANNEL_TITLE = 'Radio Brodiaga';
const CHANNEL_DESCRIPTION = 'Музыка, клипы, авторские песни и атмосферные видео.';
const CHANNEL_LANG = 'ru';
const MAX_ITEMS = 20;

// ============================
// ПРОВЕРКА
// ============================
if (!API_KEY) {
    console.error('❌ Ошибка: API_KEY не задан');
    process.exit(1);
}
if (!PLAYLISTS.length) {
    console.error('❌ Ошибка: PLAYLIST_IDS пустой');
    process.exit(1);
}

// ============================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================
function escapeXml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapeJs(text) {
    if (!text) return '';
    return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ');
}

function formatRssDate(isoDate) {
    const d = new Date(isoDate);
    return d.toUTCString();
}

async function fetchPlaylistVideos(playlistId, maxResults = 50) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('maxResults', String(maxResults));

    const res = await fetch(url.toString());
    if (!res.ok) {
        console.error(`❌ Ошибка плейлиста ${playlistId}: ${res.status}`);
        return [];
    }

    const data = await res.json();
    if (!data.items) return [];

    return data.items.map(item => ({
        id: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId,
        title: item.snippet.title || '',
        description: item.snippet.description || '',
        publishedAt: item.snippet.publishedAt || new Date().toISOString(),
        thumbnail: 
            item.snippet.thumbnails?.maxres?.url ||
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            ''
    })).filter(v => v.id);
}

// ============================
// ГЕНЕРАЦИЯ RSS (XML)
// ============================
function buildRssXml(videos) {
    const buildDate = new Date().toUTCString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n';
    xml += '  <channel>\n';
    xml += `    <title>${escapeXml(CHANNEL_TITLE)}</title>\n`;
    xml += `    <link>${BASE_URL}/</link>\n`;
    xml += `    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>\n`;
    xml += `    <language>${CHANNEL_LANG}</language>\n`;
    xml += `    <lastBuildDate>${buildDate}</lastBuildDate>\n`;
    xml += `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    for (const video of videos) {
        const link = `${BASE_URL}/watch/${video.id}.html`;
        const pubDate = formatRssDate(video.publishedAt);

        xml += '    <item>\n';
        xml += `      <title>${escapeXml(video.title)}</title>\n`;
        xml += `      <link>${link}</link>\n`;
        xml += `      <guid isPermaLink="true">${link}</guid>\n`;
        xml += `      <pubDate>${pubDate}</pubDate>\n`;
        xml += `      <description>${escapeXml(video.description.substring(0, 300))}</description>\n`;
        if (video.thumbnail) {
            xml += `      <enclosure url="${escapeXml(video.thumbnail)}" type="image/jpeg" />\n`;
            xml += `      <media:thumbnail url="${escapeXml(video.thumbnail)}" />\n`;
        }
        xml += '    </item>\n';
    }

    xml += '  </channel>\n';
    xml += '</rss>\n';
    return xml;
}

// ============================
// ГЕНЕРАЦИЯ JSONP (JS)
// ============================
function buildRssJs(videos) {
    // Формируем объект для виджета
    const items = videos.map(v => ({
        title: v.title,
        link: `${BASE_URL}/watch/${v.id}.html`,
        thumbnail: v.thumbnail,
        pubDate: v.publishedAt
    }));

    const json = JSON.stringify({ items: items }, null, 0);

    // Оборачиваем в вызов функции
    return `showRadioVideos(${json});\n`;
}

// ============================
// ОСНОВНАЯ ФУНКЦИЯ
// ============================
async function main() {
    console.log('');
    console.log('========================================');
    console.log('📡 Генерация RSS-ленты + JS-виджета');
    console.log('========================================');

    const allVideos = [];

    for (let i = 0; i < PLAYLISTS.length; i++) {
        console.log(`[${i + 1}/${PLAYLISTS.length}] ${PLAYLISTS[i]}`);
        const videos = await fetchPlaylistVideos(PLAYLISTS[i]);
        console.log(`   → ${videos.length} видео`);
        allVideos.push(...videos);
    }

    const uniqueMap = new Map();
    for (const v of allVideos) {
        if (!uniqueMap.has(v.id)) uniqueMap.set(v.id, v);
    }

    const sortedVideos = [...uniqueMap.values()]
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, MAX_ITEMS);

    console.log('');
    console.log(`📊 Всего уникальных: ${uniqueMap.size}`);
    console.log(`📋 В ленте: ${sortedVideos.length}`);
    console.log('');

    // === rss.xml ===
    const xml = buildRssXml(sortedVideos);
    fs.writeFileSync(OUTPUT_XML, xml, 'utf8');
    console.log(`✅ XML сохранён: ${OUTPUT_XML}`);

    // === rss-js.js ===
    const js = buildRssJs(sortedVideos);
    fs.writeFileSync(OUTPUT_JS, js, 'utf8');
    console.log(`✅ JS сохранён: ${OUTPUT_JS}`);

    console.log('========================================');
}

main().catch(err => {
    console.error('❌ Критическая ошибка:', err);
    process.exit(1);
});
