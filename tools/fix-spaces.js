#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// Default options
let options = {
  extensions: ['.js'],
  ignore: ['node_modules'],
  dryRun: false
};

let configPath;
const targets = [];

// Simple argument parsing
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--ext' || arg === '--extensions') {
    options.extensions = args[++i].split(',').map(e => (e.startsWith('.') ? e : '.' + e));
  } else if (arg === '--ignore') {
    options.ignore = args[++i].split(',').filter(Boolean);
  } else if (arg === '--config') {
    configPath = args[++i];
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else {
    targets.push(arg);
  }
}

async function loadConfig(file) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    const cfg = JSON.parse(txt);
    if (Array.isArray(cfg.extensions)) {
      options.extensions = cfg.extensions.map(e => (e.startsWith('.') ? e : '.' + e));
    }
    if (Array.isArray(cfg.ignore)) {
      options.ignore = cfg.ignore;
    }
  } catch {
    // ignore if file missing or invalid
  }
}

// Load config if provided or default exists
if (configPath) {
  await loadConfig(configPath);
} else {
  try {
    await fs.access('fix-spaces.config.json');
    await loadConfig('fix-spaces.config.json');
  } catch {}
}

function isIgnored(file) {
  return options.ignore.some(p => file.includes(p));
}

async function processFile(file) {
  if (isIgnored(file)) return;
  if (!options.extensions.some(ext => file.endsWith(ext))) return;
  const original = await fs.readFile(file, 'utf8');
  const fixed = original.replace(/[ \t]+(\r?\n)/g, '$1');
  if (fixed !== original) {
    if (options.dryRun) {
      console.log(`Would fix ${file}`);
    } else {
      await fs.writeFile(file, fixed);
      console.log(`Fixed ${file}`);
    }
  }
}

async function walk(target) {
  const stat = await fs.stat(target);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(target, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(target, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        await processFile(full);
      }
    }
  } else {
    await processFile(target);
  }
}

const toProcess = targets.length ? targets : ['.'];
for (const t of toProcess) {
  await walk(path.resolve(t));
}
