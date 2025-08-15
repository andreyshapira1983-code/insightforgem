// Show only the % score on the Generator page.
// Save -> redirect to idea_detail.html?id=...

document.addEventListener('DOMContentLoaded', function () {
  let lastGenerateTime = 0;

  const analysisContainer = document.getElementById('analysis-results');
  const saveButtonEl = document.getElementById('save-button');
  const generateButton = document.getElementById('generate-button');
  const ideaInput = document.getElementById('idea-input');
  const progressContainer = document.getElementById('progress-container');
  const scoreText = document.getElementById('score-text');
  const progressCircle = document.querySelector('.progress-circle');

  let currentResult = null;

  function setScore(score) {
    score = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
    if (scoreText) scoreText.innerText = `${score}%`;
    if (progressCircle) {
      const deg = Math.round((score / 100) * 360);
      progressCircle.style.background = `conic-gradient(var(--primary) ${deg}deg, var(--border) ${deg}deg)`;
    }
  }

  async function generateIdea() {
    const idea = (ideaInput?.value || '').trim();
    if (!idea) { alert('Please enter an idea to generate.'); return; }

    const now = Date.now();
    const remaining = lastGenerateTime + 10_000 - now;
    if (remaining > 0) { alert(`Please wait ${Math.ceil(remaining/1000)} seconds before generating another idea.`); return; }
    lastGenerateTime = now;

    if (generateButton) generateButton.disabled = true;
    if (progressContainer) progressContainer.style.display = 'flex';
    if (analysisContainer) { analysisContainer.style.display = 'none'; analysisContainer.innerHTML = ''; }
    if (saveButtonEl) saveButtonEl.style.display = 'none';
    setScore(0);

    try {
      const payload = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert business analyst. Score the idea from 0 to 100 as "Score: <number>" and then provide sections "Verdict", "Recommendations", "Risks", "Next Steps", "Patentability" each after a label and colon on its own line.' },
          { role: 'user', content: idea }
        ],
        temperature: 0.7
      };

      const response = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`AI service error (${response.status})`);

      const data = await response.json().catch(() => ({}));
      const content = data?.choices?.[0]?.message?.content;

      let score = 0; const details = {};
      if (typeof content === 'string' && content.trim()) {
        const lines = content.split(/\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const lower = line.toLowerCase();
          if (lower.startsWith('score')) { const m = line.match(/(\d{1,3})/); if (m) score = Math.max(0, Math.min(100, parseInt(m[1], 10))); }
          else if (lower.startsWith('verdict')) details.verdict = line.split(':').slice(1).join(':').trim();
          else if (lower.startsWith('recommendations')) details.recommendations = line.split(':').slice(1).join(':').trim();
          else if (lower.startsWith('risks')) details.risks = line.split(':').slice(1).join(':').trim();
          else if (lower.startsWith('next')) details.nextSteps = line.split(':').slice(1).join(':').trim();
          else if (lower.startsWith('patent')) details.patentability = line.split(':').slice(1).join(':').trim();
        }
      }

      setScore(score);
      const lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
      currentResult = { id: `${Date.now()}`, idea, score, details, visibility: 'private', lang };

      if (saveButtonEl) saveButtonEl.style.display = 'inline-block';
    } catch (err) {
      console.error('Failed to call AI service:', err);
      alert(err?.message || 'Failed to contact AI service.');
      currentResult = null;
    } finally {
      setTimeout(() => { if (generateButton) generateButton.disabled = false; }, 10_000);
    }
  }

  async function saveIdea() {
    if (!currentResult) return;
    let id = currentResult.id;
    try {
      const res = await fetch('/.netlify/functions/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentResult)
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.id) id = `${data.id}`;
      } else {
        throw new Error(`Save failed (${res.status})`);
      }
    } catch (err) {
      console.warn('Server save failed, falling back to localStorage:', err);
      try {
        const list = JSON.parse(localStorage.getItem('starGalaxyIdeas') || '[]');
        if (!id) id = `${Date.now()}`;
        list.push({ ...currentResult, id });
        localStorage.setItem('starGalaxyIdeas', JSON.stringify(list));
      } catch {
        alert('Failed to save the idea locally.');
        return;
      }
    } finally {
      if (id) window.location.href = `idea_detail.html?id=${encodeURIComponent(id)}`;
    }
  }

  generateButton?.addEventListener('click', generateIdea);
  saveButtonEl?.addEventListener('click', saveIdea);
});
