#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━"
echo "🧠 Lumo Commit Intelligence"
echo "━━━━━━━━━━━━━━━━━━━━━━"

set -e

cd "$(git rev-parse --show-toplevel)"

# -----------------------------
# 1. Stage everything
# -----------------------------
git add -A

# -----------------------------
# 2. Safety check: empty commit
# -----------------------------
if git diff --cached --quiet; then
  echo "🟡 No meaningful changes"
  exit 0
fi

# -----------------------------
# 3. Detect change metrics
# -----------------------------
FILES_CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
LINES_CHANGED=$(git diff --cached | grep -E "^\+|^\-" | wc -l | tr -d ' ')

CHANGED_FILES=$(git diff --cached --name-only)

# -----------------------------
# 4. Noise filtering (ignore junk-heavy commits)
# -----------------------------
NOISE_PATTERNS="package-lock.json|yarn.lock|.log|.expo|metro|tsbuildinfo"

if echo "$CHANGED_FILES" | grep -E "$NOISE_PATTERNS" > /dev/null; then
  echo "🟡 Skipping noise-only changes"
  exit 0
fi

# -----------------------------
# 5. Smart commit message engine
# -----------------------------
PRIMARY_FILE=$(echo "$CHANGED_FILES" | head -n 1)

if [ "$FILES_CHANGED" -eq 1 ]; then
  MSG="chore(lumo): update $(basename "$PRIMARY_FILE")"

elif [ "$FILES_CHANGED" -le 3 ]; then
  MSG="chore(lumo): refine UI + logic ($FILES_CHANGED files)"

elif [ "$FILES_CHANGED" -le 10 ]; then
  MSG="feat(lumo): update components and screens ($FILES_CHANGED files)"

else
  MSG="chore(lumo): large refactor ($FILES_CHANGED files)"
fi

# -----------------------------
# 6. Commit
# -----------------------------
echo "📝 Commit:"
echo "$MSG"

git commit -m "$MSG"

# -----------------------------
# 7. Push safely
# -----------------------------
echo "⬆️ pushing..."
git push

echo "✅ intelligent commit complete"