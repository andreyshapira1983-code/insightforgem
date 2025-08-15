#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const LOG_FILE = path.join(ROOT, 'autofix-log.json');
let log = {};
try {
  log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
} catch {
  log = {};
}

const rules = [
  { name: 'trim-trailing-space', regex: /[ \t]+$/gm, replacement: '' }
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else processFile(full);
  }
}

function walkTarget(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) walk(target);
  else if (stat.isFile()) processFile(target);
}

function processFile(file) {
  const ext = path.extname(file);
  const allow = ['.js', '.html', '.css', '.md', '.txt', '.json'];
  if (!allow.includes(ext)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const rule of rules) {
    const updated = content.replace(rule.regex, rule.replacement);
    if (updated !== content) {
      changed = true;
      content = updated;
      log[rule.name] = log[rule.name] || [];
      if (!log[rule.name].includes(file)) {
        log[rule.name].push(file);
      }
    }
  }
  if (!content.endsWith('\n')) {
    content += '\n';
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Auto-fixed ${file}`);
  }
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  walkTarget(ROOT);
} else {
  for (const t of targets) {
    walkTarget(path.resolve(ROOT, t));
  }
}

fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2) + '\n');
