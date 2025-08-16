// netlify/functions/updateBackground.js

export async function handler(event, context) {
  try {
    // Тут ты можешь придумать любую логику "обновления фона"
    // Например, меняем фон на случайный вариант из списка
    const backgrounds = [
      "bg-space-1.jpg",
      "bg-space-2.jpg",
      "bg-space-3.jpg"
    ];

    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    // ⚡ В реальном проекте здесь можно:
    // 1. Обновить запись в базе (какой фон активен)
    // 2. Триггерить redeploy Netlify (если фон в CSS)
    // Сейчас просто вернём результат
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Фон успешно обновлён",
        background: randomBg
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}
