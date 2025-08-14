// netlify/functions/agents.js
const API = 'https://api.openai.com/v1';
const MODEL = 'gpt-4o';

// ---------- helpers ----------
const json = (code, obj) => ({ statusCode: code, headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj) });
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const hash = s => [...(s||'')].reduce((h,c)=>((h*33 + c.charCodeAt(0))>>>0), 5381);

// DEMO генерация без затрат
function demoText(idea){
  const text = (idea||'моя идея').toString().slice(0,800);
  const h = hash(text), pick = (arr,n=h)=>arr[n%arr.length];
  const probs = ['сложно быстро получить результат','теряется фокус','много ручных шагов','нет метрик','дорого проверять гипотезы'];
  const vals  = ['экономит 60–80% времени','даёт план на 7 дней','убирает рутину','показывает метрики','помогает решать без экспертов'];
  const steps = ['3–5 историй → топ-3 боли','прототип + 5 интервью','мини-тест на 20 пользователях','2 итерации и отчёт (скрины+цифры)'];
  const risks = ['нет трафика','переоценка спроса','правовые ограничения','зависимость от внешних данных'];
  return [
    `Идея: ${text}`,
    `Проблема: ${pick(probs)}`,
    `Ценность: ${pick(vals)}`,
    `План на 7 дней: 1) ${pick(steps,h+1)}  2) ${pick(steps,h+2)}  3) ${pick(steps,h+3)}`,
    `Риски: ${pick(risks)} → смягчение: маленький тест.`,
    `Статус: DEMO`
  ].join('\n');
}
function demoScore(idea){
  const h = hash(idea||''); const len=(idea||'').trim().split(/\s+/).length||1;
  const originality = clamp(((h%100)+15)%100, 10, 95);
  const clarity = clamp(Math.round(100 - Math.abs(len-25)*2), 10, 95);
  const feasibility = /прототип|MVP|прост|дешев|nocode|figma/i.test(idea||'') ? 70 : 45;
  const impact = /рынок|миллион|город|страна|мир|b2b|b2c/i.test(idea||'') ? 65 : 40;
  const score = clamp(Math.round(0.35*originality + 0.25*clarity + 0.2*feasibility + 0.2*impact), 10, 95);
  return { score, breakdown:{ originality, clarity, feasibility, impact }, demo:true };
}

