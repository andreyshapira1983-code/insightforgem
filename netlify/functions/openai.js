const { pickKey } = require('./openai-keys');

const ORIGIN = process.env.ALLOWED_ORIGIN || 'https://insightforgem.netlify.app';
const baseHeaders = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: baseHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: baseHeaders, body: 'Method Not Allowed' };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { model = 'gpt-4o-mini', messages = [], temperature = 0.7 } = payload;
  const role = payload.role || payload.purpose || null;

  let apiKey;
  try {
    apiKey = pickKey({ role });
  } catch {
    return {
      statusCode: 500,
      headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing OpenAI API key in environment' }),
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    data.meta = { ...(data.meta || {}), roleUsed: role };
    return {
      statusCode: res.status,
      headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message, meta: { roleUsed: role } }),
    };
  }
};
