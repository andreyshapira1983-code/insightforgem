// netlify/functions/_callCommand.js
const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));

exports.callCommand = async (cmd, data = {}) => {
  const url = `${process.env.URL || process.env.DEPLOY_URL}/.netlify/functions/command`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': process.env.X_ADMIN_TOKEN
    },
    body: JSON.stringify({ cmd, data })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    const msg = `command[${cmd}] failed: ${json.error || res.statusText}`;
    throw new Error(msg);
  }
  return json;
};

// уведомление в Telegram (опционально)
exports.notifyTG = async (text) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text })
    });
  } catch {}
};
