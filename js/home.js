// home.js
// Handles loading dynamic content for the home page including
// platform statistics and latest news.  Fetches data from
// serverless endpoints (.netlify/functions/stats and news) and
// updates the left and right rails accordingly.

document.addEventListener('DOMContentLoaded', function () {
  const statsContainer = document.getElementById('stats-content');
  const newsList = document.getElementById('news-list');
  // Load statistics from the Netlify function
  async function loadStats() {
    if (!statsContainer) return;
    try {
      const response = await fetch('/.netlify/functions/stats');
      if (!response.ok) throw new Error('Stats API error');
      const stats = await response.json();
      // Build HTML for stats: total ideas, users online, idea of the day
      const html = `
        <p><strong>Total Ideas:</strong> ${stats.ideas_total}</p>
        <p><strong>Users Online:</strong> ${stats.users_online}</p>
        <p><strong>Idea of the Day:</strong> ${stats.idea_of_the_day || 'N/A'}</p>
      `;
      statsContainer.innerHTML = html;
    } catch (err) {
      statsContainer.innerHTML = '<p>Failed to load stats.</p>';
    }
  }
  // Load news items from the Netlify function
  async function loadNews() {
    if (!newsList) return;
    try {
      const response = await fetch('/.netlify/functions/news');
      if (!response.ok) throw new Error('News API error');
      const items = await response.json();
      newsList.innerHTML = '';
      items.forEach(function (item) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.link || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;
        li.appendChild(link);
        newsList.appendChild(li);
      });
    } catch (err) {
      newsList.innerHTML = '<li>Failed to load news.</li>';
    }
  }
  loadStats();
  loadNews();
});
