// ideas.js
// Renders a list of saved ideas from local storage

document.addEventListener('DOMContentLoaded', function () {
  const ideasList = document.getElementById('ideas-list');
  let ideas = [];
  try {
    ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
  } catch (e) {
    ideas = [];
  }
  if (!ideas || ideas.length === 0) {
    if (ideasList) {
      ideasList.innerHTML = '<p>No ideas saved yet. Try the <a href="generator.html">Idea Generator</a> to create one.</p>';
    }
    return;
  }
  ideas.forEach(function (idea) {
    const item = document.createElement('div');
    item.className = 'idea-item';
    // Truncate idea text for list view
    const truncated = idea.idea.length > 100 ? idea.idea.slice(0, 100) + '…' : idea.idea;
    item.innerHTML = `
      <h3>${truncated}</h3>
      <div class="score-circle">${idea.score}%</div>
      <a href="idea_detail.html?id=${idea.id}" class="cosmic-button" style="padding:8px 16px; font-size:14px;"><span>View Details</span></a>
    `;
    ideasList.appendChild(item);
  });
});