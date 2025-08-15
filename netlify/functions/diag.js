import { pickKey, listByRole } from './openai-keys.js';

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'content-type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const params = new URLSearchParams(event.rawQuery || '');
  const role = params.get('role');
  const tried = role ? pickKey({ role }) : null;

  const body = {
    roles: listByRole(),
    allowFallback: process.env.ALLOW_FALLBACK === 'true',
    fallbackKeyName:
      process.env.ALLOW_FALLBACK === 'true'
        ? process.env.FALLBACK_KEY_NAME || null
        : null,
    role: role || null,
    tried,
    now: new Date().toISOString()
  };

  return { statusCode: 200, headers, body: JSON.stringify(body) };
}
