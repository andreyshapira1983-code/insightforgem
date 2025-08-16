// netlify/functions/updateBackground.js
import { Blobs } from '@netlify/blobs'

export const handler = async (event) => {
  // простейшая проверка админ-токена из заголовка
  const hdr = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || ''
  const need = process.env.X_ADMIN_TOKEN || ''
  if (!need || hdr !== need) {
    return resp(401, { ok: false, error: 'unauthorized' })
  }

  try {
    // --- инициализация Blobs ---
    const client = new Blobs({
      // Если Blobs включены в Labs — всё заведётся и без этого,
      // но оставляем параметры на случай отсутствия Labs.
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    })

    // Здесь просто сохраняем "версию фона" и дату. 
    // (При желании можно хранить тут URL/настройки фона.)
    const key = 'background/meta.json'
    const payload = {
      version: Date.now(),
      updatedAt: new Date().toISOString(),
      note: 'Background updated from admin panel'
    }

    await client.set(key, JSON.stringify(payload), {
      contentType: 'application/json'
    })

    return resp(200, { ok: true, updated: payload })
  } catch (err) {
    return resp(500, { ok: false, error: String(err && err.message || err) })
  }
}

function resp(status, body) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body, null, 2)
  }
}
