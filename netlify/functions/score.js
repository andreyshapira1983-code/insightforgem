import { corsHeaders, preflight, selectApiKey } from './utils.js';

const OPENAI_API = 'https://api.openai.com/v1';
const MODEL_CHAT = 'gpt-4o';
const MODEL_EMB = 'text-embedding-3-small';

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function openai(path, body, apiKey) {
  const r = await fetch(`${OPENAI_API}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const txt = await r.text();
  let data = null;
  try { data = JSON.parse(txt); } catch {}
  if (!r.ok) {
    const err = new Error(data?.error?.message || txt || `OpenAI ${r.status}`);
    err.status = r.status;
    throw err;
  }
  return data || {};
}

export async function handler(event) {
  const pre = preflight(event, 'POST,OPTIONS');
  if (pre) return pre;
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: corsHeaders(event), body: 'Use POST' };
    }

    const apiKey = selectApiKey();
    if (!apiKey) {
      return { statusCode: 500, headers: corsHeaders(event), body: JSON.stringify({ error: 'No API key in env vars' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const idea = (body.idea || '').trim();
    const brief = body.brief || {};
    const historyTexts = Array.isArray(body.historyTexts) ? body.historyTexts.slice(0, 20) : [];
    if (!idea) {
      return { statusCode: 400, headers: corsHeaders(event), body: JSON.stringify({ error: 'Provide `idea` string' }) };
    }

    const inputs = [idea, ...historyTexts];
    const emb = await openai('embeddings', { model: MODEL_EMB, input: inputs }, apiKey);
    const ideaEmb = emb.data[0].embedding;
    let maxSim = 0;
    for (const d of emb.data.slice(1)) maxSim = Math.max(maxSim, cosine(ideaEmb, d.embedding));
    const originality = Math.round((1 - maxSim) * 100);

    const system = [
      'You are a strict product evaluator.',
      'Return ONLY valid JSON with keys: viability, impact, evidence, clarity_risk (0..100 each),',
      'verdict (<=140 chars), recommendations (3-6 items),',
      'risks (2-5), next_steps (3-6), patentability ("yes"|"no"|"unclear").'
    ].join(' ');
    const chat = await openai('chat/completions', {
      model: MODEL_CHAT, temperature: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify({ idea, brief, rules: ['JSON only', 'Be concrete'] }) }
      ]
    }, apiKey);

    let txt = chat.choices?.[0]?.message?.content || '{}';
    const m = txt.match(/\{[\s\S]*\}$/);
    if (m) txt = m[0];
    let a = {};
    try { a = JSON.parse(txt); } catch { a = {}; }

    const V = clamp(parseInt(a.viability ?? 50, 10), 0, 100);
    const I = clamp(parseInt(a.impact ?? 50, 10), 0, 100);
    const E = clamp(parseInt(a.evidence ?? 50, 10), 0, 100);
    const C = clamp(parseInt(a.clarity_risk ?? 50, 10), 0, 100);
    const score = Math.round(0.30 * originality + 0.25 * V + 0.15 * I + 0.15 * E + 0.15 * C);

    return {
      statusCode: 200,
      headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, breakdown: { originality, viability: V, impact: I, evidence: E, clarity_risk: C }, analysis: a })
    };
  } catch (e) {
    const sc = e.status || 500;
    return { statusCode: sc, headers: { ...corsHeaders(event), 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}
