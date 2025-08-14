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
  ideas.forEach(function (idea, index) {
    const item = document.createElement('div');
    item.className = 'idea-item';
    // Set language attribute on the container for accessibility
    if (idea.lang) {
      item.setAttribute('lang', idea.lang);
    }
    // Truncate idea text for list view
    const truncated = idea.idea && idea.idea.length > 100 ? idea.idea.slice(0, 100) + '…' : idea.idea;
    // Title element
    const titleEl = document.createElement('h3');
    titleEl.textContent = truncated;
    // Score circle
    const scoreEl = document.createElement('div');
    scoreEl.className = 'score-circle';
    scoreEl.textContent = idea.score + '%';
    // Visibility badge
    const visBadge = document.createElement('span');
    visBadge.className = 'idea-badge visibility-badge';
    visBadge.textContent = idea.visibility || 'private';
    // Language badge
    const langBadge = document.createElement('span');
    langBadge.className = 'idea-badge lang-badge';
    langBadge.textContent = idea.lang || '';
    // Visibility selector
    const visSelect = document.createElement('select');
    ['private','link','shared','public'].forEach(function (opt) {
      const optionEl = document.createElement('option');
      optionEl.value = opt;
      optionEl.textContent = opt;
      if (idea.visibility === opt) optionEl.selected = true;
      visSelect.appendChild(optionEl);
    });
    visSelect.className = 'visibility-select';
    visSelect.addEventListener('change', function () {
      const newVal = this.value;
      // Update idea object and persist to local storage
      idea.visibility = newVal;
      visBadge.textContent = newVal;
      // Save back to localStorage
      const all = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
      const idx = all.findIndex(function (it) { return it.id === idea.id; });
      if (idx >= 0) {
        all[idx].visibility = newVal;
        localStorage.setItem('starGalaxyIdeas', JSON.stringify(all));
      }
    });
    // View details link
    const linkEl = document.createElement('a');
    linkEl.href = 'idea_detail.html?id=' + idea.id;
    linkEl.className = 'cosmic-button';
    linkEl.style.padding = '8px 16px';
    linkEl.style.fontSize = '14px';
    const spanEl = document.createElement('span');
    spanEl.textContent = 'View Details';
    linkEl.appendChild(spanEl);
    // Assemble content
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'idea-badges';
    badgesContainer.appendChild(visBadge);
    badgesContainer.appendChild(langBadge);
    badgesContainer.appendChild(visSelect);
    item.appendChild(titleEl);
    item.appendChild(scoreEl);
    item.appendChild(badgesContainer);
    item.appendChild(linkEl);
    ideasList.appendChild(item);
  });
});