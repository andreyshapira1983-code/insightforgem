// /netlify/functions/weeklyReport.js
// Генерирует недельный отчёт (пример). 
// Реально данные нужно будет подтянуть из базы или API.
// Пока стоит заглушка с тестовыми данными.

export async function handler(event) {
  try {
    // Проверка авторизации
    const token = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
    if (!token || token !== process.env.X_ADMIN_TOKEN) {
      return json(401, { ok: false, error: "unauthorized" });
    }

    // Заглушка — данные отчёта
    const report = {
      generatedAt: new Date().toISOString(),
      stats: {
        users: 42,
        ideasGenerated: 137,
        comments: 58
      },
      notes: "Это тестовый отчёт. Подключи реальные источники позже."
    };

    return json(200, { ok: true, report });
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
