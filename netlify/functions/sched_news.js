// netlify/functions/sched_news.js
const { callCommand, notifyTG } = require('./_callCommand');
const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));

exports.handler = async () => {
  const feeds = (process.env.NEWS_FEED_URLS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!feeds.length) return { statusCode: 200, body: 'NEWS_FEED_URLS empty' };

  let created = 0, errors = 0;

  for (const url of feeds) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      for (const it of items.slice(0, 5)) {
        const title = it.title || it.headline || 'Без названия';
        const body  = it.summary || it.body || it.url || '';
        await callCommand('post_news', { title, body });
        created++;
      }
    } catch {
      errors++;
    }
  }

  const msg = `📰 News: +${created} items, errors=${errors}`;
  await notifyTG(msg);
  return { statusCode: 200, body: msg };
};
