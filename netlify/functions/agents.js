// helper рядом с остальными:
const isAuthOrQuota = (s)=> s===401 || s===429;

// --- GENERATOR ---
if (agent === 'generator' && action === 'generate'){
  const topic = (payload.topic||'идея').toString();
  try {
    if (DEMO) throw {status:429}; // принудительно в демо, если нет ключа
    const prompt = `Сгенерируй 5 конкретных идей по теме: "${topic}". Кратко, с шагами.`;
    const txt = await callOpenAI([{role:'user', content: prompt}], key);
    return json(200, { ideas: txt.split(/\n(?=Идея|-\s)/).filter(Boolean), demo:false });
  } catch(e){
    if (isAuthOrQuota(e.status)) {
      const ideas = Array.from({length:5}, (_,i)=>`Идея #${i+1}\n` + demoText(`${topic} — вариант ${i+1}`));
      return json(200, { ideas, demo:true });
    }
    return json(e.status||500, { error: e.message || String(e) });
  }
}

// --- JUDGE ---
if (agent === 'judge' && action === 'score'){
  const idea = (payload.idea||'').toString();
  if (!idea.trim()) return json(400, { error:'Provide `payload.idea`' });
  try {
    if (DEMO) throw {status:429};
    const sys = 'Верни только JSON {score, originality, clarity, feasibility, impact}. Коротко.';
    const user = `Оцени идею. Идея: """${idea}"""`;
    const txt = await callOpenAI([{role:'system',content:sys},{role:'user',content:user}], key);
    let out; try{ out = JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0] || '{}') }catch{ out=null }
    return json(200, out || demoScore(idea));
  } catch(e){
    if (isAuthOrQuota(e.status)) return json(200, demoScore(idea));
    return json(e.status||500, { error: e.message || String(e) });
  }
}

// --- DESIGNER ---
if (agent === 'designer' && action === 'rewrite'){
  const { heading='Идея', sub='Подзаголовок', cta='Попробовать' } = payload||{};
  try {
    if (DEMO) throw {status:429};
    const prompt = `Перепиши 3 строки лендинга: заголовок(<=60), подзаголовок(<=100), CTA(<=20). Исходник: ${heading} / ${sub} / ${cta}. Верни JSON {heading, sub, cta}.`;
    const txt = await callOpenAI([{role:'user',content:prompt}], key);
    let o=null; try{ o=JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0]||'{}')}catch{}
    return json(200, o || { heading, sub, cta, demo:true });
  } catch(e){
    if (isAuthOrQuota(e.status)) {
      return json(200, {
        heading: `🚀 ${heading}`.slice(0,64),
        sub: `${sub} · план на 7 дней`.slice(0,100),
        cta: cta.toUpperCase().slice(0,24),
        demo:true
      });
    }
    return json(e.status||500, { error: e.message || String(e) });
  }
}

// --- RESEARCHER ---
if (agent === 'researcher' && action === 'research'){
  const q = (payload.query||'').toString();
  if (!q.trim()) return json(400, { error:'Provide `payload.query`' });
  try {
    if (DEMO) throw {status:429};
    const prompt = `Краткий обзор по теме "${q}": 3 тезиса, 5 поисковых запросов, типы источников. Верни JSON {summary, terms, sources}.`;
    const txt = await callOpenAI([{role:'user',content:prompt}], key);
    let o=null; try{ o=JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0]||'{}')}catch{}
    return json(200, o || { summary:`${q}`, terms:[q], sources:[], demo:true });
  } catch(e){
    if (isAuthOrQuota(e.status)) {
      const terms = [`${q} кейсы`, `${q} бенчмарки`, `${q} сравнение инструментов`];
      return json(200, { summary:`DEMO: направления по теме «${q}».`, terms, sources:[], demo:true });
    }
    return json(e.status||500, { error: e.message || String(e) });
  }
}
