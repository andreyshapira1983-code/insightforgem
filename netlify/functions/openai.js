// Netlify Function: proxy к OpenAI без внешних зависимостей (используем глобальный fetch)

const roleKeyMap = {
  gen: 'OPENAI_KEY_GEN',
  admin: 'OPENAI_KEY_ADMIN',
  design: 'OPENAI_KEY_DESIGN',
  guard: 'OPENAI_KEY_GUARD',
  research: 'OPENAI_KEY_RESEARCH',
  support: 'OPENAI_KEY_SUPPORT',
};

const FALLBACK_KEY_NAME = process.env.FALLBACK_KEY_NAME || 'OPENAI_API_KEY';

function getOpenAIKey(role) {
  const envKey = roleKeyMap[role] || FALLBACK_KEY_NAME;
  let key = process.env[envKey];
  if (!key && process.env.ALLOW_FALLBACK === '1') {
    key = process.env[FALLBACK_KEY_NAME];
  }
  return key;
}

exports.handler = async (event) => {
  const { role } = event.queryStringParameters || {};
  const key = getOpenAIKey(role);

  if (!key) {
    return {
      statusCode: process.env.ALLOW_FALLBACK === '1' ? 503 : 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No OpenAI key assigned for this role' }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Bad request body' }),
    };
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,     // ВАЖНО: в кавычках
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text(); // отдаём как есть (JSON строка)
    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Upstream error' }),
    };
  }
};
