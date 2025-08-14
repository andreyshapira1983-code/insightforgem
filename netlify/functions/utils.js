const ALLOWED_ORIGIN = process.env.SITE_ORIGIN || 'https://example.com';

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export function preflight(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  return null;
}

let keyIndex = 0;
export function getApiKey() {
  const list = (process.env.OPENAI_API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  if (list.length === 0) {
    return process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  }
  const key = list[keyIndex % list.length];
  keyIndex++;
  return key;
}

export function json(statusCode, data) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify(data) };
}
