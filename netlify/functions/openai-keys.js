const CENTRAL = ['OPENAI_API_KEY', 'OPEN_API_KEY', 'OPENAI_KEY', 'OPEN_KEY'];
// Environment variables prefixed with OPENAI_API_KEY_ map keys to roles.
// For example, OPENAI_API_KEY_ADMIN will be used when role="admin".
const PREFIX = 'OPENAI_API_KEY_';
let rr = 0;

function collect(env = process.env) {
  const set = new Set();
  CENTRAL.forEach((n) => env[n] && set.add(env[n]));
  Object.entries(env).forEach(([k, v]) => k.startsWith(PREFIX) && v && set.add(v));
  return [...set];
}

function roleMap(env = process.env) {
  const m = {};
  Object.entries(env).forEach(([k, v]) => {
    if (k.startsWith(PREFIX)) m[k.slice(PREFIX.length).toLowerCase()] = v;
  });
  return m;
}

function pickKey({ role } = {}, env = process.env) {
  const by = roleMap(env);
  if (role) {
    const key = by[role.toLowerCase()];
    if (!key) throw new Error(`No OpenAI key for role: ${role}`);
    return key;
  }
  const all = collect(env);
  if (!all.length) throw new Error('No OpenAI keys found');
  const k = all[rr % all.length];
  rr++;
  return k;
}

function detectedKeyNames(env = process.env) {
  return [
    ...CENTRAL.filter((n) => env[n]),
    ...Object.keys(env).filter((k) => k.startsWith(PREFIX)),
  ].sort();
}

module.exports = { pickKey, detectedKeyNames };
