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
    container.textContent = 'Idea not found.';
    return;
  }
  var text = idea.idea;
  var score = idea.score;
  var details = idea.details;
  // Clear existing content
  container.textContent = '';
  // Title
  var h2 = document.createElement('h2');
  h2.textContent = text;
  container.appendChild(h2);
  // Score circle
  var scoreDiv = document.createElement('div');
  scoreDiv.className = 'score-circle big';
  scoreDiv.textContent = score + '%';
  container.appendChild(scoreDiv);
  // Helper to add section
  function addSection(title, content) {
    var h3 = document.createElement('h3');
    h3.textContent = title;
    container.appendChild(h3);
    var p = document.createElement('p');
    p.textContent = content;
    container.appendChild(p);
  }
  addSection('Verdict', details.verdict);
  addSection('Recommendations', details.recommendations);
  addSection('Risks', details.risks);
  addSection('Next Steps', details.nextSteps);
  addSection('Patentability', details.patentability);
});