// trending.js
// Implements search and category filtering for trending items on the Trending page

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('trending-search');
  const filterCheckboxes = document.querySelectorAll('.trend-filter input[type="checkbox"]');
  const items = Array.from(document.querySelectorAll('.trend-item'));

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedCategories = Array.from(filterCheckboxes)
      .filter(function (cb) { return cb.checked; })
      .map(function (cb) { return cb.value; });
    items.forEach(function (item) {
      const textContent = item.textContent.toLowerCase();
      const categories = item.dataset.categories ? item.dataset.categories.split(',') : [];
      const matchesQuery = !query || textContent.includes(query);
      const matchesCategory = selectedCategories.length === 0 || categories.some(function (cat) {
        return selectedCategories.includes(cat);
      });
      if (matchesQuery && matchesCategory) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  filterCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', applyFilters);
  });
  // Run once on page load
  applyFilters();
});
