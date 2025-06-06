#!/bin/bash
set -e

BRANCH="feature/agent-orchestration-core"

# Check for uncommitted changes
if git diff-index --quiet HEAD --; then
  echo "No uncommitted changes to commit."
  exit 0
fi

# Create branch if it doesn't exist
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  echo "Branch $BRANCH already exists. Checking it out."
  git switch "$BRANCH"
else
  git switch -c "$BRANCH"
fi

# Stage all changes
git add -A

# Commit with provided message or default
MSG=${1:-"Update work"}

git commit -m "$MSG"

# Push branch
if git remote | grep -q origin; then
  git push -u origin "$BRANCH"
else
  echo "Remote 'origin' not configured. Skipping push."
fi
