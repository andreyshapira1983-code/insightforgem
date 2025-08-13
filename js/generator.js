// Логика для генератора идей: установка случайного процента для Gauge
document.addEventListener('DOMContentLoaded', () => {
  const gauge = document.getElementById('gauge');
  const gaugeValue = document.getElementById('gauge-value');
  if (!gauge || !gaugeValue) return;
  // сгенерировать число 0–100 для демонстрации
  const value = Math.floor(Math.random() * 101);
  gauge.style.setProperty('--gauge-value', `${value}%`);
  gaugeValue.textContent = `${value}%`;
});