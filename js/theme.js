// theme.js
// Handles light/dark mode toggling and persists the user preference

document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('theme-toggle');
  // Load saved theme preference
  const savedTheme = localStorage.getItem('starGalaxyTheme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
  }
  // Update button icon based on current theme
  function updateIcon() {
    if (!toggleButton) return;
    const isLight = document.body.classList.contains('light');
    toggleButton.textContent = isLight ? '☀' : '☾';
  }
  updateIcon();
  if (toggleButton) {
    toggleButton.addEventListener('click', function () {
      document.body.classList.toggle('light');
      // Save or remove preference
      if (document.body.classList.contains('light')) {
        localStorage.setItem('starGalaxyTheme', 'light');
      } else {
        localStorage.removeItem('starGalaxyTheme');
      }
      updateIcon();
    });
  }
});