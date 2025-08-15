// GET /.netlify/functions/search?query=... -> { results: [...] }
// Proxy to an external search provider, injecting the API key server-side.

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const query = event.queryStringParameters?.query || "";
  if (!query.trim()) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Missing query" }) };
  }

  const apiUrl = process.env.SEARCH_API_URL || "";
  const apiKey = process.env.OPEN_API_KEY || "";
  if (!apiUrl || !apiKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "Search API not configured" }) };
  }

  try {
    const url = `${apiUrl}?query=${encodeURIComponent(query)}`;
    const resp = await fetch(url, { headers: { authorization: `Bearer ${apiKey}` } });
    const text = await resp.text();
    if (!resp.ok) {
      return { statusCode: resp.status, headers: cors, body: JSON.stringify({ error: "Upstream", detail: text.slice(0, 800) }) };
    }
    return { statusCode: 200, headers: { ...cors, "content-type": "application/json" }, body: text };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "Function error", message: String(e) }) };
  }
};

