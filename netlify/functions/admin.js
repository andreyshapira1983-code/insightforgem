const { timingSafeEqual } = require('crypto');

// Роли -> имена переменных окружения
const ROLE_ENV = {
  gen: 'OPENAI_KEY_GEN',
  admin: 'OPENAI_KEY_ADMIN',
  design: 'OPENAI_KEY_DESIGN',
  guard: 'OPENAI_KEY_GUARD',
  research: 'OPENAI_KEY_RESEARCH',
  support: 'OPENAI_KEY_SUPPORT',
};

const FALLBACK = process.env.FALLBACK_KEY_NAME || 'OPENAI_API_KEY';

// Разрешённый Origin для CORS (твой домен)
const ALLOWED_ORIGIN = 'https://insightforgem.netlify.app';

// Простой rate-limit (складируется в тёплой лямбде)
const RATE_LIMIT_PER_MIN = 30;
const _buckets = new Map(); // ip -> {count, ts}

// Получаем «ключ роли» (значение не возвращаем наружу)
function pickKey(role) {
  const envName = ROLE_ENV[role] || FALLBACK;
  let val = process.env[envName];
  if (!val && process.env.ALLOW_FALLBACK === '1' && envName !== FALLBACK) {
    val = process.env[FALLBACK];
  }
  return { envName, present: !!val, val };
}

// Универсальный ответ с базовыми заголовками
function respond(statusCode, body, origin) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  };
  if (origin && origin === ALLOWED_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return { statusCode, headers, body: JSON.stringify(body) };
}

// Достаём IP (для rate-limit)
function getIp(event) {
  const h = event.headers || {};
  return (
    h['x-nf-client-connection-ip'] ||
    h['client-ip'] ||
    (h['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  );
}

// Простейший rate-limit: N запросов в 60 сек на IP
function checkRateLimit(ip) {
  const now = Date.now();
  const rec = _buckets.get(ip) || { count: 0, ts: now };
  if (now - rec.ts > 60_000) {
    rec.count = 0;
    rec.ts = now;
  }
  rec.count += 1;
  _buckets.set(ip, rec);
  return rec.count <= RATE_LIMIT_PER_MIN;
}

// Токен только в заголовке X-Admin-Token; сравнение константным временем
function isAuthorized(event) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const sent = (event.headers?.['x-admin-token'] || event.headers?.['X-Admin-Token'] || '').toString();
  const a = Buffer.from(token);
  const b = Buffer.from(sent);
  if (a.length !== b.length) return false;
  try { return timingSafeEqual(a, b); } catch { return false; }
}

exports.handler = async (event) => {
  try {
    const origin = event.headers?.origin || '';
    const qs = event.queryStringParameters || {};
    const cmd = (qs.cmd || 'health').toLowerCase();
    const role = (qs.role || 'gen').toLowerCase();
    const live = qs.live === '1';
    const ip = getIp(event);

    // Базовый rate-limit
    if (!checkRateLimit(ip)) {
      return respond(429, { ok: false, error: 'Too Many Requests' }, origin);
    }

    // health можно оставить публичным — НО без масок/значений
    if (cmd === 'health') {
      const roles = Object.keys(ROLE_ENV);
      const out = {};
      for (const r of roles) {
        const { envName, present } = pickKey(r);
        out[r] = { env: envName, present };
      }
      const fb = pickKey('fallback');
      out.fallback = { env: FALLBACK, present: fb.present };
      return respond(200, { ok: true, roles: out, allowFallback: process.env.ALLOW_FALLBACK === '1' }, origin);
    }

    // Всё остальное — только по токену
    if (!isAuthorized(event)) {
      // прячемся под 404, не выдаём, что здесь вообще что-то есть
      return respond(404, { ok: false, error: 'Not Found' }, origin);
    }

    if (cmd === 'diag') {
      const { envName, present } = pickKey(role);
      // В diag не возвращаем никаких масок/значений — только факт и имя переменной
      return respond(200, { ok: present, role, env: envName, allowFallback: process.env.ALLOW_FALLBACK === '1' }, origin);
    }

    if (cmd === 'ping') {
      const { present, val } = pickKey(role);
      if (!present) {
        const code = process.env.ALLOW_FALLBACK === '1' ? 503 : 401;
        return respond(code, { ok: false, error: 'No key for role' }, origin);
      }
      if (!live) return respond(200, { ok: true, dryRun: true }, origin);

      // Живой минимальный вызов к OpenAI (Node 18+/20+ — fetch глобальный)
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
        headers: { Authorization: `Bearer ${val}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!r.ok) return respond(r.status, { ok: false, error: 'OpenAI error', status: r.status }, origin);
      const data = await r.json();
      const text = data.choices?.[0]?.message?.content ?? '';
      return respond(200, { ok: true, reply: text }, origin);
    }

    return respond(400, { ok: false, error: 'Unknown cmd' }, origin);
  } catch {
    return respond(500, { ok: false, error: 'Internal error' });
  }
};
