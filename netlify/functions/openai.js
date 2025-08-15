// POST /.netlify/functions/openai  -> { score, details, raw }
// Принимает: { idea: "..." } ИЛИ { model, messages, temperature?, role? }
// Ключ берём по роли (default: "gen") из ROLES_JSON с опциональным фолбэком.

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };

  // ---- parse body
  let body = {};
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Bad JSON" }) }; }

  const role = body.role || "gen";

  // ---- pick API key by role
  const roles = JSON.parse(process.env.ROLES_JSON || '{"gen":["OPENAI_KEY_GEN"]}');
  const allowFallback = String(process.env.ALLOW_FALLBACK || "false").toLowerCase() === "true";
  const fallbackKeyName = process.env.FALLBACK_KEY_NAME || "OPENAI_API_KEY";
  const names = Array.isArray(roles[role]) ? roles[role] : [];
  let keyName;
  for (const n of names) if (process.env[n]) { keyName = n; break; }
  if (!keyName && allowFallback && process.env[fallbackKeyName]) keyName = fallbackKeyName;
  if (!keyName) {
    return { statusCode: 503, headers: cors, body: JSON.stringify({ error: `No API key for role ${role}` }) };
  }
  const apiKey = process.env[keyName];

  // ---- build messages
  const model = body.model || "gpt-4o-mini";
  let messages = body.messages;
  if (!messages && typeof body.idea === "string" && body.idea.trim()) {
    messages = [
      { role: "system", content:
        "You are an expert analyst. Reply as plain text. First line: 'Score: <0..100>'. Then lines: 'Verdict:', 'Recommendations:', 'Risks:', 'Next Steps:', 'Patentability:' with short text." },
      { role: "user", content: body.idea.trim() }
    ];
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Provide 'idea' or OpenAI 'messages'." }) };
  }

  // ---- call OpenAI
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: typeof body.temperature === "number" ? body.temperature : 0.7
      })
    });

    const text = await resp.text();
    if (!resp.ok) {
      return { statusCode: resp.status, headers: cors, body: JSON.stringify({ error: "Upstream error", detail: text.slice(0, 800) }) };
    }
    const data = JSON.parse(text);
    const content = data?.choices?.[0]?.message?.content || "";

    // ---- parse model output
    const lines = String(content).split(/\n/).map(l => l.trim()).filter(Boolean);
    let score = 0; const details = {};
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!score && lower.startsWith("score")) {
        const m = line.match(/(\d{1,3})/); if (m) score = Math.max(0, Math.min(100, parseInt(m[1], 10)));
      } else if (lower.startsWith("verdict")) details.verdict = line.split(":").slice(1).join(":").trim();
      else if (lower.startsWith("recommendations")) details.recommendations = line.split(":").slice(1).join(":").trim();
      else if (lower.startsWith("risks")) details.risks = line.split(":").slice(1).join(":").trim();
      else if (lower.startsWith("next")) details.nextSteps = line.split(":").slice(1).join(":").trim();
      else if (lower.startsWith("patent")) details.patentability = line.split(":").slice(1).join(":").trim();
    }

    return {
      statusCode: 200,
      headers: { ...cors, "content-type": "application/json" },
      body: JSON.stringify({ score, details, raw: content })
    };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "Function error", message: String(e) }) };
  }
};
