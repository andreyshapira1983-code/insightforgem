#!/usr/bin/env bash
set -euo pipefail

echo "== Star Galaxy Cleanup Kit =="
echo "This script will:"
echo "  1) remove js/security.js"
echo "  2) keep only js/script.js and js/generator.js (delete duplicates)"
echo "  3) strip console.*, alert/confirm/prompt from js/*.js"
echo "  4) add ESLint/Prettier configs and CI workflow"
echo "  5) update js/package.json with lint/format scripts"
echo

# Sanity checks
if [ ! -d "./js" ]; then
  echo "ERROR: Run this script from the repository root (must contain ./js directory)."
  exit 1
fi

# 1) Remove breaking file
if [ -f "js/security.js" ]; then
  git rm -f js/security.js || rm -f js/security.js
  echo "[ok] removed js/security.js"
else
  echo "[ok] js/security.js already absent"
fi

# 2) Remove duplicates (keep js/script.js and js/generator.js only)
echo "[..] scanning for duplicates in ./js"
dups=$(git ls-files | grep -E '(^|/)js/(script(?!\.js$).*|generator(?!\.js$).*)\.js$' || true)
if [ -n "$dups" ]; then
  echo "$dups" | while read -r f; do
    git rm -f "$f" || rm -f "$f"
    echo "[ok] removed duplicate: $f"
  done
else
  echo "[ok] no duplicate script*/generator* files found in ./js"
fi

# Remove root-level script.js, if any (we keep only js/script.js)
if [ -f "script.js" ]; then
  git rm -f script.js || rm -f script.js
  echo "[ok] removed root-level script.js"
fi

# 3) Strip debug calls in all js/*.js
echo "[..] stripping console.*, alert/confirm/prompt from js/*.js"
find js -type f -name "*.js" -print0 | xargs -0 sed -i.bak   -e '/\bconsole\.[a-zA-Z_]\+\s*(/d'   -e '/\balert\s*(/d'   -e '/\bconfirm\s*(/d'   -e '/\bprompt\s*(/d'
find js -type f -name "*.js.bak" -delete
echo "[ok] stripped debug calls"

# 4) Add ESLint/Prettier configs
echo "[..] writing .eslintrc.json and .prettierrc"
cat > .eslintrc.json << 'EOF'
{
  "env": { "browser": true, "es2021": true },
  "extends": ["eslint:recommended"],
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "rules": {
    "no-console": "warn",
    "no-alert": "warn"
  }
}
EOF

cat > .prettierrc << 'EOF'
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5"
}
EOF
echo "[ok] lint/format configs created"

# 5) Add CI workflow
echo "[..] writing .github/workflows/ci.yml"
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install
        run: npm ci
        working-directory: js
      - name: Lint
        run: npm run lint
        working-directory: js
      - name: Prettier check
        run: npm run format:check
        working-directory: js
EOF
echo "[ok] CI workflow created"

# 6) Update js/package.json scripts (lint/format)
echo "[..] updating js/package.json scripts"
if [ -f "js/package.json" ]; then
  node -e "const fs=require('fs');const p='js/package.json';let j=JSON.parse(fs.readFileSync(p,'utf8'));j.scripts=j.scripts||{};j.scripts.lint='eslint . --ext .js,.mjs --max-warnings=0';j.scripts['format']='prettier . --write';j.scripts['format:check']='prettier . --check';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"     || echo 'WARN: Node not available; please add scripts manually to js/package.json'
  echo "[ok] js/package.json scripts set (or warning printed above)"
else
  echo "WARN: js/package.json not found. Skipped updating scripts."
fi

# 7) Git commit (optional, if repo is a git repo)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git add -A || true
  git commit -m "chore: remove security.js, dedupe scripts; strip debug logs; add CI (lint & format:check)" || echo "INFO: nothing to commit"
  echo
  echo "[ok] committed changes locally."
  echo "Next steps (when GitHub is available):"
  echo "  git push -u origin <your-branch>"
  echo "  open PR with title:"
  echo "    chore: remove security.js, dedupe scripts; strip debug logs; add CI (lint & format:check)"
else
  echo "INFO: Not a git repo; files updated on disk."
fi

echo
echo "== Done =="
