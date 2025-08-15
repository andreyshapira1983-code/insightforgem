// js/generator.js — версия без заглушек (только реальный бэкенд)
(function () {
  const endpoint = '/.netlify/functions/openai'; // прод-функция
  const ideaInput = document.getElementById('idea-input');
  const genBtn = document.getElementById('generate-button');
  const saveBtn = document.getElementById('save-button');
  const progress = document.getElementById('progress-container');
  const scoreText = document.getElementById('score-text');
  const results = document.getElementById('analysis-results');

  function showScore(score) {
    const s = Math.max(0, Math.min(100, Number(score) || 0));
    scoreText.textContent = s + '%';
    progress.style.display = 'flex';
  }

  function showError(msg) {
    progress.style.display = 'none';
    results.style.display = 'block';
    results.innerHTML = `<div class="error-box">${msg}</div>`;
  }

  async function analyzeIdea(idea) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ошибка ${res.status}: ${text || 'backend'}`);
    }
    return res.json();
  }

  function saveAndGo(detail) {
    const id = String(Date.now());
    const list = JSON.parse(localStorage.getItem('starGalaxyIdeas') || '[]');
    list.push({
      id,
      idea: detail.idea || '',
      score: detail.score ?? 0,
      details: detail.details || {},
      visibility: 'private',
      lang: detail.lang || 'ru'
    });
    localStorage.setItem('starGalaxyIdeas', JSON.stringify(list));
    location.href = 'idea_detail.html?id=' + encodeURIComponent(id);
  }

  genBtn?.addEventListener('click', async () => {
    const idea = (ideaInput?.value || '').trim();
    if (!idea) {
      showError('Введите идею и попробуйте снова.');
      return;
    }
    // UI: сброс
    results.style.display = 'none';
    progress.style.display = 'flex';
    scoreText.textContent = '...';

    try {
      const data = await analyzeIdea(idea);
      // ожидаем { score: number, details: { verdict, recommendations, risks, nextSteps, patentability }, lang? }
      showScore(data.score);
      results.style.display = 'block';
      results.innerHTML = `
        <ul class="mini-list">
          <li><strong>Вердикт:</strong> ${data?.details?.verdict ?? '—'}</li>
          <li><strong>Рекомендации:</strong> ${data?.details?.recommendations ?? '—'}</li>
          <li><strong>Риски:</strong> ${data?.details?.risks ?? '—'}</li>
          <li><strong>Следующие шаги:</strong> ${data?.details?.nextSteps ?? '—'}</li>
          <li><strong>Патентоспособность:</strong> ${data?.details?.patentability ?? '—'}</li>
        </ul>
      `;
      saveBtn.style.display = 'inline-block';
      saveBtn.onclick = () => saveAndGo({ idea, score: data.score, details: data.details, lang: data.lang });
    } catch (e) {
      console.error(e);
      showError('Не удалось получить ответ от ИИ. Проверьте ключи и функцию /openai.');
    }
  });
})();
