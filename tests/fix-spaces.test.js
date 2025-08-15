import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exec = (cmd, args, opts={}) => new Promise((resolve, reject) => {
  execFile(cmd, args, opts, (err, stdout, stderr) => {
    if (err) return reject(Object.assign(err,{stdout,stderr}));
    resolve({stdout, stderr});
  });
});

const run = async (name, fn) => {
  try {
    await fn();
    console.log('\u2713', name);
  } catch (e) {
    console.error('\u2717', name, e);
    process.exitCode = 1;
  }
};

const tmpDir = path.join(__dirname, 'tmp');
await fs.mkdir(tmpDir, { recursive: true });

await run('dry run does not modify files', async () => {
  const file = path.join(tmpDir, 'a.js');
  await fs.writeFile(file, 'const x = 1;   \n');
  const { stdout } = await exec('node', ['../tools/fix-spaces.js', '--dry-run', file], { cwd: __dirname });
  const content = await fs.readFile(file, 'utf8');
  assert.equal(content, 'const x = 1;   \n');
  assert.match(stdout, /Would fix/);
});

await run('applies fixes to matching extensions', async () => {
  const file = path.join(tmpDir, 'b.txt');
  await fs.writeFile(file, 'hello   \n');
  await exec('node', ['../tools/fix-spaces.js', '--ext', '.txt', file], { cwd: __dirname });
  const content = await fs.readFile(file, 'utf8');
  assert.equal(content, 'hello\n');
});

await run('config file and ignore patterns work', async () => {
  const cfgPath = path.join(tmpDir, 'config.json');
  await fs.writeFile(cfgPath, JSON.stringify({ extensions: ['.txt'], ignore: ['skip'] }));
  const goodFile = path.join(tmpDir, 'c.txt');
  const ignoredFile = path.join(tmpDir, 'skip', 'd.txt');
  await fs.mkdir(path.dirname(ignoredFile), { recursive: true });
  await fs.writeFile(goodFile, 'hi   \n');
  await fs.writeFile(ignoredFile, 'no   \n');
  await exec('node', ['../tools/fix-spaces.js', '--config', cfgPath, tmpDir], { cwd: __dirname });
  const good = await fs.readFile(goodFile, 'utf8');
  const ignored = await fs.readFile(ignoredFile, 'utf8');
  assert.equal(good, 'hi\n');
  assert.equal(ignored, 'no   \n');
});
