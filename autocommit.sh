#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧠 Lumo Auto Commit Intelligence
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$REPO_ROOT" ]; then
  echo "❌ Not inside a git repository"
  exit 1
fi

cd "$REPO_ROOT"

LOG_DIR=".lumo"
LOG_FILE="$LOG_DIR/commit-log.txt"

mkdir -p "$LOG_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━"
echo "🧠 Lumo Auto Commit Running"
echo "📁 Repo: $REPO_ROOT"
echo "📝 Logs: $LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# -----------------------------
# Ignore junk-only changes
# -----------------------------
NOISE_PATTERNS="package-lock.json|yarn.lock|\.log$|\.expo|metro|tsbuildinfo"

# -----------------------------
# Main loop
# -----------------------------
while true; do

  # Check for changes
  if ! git diff --quiet || ! git diff --cached --quiet; then

    # Stage everything
    git add -A

    # Double-check staged changes exist
    if git diff --cached --quiet; then
      sleep 5
      continue
    fi

    CHANGED_FILES=$(git diff --cached --name-only)

    # Remove noise files
    REAL_FILES=$(echo "$CHANGED_FILES" | grep -Ev "$NOISE_PATTERNS" || true)

    # Skip if only noise exists
    if [ -z "$REAL_FILES" ]; then
      echo "🟡 Noise-only changes skipped"
      sleep 5
      continue
    fi

    FILES_CHANGED=$(echo "$REAL_FILES" | wc -l | tr -d ' ')
    PRIMARY_FILE=$(echo "$REAL_FILES" | head -n 1)

    # -----------------------------
    # Intelligent commit messages
    # -----------------------------
    if [ "$FILES_CHANGED" -eq 1 ]; then
      MSG="chore(lumo): update $(basename "$PRIMARY_FILE")"

    elif [ "$FILES_CHANGED" -le 3 ]; then
      MSG="chore(lumo): refine system ($FILES_CHANGED files)"

    elif [ "$FILES_CHANGED" -le 10 ]; then
      MSG="feat(lumo): evolve components and logic ($FILES_CHANGED files)"

    else
      MSG="refactor(lumo): large system evolution ($FILES_CHANGED files)"
    fi

    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 $MSG"
    echo "⏰ $TIMESTAMP"
    echo "━━━━━━━━━━━━━━━━━━━━━━"

    # -----------------------------
    # Commit
    # -----------------------------
    git commit -m "$MSG"

    # -----------------------------
    # Push
    # -----------------------------
    if git push origin main; then

      echo "✅ Push complete"

      {
        echo "━━━━━━━━━━━━━━━━━━━━━━"
        echo "TIME: $TIMESTAMP"
        echo "COMMIT: $MSG"
        echo ""
        echo "$REAL_FILES"
        echo ""
      } >> "$LOG_FILE"

    else
      echo "❌ Push failed"
    fi
  fi

  # Polling interval
  sleep 10

done