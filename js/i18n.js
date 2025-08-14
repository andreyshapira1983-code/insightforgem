// i18n.js
// Basic internationalisation support for Star Galaxy.
// Detects the user's browser language and replaces text in the
// navigation and certain headings with Russian equivalents if the
// language begins with `ru`.  This is a simple implementation for
// demonstration purposes and does not cover all content on the site.

document.addEventListener('DOMContentLoaded', function () {
  const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  // Only apply translations for Russian
  if (!lang.startsWith('ru')) return;
  // Map of English strings to Russian translations
  const translations = {
    'Home': 'Главная',
    'Generator': 'Генератор',
    'My Ideas': 'Мои идеи',
    'Trending': 'Тренды',
    'Resources': 'Ресурсы',
    'Community': 'Сообщество',
    'Legal': 'Юридическая',
    'Sign In': 'Войти',
    'Sign Out': 'Выйти',
    'Welcome to Star Galaxy': 'Добро пожаловать в Star Galaxy',
    'Discover and refine business ideas with AI and a vibrant community of innovators.': 'Открывайте и совершенствуйте бизнес‑идеи с помощью ИИ и живого сообщества новаторов.',
    'Try the Generator': 'Попробуйте генератор',
    'My Ideas': 'Мои идеи',
    'Market Trends': 'Рыночные тренды',
    'Latest News': 'Последние новости',
    'Stats': 'Статистика',
    'Total Ideas:': 'Всего идей:',
    'Users Online:': 'Пользователей онлайн:',
    'Idea of the Day:': 'Идея дня:'
  };
  // Translate nav links
  document.querySelectorAll('.nav a').forEach(function (link) {
    const key = link.textContent.trim();
    if (translations[key]) {
      link.textContent = translations[key];
    }
  });
  // Translate auth button
  const authBtn = document.getElementById('sign-in-button');
  if (authBtn && translations[authBtn.textContent.trim()]) {
    authBtn.textContent = translations[authBtn.textContent.trim()];
  }
  // Translate hero and headings
  document.querySelectorAll('h1, h2, p, a span').forEach(function (el) {
    const key = el.textContent.trim();
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });
});