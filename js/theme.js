// theme.js
// Handles light/dark mode toggling and persists the user preference

document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('theme-toggle');
  // Load saved theme preference from a global variable.  Theme
  // preferences are no longer persisted in localStorage.  The server
  // may choose to set a cookie if persistence is desired.
  if (window.starGalaxyTheme === 'light') {
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
      // Save preference in memory.  If persistence is required,
      // the server should store it in a cookie.
      if (document.body.classList.contains('light')) {
        window.starGalaxyTheme = 'light';
      } else {
        window.starGalaxyTheme = null;
      }
      updateIcon();
    });
  }
});