// resources.js
// Implements simple search filtering for the resources list on the Resources page

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('resources-search');
  const resourcesList = document.getElementById('resources-list');
  if (!searchInput || !resourcesList) return;
  const items = Array.from(resourcesList.querySelectorAll('li'));
  function filterResources() {
    const query = searchInput.value.trim().toLowerCase();
    items.forEach(function (item) {
      const text = item.dataset.text || item.textContent.toLowerCase();
      item.style.display = !query || text.includes(query) ? '' : 'none';
    });
  }
  searchInput.addEventListener('input', filterResources);
});