# InsightForge

Веб‑приложение использует функции Netlify для проксирования вызовов OpenAI. Для корректной работы на любом деплое переменные окружения на Netlify должны быть заданы для **All** (или отдельно для Production, Deploy Previews и Branch deploys).

Используются следующие имена переменных:

- `OPENAI_API_KEY`
- `OPEN_API_KEY`
- `OPENAI_KEY_ADMIN`
- `OPENAI_KEY_DESIGN`
- `OPENAI_KEY_GEN`
- `OPENAI_KEY_GUARD`
- `OPENAI_KEY_RESEARCH`
- `OPENAI_KEY_SUPPORT`

Основные функции находятся в директории `netlify/functions`:

- `openai-keys.js` — выбор ключей по ролям
- `openai.js` — прокси для запросов к OpenAI с поддержкой ролей и фолбэка
- `diag.js` — диагностика доступности ключей
