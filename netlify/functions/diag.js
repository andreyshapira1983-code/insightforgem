// ESM Netlify Function: GET /.netlify/functions/diag?role=gen
export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event?.rawQuery || "");
    const role = params.get("role") || "gen";

    const roles = JSON.parse(
      process.env.ROLES_JSON ||
        '{"admin":[],"design":[],"gen":["OPENAI_KEY_GEN"],"guard":[],"research":[],"support":[]}'
    );

    const allowFallback = String(process.env.ALLOW_FALLBACK || "false").toLowerCase() === "true";
    const fallbackKeyName = process.env.FALLBACK_KEY_NAME || "OPENAI_API_KEY";

    const names = Array.isArray(roles[role]) ? roles[role] : [];
    const tried = [];
    let picked;

    for (const name of names) {
      tried.push(name);
      if (process.env[name]) {
        picked = name;
        break;
      }
    }

    if (!picked && allowFallback) {
      tried.push(fallbackKeyName);
      if (process.env[fallbackKeyName]) picked = fallbackKeyName;
    }

    const body = {
      roles,
      role,
      tried,
      allowFallback,
      fallbackKeyName,
      ok: Boolean(picked),
      now: new Date().toISOString()
    };

    return {
      statusCode: picked ? 200 : 503,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: String(err) })
    };
  }
};
