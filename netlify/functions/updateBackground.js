// /netlify/functions/updateBackground.js
// Обновляет фон сайта и пишет его в Netlify Blobs: app-state/config.json
// Защищено заголовком X-Admin-Token (значение в переменной окружения X_ADMIN_TOKEN)

export async function handler(event) {
  try {
    // --- авторизация по админ-ключу ---
    const token = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
    if (!token || token !== process.env.X_ADMIN_TOKEN) {
      return json(401, { ok: false, error: "unauthorized" });
    }

    // --- читаем тело запроса (можно передать конкретный URL фона) ---
    let payload = {};
    if (event.httpMethod === "POST" && event.body) {
      try { payload = JSON.parse(event.body); } catch {}
    }

    // пул на случай, если не передали явный url
    const POOL = [
      "/assets/bg/nebula-1.jpg",
      "/assets/bg/nebula-2.jpg",
      "/assets/bg/nebula-3.jpg"
    ];

    // подключаем Blobs (динамический import — работает на Netlify)
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "app-state" });

    // читаем текущий конфиг
    const currentRaw = await store.get("config.json");
    const cfg = currentRaw ? JSON.parse(currentRaw) : {};

    // решаем, какой фон ставить
    let nextUrl = (payload && typeof payload.url === "string" && payload.url.trim()) ? payload.url.trim() : null;
    if (!nextUrl) {
      // крутим по кругу, если url не задан
      const idx = Number(cfg.ui?.bgIndex ?? -1);
      const next = (idx + 1) % POOL.length;
      nextUrl = POOL[next];
      cfg.ui = { ...(cfg.ui || {}), bgIndex: next };
    }

    // простая проверка доступности (HEAD)
    const absolute = toAbsolute(nextUrl);
    try {
      const headRes = await fetch(absolute, { method: "HEAD" });
      if (!headRes.ok) throw new Error(`HEAD ${absolute} → ${headRes.status}`);
    } catch (e) {
      // если картинка недоступна — не заливаем битое
      return json(400, { ok: false, error: `background not reachable: ${absolute}` });
    }

    // пишем новый фон в конфиг
    cfg.ui = { ...(cfg.ui || {}), backgroundUrl: nextUrl, updatedAt: new Date().toISOString() };
    await store.set("config.json", JSON.stringify(cfg));

    return json(200, { ok: true, backgroundUrl: nextUrl, cfg });
  } catch (e) {
    return json(500, { ok: false, error: e.message || "internal_error" });
  }
}

function json(status, data) {
  return {
    statusCode: status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(data)
  };
}

// Делает абсолютный URL из относительного (для HEAD-проверки)
function toAbsolute(url) {
  try {
    // если уже абсолютный
    new URL(url);
    return url;
  } catch {}
  // относительный → домен берём из ENV (Netlify его задаёт), иначе / привяжется у клиента
  const base = process.env.URL || "";
  return base ? new URL(url, base).href : url;
}
