
#!/bin/bash
set -e

echo "[post-build] Starting controller → view sync for sys and app..."

SRC_DIR="dist-ts/CdShell"
DEST_DIR="src/CdShell"

check_and_copy() {
  local domain=$1
  local src_path="$SRC_DIR/$domain"
  local dest_path="$DEST_DIR/$domain"

  if [ ! -d "$src_path" ]; then
    echo "[warn] Directory not found: $src_path — skipping..."
    echo "[hint] Try running: npm run compile-ts"
    return
  fi

  find "$src_path" -type f -name "*.controller.js" | while read -r controller; do
    rel_path="${controller#$src_path/}"
    view_path="$dest_path/${rel_path/controllers/view}"

    mkdir -p "$(dirname "$view_path")"
    cp "$controller" "$view_path"
    echo "[post-build] Synced: $rel_path → view/"
  done
}

check_and_copy "sys"
check_and_copy "app"

echo "[post-build] Controller → view sync complete."
echo "[post-build] Invoking Node view index generator..."

# Run the Node-based auto-index generator
node scripts/post-build.js

echo "[post-build] All steps complete."

