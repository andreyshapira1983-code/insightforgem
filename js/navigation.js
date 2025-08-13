// navigation.js
// Handles responsive navigation behaviour such as the mobile hamburger menu
// and nav overlay dimming.

document.addEventListener('DOMContentLoaded', function () {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  const overlay = document.getElementById('nav-overlay');
  if (!nav) return;

  function closeMenu() {
    nav.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', function () {
      closeMenu();
    });
  }
  // Close the menu when any nav link is clicked
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });
});