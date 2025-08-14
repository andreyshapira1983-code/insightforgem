const base = process.env.DIAG_URL || 'http://localhost:8888/.netlify/functions/diag';

async function getJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

(async () => {
  const j = await getJSON(base);
  if (!Array.isArray(j.foundEnvNames) || !j.foundEnvNames.length) throw new Error('No env names');
  if (!j.roundRobinSample) throw new Error('Round-robin not working');
  const roles = ['design', 'gen', 'guard', 'research', 'admin', 'support'];
  for (const r of roles) {
    const k = await getJSON(`${base}?role=${r}`);
    if (k.meta?.roleUsed !== r) throw new Error(`Role ${r} missing`);
  }
  console.log('OK diag:', j.foundEnvNames.join(', '));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
