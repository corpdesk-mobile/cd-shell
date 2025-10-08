// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ Correct base path for controller scanning
// const BASE_DIR = path.resolve(__dirname, "../dist-ts/CdShell");
// const SYS_DIR = path.join(BASE_DIR, "sys");
// const APP_DIR = path.join(BASE_DIR, "app");

// /**
//  * Recursively find controller files within a directory
//  */
// function findControllers(dir) {
//   const controllers = [];
//   function walk(currentDir) {
//     if (!fs.existsSync(currentDir)) return;
//     const entries = fs.readdirSync(currentDir, { withFileTypes: true });
//     for (const entry of entries) {
//       const fullPath = path.join(currentDir, entry.name);
//       if (entry.isDirectory()) walk(fullPath);
//       else if (entry.name.endsWith(".controller.js")) {
//         controllers.push(fullPath);
//       }
//     }
//   }
//   walk(dir);
//   return controllers;
// }

// /**
//  * Log how many controllers were found
//  */
// function logControllers(context, controllers) {
//   if (controllers.length === 0) {
//     console.warn(`[WARN] No controllers found for: ${context}`);
//   } else {
//     console.log(`[OK] Found ${controllers.length} controllers for: ${context}`);
//   }
// }

// /**
//  * Format timestamp in a readable way
//  */
// function getTimestamp() {
//   const now = new Date();
//   const date = now.toLocaleDateString("en-KE", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   });
//   const time = now.toLocaleTimeString("en-KE", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
//   return `Date: ${date}, Time: ${time}`;
// }

// // 🚀 Run scan
// const sysControllers = findControllers(SYS_DIR);
// const appControllers = findControllers(APP_DIR);

// logControllers("sys", sysControllers);
// logControllers("app", appControllers);

// console.log("[post-build] Controller → view sync complete.");

// // ✅ Add timestamp marker
// console.log("--------------------------------------------------");
// console.log(`[post-build] Build completed successfully.`);
// console.log(getTimestamp());
// console.log("--------------------------------------------------");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct base path for controller scanning
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
 * Copies compiled controllers and generates the index.js module wrapper.
 * @param {string} modulePath The module path relative to CdShell (e.g., 'sys/cd-user')
 * @param {string[]} controllerFiles List of full paths to compiled controllers in dist-ts
 */
function syncModuleView(modulePath, controllerFiles) {
  if (controllerFiles.length === 0) return;

  // The target directory is in 'src' for the module loader to find it in dev mode.
  const targetModuleBaseDir = path.resolve(__dirname, `../src/CdShell/${modulePath}`);
  const targetViewDir = path.join(targetModuleBaseDir, 'view');

  // Ensure target directory exists
  if (!fs.existsSync(targetViewDir)) {
    fs.mkdirSync(targetViewDir, { recursive: true });
  }

  const imports = [];
  const copiedControllers = [];
  
  for (const sourcePath of controllerFiles) {
    const filename = path.basename(sourcePath); 
    const targetPath = path.join(targetViewDir, filename);
    
    // 1. COPY the compiled controller file to the target view directory.
    fs.copyFileSync(sourcePath, targetPath);
    
    // Generate the import name (e.g., sign-in.controller.js -> ctlSignIn)
    const namePart = filename.replace('.controller.js', ''); 
    const exportName = 'ctl' + namePart.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    
    imports.push(`import { ${exportName} } from "./${filename}";`);
    copiedControllers.push({ exportName, filename, sourcePath });
  }
  
  // 2. GENERATE the index.js Module Wrapper
  const targetIndexFile = path.join(targetViewDir, 'index.js');
  const [ctx, moduleId] = modulePath.split('/');

  // Assuming 'ctlSignIn' is the default controller for the module entry
  const primaryController = copiedControllers.find(c => c.exportName === 'ctlSignIn') || copiedControllers[0];
  
  if (!primaryController) {
      console.warn(`[WARN] No primary controller for module ${modulePath}. Skipping index.js generation.`);
      return;
  }
  
  const templateContent = primaryController.exportName + ".__template()"; 
  
  let indexContent = `// Generated by post-build.js\n`;
  indexContent += `${imports.join('\n')}\n\n`;
  indexContent += `export const ${moduleId.replace('-', '')}Module = {\n`;
  indexContent += `  ctx: "${ctx}",\n`;
  indexContent += `  moduleId: "${moduleId}",\n`;
  indexContent += `  moduleName: "Auto-Generated Module",\n`;
  indexContent += `  moduleGuid: "auto-guid",\n`;
  indexContent += `  controller: ${primaryController.exportName},\n`;
  indexContent += `  template: ${templateContent},\n`;
  indexContent += `  menu: [], // Menu structure must be generated separately or hardcoded\n`;
  indexContent += `};\n\n`;
  indexContent += `export const module = ${moduleId.replace('-', '')}Module;\n`;

  try {
      fs.writeFileSync(targetIndexFile, indexContent, 'utf8');
      console.log(`[OK] Generated module wrapper: ${path.relative(path.resolve(__dirname, '../'), targetIndexFile)}`);
  } catch (error) {
      console.error(`[ERROR] Failed to write module wrapper for ${modulePath}:`, error);
  }
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

// --- New Sync Logic: Group and Sync ---
const modulesToSync = {};

[...sysControllers, ...appControllers].forEach(fullPath => {
    // Determine module path (e.g., 'sys/cd-user') from the full path in dist-ts
    const relativePath = path.relative(BASE_DIR, fullPath).replace(/\\/g, '/');
    
    // Extract module path: looks for 'sys/cd-user/controllers/' or 'app/my-module/controllers/'
    const modulePathMatch = relativePath.match(/^(.*?\/.*?)\/controllers\//);
    if (modulePathMatch) {
        const modulePath = modulePathMatch[1];
        if (!modulesToSync[modulePath]) {
            modulesToSync[modulePath] = [];
        }
        modulesToSync[modulePath].push(fullPath);
    }
});

// Run sync for each detected module
for (const modulePath in modulesToSync) {
    syncModuleView(modulePath, modulesToSync[modulePath]);
}
// --- End New Sync Logic ---

console.log("[post-build] Controller → view sync complete.");

// ✅ Add timestamp marker
console.log("--------------------------------------------------");
console.log(`[post-build] Build completed successfully.`);
console.log(getTimestamp());
console.log("--------------------------------------------------");

