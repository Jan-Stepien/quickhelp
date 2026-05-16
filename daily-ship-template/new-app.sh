#!/bin/bash
# Usage: ./new-app.sh my-app-name
# Creates a new project from this template

set -e

NAME=${1:-my-app}
TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$(dirname "$TEMPLATE_DIR")/$NAME"

echo "Creating $NAME in $TARGET_DIR..."

cp -r "$TEMPLATE_DIR" "$TARGET_DIR"

cd "$TARGET_DIR"

# Reset git
rm -rf .git
git init
git add -A
git commit -m "init: $NAME from daily-ship-template"

# Copy env file
cp .env.local.example .env.local

echo ""
echo "Done. Next steps:"
echo ""
echo "  cd $TARGET_DIR"
echo "  npm install"
echo "  # Edit .env.local with your API keys"
echo "  npm run dev"
echo ""
echo "Then open Claude Code and run:"
echo "  /ship your idea here"
echo ""
