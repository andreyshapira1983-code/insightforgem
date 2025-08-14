const https = require('https');
const url = process.env.OPENAI_URL || 'https://<домен>/.netlify/functions/openai';
const roles = ['design', 'gen', 'guard', 'research', 'admin', 'support'];
(async () => {
  for (const r of roles) {
    const j = await post(url, {
      role: r,
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'ok' }],
    });
    if (!j.meta || j.meta.roleUsed !== r) throw new Error('role mismatch ' + r);
    console.log('OK role', r);
  }
  process.exit(0);
})().catch((e) => {
  console.error('ROLES', e.message);
  process.exit(1);
});
function post(u, body) {
  return new Promise((res, rej) => {
    const r = https.request(
      u,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (x) => {
        let b = '';
        x.on('data', (c) => (b += c));
        x.on('end', () => {
          try {
            res(JSON.parse(b));
          } catch (e) {
            rej(e);
          }
        });
      }
    );
    r.on('error', rej);
    r.write(JSON.stringify(body));
    r.end();
  });
}
