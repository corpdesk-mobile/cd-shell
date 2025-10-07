#!/usr/bin/env bash
# cleanup-node-modules.sh
# Purpose: remove server-only Node modules from cd-shell (browser/PWA build)

set -e

echo "🧹 Cleaning up Node-only modules from cd-shell..."

PACKAGES=(
  ioredis
  @redis/client
  redis-errors
  winston
  winston-daily-rotate-file
  file-stream-rotator
  dotenv
  generic-pool
)

for pkg in "${PACKAGES[@]}"; do
  if npm list "$pkg" >/dev/null 2>&1; then
    echo "🚫 Removing $pkg..."
    npm uninstall "$pkg" --save --save-dev || true
    rm -rf "node_modules/$pkg"
  fi
done

# Remove residual nested copies (in node_modules of sub-dependencies)
echo "🧽 Deep clean nested node_modules..."
find node_modules -type d \( \
  -name "ioredis" -o \
  -name "@redis" -o \
  -name "winston*" -o \
  -name "file-stream-rotator" -o \
  -name "dotenv" -o \
  -name "generic-pool" \
\) -prune -exec rm -rf {} +

echo "🧼 Pruning unused packages..."
npm prune

echo "✅ Cleanup complete. You may now run:"
echo "   npm install --force"
echo "   npm run dev"
