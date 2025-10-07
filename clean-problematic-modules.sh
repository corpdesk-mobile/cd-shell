#!/bin/bash
# Comprehensive cleanup script for Node modules not compatible with browser/Vite builds.

echo "🧹 Cleaning incompatible modules and caches..."

# Step 1: Remove problematic Node-based packages
npm uninstall ioredis @redis/client redis-errors generic-pool winston winston-daily-rotate-file file-stream-rotator dotenv logform

# Step 2: Remove leftover directories manually (in case uninstall didn’t remove them)
rm -rf node_modules/ioredis \
       node_modules/@redis \
       node_modules/redis-errors \
       node_modules/generic-pool \
       node_modules/winston* \
       node_modules/file-stream-rotator \
       node_modules/logform \
       node_modules/dotenv

# Step 3: Clear npm cache
echo "🧽 Clearing npm cache..."
npm cache clean --force

# Step 4: Remove build and Vite caches
echo "🗑️ Removing build artifacts and Vite cache..."
rm -rf node_modules/.vite \
       dist \
       dist-ts \
       .vite \
       .vite_cache

# Step 5: Remove lockfiles (optional but recommended if corrupted)
echo "🔒 Removing lockfiles..."
rm -f package-lock.json \
      pnpm-lock.yaml \
      yarn.lock

# Step 6: Reinstall dependencies (you can skip this and run manually if you prefer)
echo "📦 Reinstalling dependencies..."
npm install

echo "✅ Cleanup complete. All incompatible modules should now be removed."
echo "💡 Tip: If issues persist, search your codebase for 'redis' or 'winston' imports."
