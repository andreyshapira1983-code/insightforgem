// /netlify/functions/newsPull.js
// Тянет "новости". Пока вместо реальных источников — фейковые данные.
// Позже можно подключить API (например, RSS, Google News, свой бекенд).

export async function handler(event) {
  try {
    const token = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
    if (!token || token !== process.env.X_ADMIN_TOKEN) {
      return json(401, { ok: false, error: "unauthorized" });
    }

    // Пока заглушка: массив "новостей"
    const news = [
      { id: 1, title: "🚀 Новый релиз сайта StarGalaxy", date: "2025-08-16" },
      { id: 2, title: "✨ Добавлена анимация фона", date: "2025-08-15" },
      { id: 3, title: "🔧 Поправлены иконки входа", date: "2025-08-14" }
    ];

    return json(200, { ok: true, news, fetchedAt: new Date().toISOString() });
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
