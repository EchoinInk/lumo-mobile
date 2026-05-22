#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Lumo Auto Commit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

set -e  # fail fast if anything breaks

echo "📦 Staging changes..."
git add . && echo "✔ staged"

echo "📝 Creating commit..."
git commit -m "chore: update $(date '+%Y-%m-%d %H:%M:%S')" && echo "✔ committed"

echo "⬆️ Pushing to remote..."
git push && echo "✔ pushed"

echo ""
echo "✅ Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"