const https = require('https');
const url = process.env.OPENAI_URL || 'https://<домен>/.netlify/functions/openai';
req(url, { model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] })
  .then((j) => {
    if (j.error) throw new Error(j.error);
    console.log('OK openai');
    process.exit(0);
  })
  .catch((e) => {
    console.error('FUNC', e.message);
    process.exit(1);
  });
function req(u, body) {
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
    r.write(JSON.stringify(body || {}));
    r.end();
  });
}
