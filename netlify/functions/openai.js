const { pickKey } = require('./openai-keys');

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'https://insightforgem.netlify.app';

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { model = 'gpt-4o-mini', messages = [], temperature = 0.7, role } = payload;

  let apiKey;
  try {
    apiKey = pickKey({ role: role || payload.purpose });
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
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
    return {
      statusCode: res.ok ? 200 : res.status,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
