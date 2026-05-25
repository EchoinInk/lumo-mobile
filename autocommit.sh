#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧠 Lumo Auto Commit Intelligence (STABLE)
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

  # ALWAYS resync repo root (prevents cron / context drift bugs)
  cd "$(git rev-parse --show-toplevel)"

  # -----------------------------
  # 1. Stage EVERYTHING first
  # -----------------------------
  git add -A

  # -----------------------------
  # 2. Now check staged changes (CORRECT ORDER)
  # -----------------------------
  CHANGED_FILES=$(git diff --cached --name-only)

  if [ -z "$CHANGED_FILES" ]; then
    echo "🟡 No staged changes"
    sleep 10
    continue
  fi

  # -----------------------------
  # 3. Filter noise
  # -----------------------------
  REAL_FILES=$(echo "$CHANGED_FILES" | grep -Ev "$NOISE_PATTERNS" || true)

  if [ -z "$REAL_FILES" ]; then
    echo "🟡 Noise-only changes skipped"
    sleep 10
    continue
  fi

  FILES_CHANGED=$(echo "$REAL_FILES" | wc -l | tr -d ' ')
  PRIMARY_FILE=$(echo "$REAL_FILES" | head -n 1)

  # -----------------------------
  # 4. Commit message engine
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
  # 5. Commit (only if safe)
  # -----------------------------
  git commit -m "$MSG"

  # -----------------------------
  # 6. Sync safely BEFORE push
  # -----------------------------
  if ! git pull --rebase origin main; then
    echo "❌ Rebase failed — skipping cycle"
    sleep 10
    continue
  fi

  # -----------------------------
  # 7. Push safely
  # -----------------------------
  if git push origin main; then
    echo "✅ Push complete"
  else
    echo "❌ Push failed — will retry next cycle"
  fi

  # -----------------------------
  # 8. Logging
  # -----------------------------
  {
    echo "━━━━━━━━━━━━━━━━━━━━━━"
    echo "TIME: $TIMESTAMP"
    echo "COMMIT: $MSG"
    echo "FILES:"
    echo "$REAL_FILES"
    echo ""
  } >> "$LOG_FILE"

  sleep 10

done