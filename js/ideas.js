// Updated ideas.js
// This script renders a structured list of saved ideas grouped by visibility
// and provides summary statistics. It enhances the UX by grouping ideas
// into "Private", "Shared via link" and "Public" sections. Each idea card
// shows a colour‑coded icon badge for visibility and allows inline editing
// of the status via a select element. Additional information such as the
// language and score remains unchanged.

document.addEventListener('DOMContentLoaded', function () {
  // Inject custom styles for the grouped ideas and badges directly into the page.
  // This avoids the need to modify the HTML to include an extra CSS file.
  const styleContent = `
    /* My Ideas page improvements */
    .ideas-summary {
      margin-bottom: 24px;
      font-size: 14px;
      color: var(--text-muted);
    }
    .ideas-category {
      margin-bottom: 32px;
    }
    .ideas-category h2 {
      margin-bottom: 12px;
      font-size: 20px;
      font-weight: 600;
    }
    .ideas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .vis-badge-private {
      background: #64748b;
      color: #0b1222;
    }
    .vis-badge-link,
    .vis-badge-shared {
      background: #d97706;
      color: #0b1222;
    }
    .vis-badge-public {
      background: #15803d;
      color: #0b1222;
    }
    .no-ideas {
      font-size: 16px;
      color: var(--text-muted);
      margin-top: 16px;
    }
    @media (min-width: 1200px) {
      .ideas-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.innerHTML = styleContent;
  document.head.appendChild(styleEl);
  const ideasList = document.getElementById('ideas-list');
  // Fallback when the container is missing
  if (!ideasList) return;

  let ideas = [];
  try {
    ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
  } catch (e) {
    ideas = [];
  }

  // When there are no ideas, show a friendly message
  if (!ideas || ideas.length === 0) {
    ideasList.innerHTML =
      '<p class="no-ideas">No ideas saved yet. Try the Idea Generator to create one.</p>';
    return;
  }

  // Compute counts per visibility type
  const counts = { private: 0, link: 0, shared: 0, public: 0 };
  ideas.forEach(function (idea) {
    const vis = idea.visibility || 'private';
    if (counts[vis] !== undefined) {
      counts[vis]++;
    }
  });

  // Create and append summary stats at the top
  const summary = document.createElement('div');
  summary.className = 'ideas-summary';
  const sharedCount = counts.link + counts.shared;
  summary.textContent =
    `You have ${ideas.length} ideas: ${counts.private} private, ` +
    `${sharedCount} shared via link, ${counts.public} public.`;
  ideasList.appendChild(summary);

  // Group ideas into categories based on visibility
  const sections = {
    private: { title: 'Private Ideas', list: [] },
    link: { title: 'Shared via link', list: [] },
    shared: { title: 'Shared via link', list: [] },
    public: { title: 'Public Ideas', list: [] }
  };
  ideas.forEach(function (idea) {
    const vis = idea.visibility || 'private';
    if (sections[vis]) {
      sections[vis].list.push(idea);
    } else {
      sections.private.list.push(idea);
    }
  });

  // Helper function to create an idea card
  function createIdeaCard(idea) {
    const item = document.createElement('div');
    item.className = 'idea-item';

    // Apply language attribute for accessibility
    if (idea.lang) {
      item.setAttribute('lang', idea.lang);
    }

    // Truncate long ideas for the card title
    const truncated =
      idea.idea && idea.idea.length > 100
        ? idea.idea.slice(0, 100) + '…'
        : idea.idea;

    // Title element
    const titleEl = document.createElement('h3');
    titleEl.textContent = truncated;

    // Score circle
    const scoreEl = document.createElement('div');
    scoreEl.className = 'score-circle';
    scoreEl.textContent = idea.score + '%';

    // Visibility badge – show an icon only
    const visBadge = document.createElement('span');
    const visType = idea.visibility || 'private';
    // Map statuses to icons
    const visIcons = {
      private: '🔒',
      link: '🔗',
      shared: '🔗',
      public: '🌍'
    };
    visBadge.className = 'idea-badge visibility-badge vis-badge-' + visType;
    visBadge.textContent = visIcons[visType] || '';
    visBadge.title = visType.charAt(0).toUpperCase() + visType.slice(1);

    // Language badge remains the same
    const langBadge = document.createElement('span');
    langBadge.className = 'idea-badge lang-badge';
    langBadge.textContent = idea.lang || '';

    // Visibility selector (allows changing status inline)
    const visSelect = document.createElement('select');
    ['private', 'link', 'shared', 'public'].forEach(function (opt) {
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
      // Update badge classes and icon
      visBadge.className = 'idea-badge visibility-badge vis-badge-' + newVal;
      visBadge.textContent = visIcons[newVal] || '';
      visBadge.title = newVal.charAt(0).toUpperCase() + newVal.slice(1);
      // Save back to localStorage
      const all = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
      const idx = all.findIndex(function (it) {
        return it.id === idea.id;
      });
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

    // Assemble badges container
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'idea-badges';
    badgesContainer.appendChild(visBadge);
    badgesContainer.appendChild(langBadge);
    badgesContainer.appendChild(visSelect);

    // Assemble card
    item.appendChild(titleEl);
    item.appendChild(scoreEl);
    item.appendChild(badgesContainer);
    item.appendChild(linkEl);

    return item;
  }

  // Render each section
  Object.keys(sections).forEach(function (key) {
    const group = sections[key];
    if (group.list.length === 0) return;
    const sectionEl = document.createElement('div');
    sectionEl.className = 'ideas-category';
    // Section heading
    const header = document.createElement('h2');
    header.textContent = group.title;
    sectionEl.appendChild(header);
    // Container for cards using a grid layout
    const grid = document.createElement('div');
    grid.className = 'ideas-grid';
    group.list.forEach(function (idea) {
      const card = createIdeaCard(idea);
      grid.appendChild(card);
    });
    sectionEl.appendChild(grid);
    ideasList.appendChild(sectionEl);
  });
});