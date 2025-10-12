import fs from "fs";
import path from "path";

const MODULES = ["sys", "app"];
const BASE = path.resolve("src/CdShell");

for (const ctx of MODULES) {
  const ctxDir = path.join(BASE, ctx);
  if (!fs.existsSync(ctxDir)) continue;

  const modules = fs.readdirSync(ctxDir);
  for (const mod of modules) {
    const modPath = path.join(ctxDir, mod);
    const viewDir = path.join(modPath, "view");

    // Skip system files or invalid dirs
    if (!fs.statSync(modPath).isDirectory()) continue;

    if (!fs.existsSync(viewDir)) {
      fs.mkdirSync(viewDir, { recursive: true });
      console.log(`[prebuild] Created missing view directory: ${viewDir}`);
    }

    const indexFile = path.join(viewDir, "index.js");
    if (!fs.existsSync(indexFile)) {
      fs.writeFileSync(indexFile, "// placeholder for post-build output\n");
      console.log(`[prebuild] Created placeholder file: ${indexFile}`);
    }
  }
}

console.log("[prebuild] View placeholders ready.\n");
