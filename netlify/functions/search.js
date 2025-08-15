// GET /.netlify/functions/search?query=...
export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors };
  if (event.httpMethod !== "GET")
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };

  const params = new URLSearchParams(event.rawQuery || "");
  const query = params.get("query") || "";
  console.log("search", { time: new Date().toISOString(), query });
  return {
    statusCode: 200,
    headers: { ...cors, "content-type": "application/json" },
    body: JSON.stringify({ ok: true, results: [] })
  };
};
