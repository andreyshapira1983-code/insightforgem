// /netlify/functions/refreshSite.js
// Тригерит пересборку сайта через Netlify Build Hook.
// Защита: заголовок X-Admin-Token должен совпадать с ENV X_ADMIN_TOKEN.
// Требуется ENV: SITE_BUILD_HOOK_URL (URL build hook’а на Netlify).

export async function handler(event) {
  try {
    // --- auth ---
    const token = event.headers["x-admin-token"] || event.headers["X-Admin-Token"];
    if (!token || token !== process.env.X_ADMIN_TOKEN) {
      return json(401, { ok: false, error: "unauthorized" });
    }

    const HOOK = process.env.SITE_BUILD_HOOK_URL;
    if (!HOOK) {
      return json(500, { ok: false, error: "missing SITE_BUILD_HOOK_URL env var" });
    }

    // читаем тело (опционально): { reason?: string, clearCache?: boolean }
    let payload = {};
    if (event.httpMethod === "POST" && event.body) {
      try { payload = JSON.parse(event.body); } catch { /* ignore */ }
    }

    // поддержка очистки кэша Netlify: ?clear_cache=true
    const url = new URL(HOOK);
    if (payload.clearCache) {
      url.searchParams.set("clear_cache", "true");
    }

    const meta = {
      from: "refreshSite.js",
      reason: typeof payload.reason === "string" && payload.reason.trim() ? payload.reason.trim() : "admin refresh",
      at: new Date().toISOString()
    };

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(meta)
    });

    const text = await res.text().catch(() => "");

    // маскируем id хука в ответе
    const masked = url.toString().replace(/(build_hooks\/)[^?]+/, "$1***");

    return json(res.ok ? 200 : res.status, {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      hook: masked,
      meta,
      response: text.slice(0, 1000)
    });
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
