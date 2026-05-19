#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Lumo Auto Commit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

git add .

git commit -m "chore: update $(date '+%Y-%m-%d %H:%M:%S')"

git push

echo ""
echo "✅ Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"