// вызов OpenAI с безопасным фолбэком
async function callOpenAI(messages, key){
  const body = { model: MODEL, messages, temperature: 0.4, max_tokens: 400 };
  const r = await fetch(`${API}/chat/completions`, {
    method:'POST',
    headers:{ 'Authorization':'Bearer '+key, 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  const text = await r.text(); let data=null; try{ data=JSON.parse(text) }catch{}
  if (!r.ok) throw Object.assign(new Error(data?.error?.message || text), { status:r.status });
  return data?.choices?.[0]?.message?.content || '';
}

// простейшая матрица привилегий (пример)
const PRIVS = {
  guard:      ['filter'],
  generator:  ['generate'],
  judge:      ['score'],
  designer:   ['rewrite'],
  researcher: ['research'],
  manager:    ['orchestrate']
};

exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return json(405, { error:'Use POST' });

    const { agent, action, payload={} } = JSON.parse(event.body || '{}');
    if (!agent || !action) return json(400, { error:'Provide `agent` and `action`' });
    if (!PRIVS[agent]?.includes(action)) return json(403, { error:`Agent "${agent}" cannot "${action}"` });

    const key = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY || null;
    const DEMO = !key || process.env.DEMO_MODE === '1';

    // --------- GUARD ----------
    if (agent === 'guard' && action === 'filter'){
      const text = (payload.text||'').toString();
      if (text.length > 4000) return json(413, { ok:false, reason:'too_long' });
      if (/[A-Za-z0-9]{32,}/.test(text)) return json(400, { ok:false, reason:'secrets_look_like_key' });
      // примитивная фильтрация мата, можно расширить
      if (/(хуй|пизд|блять|сука)/i.test(text)) return json(400, { ok:false, reason:'bad_language' });
      return json(200, { ok:true, demo: DEMO });
    }

    // --------- GENERATOR ----------
    if (agent === 'generator' && action === 'generate'){
      const topic = (payload.topic||'идея').toString();
      if (DEMO){
        const ideas = Array.from({length:5}, (_,i)=>`Идея #${i+1}: ${demoText(`${topic} — вариант ${i+1}`)}`);
        return json(200, { ideas, demo:true });
      }
      const prompt = `Сгенерируй 5 конкретных идей по теме: "${topic}". Кратко, с пользой и следующими шагами.`;
      const txt = await callOpenAI([{role:'user', content: prompt}], key);
      return json(200, { ideas: txt.split(/\n(?=Идея|-\s)/).filter(Boolean), demo:false });
    }

    // --------- JUDGE ----------
    if (agent === 'judge' && action === 'score'){
      const idea = (payload.idea||'').toString();
      if (!idea.trim()) return json(400, { error:'Provide `payload.idea`' });
      if (DEMO) return json(200, demoScore(idea));
      const sys = 'Верни только JSON {score:0..100, originality, clarity, feasibility, impact}. Коротко, без воды.';
      const user = `Оцени идею по новизне, ясности, реализуемости, влиянию. Идея: """${idea}"""`;
      const txt = await callOpenAI([{role:'system',content:sys},{role:'user',content:user}], key);
      let out; try{ out = JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0] || '{}') }catch{ out=null }
      return json(200, out || demoScore(idea));
    }

    // --------- DESIGNER ----------
    if (agent === 'designer' && action === 'rewrite'){
      const { heading='Идея', sub='Короткий подзаголовок', cta='Попробовать' } = payload||{};
      if (DEMO){
        return json(200, {
          heading: `🚀 ${heading}`.slice(0,64),
          sub: `${sub} · план на 7 дней`.slice(0,100),
          cta: cta.toUpperCase().slice(0,24),
          demo:true
        });
      }
      const prompt = `Перепиши три строки лендинга под конверсию: заголовок (<=60), подзаголовок (<=100), CTA (<=20). Исходник: ${heading} / ${sub} / ${cta}. Верни JSON с ключами heading, sub, cta.`;
      const txt = await callOpenAI([{role:'user',content:prompt}], key);
      let o=null; try{ o=JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0]||'{}')}catch{}
      return json(200, o || { heading, sub, cta, demo:true });
    }

    // --------- RESEARCHER ----------
    if (agent === 'researcher' && action === 'research'){
      const q = (payload.query||'').toString();
      if (!q.trim()) return json(400, { error:'Provide `payload.query`' });
      if (DEMO){
        const terms = [`${q} кейсы`, `${q} бенчмарки`, `${q} сравнение инструментов`];
        return json(200, { summary:`DEMO: направления для изучения по теме «${q}».`, terms, sources:[], demo:true });
      }
      const prompt = `Дай краткий обзор по теме "${q}": 3 тезиса, 5 поисковых запросов, и список типов источников. Верни JSON {summary, terms, sources}.`;
      const txt = await callOpenAI([{role:'user',content:prompt}], key);
      let o=null; try{ o=JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0]||'{}')}catch{}
      return json(200, o || { summary:`${q}`, terms:[q], sources:[], demo:true });
    }

    // --------- MANAGER ----------
    if (agent === 'manager' && action === 'orchestrate'){
      const topic = (payload.topic||'идея').toString();
      // простая оркестрация: guard -> generator -> judge top -> designer
      // guard
      const guardRes = await exports.handler({ httpMethod:'POST', body: JSON.stringify({agent:'guard', action:'filter', payload:{ text: topic }}) });
      const g = JSON.parse(guardRes.body||'{}'); if (!g.ok) return json(400, { error:'blocked_by_guard', reason:g.reason });
      // generator
      const genRes = await exports.handler({ httpMethod:'POST', body: JSON.stringify({agent:'generator', action:'generate', payload:{ topic }}) });
      const ideas = JSON.parse(genRes.body||'{}').ideas || [];
      // judge best
      let best={score:-1, idea:''};
      for (const raw of ideas){
        const plain = (raw||'').toString().replace(/^Идея\s*#?\d+:\s*/,'');
        const jRes = await exports.handler({ httpMethod:'POST', body: JSON.stringify({agent:'judge', action:'score', payload:{ idea: plain }}) });
        const s = JSON.parse(jRes.body||'{}'); const sc = s.score || s?.breakdown?.score || 0;
        if (sc > best.score) best = { score: sc, idea: plain, details: s };
      }
      // designer
      const dRes = await exports.handler({ httpMethod:'POST', body: JSON.stringify({agent:'designer', action:'rewrite', payload:{ heading: best.idea, sub:'Собери прототип и проверь спрос за 7 дней', cta:'Попробовать' }}) });
      const design = JSON.parse(dRes.body||'{}');

      return json(200, { topic, best, design, demo: DEMO });
    }

    return json(400, { error:'Unknown route' });
  }catch(e){
    return json(e.status||500, { error: e.message || String(e) });
  }
};
