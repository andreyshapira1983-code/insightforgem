// Netlify Function: /.netlify/functions/openai
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"},
      body: ""};
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body || "{}");

    // Default values if omitted
    if (!payload.model) payload.model = "gpt-4o-mini";
    if (typeof payload.temperature === "undefined") payload.temperature = 0.7;

    const r = await fetch("/.netlify/functions/openai", {
      method: "POST",
      headers: {
        .env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"},
      body: JSON.stringify(payload)});

    const data = await r.json();
    return {
      statusCode: r.ok ? 200 : r.status,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)};
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message })};
  }
}
