// GET /.netlify/functions/stats -> site statistics
export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors };
  if (event.httpMethod !== "GET")
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };

  console.log("stats", { time: new Date().toISOString() });
  return {
    statusCode: 200,
    headers: { ...cors, "content-type": "application/json" },
    body: JSON.stringify({ ok: true, users: 0, ideas: 0 })
  };
};
