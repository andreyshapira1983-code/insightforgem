// Общий скрипт для обновления состояния кнопки входа/выхода
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('a.login-btn');
  if (!loginBtn) return;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn) {
    loginBtn.textContent = 'Выйти';
    loginBtn.href = '#logout';
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('isLoggedIn');
      // перезагружаем страницу для обновления интерфейса
      window.location.reload();
    });
  } else {
    loginBtn.textContent = 'Войти';
    loginBtn.href = '/account';
  }
});