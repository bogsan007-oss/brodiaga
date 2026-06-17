(async function() {

  // 🔑 ВСТАВЬ СВОИ ДАННЫЕ
  const YT_API_KEY = 'ТВОЙ_YOUTUBE_API_KEY';
  const CHANNEL_ID = 'ТВОЙ_CHANNEL_ID';
  const BLOG_ID = 'ТВОЙ_BLOG_ID';

  const cardsRoot = document.getElementById('cards-root');
  if (!cardsRoot) return;

  function createCard(item) {
    const el = document.createElement('a');
    el.className = 'track-card';
    el.href = item.url;

    el.innerHTML = `
      <div class='card-top-line'></div>
      <img class='card-cover' src='${item.cover}' alt='cover'>
      <div class='card-title'>${item.title}</div>
      <div class='card-desc'>${item.desc}</div>
      <div class='card-btn'>Слушать</div>
    `;

    return el;
  }

  async function loadYouTube() {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${YT_API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet` +
      `&order=date` +
      `&maxResults=50`;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return [];

    return data.items
      .filter(v => v.id && v.id.videoId)
      .map(v => ({
        type: 'youtube',
        date: new Date(v.snippet.publishedAt),
        title: v.snippet.title,
        desc: (v.snippet.description || '').substring(0, 120),
        cover: v.snippet.thumbnails && v.snippet.thumbnails.medium
          ? v.snippet.thumbnails.medium.url
          : '',
        url: 'https://www.youtube.com/watch?v=' + v.id.videoId
      }));
  }

  async function loadPosts() {
    const url =
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts` +
      `?key=${YT_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map(p => {
      const text = (p.content || '').replace(/<[^>]+>/g, '');
      const img =
        p.images && p.images.length
          ? p.images[0].url
          : 'https://via.placeholder.com/400x250?text=No+Image';

      return {
        type: 'post',
        date: new Date(p.published),
        title: p.title,
        desc: text.substring(0, 120),
        cover: img,
        url: p.url
      };
    });
  }

  try {
    const yt = await loadYouTube();
    const posts = await loadPosts();

    const all = [...yt, ...posts].sort((a, b) => b.date - a.date);

    all.forEach(item => {
      cardsRoot.appendChild(createCard(item));
    });
  } catch (e) {
    console.error('Cards loader error:', e);
  }

})();
