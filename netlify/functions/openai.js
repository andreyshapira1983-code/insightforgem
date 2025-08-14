// Netlify Function: /.netlify/functions/openai
//
// Acts as a proxy to the OpenAI API so that the secret API key can
// remain on the server.  The function expects a POST request with a
// JSON body identical to the OpenAI API payload.  It forwards the
// request to OpenAI using the API key stored in `process.env.OPENAI_API_KEY`
// (or `process.env.OPEN_API_KEY` as a fallback) and returns the
// response.  This prevents exposing the key to the client.

export async function handler(event) {
  // Allow preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // Parse the payload
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }
  // Set sensible defaults if not provided
if (!payload.model || payload.model === 'gpt-4o-mini') {
  payload.model = 'gpt-4o';
}
  if (typeof payload.temperature === 'undefined') payload.temperature = 0.7;
  // Determine API key
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing OpenAI API key in environment' })
    };
  }
  // Determine endpoint (use chat completions endpoint for chat models)
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  try {
    // Use native fetch if available (Node 18) or import node-fetch
    let fetchFn;
    if (typeof fetch === 'function') {
      fetchFn = fetch;
    } else {
      const nodeFetch = await import('node-fetch');
      fetchFn = nodeFetch.default;
    }
    const res = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return {
      statusCode: res.ok ? 200 : res.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
}
