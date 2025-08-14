const http = require('http');
const url = process.env.DIAG_URL || 'http://localhost:8888/.netlify/functions/diag';
http
  .get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error('HTTP', res.statusCode);
      process.exit(1);
    }
    let b = '';
    res.on('data', (c) => (b += c));
    res.on('end', () => {
      try {
        const j = JSON.parse(b);
        if (!j.foundEnvNames || !j.foundEnvNames.length) throw new Error('No env names');
        console.log('OK keys:', j.foundEnvNames.join(', '));
      } catch (e) {
        console.error('Parse', e.message);
        process.exit(1);
      }
    });
  })
  .on('error', (e) => {
    console.error('Diag', e.message);
    process.exit(1);
  });
