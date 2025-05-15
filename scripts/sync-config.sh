#!/bin/bash

SRC="./shell.config.json"
DEST="./public/shell.config.json"

echo "[sync-config] Copying $SRC -> $DEST"
cp "$SRC" "$DEST"
