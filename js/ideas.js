// Minimal stub: POST /.netlify/functions/ideas -> { id }
// No persistence here; client falls back to localStorage if server fails.

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Bad JSON" }) }; }

  const id = String(body.id || Date.now());
  return { statusCode: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify({ id }) };
};
