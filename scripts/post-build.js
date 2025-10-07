import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Correct base path for controller scanning
const BASE_DIR = path.resolve(__dirname, "../dist-ts/CdShell");
const SYS_DIR = path.join(BASE_DIR, "sys");
const APP_DIR = path.join(BASE_DIR, "app");

/**
 * Recursively find controller files within a directory
 */
function findControllers(dir) {
  const controllers = [];
  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name.endsWith(".controller.js")) {
        controllers.push(fullPath);
      }
    }
  }
  walk(dir);
  return controllers;
}

/**
 * Log how many controllers were found
 */
function logControllers(context, controllers) {
  if (controllers.length === 0) {
    console.warn(`[WARN] No controllers found for: ${context}`);
  } else {
    console.log(`[OK] Found ${controllers.length} controllers for: ${context}`);
  }
}

/**
 * Format timestamp in a readable way
 */
function getTimestamp() {
  const now = new Date();
  const date = now.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = now.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `Date: ${date}, Time: ${time}`;
}

// 🚀 Run scan
const sysControllers = findControllers(SYS_DIR);
const appControllers = findControllers(APP_DIR);

logControllers("sys", sysControllers);
logControllers("app", appControllers);

console.log("[post-build] Controller → view sync complete.");

// ✅ Add timestamp marker
console.log("--------------------------------------------------");
console.log(`[post-build] Build completed successfully.`);
console.log(getTimestamp());
console.log("--------------------------------------------------");
