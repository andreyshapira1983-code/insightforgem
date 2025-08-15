Star Galaxy Cleanup Kit
=========================

Что делает:
1) Удаляет js/security.js.
2) Оставляет только js/script.js и js/generator.js (удаляет дубли).
3) Удаляет отладочные вызовы (console.*, alert/confirm/prompt) из всех js/*.js.
4) Добавляет .eslintrc.json и .prettierrc в корень.
5) Добавляет .github/workflows/ci.yml (lint + format:check).
6) Обновляет js/package.json, добавляя скрипты lint/format.

Как использовать:
1) Скачайте архив и распакуйте в корень репозитория.
2) В терминале (в корне репо) выполните:
   bash apply_cleanup.sh
3) Когда GitHub восстановится:
   git push -u origin <ваша-ветка>
   Откройте PR со стандартным заголовком.

Требования:
- Unix-шелл (bash).
- Опционально: Node.js (для автоматического обновления js/package.json). Если Node нет — внесите скрипты вручную.
