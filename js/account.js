// Скрипт для управления страницей входа и авторизацией
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // имитация проверки логина
      localStorage.setItem('isLoggedIn', 'true');
      if (message) {
        message.classList.remove('hidden');
        message.textContent = 'Вы успешно вошли!';
      }
      // обновить кнопку во всех страницах
      setTimeout(() => {
        window.location.href = '/generator';
      }, 1000);
    });
  }
  // псевдо‑обработчики для кнопок OAuth: показываем уведомление
  const oauthButtons = document.querySelectorAll('.oauth');
  oauthButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      localStorage.setItem('isLoggedIn', 'true');
      if (message) {
        message.classList.remove('hidden');
        message.textContent = 'Вы успешно вошли через OAuth!';
      }
      setTimeout(() => {
        window.location.href = '/generator';
      }, 1000);
    });
  });
});