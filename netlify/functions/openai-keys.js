const centralNames = ['OPENAI_API_KEY','OPEN_API_KEY','OPENAI_KEY','OPEN_KEY'];
const env = process.env;

// Collect all key values and role specific mappings
const allKeys = [];
const added = new Set();
const roleKeys = {};

for (const [name, value] of Object.entries(env)) {
  if (!value) continue;
  if (centralNames.includes(name) || name.startsWith('OPENAI_KEY_')) {
    if (!added.has(value)) {
      allKeys.push(value);
      added.add(value);
    }
    if (name.startsWith('OPENAI_KEY_') && !centralNames.includes(name)) {
      const role = name.slice('OPENAI_KEY_'.length).toLowerCase();
      if (!roleKeys[role]) roleKeys[role] = [];
      if (!roleKeys[role].includes(value)) roleKeys[role].push(value);
    }
  }
}

let index = 0;
const roleIndex = {};

function pickKey({ role } = {}) {
  if (role) {
    const r = String(role).toLowerCase();
    const list = roleKeys[r];
    if (list && list.length) {
      const i = roleIndex[r] || 0;
      roleIndex[r] = (i + 1) % list.length;
      return list[i % list.length];
    }
  }
  if (!allKeys.length) throw new Error('No OpenAI API keys configured');
  const key = allKeys[index % allKeys.length];
  index = (index + 1) % allKeys.length;
  return key;
}

function detectedKeyNames() {
  return Object.keys(env).filter(name =>
    (centralNames.includes(name) || name.startsWith('OPENAI_KEY_')) && env[name]
  );
}

module.exports = { pickKey, detectedKeyNames };
