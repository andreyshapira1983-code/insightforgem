#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FUNCDIR = 'netlify/functions';
const ONLY_GALAXY = 'js/galaxy-bg.js';
const DISALLOW_META_CSP = /<meta[^>]+http-equiv=["']Content-Security-Policy["']/i;
const REQUIRED_FUNCS = ['openai.js', 'openai-keys.js', 'diag.js'];
// collect files
const ALL = walk('.', (p) => !p.startsWith('.git/') && !p.startsWith('node_modules/'));
const HTML = ALL.filter((f) => f.endsWith('.html'));
const JS = ALL.filter((f) => f.endsWith('.js'));
const CSS = ALL.filter((f) => f.endsWith('.css'));
const FUNCS = ALL.filter((f) => f.startsWith(FUNCDIR + '/') && f.endsWith('.js'));

// 1) CSP в <meta> запрещена
const metaCsp = HTML.filter((f) => DISALLOW_META_CSP.test(read(f)));

// 2) Лишние файлы галактики
const galaxyList = ALL.filter((f) => /galaxy.*bg\.js$/i.test(f) || /combined.*galaxy.*bg/i.test(f));
const galaxyDup = galaxyList.filter((f) => f !== ONLY_GALAXY);

// 3) Дубликаты по хешу (>200KB)
const big = ALL.filter((f) => fs.statSync(f).size > 200 * 1024);
const hashes = new Map();
for (const f of big) {
  const h = sha256(fs.readFileSync(f));
  (hashes.get(h) || hashes.set(h, []).get(h)).push(f);
}
const duplicates = [...hashes.values()].filter((a) => a.length > 1);

// 4) Битые локальные пути (src/href/import/url)
const refs = collectRefs(HTML, JS, CSS);
const missing = refs.local.filter((p) => !fs.existsSync(p));

// 5) Неиспользуемые кандидаты (js/css/img не встречаются нигде)
const used = new Set(refs.local);
const unused = ALL.filter((f) => {
  if (!(f.startsWith('js/') || f.startsWith('css/') || f.startsWith('img/'))) return false;
  if (f.endsWith('.map')) return false;
  if (f === ONLY_GALAXY || /diag\.js$/.test(f)) return false;
  return !used.has(f);
});

// 6) Наличие функций и CORS
const funcIssues = [];
if (!fs.existsSync(FUNCDIR)) {
  funcIssues.push('missing netlify/functions dir');
} else {
  for (const n of REQUIRED_FUNCS) {
    if (!fs.existsSync(path.join(FUNCDIR, n))) funcIssues.push('missing ' + n);
  }
  const noCORS = FUNCS.filter((f) => !/Access-Control-Allow-Origin|ALLOWED_ORIGIN/i.test(read(f)));
  if (noCORS.length) funcIssues.push('CORS headers missing in: ' + noCORS.join(', '));
}

// 7) netlify.toml: CSP в заголовке и разрешение Flaticon
let tomlWarn = [];
if (fs.existsSync('netlify.toml')) {
  const t = read('netlify.toml');
  if (!/Content-Security-Policy/i.test(t)) {
    tomlWarn.push('CSP missing in netlify.toml');
  }
  if (!/img-src[^"']*flaticon\.com/i.test(t)) {
    tomlWarn.push('Flaticon not whitelisted in img-src');
  }
} else {
  tomlWarn.push('netlify.toml not found');
}

// 8) Тяжёлые картинки >500KB
const heavy = ALL.filter((f) => /^img\/.*\.(png|jpe?g|webp|gif|svg)$/i.test(f)).filter(
  (f) => fs.statSync(f).size > 500 * 1024
);

// 9) Итог
const problems = { metaCsp, galaxyDup, duplicates, missing, unused, funcIssues, tomlWarn, heavy };
const errors = metaCsp.length || galaxyDup.length || missing.length || funcIssues.length;
const report = {
  ok: !errors,
  summary: {
    metaCsp: metaCsp.length,
    galaxyDup: galaxyDup.length,
    duplicateBlobs: duplicates.length,
    missingRefs: missing.length,
    unusedCandidates: unused.length,
    funcIssues: funcIssues.length,
    tomlWarnings: tomlWarn.length,
    heavyImages: heavy.length,
  },
  details: problems,
};
console.log(JSON.stringify(report, null, 2));
process.exit(errors ? 1 : 0);

// helpers
function walk(dir, filter) {
  const out = [];
  (function rec(d) {
    if (!fs.existsSync(d)) return;
    for (const n of fs.readdirSync(d)) {
      const p = path.posix.join(d, n);
      const st = fs.statSync(p);
      if (st.isDirectory()) rec(p);
      else if (!filter || filter(p)) out.push(p);
    }
  })(dir);
  return out;
}
function read(f) {
  return fs.readFileSync(f, 'utf8');
}
function sha256(b) {
  return crypto.createHash('sha256').update(b).digest('hex');
}
function collectRefs(htmls, jss, csss) {
  const local = new Set();
  const add = (from, rel) => {
    if (!rel) return;
    const q = rel.split('#')[0].split('?')[0];
    if (/^https?:\/\//i.test(q)) return;
    const p = path.posix.join(path.posix.dirname(from), q).replace(/^\.\//, '');
    local.add(p);
  };
  const rxSrcHref = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  for (const f of htmls) {
    const s = read(f);
    let m;
    while ((m = rxSrcHref.exec(s))) add(f, m[1]);
  }
  const rxImport = /import\s+.*?from\s+["']([^"']+)["']|require\(["']([^"']+)["']\)/g;
  for (const f of jss) {
    const s = read(f);
    let m;
    while ((m = rxImport.exec(s))) add(f, m[1] || m[2]);
  }
  const rxUrl = /url\(["']?([^"')]+)["']?\)/g;
  for (const f of csss) {
    const s = read(f);
    let m;
    while ((m = rxUrl.exec(s))) add(f, m[1]);
  }
  return { local: [...local] };
}
