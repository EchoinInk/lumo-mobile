#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Lumo Mobile Auto Commit"
echo "━━━━━━━━━━━━━━━━━━━━━━"

set -e

# Always run from repo root
cd "$(git rev-parse --show-toplevel)"

# Safety: ignore junk
git add -A

# Ignore empty commits
if git diff --cached --quiet; then
  echo "🟡 No changes to commit"
  exit 0
fi

# Smart lightweight message
FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')

if [ "$FILES" -eq 1 ]; then
  FILE=$(git diff --cached --name-only | head -n 1)
  MSG="chore(lumo): update $FILE"
else
  MSG="chore(lumo): update $FILES files"
fi

echo "📝 $MSG"

git commit -m "$MSG"

echo "⬆️ pushing..."
git push

echo "✅ done"