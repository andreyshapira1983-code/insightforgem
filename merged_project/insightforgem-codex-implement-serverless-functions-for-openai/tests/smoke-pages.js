const { chromium } = require('@playwright/test');
const SITE = process.env.SITE_URL || 'https://<домен>';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const paths = ['/', '/generator', '/resources', '/community', '/ideas', '/trending'];
  for (const x of paths) {
    const r = await p.goto(SITE + x, { waitUntil: 'domcontentloaded' });
    if (!r || r.status() >= 400) throw new Error('HTTP ' + x + ' ' + (r && r.status()));
    // простые проверки наличия важного UI (не падаем, если блока нет)
    await p.waitForTimeout(200); // дать скриптам шанс
  }
  console.log('OK pages');
  await b.close();
  process.exit(0);
})().catch((e) => {
  console.error('PAGES', e.message);
  process.exit(1);
});
