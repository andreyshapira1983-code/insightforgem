export function allowedOrigin(event) {
  const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
  const origin = event.headers?.origin || '';
  return origins.includes(origin) ? origin : origins[0] || 'http://localhost';
}

export function corsHeaders(event, methods = 'GET,POST,OPTIONS') {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(event),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export function preflight(event, methods = 'GET,POST,OPTIONS') {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(event, methods),
      body: ''
    };
  }
  return null;
}

export function selectApiKey(role = 'default') {
  const envVar = `OPENAI_API_KEYS_${role.toUpperCase()}`;
  const raw = process.env[envVar] || process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY || '';
  const keys = raw.split(',').map(k => k.trim()).filter(Boolean);
  if (!keys.length) return null;
  const index = Math.floor(Date.now() / 60000) % keys.length;
  return keys[index];
}
