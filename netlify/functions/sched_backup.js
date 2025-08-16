// netlify/functions/sched_backup.js
const { notifyTG } = require('./_callCommand');
const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));
const { Blobs } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = new Blobs({
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    const list = await store.list();
    const snapshot = {};
    for (const k of list.blobs) {
      snapshot[k.key] = await store.get(k.key);
    }

    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const body  = JSON.stringify(snapshot, null, 2);

    if (process.env.GIST_ID) {
      const r = await fetch(`https://api.github.com/gists/${process.env.GIST_ID}`, {
        method:'PATCH',
        headers:{ 'Authorization':`Bearer ${process.env.GH_TOKEN}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ files: { [`blobs-${stamp}.json`]: { content: body } } })
      });
      if (!r.ok) throw new Error('Gist backup failed');
    }

    const msg = `💾 Blobs backup done: ${Object.keys(snapshot).length} keys`;
    await notifyTG(msg);
    return { statusCode: 200, body: msg };
  } catch (e) {
    const msg = `🛑 Backup failed: ${e.message}`;
    await notifyTG(msg);
    return { statusCode: 500, body: msg };
  }
};
