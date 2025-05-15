import { promises as fs } from 'fs';
import path from 'path';

async function syncConfig() {
  const rootConfigPath = path.resolve(__dirname, '../shell.config.json');
  const publicConfigPath = path.resolve(__dirname, '../public/shell.config.json');

  try {
    await fs.copyFile(rootConfigPath, publicConfigPath);
    console.log(`[sync-config] Copied shell.config.json to public/`);
  } catch (err) {
    console.error(`[sync-config] Failed to copy shell.config.json`, err);
    process.exit(1);
  }
}

syncConfig();
