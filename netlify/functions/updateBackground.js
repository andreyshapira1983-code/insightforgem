// netlify/functions/updateBackground.js
/* CommonJS-совместимо: используем динамический import() */

function resp(status, body) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body, null, 2),
  };
}

exports.handler = async (event) => {
  // 1) Проверка админ-токена
  const incoming = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';
  const expected = process.env.X_ADMIN_TOKEN || '';
  if (!expected || incoming !== expected) {
    return resp(401, { ok: false, error: 'unauthorized' });
  }

  try {
    // 2) Инициализация Netlify Blobs (ESM импорт в CJS среде)
    const { Blobs } = await import('@netlify/blobs');

    const client = new Blobs({
      // Если Blobs включены в Site Settings → Labs, эти поля могут не понадобиться,
      // но оставляем для совместимости.
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
    });

    // 3) Обновляем метаданные фона (можно расширить под свои нужды)
    const key = 'background/meta.json';
    const payload = {
      version: Date.now(),
      updatedAt: new Date().toISOString(),
      note: 'Background updated from admin panel',
    };

    await client.set(key, JSON.stringify(payload), {
      contentType: 'application/json',
    });

    return resp(200, { ok: true, updated: payload });
  } catch (err) {
    return resp(500, { ok: false, error: String(err && err.message || err) });
  }
};
