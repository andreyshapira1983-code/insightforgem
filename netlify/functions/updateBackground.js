// /netlify/functions/updateBackground.js
// Обновляет "фон" в Netlify Blobs (ключ: site-settings/background.json)
// Авторизация: заголовок x-admin-token должен совпадать с ENV X_ADMIN_TOKEN
// Требует: package.json с "@netlify/blobs" в dependencies

function json(status, data) {
  return {
    statusCode: status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(data, null, 2)
  };
}

exports.handler = async (event) => {
  // 0) Проверяем админ-токен
  const incoming = event.headers["x-admin-token"] || event.headers["X-Admin-Token"] || "";
  const expected = process.env.X_ADMIN_TOKEN || "";
  if (!expected || incoming !== expected) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  try {
    // 1) Достаем getStore динамическим импортом (совместимо с CJS)
    const { getStore } = await import("@netlify/blobs");

    // 2) Инициализируем store "site-settings"
    // Если Blobs включены в Site settings → Labs, siteID/token можно не задавать.
    // Но для гарантии читаем из ENV, если заданы.
    const store = getStore({
      name: "site-settings",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });

    // 3) Читаем текущее значение (если есть)
    const current = await store.get("background.json", { type: "json" }) || {};

    // Пул фоновых картинок (можно заменить на свои)
    const POOL = [
      "/OIP.jpg", // ваш локальный фон рядом с index.html
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"
    ];

    // 4) Если в body передали конкретный url — ставим его; иначе крутим по кругу
    let body = {};
    if (event.httpMethod === "POST" && event.body) {
      try { body = JSON.parse(event.body); } catch {}
    }

    const prevUrl = current.url || POOL[0];
    const nextUrl = typeof body.url === "string" && body.url.trim()
      ? body.url.trim()
      : POOL[(Math.max(0, POOL.indexOf(prevUrl)) + 1) % POOL.length];

    // 5) Сохраняем новое значение
    const value = { url: nextUrl, updatedAt: new Date().toISOString() };
    await store.setJSON("background.json", value);

    return json(200, { ok: true, value });
  } catch (e) {
    return json(500, { ok: false, error: e && e.message ? e.message : String(e) });
  }
};
