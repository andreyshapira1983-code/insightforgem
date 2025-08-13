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
    var item = document.createElement('div');
    item.className = 'idea-item';
    // Truncate idea text for list view
    var truncated = idea.idea.length > 100 ? idea.idea.slice(0, 100) + '…' : idea.idea;
    // Create title element and set textContent to avoid XSS
    var titleEl = document.createElement('h3');
    titleEl.textContent = truncated;
    // Score circle
    var scoreEl = document.createElement('div');
    scoreEl.className = 'score-circle';
    scoreEl.textContent = idea.score + '%';
    // View details link
    var linkEl = document.createElement('a');
    linkEl.href = 'idea_detail.html?id=' + idea.id;
    linkEl.className = 'cosmic-button';
    linkEl.style.padding = '8px 16px';
    linkEl.style.fontSize = '14px';
    var spanEl = document.createElement('span');
    spanEl.textContent = 'View Details';
    linkEl.appendChild(spanEl);
    // Assemble
    item.appendChild(titleEl);
    item.appendChild(scoreEl);
    item.appendChild(linkEl);
    ideasList.appendChild(item);
  });
});