// search.js
// Provides a global search overlay that lets users search across saved ideas,
// trending topics and external resources from anywhere on the site. When the
// magnifying glass in the header is clicked, a modal overlay opens with
// a search field. Results update in real time as the user types. Clicking
// a result navigates to the appropriate page and closes the overlay.

document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('global-search-button');
  const overlay = document.getElementById('global-search-overlay');
  const input = document.getElementById('global-search-input');
  const resultsContainer = document.getElementById('global-search-results');
  if (!searchButton || !overlay || !input || !resultsContainer) return;

  // Static datasets for trends and resources. These mirror the content in
  // trending.html and resources.html so that search results remain
  // consistent across pages. If you add new entries to those pages, be
  // sure to update this array accordingly.
  const staticData = [
    // Trending items
    { type: 'Trend', title: 'Clean Energy Solutions', description: 'Innovations in renewable energy, storage, and sustainable infrastructure are gaining momentum.', link: 'trending.html' },
    { type: 'Trend', title: 'Health Tech Wearables', description: 'Smart devices for monitoring health metrics are becoming ubiquitous and increasingly sophisticated.', link: 'trending.html' },
    { type: 'Trend', title: 'Remote Collaboration Platforms', description: 'Next‑generation tools that enable distributed teams to work together seamlessly.', link: 'trending.html' },
    { type: 'Trend', title: 'AI‑Assisted Creativity', description: 'Applications that help artists, writers and designers co‑create with artificial intelligence.', link: 'trending.html' },
    // Resources
    { type: 'Resource', title: 'USPTO Patent Search', description: 'US patent database search.', link: 'https://www.uspto.gov/patents/search', external: true },
    { type: 'Resource', title: 'WIPO PATENTSCOPE', description: 'International patent search.', link: 'https://patentscope.wipo.int', external: true },
    { type: 'Resource', title: 'Lean Canvas Template', description: 'Structure your idea on one page.', link: 'https://leanstack.com/leancanvas', external: true },
    { type: 'Resource', title: 'Pitch Deck Guide', description: 'Resources from Y Combinator.', link: 'https://www.ycombinator.com/library', external: true },
    { type: 'Resource', title: 'OpenAI API', description: 'Build AI‑powered features.', link: 'https://platform.openai.com/docs', external: true }
  ];

  // Load ideas saved in localStorage. Each idea has an id (its index in the
  // stored array) and a title drawn from the idea text. We slice the text
  // for brevity in the results list.
  function loadIdeaData() {
    let ideas = [];
    try {
      ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
    } catch (e) {
      ideas = [];
    }
    return ideas.map(function (ideaObj) {
      // Each saved idea has an `idea` property for the text and an `id` property
      const fullText = (ideaObj.idea || '').toString().trim();
      const displayTitle = fullText.length > 40 ? fullText.slice(0, 37) + '…' : fullText;
      return {
        type: 'Idea',
        title: displayTitle,
        description: '',
        link: 'idea_detail.html?id=' + ideaObj.id,
        external: false
      };
    });
  }

  // Compose full search dataset each time; dynamic part (ideas) is loaded on demand.
  function getSearchData() {
    return staticData.concat(loadIdeaData());
  }

  // Render search results
  function renderResults(results) {
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
      const noRes = document.createElement('div');
      noRes.className = 'search-result-item';
      noRes.textContent = 'No results found.';
      resultsContainer.appendChild(noRes);
      return;
    }
    results.forEach(function (item) {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      const linkEl = document.createElement('a');
      linkEl.textContent = item.title;
      linkEl.href = item.link;
      if (item.external) {
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
      }
      linkEl.addEventListener('click', function () {
        // Close overlay when navigating
        closeOverlay();
      });
      const small = document.createElement('small');
      small.textContent = item.type;
      div.appendChild(linkEl);
      div.appendChild(small);
      resultsContainer.appendChild(div);
    });
  }

  // Perform search on the dataset
  function handleSearch() {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      renderResults([]);
      return;
    }
    const data = getSearchData();
    const results = data.filter(function (item) {
      const haystack = (item.title + ' ' + item.description).toLowerCase();
      return haystack.includes(query);
    });
    renderResults(results);
  }

  function openOverlay() {
    overlay.classList.add('active');
    input.value = '';
    renderResults([]);
    // Use setTimeout to ensure focus after display
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  function closeOverlay() {
    overlay.classList.remove('active');
  }

  // Event bindings
  searchButton.addEventListener('click', function () {
    openOverlay();
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeOverlay();
    }
  });
  input.addEventListener('input', handleSearch);
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeOverlay();
    }
  });
});