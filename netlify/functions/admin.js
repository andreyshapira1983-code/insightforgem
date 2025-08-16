'use strict';

// Привязка ролей к env-переменным
const ROLE_ENV = {
  gen: 'OPENAI_KEY_GEN',
  admin: 'OPENAI_KEY_ADMIN',
  design: 'OPENAI_KEY_DESIGN',
  guard: 'OPENAI_KEY_GUARD',
  research: 'OPENAI_KEY_RESEARCH',
  support: 'OPENAI_KEY_SUPPORT',
};

const FALLBACK = process.env.FALLBACK_KEY_NAME || 'OPENAI_API_KEY';

function mask(v) {
  if (!v || typeof v !== 'string' || v.length < 8) return '*';
  return v.slice(0, 3) + '**' + v.slice(-4);
}

function pickKey(role) {
  const tried = [];
  const envName = ROLE_ENV[role] || FALLBACK;
  tried.push(envName);

  let val = process.env[envName];
  if (!val && process.env.ALLOW_FALLBACK === '1' && envName !== FALLBACK) {
    tried.push(FALLBACK);
    val = process.env[FALLBACK];
  }
  return { envName, tried, val };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const cmd = (qs.cmd || 'health').toLowerCase();
    const role = (qs.role || 'gen').toLowerCase();
    const live = qs.live === '1';

    if (cmd === 'health') {
      const roles = Object.keys(ROLE_ENV);
      const out = {};
      for (const r of roles) {
        const { envName, val } = pickKey(r);
        out[r] = { env: envName, present: !!val, mask: mask(val) };
      }
      // и фолбэк
      out.fallback = { env: FALLBACK, present: !!process.env[FALLBACK], mask: mask(process.env[FALLBACK]) };
      return json(200, { ok: true, roles: out, allowFallback: process.env.ALLOW_FALLBACK === '1' });
    }

    if (cmd === 'diag') {
      const { tried, val } = pickKey(role);
      return json(200, {
        ok: !!val,
        role,
        tried,
        tried_masked: tried.map((e) => mask(process.env[e])),
        allowFallback: process.env.ALLOW_FALLBACK === '1',
      });
    }

    if (cmd === 'ping') {
      const { val } = pickKey(role);
      if (!val) return json(process.env.ALLOW_FALLBACK === '1' ? 503 : 401, { ok: false, error: 'No key for role' });
      if (!live) return json(200, { ok: true, dryRun: true }); // без трат

      // Лёгкий живой вызов в OpenAI (без зависимостей, используем встроенный fetch)
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Ответь одним словом: ok' },
          { role: 'user', content: 'ping' },
        ],
        temperature: 0,
        max_tokens: 4,
      };

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${val}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        return json(r.status, { ok: false, error: 'OpenAI error', status: r.status });
      }
      const data = await r.json();
      const text = data.choices?.[0]?.message?.content ?? '';
      return json(200, { ok: true, reply: text });
    }

    return json(400, { ok: false, error: 'Unknown cmd' });
  } catch (e) {
    return json(500, { ok: false, error: 'Internal error' });
  }
};

