const ROLES = ["admin", "design", "gen", "guard", "research", "support"];

function collect(role) {
  const base = `OPENAI_KEY_${role.toUpperCase()}`;
  const names = [];
  if (process.env[base]) names.push(base);
  for (let i = 1; ; i++) {
    const name = `${base}_${i}`;
    if (process.env[name]) names.push(name);
    else break;
  }
  return names;
}

const roleMap = {};
for (const role of ROLES) {
  roleMap[role] = collect(role);
}

const counters = {};

export function pickKey({ role }) {
  const names = roleMap[role] || [];
  if (names.length === 0) return null;
  counters[role] = (counters[role] || 0) + 1;
  return names[(counters[role] - 1) % names.length];
}

export function listByRole() {
  return roleMap;
}
