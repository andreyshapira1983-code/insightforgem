// netlify/functions/sched_health.js
const { callCommand, notifyTG } = require('./_callCommand');

exports.handler = async () => {
  try {
    const health = await callCommand('check_health');
    let text = `✅ Health: site=${health.result.okSite}, blobs=${health.result.okBlobs}`;

    if (!health.result.okSite || !health.result.okBlobs) {
      const fix = await callCommand('auto_fix');
      text = `⚠️ HEALTH WARN\nsite=${health.result.okSite} blobs=${health.result.okBlobs}\nauto_fix: ${JSON.stringify(fix.result.actions)}`;
      await callCommand('redeploy');
    }

    await notifyTG(text);
    return { statusCode: 200, body: text };
  } catch (e) {
    const msg = `🛑 Health error: ${e.message}`;
    await notifyTG(msg);
    return { statusCode: 500, body: msg };
  }
};
