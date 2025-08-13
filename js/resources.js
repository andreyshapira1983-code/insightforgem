// resources.js
// Implements simple search filtering for the resources list on the Resources page

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('resources-search');
  const resourcesList = document.getElementById('resources-list');
  const filterCheckboxes = document.querySelectorAll('.resource-filter input[type="checkbox"]');
  if (!resourcesList) return;
  const items = Array.from(resourcesList.querySelectorAll('li'));

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selected = Array.from(filterCheckboxes).filter(function (cb) { return cb.checked; }).map(function (cb) { return cb.value; });
    items.forEach(function (item) {
      const text = (item.dataset.text || item.textContent).toLowerCase();
      const category = item.dataset.category || '';
      const matchesQuery = !query || text.includes(query);
      const matchesCategory = selected.length === 0 || selected.includes(category);
      item.style.display = matchesQuery && matchesCategory ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  filterCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', applyFilters);
  });
  applyFilters();
});