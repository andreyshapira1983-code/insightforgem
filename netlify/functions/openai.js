import { corsHeaders, preflight, selectApiKey } from './utils.js';

export async function handler(event) {
  const pre = preflight(event, 'POST,OPTIONS');
  if (pre) return pre;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(event), body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  if (!payload.model || payload.model === 'gpt-4o-mini') {
    payload.model = 'gpt-4o';
  }
  if (typeof payload.temperature === 'undefined') payload.temperature = 0.7;

  const apiKey = selectApiKey("openai");
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Missing OpenAI API key in environment' })
    };
  }

  const endpoint = 'https://api.openai.com/v1/chat/completions';
  try {
    const fetchFn = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;
    const res = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return {
      statusCode: res.ok ? 200 : res.status,
      headers: corsHeaders(event),
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: err.message })
    };
  }
}
