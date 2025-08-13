// idea_detail.js
// Displays the details of a single idea based on query parameter id

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('idea-details');
  if (!id || !container) {
    if (container) {
      container.innerHTML = '<p>Idea not found.</p>';
    }
    return;
  }
  let ideas = [];
  try {
    ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
  } catch (e) {
    ideas = [];
  }
  const idea = ideas.find(function (item) { return String(item.id) === String(id); });
  if (!idea) {
    container.innerHTML = '<p>Idea not found.</p>';
    return;
  }
  const { idea: text, score, details } = idea;
  container.innerHTML = `
    <h2>${text}</h2>
    <div class="score-circle big">${score}%</div>
    <h3>Verdict</h3>
    <p>${details.verdict}</p>
    <h3>Recommendations</h3>
    <p>${details.recommendations}</p>
    <h3>Risks</h3>
    <p>${details.risks}</p>
    <h3>Next Steps</h3>
    <p>${details.nextSteps}</p>
    <h3>Patentability</h3>
    <p>${details.patentability}</p>
  `;
});