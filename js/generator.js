// js/generator.js
document.addEventListener('DOMContentLoaded', () => {
  const endpoint = '/.netlify/functions/openai?role=gen';

  const input = document.getElementById('idea-input');
  const genBtn = document.getElementById('generate-button');
  const saveBtn = document.getElementById('save-button');
  const scoreText = document.getElementById('score-text');
  const progressCircle = document.querySelector('.progress-circle');
  const progressWrap = document.getElementById('progress-container');

  let current = null;
  let last = 0;

  function setScore(val) {
    const s = Math.max(0, Math.min(100, Number(val) || 0));
    if (scoreText) scoreText.textContent = s + '%';
    const deg = Math.round((s / 100) * 360);
    if (progressCircle) {
      progressCircle.style.background = `conic-gradient(var(--primary) ${deg}deg, var(--border) ${deg}deg)`;
    }
  }

  async function callAI(idea) {
    const sys = 'Ты продуктовый аналитик. Верни СТРОГО JSON без лишнего текста: {"score":0..100,"verdict":"...","recommendations":[],"risks":[],"nextSteps":[],"patentability":"..."}';
    const body = {
      model: 'gpt-4.1',          
      temperature: 0.2,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: idea }
      ]
    };
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error('AI ' + r.status);
    const data = await r.json();
    // chat.completions -> choices[0].message.content
    let content = data?.choices?.[0]?.message?.content ?? '';
    try { return JSON.parse(content); } catch { return { score: 0, verdict: content || 'нет данных' }; }
  }

  genBtn?.addEventListener('click', async () => {
    const idea = (input?.value || '').trim();
    if (!idea) { alert('Введите идею.'); return; }
    const now = Date.now();
    if (now - last < 3000) { alert('Подождите пару секунд.'); return; }
    last = now;

    genBtn.disabled = true;
    if (progressWrap) progressWrap.style.display = 'flex';
    setScore(0);

    try {
      const data = await callAI(idea);
      current = {
        id: String(Date.now()),
        idea,
        score: data.score ?? 0,
        details: data,
        visibility: 'private',
        lang: (navigator.languages && navigator.languages[0]) || 'ru'
      };
      setScore(current.score);
      if (saveBtn) saveBtn.style.display = 'inline-block';
    } catch {
      alert('Не удалось получить ответ от ИИ.');
      current = null;
    } finally {
      genBtn.disabled = false;
    }
  });

  saveBtn?.addEventListener('click', () => {
    if (!current) return;
    const list = JSON.parse(localStorage.getItem('starGalaxyIdeas') || '[]');
    list.push(current);
    localStorage.setItem('starGalaxyIdeas', JSON.stringify(list));
    location.href = 'idea_detail.html?id=' + encodeURIComponent(current.id);
  });
});
