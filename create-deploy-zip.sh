#!/bin/bash
# River Trading - Create deployment zip for cPanel
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ZIP_NAME="river-trading-deploy.zip"
cd "$PROJECT_DIR"

echo "Building React app (Vite build, skip TS check for deploy)..."
npx vite build

echo "Creating deployment zip..."
rm -f "$ZIP_NAME"

# Include: api, uploads, dist, .htaccess, database, DEPLOYMENT.md
# Exclude: node_modules, .env (secrets), config.php (user fills in on server)
zip -r "$ZIP_NAME" \
  api/ \
  uploads/ \
  dist/ \
  database/ \
  .htaccess \
  DEPLOYMENT.md \
  api/config.deploy.php \
  -x "*.git*" \
  -x "api/config.php" \
  -x "*.env" \
  -x "node_modules/*"

echo "Done! Created: $ZIP_NAME"
echo "Upload this zip to cPanel, extract it, then follow DEPLOYMENT.md"
