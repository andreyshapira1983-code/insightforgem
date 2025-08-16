// netlify/functions/sched_weekly_report.js
const { callCommand, notifyTG } = require('./_callCommand');

exports.handler = async () => {
  try {
    const note = `Автопилот: отчёт за ${new Date().toISOString().slice(0,10)}`;
    const r = await callCommand('weekly_report', { note });
    const msg = `📊 Weekly report saved: ${r.result.saved}`;
    await notifyTG(msg);
    return { statusCode: 200, body: msg };
  } catch (e) {
    const msg = `🛑 Weekly report failed: ${e.message}`;
    await notifyTG(msg);
    return { statusCode: 500, body: msg };
  }
};
