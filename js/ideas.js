// js/ideas.js - render list of saved ideas from localStorage

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('ideas-list');
  const searchInput = document.getElementById('ideas-search-input');

  function loadIdeas() {
    try {
      return JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
    } catch {
      return [];
    }
  }

  function render(filter = '') {
    const ideas = loadIdeas();
    const q = filter.toLowerCase();
    const filtered = ideas.filter(i => (i.idea || '').toLowerCase().includes(q));
    listEl.innerHTML = '';
    if (filtered.length === 0) {
      listEl.innerHTML = '<p>No ideas yet.</p>';
      return;
    }
    const ul = document.createElement('ul');
    filtered.forEach(i => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = 'idea_detail.html?id=' + encodeURIComponent(i.id);
      a.textContent = i.idea;
      li.appendChild(a);
      ul.appendChild(li);
    });
    listEl.appendChild(ul);
  }

  searchInput?.addEventListener('input', e => render(e.target.value));
  render();
});
