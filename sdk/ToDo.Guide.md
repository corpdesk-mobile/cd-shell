//////////////////////////////////////////////

The system is currently able to run on bootstrap and switch between default and dark theme.
Setting for it to run on bootsrap is a matter of configuration or switching at the admin interface.
At the moment we are just focusing on configuration for booting stage.
We need to try and change all configuration to switch from bootstrap-538 to material-design.
Below are the configuration point.
Configurations for available ui-systems is done via automatic discovery via ui-adaptor-port module which hosts available adaptors
public/shell.config.json
UiSystemLoading
ThemeLoading

References:

- Documentation for SysCacheService
- Documentation on how adaptors are auto discovered and save in the SysCacheService
  - ui-adaptor-port
  - core adaptor
  - Settings at the cd-shell-config
  - loading and application of cd-shell-config
- reference for core adaptor
- available adaptors
  - tree
  - ui-adaptor-port
- codes for bridge.css, descriptor.json, adaptor for both bootstrap and mateirial-design

Hey Chase, included here are the key specification files for bootstrap. Generate an equivalent of the each of the files for Bulma.

```sh
emp-12@emp-12 ~/cd-shell (main)> tree public/assets/ui-systems/
public/assets/ui-systems/
├── bootstrap-502
│   ├── bootstrap.min.css
│   ├── bootstrap.min.js
│   └── descriptor.json
├── bootstrap-538
│   ├── bootstrap.bundle.min.js
│   ├── bootstrap.min.css
│   ├── bridge.css
│   └── descriptor.json
└── material-design
    ├── descriptor.json
    ├── material-components-web.min.css
    └── material-components-web.min.js

```

// public/assets/ui-systems/bootstrap-538/bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR BOOTSTRAP 5.3.x
   ============================================================ */

/* ------------------------------------------------------------
   1. ROOT VARIABLES (Light Mode Defaults)
   ------------------------------------------------------------ */
:root {
  --cd-bridge-body-font-family: var(
    --bs-body-font-family,
    system-ui,
    sans-serif
  );
  --cd-bridge-body-font-size: var(--bs-body-font-size, 1rem);
  --cd-bridge-border-radius: var(--bs-border-radius, 0.375rem);

  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  /* Sidebar defaults (light mode) */
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Active (selected) row – light */
  --cd-menu-active-bg: #e6e6e6;
  --cd-menu-active-text: #000;

  /* Hover (light) */
  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   2. LIGHT MODE
   ------------------------------------------------------------ */
:root[data-bs-theme="light"] {
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  --cd-menu-active-bg: #e2e2e2;
  --cd-menu-active-text: #000;

  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   3. DARK MODE  (Option A – Neutral Grey)
   ------------------------------------------------------------ */
:root[data-bs-theme="dark"] {
  --cd-input-text-color: var(--bs-body-color, #e6e6e6);
  --cd-color-border: var(--bs-border-color, #495057);

  /* Sidebar surface + text */
  --cd-menu-bg: #1e1e1e;
  --cd-menu-text: #dcdcdc;

  /* Active row — neutral dark */
  --cd-menu-active-bg: #2f3640;
  --cd-menu-active-text: #ffffff;

  /* Hover (dark) */
  --cd-menu-hover-bg: rgba(255, 255, 255, 0.07);

  /* Bootstrap form background */
  --bs-form-control-bg: var(--bs-gray-900, #2b3035);
}

/* ------------------------------------------------------------
   4. FORM LABELS
   ------------------------------------------------------------ */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* ------------------------------------------------------------
   5. INPUTS
   ------------------------------------------------------------ */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: var(--bs-form-control-bg, #fff);
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

/* ------------------------------------------------------------
   6. VALID / INVALID STATES
   ------------------------------------------------------------ */
.cd-form-field input.cd-valid,
.cd-form-field select.cd-valid,
.cd-form-field textarea.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}

.cd-form-field input.cd-invalid,
.cd-form-field select.cd-invalid,
.cd-form-field textarea.cd-invalid {
  border-color: var(--bs-danger, #dc3545) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb, 220, 53, 69), 0.15);
}

/* ------------------------------------------------------------
   7. BUTTONS
   ------------------------------------------------------------ */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
}

/* ------------------------------------------------------------
   8. SIDEBAR / MENU BASE
   ------------------------------------------------------------ */
#cd-sidebar {
  background-color: var(--cd-menu-bg);
  color: var(--cd-menu-text);
}

/* ------------------------------------------------------------
   8B. FIX OVERRIDES FOR METISMENU ACTIVE + HOVER
   ------------------------------------------------------------ */
#cd-sidebar .metismenu a:hover {
  background-color: var(--cd-menu-hover-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

#cd-sidebar .metismenu li.mm-active > a {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

/* ------------------------------------------------------------
   🔧 FIXED TEXT CONTRAST FOR ALL MENU LINKS
   ------------------------------------------------------------ */
#cd-sidebar a.cd-menu-link {
  color: var(--cd-menu-text) !important;
}

/* Each clickable row — full width */
.cd-menu-entry {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 15px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Main label side */
.cd-menu-link {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

/* Right-side arrow */
.cd-menu-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-left: 8px;
  padding-right: 8px;
  font-size: 0.8rem;
}

/* Hover */
.cd-menu-entry:hover {
  background-color: var(--cd-menu-hover-bg);
  color: var(--cd-menu-active-text);
}

/* Active row */
.metismenu li.mm-active > .cd-menu-entry,
.metismenu li.mm-active > .cd-menu-entry:hover {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

/* IMPORTANT: Hide only MetisMenu's auto-generated pseudo arrow */
.metismenu .has-arrow::before {
  display: none !important;
  content: none !important;
}
```

// public/assets/ui-systems/bootstrap-538/descriptor.json

```json
{
  "id": "bootstrap-538",
  "name": "Bootstrap 5",
  "version": "5.3.8",
  "description": "Bootstrap 5.3.8 UI System with full support for data-bs-theme light/dark switching.",
  "author": "Bootstrap Authors",
  "license": "MIT",
  "assetPath": "/assets/ui-systems/bootstrap-538",
  "cssUrl": "bootstrap.min.css",
  "jsUrl": "bootstrap.bundle.min.js",
  "stylesheets": ["bootstrap.min.css"],
  "scripts": ["bootstrap.bundle.min.js"],
  "conceptMappings": {
    "button": {
      "class": "btn btn-primary"
    },
    "card": {
      "class": "card"
    },
    "input": {
      "class": "form-control"
    },
    "formGroup": {
      "class": "mb-3"
    }
  },
  "directiveMap": {
    "cd-tooltip": "data-bs-toggle=\"tooltip\""
  },
  "themesAvailable": [
    {
      "id": "default",
      "name": "Default",
      "displayName": "Default Theme",
      "css": "/themes/default/theme.css",
      "mode": "light"
    },
    {
      "id": "dark",
      "name": "Dark Mode",
      "displayName": "Dark Theme",
      "css": "/themes/dark/theme.css",
      "mode": "dark"
    }
  ],
  "themeActive": null,
  "metadata": {
    "supportsDarkMode": true,
    "supportsBootstrapThemeSwitch": true
  },
  "extensions": {
    "adapter": "Bootstrap5Adapter",
    "versionTag": "bootstrap-538"
  }
}
```

// src/CdShell/app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts

```ts
// src/CdShell/app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts
import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class Bootstrap538AdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  constructor() {
    console.log("%c[Bootstrap538AdapterService] constructor()", "color:#6cf");
  }

  // ---------------------------------------------------------------------------
  // ACTIVATION
  // ---------------------------------------------------------------------------
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    diag_css("[Bootstrap538Adapter] activate() START", { id: descriptor?.id });

    this.descriptor = descriptor || null;

    if (!descriptor?.conceptMappings) {
      console.warn(
        "%c[Bootstrap538Adapter] descriptor.conceptMappings missing!",
        "color:orange"
      );
    } else {
      console.log(
        "%c[Bootstrap538Adapter] Loaded conceptMappings:",
        "color:#0ff",
        descriptor.conceptMappings
      );
    }

    // Initial mapping
    diag_css("[Bootstrap538Adapter] Initial mapAll() pass");
    this.mapAll();

    // Start observing DOM changes
    this.observeMutations();

    diag_css("[Bootstrap538Adapter] activate() COMPLETE", {
      active: descriptor?.id,
    });
  }

  // ---------------------------------------------------------------------------
  // DEACTIVATION
  // ---------------------------------------------------------------------------
  async deactivate(): Promise<void> {
    diag_css("[Bootstrap538Adapter] deactivate() START");

    try {
      document.documentElement.removeAttribute("data-bs-theme");
      console.log("[Bootstrap538Adapter] removed data-bs-theme");
    } catch {}

    if (this.observer) {
      try {
        this.observer.disconnect();
        console.log("[Bootstrap538Adapter] MutationObserver disconnected");
      } catch {}
      this.observer = null;
    }

    this.descriptor = null;
    this.appliedSet = new WeakSet();

    diag_css("[Bootstrap538Adapter] deactivate() COMPLETE");
  }

  // ---------------------------------------------------------------------------
  // THEME APPLICATION
  // ---------------------------------------------------------------------------
  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    diag_css("[Bootstrap538Adapter] applyTheme()", { themeDescriptorOrId });

    try {
      if (!themeDescriptorOrId) {
        console.warn("[Bootstrap538Adapter] applyTheme ignored (null theme)");
        return;
      }

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      diag_css("[Bootstrap538Adapter] applied Bootstrap theme", { mode });
    } catch (err) {
      console.warn("[Bootstrap538Adapter] applyTheme error", err);
    }
  }

  // ---------------------------------------------------------------------------
  // CONCEPT MAPPING
  // ---------------------------------------------------------------------------
  private getMapping(concept: string): Mapping {
    console.log(
      "[Bootstrap538Adapter] getMapping() this.descriptor:",
      this.descriptor
    );
    const mapping =
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined;

    console.log(
      `%c[Bootstrap538Adapter] getMapping('${concept}') =`,
      "color:#9f9",
      mapping
    );

    return mapping;
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;

    if (this.appliedSet.has(el)) {
      // Already mapped but update attributes if any
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    console.log(
      "%c[Bootstrap538Adapter] Applying mapping to element:",
      "color:#7ff;",
      { tag: el.tagName, mapping }
    );

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => {
        if (c) el.classList.add(c);
      });
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    this.appliedSet.add(el);
  }

  // ---------------------------------------------------------------------------
  // SPECIFIC MAPPING PASSES
  // ---------------------------------------------------------------------------
  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;

    const selector = "button[cdButton], button.cd-button";
    const nodes = document.querySelectorAll<HTMLElement>(selector);

    diag_css("[Bootstrap538Adapter] mapButtons()", { count: nodes.length });

    nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
  }

  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;

    const selector =
      "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]";
    const nodes = document.querySelectorAll<HTMLElement>(selector);

    diag_css("[Bootstrap538Adapter] mapInputs()", { count: nodes.length });

    nodes.forEach((el) => this.applyMappingToElement(el, mapping));
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;

    const selector = ".cd-form-field";
    const nodes = document.querySelectorAll<HTMLElement>(selector);

    diag_css("[Bootstrap538Adapter] mapFormGroups()", { count: nodes.length });

    nodes.forEach((el) => this.applyMappingToElement(el, mapping));
  }

  private mapOtherConcepts() {
    const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
    const concepts = Object.keys(cm).filter(
      (c) => !["button", "input", "formGroup"].includes(c)
    );

    diag_css("[Bootstrap538Adapter] mapOtherConcepts()", { concepts });

    concepts.forEach((concept) => {
      const mapping = (cm as any)[concept];
      const selector = `[data-cd-${concept}], .cd-${concept}`;
      const nodes = document.querySelectorAll<HTMLElement>(selector);

      nodes.forEach((el) => this.applyMappingToElement(el, mapping));
    });
  }

  // master mapping pass
  private mapAll() {
    console.log(
      "%c[Bootstrap538Adapter] mapAll() — START",
      "background:#444;color:#aaf;padding:2px"
    );

    try {
      this.mapButtons();
      this.mapInputs();
      this.mapFormGroups();
      this.mapOtherConcepts();
    } catch (err) {
      console.warn("[Bootstrap538Adapter] mapAll error", err);
    }

    console.log(
      "%c[Bootstrap538Adapter] mapAll() — END",
      "background:#444;color:#aaf;padding:2px"
    );
  }

  // ---------------------------------------------------------------------------
  // DOM OBSERVER
  // ---------------------------------------------------------------------------
  private observeMutations() {
    if (this.observer) return;

    diag_css("[Bootstrap538Adapter] MutationObserver ATTACH");

    this.observer = new MutationObserver((mutations) => {
      console.log(
        "%c[Bootstrap538Adapter] Mutation detected → scheduling mapAll()",
        "color:#ffa;"
      );

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (err) {
      console.warn("[Bootstrap538Adapter] observer failed to attach", err);
      this.observer = null;
    }
  }
}

// Self-register
UiSystemAdapterRegistry.register(
  "bootstrap-538",
  new Bootstrap538AdapterService()
);
```

/////////////////////////////////////////////////////

Below is the public folder structure.
Given that you have the full procedure for seting up the tailwind. Is it possible to generate a tailwind-setup directory in cd-shell/sdk directory.
inside the cd-shell/sdk/ directory we then have setup.sh and uninstall.sh.
The shell scripts should be able to idempontently install and uninstall tailwind.
Let me know if there is any further information that would be required.

```sh
emp-12@emp-12 ~/cd-shell (main)> tree public
public
├── assets
│   ├── css
│   │   ├── font-awesome-6.5.0
│   │   │   └── all.min.css
│   │   └── index.css
│   ├── fonts
│   ├── images
│   └── ui-systems
│       ├── bootstrap-502
│       │   ├── bootstrap.min.css
│       │   ├── bootstrap.min.js
│       │   └── descriptor.json
│       ├── bootstrap-538
│       │   ├── bootstrap.bundle.min.js
│       │   ├── bootstrap.min.css
│       │   ├── bridge.css
│       │   └── descriptor.json
│       └── material-design
│           ├── bridge.css
│           ├── descriptor.json
│           ├── material-components-web.min.css
│           └── material-components-web.min.js
├── shell.config.json
└── themes
    ├── common
    │   ├── base.css
    │   ├── forms
    │   │   ├── cd-forms.css
    │   │   └── variants
    │   │       ├── cd-form-compact.css
    │   │       ├── cd-form-floating.css
    │   │       └── cd-form-standard.css
    │   ├── layout.json
    │   └── menu-neutral.css
    ├── dark
    │   ├── menu-systems
    │   │   └── metismenu.css
    │   ├── theme.css
    │   └── theme.json
    └── default
        ├── logo.png
        ├── menu-systems
        │   └── metismenu.css
        ├── theme.css
        └── theme.json
```

```json
{
  "name": "cd-shell",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "clean": "rm -rf dist dist-ts",
    "prebuild": "node scripts/prebuild-stubs.js",
    "compile-ts": "tsc --project tsconfig.json",
    "dev": "vite --debug",
    "build": "npm run clean && npm run prebuild && npm run compile-ts && vite build && npm run post-build",
    "post-build": "node scripts/post-build.js || bash scripts/post-build.sh",
    "preview": "vite preview --config src/vite.config.ts",
    "rebuild": "npm run clean && npm run build",
    "analyze": "vite build --mode analyze"
  },
  "devDependencies": {
    "@types/jest": "^30.0.0",
    "@types/node": "^22.18.10",
    "@types/node-cleanup": "^2.1.5",
    "@types/update-notifier": "^6.0.8",
    "prettier": "^3.6.2",
    "ts-node": "^10.9.2",
    "typeorm": "0.3",
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  },
  "dependencies": {
    "@jest/globals": "^29.7.0",
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/testing": "^10.4.15",
    "@octokit/plugin-rest-endpoint-methods": "^16.0.0",
    "@octokit/rest": "^22.0.0",
    "@swc/core": "^1.10.7",
    "@types/minimist": "^1.2.5",
    "@types/sqlite3": "^5.1.0",
    "ast-types": "^0.14.2",
    "axios": "^1.7.9",
    "bcrypt": "^5.1.1",
    "chalk": "^5.4.0",
    "chokidar": "^4.0.3",
    "class-validator": "^0.14.1",
    "cloudmailin": "^0.1.0",
    "date-fns": "^4.1.0",
    "dayjs": "^1.11.13",
    "device-detector-js": "^3.0.3",
    "execa": "^9.6.0",
    "html-to-text": "^9.0.5",
    "jsonwebtoken": "^9.0.2",
    "lodash": "^4.17.21",
    "logger": "^0.0.1",
    "metismenujs": "^1.4.0",
    "minimist": "^1.2.8",
    "moment": "^2.30.1",
    "node-cleanup": "^2.1.2",
    "node-ssh": "^13.2.0",
    "node-ts-cache-storage-memory": "^4.4.0",
    "nodemailer": "^6.10.0",
    "ora": "^8.2.0",
    "puppeteer": "^24.4.0",
    "pusher": "^5.2.0",
    "recast": "^0.23.11",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "simple-git": "^3.28.0",
    "socket.io-client": "^4.8.1",
    "sqlite3": "^5.1.7",
    "update-notifier": "^5.1.0",
    "url": "^0.11.4",
    "util": "^0.12.5",
    "uuid": "^11.1.0",
    "zx": "^7.2.3"
  }
}
```

// scripts/post-build.sh

```sh
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
```

// scripts/post-build.js

```js
/**
 * post-build.js
 * --------------------------
 * Generates runtime "view" controllers and module wrappers
 * after TypeScript compilation (dist-ts).
 *
 * - Converts each `*.controller.js` class file into a runtime object
 *   in the corresponding `view` directory.
 * - Each runtime object follows this shape:
 *      export const ctlName = {
 *         __template() { ... },
 *         __setup() { ... },
 *         ...
 *      };
 *
 * Usage:
 *    npm run post-build              → normal
 *    VERBOSE=true npm run post-build → with detailed logs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

// Promisified fs utilities
const writeFile = promisify(fs.writeFile);
const open = promisify(fs.open);
const fsync = promisify(fs.fsync);
const close = promisify(fs.close);

// Verbose mode toggle
const VERBOSE = process.env.VERBOSE === "true";
const vLog = (...args) => VERBOSE && console.log("[VERBOSE]", ...args);

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const BASE_DIR = path.resolve(__dirname, "../dist-ts/CdShell");
const SYS_DIR = path.join(BASE_DIR, "sys");
const APP_DIR = path.join(BASE_DIR, "app");

/* -------------------------------------------------------------------------- */
/* Helper: Controller name derivation                                         */
/* -------------------------------------------------------------------------- */
function deriveControllerNames(filename) {
  const namePart = filename.replace(".controller.js", "");
  const pascalName = namePart
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  return {
    runtimeName: "ctl" + pascalName,
    className: pascalName + "Controller",
    filename,
  };
}

/* -------------------------------------------------------------------------- */
/* Core: Generate a runtime controller stub                                   */
/* -------------------------------------------------------------------------- */
async function generateRuntimeControllerStub(
  sourcePath,
  targetViewDir,
  modulePath
) {
  const filename = path.basename(sourcePath);
  const names = deriveControllerNames(filename);
  const targetPath = path.join(targetViewDir, filename);
  const relativeDistPath = path
    .relative(targetViewDir, sourcePath)
    .replace(/\\/g, "/");

  vLog("Generating runtime stub for:", names.runtimeName);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`[WARN] Controller source missing: ${sourcePath}`);
    return;
  }

  // 🔹 Generate a *runtime object* — not a class instance.
  const content = `// Generated by post-build.js - Runtime Controller Stub
import { ${names.className} } from '${relativeDistPath}';

const _controller = new ${names.className}();

export const ${names.runtimeName} = {
  __template: () => _controller.template?.(),
  __setup: () => _controller.setup?.(),
  __processFormData: () => _controller.processFormData?.(),
  ...Object.keys(_controller)
    .filter(k => !["template", "setup", "processFormData"].includes(k))
    .reduce((acc, k) => ({ ...acc, [k]: _controller[k] }), {})
};
`;

  // await writeFile(targetPath, content, "utf8");

  // const fd = await open(targetPath, "r+");
  // await fsync(fd);
  // await close(fd);
  // fs.utimesSync(targetPath, new Date(), new Date());
  // await new Promise((r) => setTimeout(r, 30));

  vLog(`Runtime controller written → ${targetPath}`);
  return names;
}

/* -------------------------------------------------------------------------- */
/* Core: Generate module-level view index                                     */
/* -------------------------------------------------------------------------- */
async function syncModuleView(modulePath, controllerFiles) {
  if (!controllerFiles || controllerFiles.length === 0) return;

  const targetModuleBaseDir = path.resolve(
    PROJECT_ROOT,
    `src/CdShell/${modulePath}`
  );
  const targetViewDir = path.join(targetModuleBaseDir, "view");

  if (!fs.existsSync(targetViewDir)) {
    fs.mkdirSync(targetViewDir, { recursive: true });
    vLog(`Created view directory: ${targetViewDir}`);
  }

  const imports = [];
  const runtimeControllers = [];

  for (const sourcePath of controllerFiles) {
    const names = await generateRuntimeControllerStub(
      sourcePath,
      targetViewDir,
      modulePath
    );
    if (!names) continue;
    runtimeControllers.push(names);
    imports.push(`import { ${names.runtimeName} } from "./${names.filename}";`);
  }

  const targetIndexFile = path.join(targetViewDir, "index.js");
  const [ctx, moduleId = "unknown"] = modulePath.split("/");

  const primaryController =
    runtimeControllers.find((c) => c.runtimeName === "ctlSignIn") ||
    runtimeControllers[0];

  if (!primaryController) {
    console.warn(
      `[WARN] No primary controller for module ${modulePath}. Skipping index.js.`
    );
    return;
  }

  const templateContent = `${primaryController.runtimeName}.__template()`;

  const indexContent = `// Generated by post-build.js - Module Index
${imports.join("\n")}

export const ${moduleId.replace("-", "")}Module = {
  ctx: "${ctx}",
  moduleId: "${moduleId}",
  moduleName: "Auto-Generated Module",
  moduleGuid: "auto-guid",
  controller: ${primaryController.runtimeName},
  template: ${templateContent},
  menu: []
};

export const module = ${moduleId.replace("-", "")}Module;
`;

  // await writeFile(targetIndexFile, indexContent, "utf8");

  // const fd = await open(targetIndexFile, "r+");
  // await fsync(fd);
  // await close(fd);
  // fs.utimesSync(targetIndexFile, new Date(), new Date());
  // await new Promise((r) => setTimeout(r, 30));

  console.log(
    `[OK] Generated module wrapper: ${path.relative(PROJECT_ROOT, targetIndexFile)}`
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers: Directory traversal & logging                                     */
/* -------------------------------------------------------------------------- */
function findControllers(baseDir) {
  const results = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) walk(fullPath);
      else if (entry.endsWith(".controller.js")) {
        vLog("Found controller:", fullPath);
        results.push(fullPath);
      }
    }
  }
  walk(baseDir);
  return results;
}

function logControllers(type, list) {
  console.log(`[${type}] Found ${list.length} controllers`);
  if (VERBOSE)
    list.forEach((c) => console.log(" -", path.relative(BASE_DIR, c)));
}

const timestamp = () => new Date().toLocaleString();

/* -------------------------------------------------------------------------- */
/* Main Execution                                                             */
/* -------------------------------------------------------------------------- */
(async function run() {
  const sysControllers = findControllers(SYS_DIR);
  const appControllers = findControllers(APP_DIR);

  logControllers("sys", sysControllers);
  logControllers("app", appControllers);

  const modulesToSync = {};

  [...sysControllers, ...appControllers].forEach((fullPath) => {
    const relativePath = path.relative(BASE_DIR, fullPath).replace(/\\/g, "/");
    const match = relativePath.match(/^(.*?\/.*?)\/controllers\//);
    if (match) {
      const modulePath = match[1];
      modulesToSync[modulePath] ||= [];
      modulesToSync[modulePath].push(fullPath);
    }
  });

  vLog("Modules to sync:", Object.keys(modulesToSync));

  for (const modulePath of Object.keys(modulesToSync)) {
    vLog(`Processing module: ${modulePath}`);
    await syncModuleView(modulePath, modulesToSync[modulePath]);
  }

  console.log("[post-build] Controller → view sync complete.");
  console.log("--------------------------------------------------");
  console.log(`[post-build] Build completed successfully.`);
  console.log(timestamp());
  console.log("--------------------------------------------------");
})();
```

/////////////////////////////////////////////////////////////
Below are all the associated file that will need refactoring.
The html to be rendered is processed by sign-in.controller.js as shown below.
// /src/CdShell/sys/cd-user/view/sign-in.controller.js

```js
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export const ctlSignIn = {
  form: null,
  binder: null,

  /**
   * Initializes the controller — constructs the form and binder.
   */
  __init() {
    this.form = new CdFormGroup({
      userName: new CdFormControl("", [
        CdValidators.required("Username is required"),
      ]),
      password: new CdFormControl("", [
        CdValidators.required("Password is required"),
        CdValidators.minLength(4, "Password must be at least 4 characters"),
      ]),
    });

    // Initialize binder — form selector must match template form ID
    this.binder = new CdDirectiveBinderService(this.form, "#signInForm", this);
  },

  /**
   * HTML template for the view.
   */
  __template() {
    return `
      <form id="signInForm" class="cd-form">
        <div class="cd-form-field">
          <label for="userName">Username</label>
          <input
            id="userName"
            name="userName"
            cdFormControl
            placeholder="Enter username"
          />
          <div class="error-message" data-error-for="userName"></div>
        </div>

        <div class="cd-form-field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            cdFormControl
            placeholder="Enter password"
          />
          <div class="error-message" data-error-for="password"></div>
        </div>

        <button cdButton>Sign In</button>
      </form>
    `;
  },

  /**
   * Runs after template is rendered to DOM.
   */
  __setup() {
    // Initialize form and binder if not already
    if (!this.form) this.__init();

    const form = document.querySelector("#signInForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.auth();
      });
    }
  },

  /**
   * Authentication handler.
   */
  async auth() {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      alert("Please correct the highlighted errors.");
      return;
    }

    const user = this.form.value;
    console.log("Authenticating:", user);
    alert(`Welcome, ${user.userName}!`);
  },

  // 💡 NEW: Deactivation Hook - Runs when user clicks *away*
  __deactivate() {
    console.log("[ctlSignIn][__deactivate] 01");
    // Stop any active animations, remove DOM-dependent listeners, etc.
    // The binder must provide a way to remove all listeners.
    if (this.binder?.unbindAllDomEvents) {
      this.binder.unbindAllDomEvents();
    }
  },

  // 💡 NEW: Activation Hook - Runs when view is *injected*
  async __activate() {
    console.log("[ctlSignIn][__activate] 01");
    // Re-establish DOM bindings and apply current form state
    if (this.binder?.bindToDom) {
      // This method must find the newly injected DOM (#settingsForm)
      // and re-attach all form control listeners (input, change, blur)
      await this.binder.bindToDom();
    }
    // Optional: Restore scroll position, run focus logic, etc.
  },
};
```

// public/assets/ui-systems/material-design/bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR MATERIAL COMPONENTS WEB (MDC)
   Purpose:
   - Provide Corpdesk UX tokens compatible with MDC
   - Ensure readable text in dark/light themes
   - Normalize sidebar/menu appearance
   ============================================================ */

/* 1. Root tokens (light defaults) */
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;
  --cd-bridge-border-radius: 4px;

  /* generic colors */
  --cd-color-border: #d1d5db;
  --cd-input-text-color: #212529;

  /* sidebar defaults (light) */
  --cd-menu-bg: #ffffff;
  --cd-menu-text: #222222;

  --cd-menu-active-bg: #f1f3f5;
  --cd-menu-active-text: #0b0b0b;
  --cd-menu-hover-bg: rgba(0, 0, 0, 0.04);
}

/* 2. Light theme explicit (if theme system sets it) */
html[data-md-theme="light"] {
  --cd-menu-bg: #ffffff;
  --cd-menu-text: #222222;
  --cd-menu-active-bg: #f1f3f5;
  --cd-menu-active-text: #0b0b0b;
  --cd-input-text-color: #212529;
}

/* 3. Dark theme (scoped to md theme flag) */
html[data-md-theme="dark"] {
  --cd-menu-bg: #121212;
  --cd-menu-text: #e6e6e6;

  --cd-menu-active-bg: #1f2a2f; /* subdued dark blue/grey */
  --cd-menu-active-text: #ffffff;
  --cd-menu-hover-bg: rgba(255, 255, 255, 0.06);

  --cd-input-text-color: #e6e6e6;
  --cd-color-border: #333842;
}

/* 4. Form labels */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* 5. Inputs */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: var(--cd-bridge-body-font-size);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: transparent;
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  box-sizing: border-box;
}

/* 6. Buttons (generic) */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
  cursor: pointer;
}

/* 7. Sidebar / Menu */
#cd-sidebar {
  background-color: var(--cd-menu-bg);
  color: var(--cd-menu-text);
}

/* menu link baseline (neutral) */
#cd-sidebar a.cd-menu-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 14px;
  text-decoration: none;
  color: var(--cd-menu-text);
  font-weight: 500;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

/* hover */
#cd-sidebar a.cd-menu-link:hover {
  background-color: var(--cd-menu-hover-bg);
  color: var(--cd-menu-active-text);
}

/* active row */
#cd-sidebar .metismenu li.mm-active > a,
#cd-sidebar .metismenu li.mm-active > a:hover {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

/* neutralize MetisMenu pseudo arrow if present */
.metismenu .has-arrow::before {
  display: none !important;
  content: none !important;
}

/* small helper for sidebar arrow area */
.cd-menu-arrow {
  margin-left: auto;
  padding-left: 8px;
  padding-right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

/* accessibility: remove undesired default focus outlines (bridge-controlled) */
#cd-sidebar li:focus,
#cd-sidebar li:focus-within,
#cd-sidebar a:focus,
#cd-sidebar a:focus-within {
  outline: none !important;
  box-shadow: none !important;
  background-color: inherit !important;
}
```

```json
{
  "id": "material-design",
  "name": "Material Components Web",
  "version": "1.0.0",
  "description": "Material Components Web (MDC) UI System for Corpdesk. Provides mdc classes and theme support.",
  "author": "Material Authors",
  "license": "Apache-2.0",
  "assetPath": "/assets/ui-systems/material-design",
  "cssUrl": "material-components-web.min.css",
  "jsUrl": "material-components-web.min.js",
  "stylesheets": ["material-components-web.min.css"],
  "scripts": ["material-components-web.min.js"],
  "conceptMappings": {
    "button": {
      "class": "mdc-button mdc-button--raised"
    },
    "card": {
      "class": "mdc-card"
    },
    "input": {
      "class": "mdc-text-field__input",
      "attrs": {}
    },
    "formGroup": {
      "class": "mdc-form-field"
    }
  },
  "directiveMap": {
    "cd-tooltip": "data-md-tooltip=\"true\""
  },
  "themesAvailable": [
    {
      "id": "default",
      "name": "Default",
      "displayName": "Default Theme",
      "css": "/themes/default/theme.css",
      "mode": "light"
    },
    {
      "id": "dark",
      "name": "Dark Mode",
      "displayName": "Dark Theme",
      "css": "/themes/dark/theme.css",
      "mode": "dark"
    }
  ],
  "themeActive": null,
  "metadata": {
    "supportsDarkMode": true,
    "recommendedIconLib": "material-icons"
  },
  "extensions": {
    "adapter": "MaterialDesignAdapter",
    "versionTag": "material-design"
  }
}
```

// src/CdShell/app/ui-adaptor-port/services/material-design-adapter.service.ts

```ts
// src/CdShell/app/ui-adaptor-port/services/material-design-adapter.service.ts
import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class MaterialDesignAdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  constructor() {
    console.log("%c[MaterialDesignAdapter] constructor()", "color:#8cf");
  }

  // ---------------------------------------------------------------------------
  // ACTIVATION
  // ---------------------------------------------------------------------------
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    diag_css("[MaterialDesignAdapter] activate() START", {
      id: descriptor?.id,
    });

    this.descriptor = descriptor || null;
    if (!descriptor?.conceptMappings) {
      console.warn(
        "[MaterialDesignAdapter] descriptor.conceptMappings missing!"
      );
    } else {
      console.log(
        "%c[MaterialDesignAdapter] Loaded conceptMappings:",
        "color:#0ff",
        descriptor.conceptMappings
      );
    }

    // initial pass
    diag_css("[MaterialDesignAdapter] Initial mapAll() pass");
    this.mapAll();

    // attach observer
    this.observeMutations();

    diag_css("[MaterialDesignAdapter] activate() COMPLETE", {
      active: descriptor?.id,
    });
  }

  // ---------------------------------------------------------------------------
  // DEACTIVATION
  // ---------------------------------------------------------------------------
  async deactivate(): Promise<void> {
    diag_css("[MaterialDesignAdapter] deactivate() START");

    try {
      document.documentElement.removeAttribute("data-md-theme");
      console.log("[MaterialDesignAdapter] removed data-md-theme");
    } catch {}

    if (this.observer) {
      try {
        this.observer.disconnect();
        console.log("[MaterialDesignAdapter] MutationObserver disconnected");
      } catch {}
      this.observer = null;
    }
    this.descriptor = null;
    this.appliedSet = new WeakSet();

    diag_css("[MaterialDesignAdapter] deactivate() COMPLETE");
  }

  // ---------------------------------------------------------------------------
  // THEME APPLICATION
  // ---------------------------------------------------------------------------
  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    diag_css("[MaterialDesignAdapter] applyTheme()", { themeDescriptorOrId });

    try {
      if (!themeDescriptorOrId) {
        console.warn("[MaterialDesignAdapter] applyTheme ignored (null theme)");
        return;
      }

      let mode: string | undefined;
      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-md-theme",
        mode === "dark" ? "dark" : "light"
      );

      diag_css("[MaterialDesignAdapter] applied Material theme", { mode });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] applyTheme error", err);
    }
  }

  // ---------------------------------------------------------------------------
  // CONCEPT MAPPING
  // ---------------------------------------------------------------------------
  private getMapping(concept: string): Mapping {
    const mapping =
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined;

    console.log(
      `%c[MaterialDesignAdapter] getMapping('${concept}') =`,
      "color:#9f9",
      mapping
    );
    return mapping;
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;

    if (this.appliedSet.has(el)) {
      // already mapped: update attrs if provided
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    console.log(
      "%c[MaterialDesignAdapter] Applying mapping to element:",
      "color:#7ff;",
      { tag: el.tagName, mapping }
    );

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => {
        if (c) el.classList.add(c);
      });
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    // keep track so we don't reapply repeatedly
    this.appliedSet.add(el);
  }

  // ---------------------------------------------------------------------------
  // SPECIFIC MAPPING PASSES
  // ---------------------------------------------------------------------------
  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;

    const selector = "button[cdButton], button.cd-button";
    const nodes = document.querySelectorAll<HTMLElement>(selector);

    diag_css("[MaterialDesignAdapter] mapButtons()", { count: nodes.length });
    nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
  }

  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;

    // map text-like inputs
    const selector =
      "input[cdFormControl], textarea[cdFormControl], select[cdFormControl], input, textarea, select";
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    ).filter((n) => {
      // prefer mapping only for form controls flagged with cdFormControl or inside .cd-form-field
      return (
        n.hasAttribute("cdFormControl") || n.closest(".cd-form-field") !== null
      );
    });

    diag_css("[MaterialDesignAdapter] mapInputs()", { count: nodes.length });
    nodes.forEach((el) => this.applyMappingToElement(el, mapping));
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;

    const selector = ".cd-form-field";
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    diag_css("[MaterialDesignAdapter] mapFormGroups()", {
      count: nodes.length,
    });
    nodes.forEach((el) => this.applyMappingToElement(el, mapping));
  }

  private mapOtherConcepts() {
    const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
    const concepts = Object.keys(cm).filter(
      (c) => !["button", "input", "formGroup"].includes(c)
    );
    diag_css("[MaterialDesignAdapter] mapOtherConcepts()", { concepts });

    concepts.forEach((concept) => {
      const mapping = (cm as any)[concept];
      const selector = `[data-cd-${concept}], .cd-${concept}`;
      const nodes = document.querySelectorAll<HTMLElement>(selector);
      nodes.forEach((el) => this.applyMappingToElement(el, mapping));
    });
  }

  // master mapping pass
  private mapAll() {
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — START",
      "background:#223;color:#9cf;padding:2px"
    );
    try {
      this.mapButtons();
      this.mapInputs();
      this.mapFormGroups();
      this.mapOtherConcepts();
    } catch (err) {
      console.warn("[MaterialDesignAdapter] mapAll error", err);
    }
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — END",
      "background:#223;color:#9cf;padding:2px"
    );
  }

  // ---------------------------------------------------------------------------
  // DOM OBSERVER
  // ---------------------------------------------------------------------------
  private observeMutations() {
    if (this.observer) return;

    diag_css("[MaterialDesignAdapter] MutationObserver ATTACH");

    this.observer = new MutationObserver((mutations) => {
      console.log(
        "%c[MaterialDesignAdapter] Mutation detected → scheduling mapAll()",
        "color:#ffb;"
      );
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] observer failed to attach", err);
      this.observer = null;
    }
  }
}

// Self-register with the adapter registry
UiSystemAdapterRegistry.register(
  "material-design",
  new MaterialDesignAdapterService()
);
```

//////////////////////////////////////////////
There seem to be an issue: [MaterialDesignAdapter] MDCTextField init failed: TypeError: can't access property "addEventListener", n.input is null.

html extract from browser

```html
<main id="cd-main-content">
  <form id="signInForm" class="cd-form">
    <div class="cd-form-field mdc-form-field" data-md-transformed="1">
      <div class="mdc-text-field cd-md-text-field mdc-text-field--filled">
        <input
          id="userName"
          name="userName"
          cdformcontrol=""
          placeholder=""
          class="cd-valid"
        /><label class="mdc-floating-label" for="userName">Username</label>
        <div class="mdc-line-ripple"></div>
      </div>
      <div class="error-message" data-error-for="userName"></div>
    </div>

    <div class="cd-form-field mdc-form-field" data-md-transformed="1">
      <div class="mdc-text-field cd-md-text-field mdc-text-field--filled">
        <input
          id="password"
          name="password"
          type="password"
          cdformcontrol=""
          placeholder=""
          class="cd-valid"
        /><label class="mdc-floating-label" for="password">Password</label>
        <div class="mdc-line-ripple"></div>
      </div>
      <div class="error-message" data-error-for="password"></div>
    </div>

    <button cdbutton="" class="mdc-button mdc-button--raised">Sign In</button>
  </form>
</main>
```

launch logs

```log
[MaterialDesignAdapter] mapAll() — START index-CvuyS6s1.js:48:22081
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 0 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 0 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 0 }
index-CvuyS6s1.js:48:11158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] mapAll() — END index-CvuyS6s1.js:48:22328
[MenuService] Waiting for controller services to initialize... attempt 10 index-CvuyS6s1.js:31:6640
MenuService::loadResource()/03: Injecting template into DOM index-CvuyS6s1.js:31:6783
MenuService::loadResource()/04: Executing __activate() index-CvuyS6s1.js:31:7038
[ctlSignIn][__activate] 01 index-BEx0eJtE.js:28:584
[CdDirectiveBinderService][bindToDom] start cd-directive-binder.service-DGbLY5eG.js:1:1735
[Binder] Fired event: cd:form:bound cd-directive-binder.service-DGbLY5eG.js:1:3255
[MaterialDesignAdapter] Mutation detected → scheduling mapAll() index-CvuyS6s1.js:48:22555
MenuService::loadResource()/end index-CvuyS6s1.js:31:7283
[CSS-DIAG] Default controller loaded
Object {  }
index-CvuyS6s1.js:48:11158
[SHELL] [DEBUG] bootstrapShell(): run() complete index-CvuyS6s1.js:48:1132
[CSS-DIAG] Main.run() complete
Object {  }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] mapAll() — START index-CvuyS6s1.js:48:22081
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 1 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] Applying mapping to element:
Object { tag: "BUTTON", mapping: {…} }
index-CvuyS6s1.js:48:18850
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 2 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] MDCTextField init failed: TypeError: can't access property "addEventListener", n.input is null
    registerInteractionHandler https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    registerRootHandlers https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    init https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    y https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    t https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    createRipple https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    initialize https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    C https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    initMdcTextField https://localhost:5173/assets/index-CvuyS6s1.js:48
    mapInputs https://localhost:5173/assets/index-CvuyS6s1.js:48
    mapInputs https://localhost:5173/assets/index-CvuyS6s1.js:48
    mapAll https://localhost:5173/assets/index-CvuyS6s1.js:48
    observer https://localhost:5173/assets/index-CvuyS6s1.js:48
index-CvuyS6s1.js:48:21358
[MaterialDesignAdapter] MDCTextField init failed: TypeError: can't access property "addEventListener", n.input is null
    registerInteractionHandler https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    registerRootHandlers https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    init https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    y https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    t https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    createRipple https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    initialize https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    C https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    initMdcTextField https://localhost:5173/assets/index-CvuyS6s1.js:48
    mapInputs https://localhost:5173/assets/index-CvuyS6s1.js:48
    mapInputs https://localhost:5173/assets/index-CvuyS6s1.js:48
    mapAll https://localhost:5173/assets/index-CvuyS6s1.js:48
    observer https://localhost:5173/assets/index-CvuyS6s1.js:48
index-CvuyS6s1.js:48:21358
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 2 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] Applying mapping to element:
Object { tag: "DIV", mapping: {…} }
index-CvuyS6s1.js:48:18850
[MaterialDesignAdapter] Applying mapping to element:
Object { tag: "DIV", mapping: {…} }
index-CvuyS6s1.js:48:18850
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] mapAll() — END index-CvuyS6s1.js:48:22328
[MaterialDesignAdapter] Mutation detected → scheduling mapAll() index-CvuyS6s1.js:48:22555
[MaterialDesignAdapter] mapAll() — START index-CvuyS6s1.js:48:22081
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 1 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 2 }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-CvuyS6s1.js:48:18633
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 2 }
index-CvuyS6s1.js:48:11158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-CvuyS6s1.js:48:11158
[MaterialDesignAdapter] mapAll() — END
```

/////////////////////////////////////
Same symptoms still prevail.
Perhaps you can focus on implementing debuging logs that can narrow down of the actuall issue.
Below is the status of the MaterialDesignAdapterService.
I made some correction of the codes you proposed based on typescript issues. You can also veryfy that by correcting, I did not intoduce any anomaly.

```ts
// src/CdShell/app/ui-adaptor-port/services/material-design-adapter.service.ts
import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class MaterialDesignAdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  /**
   * MDC initialization must not run multiple times during rapid DOM mutations, so we use this flag as a debounce guard.
   */
  private mdcInitQueued: boolean = false;

  constructor() {
    console.log("%c[MaterialDesignAdapter] constructor()", "color:#8cf");
  }

  // ---------------------------------------------------------------------------
  // ACTIVATION
  // ---------------------------------------------------------------------------
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    diag_css("[MaterialDesignAdapter] activate() START", {
      id: descriptor?.id,
    });

    this.descriptor = descriptor || null;
    if (!descriptor?.conceptMappings) {
      console.warn(
        "[MaterialDesignAdapter] descriptor.conceptMappings missing!"
      );
    } else {
      console.log(
        "%c[MaterialDesignAdapter] Loaded conceptMappings:",
        "color:#0ff",
        descriptor.conceptMappings
      );
    }

    // initial pass
    diag_css("[MaterialDesignAdapter] Initial mapAll() pass");
    this.mapAll();

    // attach observer
    this.observeMutations();

    diag_css("[MaterialDesignAdapter] activate() COMPLETE", {
      active: descriptor?.id,
    });
  }

  // ---------------------------------------------------------------------------
  // DEACTIVATION
  // ---------------------------------------------------------------------------
  async deactivate(): Promise<void> {
    diag_css("[MaterialDesignAdapter] deactivate() START");

    try {
      document.documentElement.removeAttribute("data-md-theme");
      console.log("[MaterialDesignAdapter] removed data-md-theme");
    } catch {}

    if (this.observer) {
      try {
        this.observer.disconnect();
        console.log("[MaterialDesignAdapter] MutationObserver disconnected");
      } catch {}
      this.observer = null;
    }
    this.descriptor = null;
    this.appliedSet = new WeakSet();

    diag_css("[MaterialDesignAdapter] deactivate() COMPLETE");
  }

  // ---------------------------------------------------------------------------
  // THEME APPLICATION
  // ---------------------------------------------------------------------------
  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    diag_css("[MaterialDesignAdapter] applyTheme()", { themeDescriptorOrId });

    try {
      if (!themeDescriptorOrId) {
        console.warn("[MaterialDesignAdapter] applyTheme ignored (null theme)");
        return;
      }

      let mode: string | undefined;
      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-md-theme",
        mode === "dark" ? "dark" : "light"
      );

      diag_css("[MaterialDesignAdapter] applied Material theme", { mode });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] applyTheme error", err);
    }
  }

  // ---------------------------------------------------------------------------
  // CONCEPT MAPPING
  // ---------------------------------------------------------------------------
  private getMapping(concept: string): Mapping {
    const mapping =
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined;

    console.log(
      `%c[MaterialDesignAdapter] getMapping('${concept}') =`,
      "color:#9f9",
      mapping
    );
    return mapping;
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;

    if (this.appliedSet.has(el)) {
      // already mapped: update attrs if provided
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    console.log(
      "%c[MaterialDesignAdapter] Applying mapping to element:",
      "color:#7ff;",
      { tag: el.tagName, mapping }
    );

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => {
        if (c) el.classList.add(c);
      });
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    // keep track so we don't reapply repeatedly
    this.appliedSet.add(el);
  }

  /**
   * Dom Construction for MDC form fields
   * Accepts either an input/textarea/select element or a wrapper (.cd-form-field) HTMLElement.
   * @param target input element or wrapper element
   * @returns
   */
  private prepareMdcDom(
    target:
      | HTMLElement
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
  ) {
    if (!target) return;

    // Resolve the actual form control element (input/textarea/select)
    let inputEl:
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | null = null;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      inputEl = target;
    } else if (target instanceof HTMLElement) {
      inputEl = target.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");
    }

    if (!inputEl) return;

    const wrapperEl = inputEl.closest(".cd-form-field");
    if (
      !wrapperEl ||
      !(wrapperEl instanceof HTMLElement) ||
      wrapperEl.dataset.mdTransformed === "1"
    )
      return;

    const wrapper = wrapperEl;

    wrapper.dataset.mdTransformed = "1";

    // Build MDC DOM
    const mdc = document.createElement("div");
    mdc.className = "mdc-text-field mdc-text-field--filled cd-md-text-field";

    const ripple = document.createElement("span");
    ripple.className = "mdc-text-field__ripple";

    const label = document.createElement("label");
    label.className = "mdc-floating-label";
    label.htmlFor = (inputEl as HTMLElement).id;
    label.textContent = wrapper.querySelector("label")?.textContent ?? "";

    const lineRipple = document.createElement("span");
    lineRipple.className = "mdc-line-ripple";

    inputEl.classList.add("mdc-text-field__input");

    mdc.append(ripple, inputEl, label, lineRipple);
    wrapper.querySelector("label")?.remove();
    wrapper.prepend(mdc);
  }

  private scheduleMdcInit() {
    if (this.mdcInitQueued) return;
    this.mdcInitQueued = true;

    setTimeout(() => {
      this.mdcInitQueued = false;
      this.initAllMdcTextFields();
    }, 20);
  }

  private initAllMdcTextFields() {
    const { MDCTextField } = (window as any).mdc || {};
    if (!MDCTextField) return;

    document.querySelectorAll(".cd-md-text-field").forEach((el) => {
      if ((el as HTMLElement).dataset.mdInitialized === "1") return;

      try {
        new MDCTextField(el);
        (el as HTMLElement).dataset.mdInitialized = "1";
      } catch (err) {
        console.warn("[MaterialDesignAdapter] MDCTextField init failed:", err);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // SPECIFIC MAPPING PASSES
  // ---------------------------------------------------------------------------
  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;

    const selector = "button[cdButton], button.cd-button";
    const nodes = document.querySelectorAll<HTMLElement>(selector);

    diag_css("[MaterialDesignAdapter] mapButtons()", { count: nodes.length });
    nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
  }

  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;

    // select potential form-control containers
    const formFieldNodes = Array.from(
      document.querySelectorAll<HTMLElement>(".cd-form-field")
    );

    diag_css("[MaterialDesignAdapter] mapInputs()", {
      candidates: formFieldNodes.length,
    });

    formFieldNodes.forEach((field) => {
      try {
        const input = field.querySelector<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input, textarea, select");
        const label = field.querySelector<HTMLLabelElement>("label");

        if (!input) return; // nothing to do

        // skip if already transformed
        if (field.dataset.mdTransformed === "1") return;

        // Create MDC text-field wrapper
        const wrapper = document.createElement("div");
        wrapper.classList.add("mdc-text-field", "cd-md-text-field");
        // Use filled style for material look (changeable)
        wrapper.classList.add("mdc-text-field--filled");

        // Move the input into wrapper (preserve attributes)
        // clone input to avoid losing event listeners (rare), but keep original reference usable
        const inputClone = input.cloneNode(true) as HTMLElement;
        // remove placeholder (we'll use label); keep placeholder as fallback attribute
        const placeholder = (input as HTMLInputElement).placeholder || "";
        if (inputClone instanceof HTMLInputElement) inputClone.placeholder = "";

        // Build floating label
        const floatingLabel = document.createElement("label");
        floatingLabel.classList.add("mdc-floating-label");
        // label text: prefer existing label text; fallback to placeholder or name
        const labelText =
          (label && label.textContent && label.textContent.trim()) ||
          placeholder ||
          (input as HTMLInputElement).name ||
          "";
        floatingLabel.textContent = labelText;

        // Build line ripple (visual bottom bar) — used by filled style
        const lineRipple = document.createElement("div");
        lineRipple.classList.add("mdc-line-ripple");

        // Transfer id/for semantics: ensure input has id; if original label existed, remove it after keeping text
        let inputId = (input as HTMLElement).id;
        if (!inputId) {
          inputId = `cd-md-input-${Math.random().toString(36).slice(2, 8)}`;
          (inputClone as HTMLElement).id = inputId;
        }
        floatingLabel.setAttribute("for", inputId);

        // Move inputClone inside wrapper
        wrapper.appendChild(inputClone);
        wrapper.appendChild(floatingLabel);
        wrapper.appendChild(lineRipple);

        // Replace original input + label in DOM:
        // if label exists, remove it (we've captured the text)
        if (label) label.remove();

        // replace input element in the field with wrapper
        input.replaceWith(wrapper);

        // Mark transformed
        field.dataset.mdTransformed = "1";

        // Copy any attributes from original input node to clone that matter for binding
        // (id already handled). For safety, copy name, type, value, required, disabled, aria-*
        const orig = input as HTMLElement;
        const clone = inputClone as HTMLElement;
        [
          "name",
          "type",
          "value",
          "required",
          "disabled",
          "aria-label",
          "aria-describedby",
        ].forEach((attr) => {
          const v = (orig as any).getAttribute?.(attr);
          if (v !== null && v !== undefined) clone.setAttribute?.(attr, v);
        });

        // Now initialize MDC TextField if available (UMD global `mdc`)
        this.initMdcTextField(wrapper as HTMLElement);

        // Fallback handlers: focus/blur toggles for the label animation if MDC not present
        if (!(window as any).mdc || !(window as any).mdc.textField) {
          const inputElement = wrapper.querySelector<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >("input, textarea, select");
          if (inputElement) {
            // initial state: if input has value, add 'mdc-text-field--focused' to keep label floated
            if (
              (inputElement as HTMLInputElement).value &&
              (inputElement as HTMLInputElement).value.length > 0
            ) {
              wrapper.classList.add("mdc-text-field--focused");
            }
            inputElement.addEventListener("focus", () =>
              wrapper.classList.add("mdc-text-field--focused")
            );
            inputElement.addEventListener("blur", () => {
              if (
                !(inputElement as HTMLInputElement).value ||
                (inputElement as HTMLInputElement).value.length === 0
              ) {
                wrapper.classList.remove("mdc-text-field--focused");
              }
            });
          }
        }

        // apply mapping attributes if mapping provides them (like aria attrs)
        if (mapping.attrs) {
          Object.entries(mapping.attrs).forEach(([k, v]) =>
            wrapper.setAttribute(k, v as string)
          );
        }

        // Remember so applyMappingToElement doesn't later add bootstrap classes
        this.appliedSet.add(wrapper as unknown as HTMLElement);
      } catch (err) {
        console.warn("[MaterialDesignAdapter] mapInputs: transform error", err);
      }
    });
  }

  /**
   * initMdcTextField(wrapper)
   * - If MDC Web is available (UMD global `mdc`), instantiate MDCTextField for the wrapper.
   * - If already instantiated, skip.
   */
  private initMdcTextField(wrapper: HTMLElement) {
    try {
      const mdcGlobal = (window as any).mdc;
      if (
        mdcGlobal &&
        mdcGlobal.textField &&
        typeof mdcGlobal.textField.MDCTextField === "function"
      ) {
        // Avoid double-instantiation
        if (!(wrapper as any).__mdc_textfield_inst) {
          try {
            const tf = new mdcGlobal.textField.MDCTextField(wrapper);
            (wrapper as any).__mdc_textfield_inst = tf;
          } catch (e) {
            // fallback: mark it and go with CSS-based behavior
            (wrapper as any).__mdc_textfield_inst = null;
            console.warn(
              "[MaterialDesignAdapter] MDCTextField init failed:",
              e
            );
          }
        }
      }
    } catch (err) {
      console.warn("[MaterialDesignAdapter] initMdcTextField error", err);
    }
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;

    const selector = ".cd-form-field";
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    diag_css("[MaterialDesignAdapter] mapFormGroups()", {
      count: nodes.length,
    });
    // nodes.forEach((el) => this.applyMappingToElement(el, mapping));
    nodes.forEach((el) => {
      this.applyMappingToElement(el, mapping);
      this.prepareMdcDom(el); // NEW — build MDC wrapper
    });
  }

  private mapOtherConcepts() {
    const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
    const concepts = Object.keys(cm).filter(
      (c) => !["button", "input", "formGroup"].includes(c)
    );
    diag_css("[MaterialDesignAdapter] mapOtherConcepts()", { concepts });

    concepts.forEach((concept) => {
      const mapping = (cm as any)[concept];
      const selector = `[data-cd-${concept}], .cd-${concept}`;
      const nodes = document.querySelectorAll<HTMLElement>(selector);
      // nodes.forEach((el) => this.applyMappingToElement(el, mapping));
      nodes.forEach((el) => {
        this.applyMappingToElement(el, mapping);
        this.prepareMdcDom(el); // NEW — build MDC wrapper
      });
    });
  }

  // master mapping pass
  private mapAll() {
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — START",
      "background:#223;color:#9cf;padding:2px"
    );
    try {
      this.mapButtons();
      this.mapInputs();
      this.mapFormGroups();
      this.mapOtherConcepts();
    } catch (err) {
      console.warn("[MaterialDesignAdapter] mapAll error", err);
    }
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — END",
      "background:#223;color:#9cf;padding:2px"
    );
  }

  // ---------------------------------------------------------------------------
  // DOM OBSERVER
  // ---------------------------------------------------------------------------
  private observeMutations() {
    if (this.observer) return;

    diag_css("[MaterialDesignAdapter] MutationObserver ATTACH");

    this.observer = new MutationObserver((mutations) => {
      console.log(
        "%c[MaterialDesignAdapter] Mutation detected → scheduling mapAll()",
        "color:#ffb;"
      );
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] observer failed to attach", err);
      this.observer = null;
    }
  }
}

// Self-register with the adapter registry
UiSystemAdapterRegistry.register(
  "material-design",
  new MaterialDesignAdapterService()
);
```

//////////////////////////////////////////////
Resulting logs:

```log
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
​
class: "mdc-button mdc-button--raised"
​
<prototype>: Object { … }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 0 }
index-DInrB58P.js:48:11158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] mapAll() — END index-DInrB58P.js:48:26184
[MenuService] Waiting for controller services to initialize... attempt 7 index-DInrB58P.js:31:6640
[MenuService] Waiting for controller services to initialize... attempt 8 index-DInrB58P.js:31:6640
[MenuService] Waiting for controller services to initialize... attempt 9 index-DInrB58P.js:31:6640
[MaterialDesignAdapter] mapAll() — START index-DInrB58P.js:48:25914
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 0 }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 0 }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 0 }
index-DInrB58P.js:48:11158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] mapAll() — END index-DInrB58P.js:48:26184
[MenuService] Waiting for controller services to initialize... attempt 10 index-DInrB58P.js:31:6640
MenuService::loadResource()/03: Injecting template into DOM index-DInrB58P.js:31:6783
MenuService::loadResource()/04: Executing __activate() index-DInrB58P.js:31:7038
[ctlSignIn][__activate] 01 index-BEx0eJtE.js:28:584
[CdDirectiveBinderService][bindToDom] start cd-directive-binder.service-DGbLY5eG.js:1:1735
[Binder] Fired event: cd:form:bound cd-directive-binder.service-DGbLY5eG.js:1:3255
[MaterialDesignAdapter] Mutation detected → scheduling mapAll() index-DInrB58P.js:48:26411
MenuService::loadResource()/end index-DInrB58P.js:31:7283
[CSS-DIAG] Default controller loaded
Object {  }
index-DInrB58P.js:48:11158
[SHELL] [DEBUG] bootstrapShell(): run() complete index-DInrB58P.js:48:1132
[CSS-DIAG] Main.run() complete
Object {  }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] mapAll() — START index-DInrB58P.js:48:25914
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 1 }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] Applying mapping to element:
Object { tag: "BUTTON", mapping: {…} }
index-DInrB58P.js:48:18872
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 2 }
index-DInrB58P.js:48:11158
[MD][mapInputs] FIELD #0 index-DInrB58P.js:48:21750
[MD][mapInputs] Input found:
Object { tag: "INPUT", id: "userName", name: "userName", placeholder: "Enter username" }
index-DInrB58P.js:48:22084
[MD][mapInputs] Attempt MDC init on wrapper:
<div class="mdc-text-field cd-md-tex… mdc-text-field--filled">
index-DInrB58P.js:48:23069
[MD][mapInputs] MDCTextField init error TypeError: can't access property "addEventListener", n.input is null
    registerInteractionHandler https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    registerRootHandlers https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    init https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    y https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    t https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    createRipple https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    initialize https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    C https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    mapInputs https://localhost:5173/assets/index-DInrB58P.js:48
    mapInputs https://localhost:5173/assets/index-DInrB58P.js:48
    mapAll https://localhost:5173/assets/index-DInrB58P.js:48
    observer https://localhost:5173/assets/index-DInrB58P.js:48

Object { wrapper: div.mdc-text-field.cd-md-text-field.mdc-text-field--filled
 }
index-DInrB58P.js:48:23393
[MD][mapInputs] Field transformation COMPLETE index-DInrB58P.js:48:24046
[MD][mapInputs] FIELD #1 index-DInrB58P.js:48:21750
[MD][mapInputs] Input found:
Object { tag: "INPUT", id: "password", name: "password", placeholder: "Enter password" }
index-DInrB58P.js:48:22084
[MD][mapInputs] Attempt MDC init on wrapper:
<div class="mdc-text-field cd-md-tex… mdc-text-field--filled">
index-DInrB58P.js:48:23069
[MD][mapInputs] MDCTextField init error TypeError: can't access property "addEventListener", n.input is null
    registerInteractionHandler https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    registerRootHandlers https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    init https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    y https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    t https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    createRipple https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    initialize https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    a https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    C https://localhost:5173/assets/ui-systems/material-design/material-components-web.min.js:1
    mapInputs https://localhost:5173/assets/index-DInrB58P.js:48
    mapInputs https://localhost:5173/assets/index-DInrB58P.js:48
    mapAll https://localhost:5173/assets/index-DInrB58P.js:48
    observer https://localhost:5173/assets/index-DInrB58P.js:48

Object { wrapper: div.mdc-text-field.cd-md-text-field.mdc-text-field--filled
 }
index-DInrB58P.js:48:23393
[MD][mapInputs] Field transformation COMPLETE index-DInrB58P.js:48:24046
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 2 }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] Applying mapping to element:
Object { tag: "DIV", mapping: {…} }
index-DInrB58P.js:48:18872
[prepareMdcDom] SKIP: already transformed
Object { field: div.cd-form-field.mdc-form-field
 }
index-DInrB58P.js:48:19419
[MaterialDesignAdapter] Applying mapping to element:
Object { tag: "DIV", mapping: {…} }
index-DInrB58P.js:48:18872
[prepareMdcDom] SKIP: already transformed
Object { field: div.cd-form-field.mdc-form-field
 }
index-DInrB58P.js:48:19419
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] mapAll() — END index-DInrB58P.js:48:26184
[MaterialDesignAdapter] Mutation detected → scheduling mapAll() index-DInrB58P.js:48:26411
[MaterialDesignAdapter] mapAll() — START index-DInrB58P.js:48:25914
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 1 }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 2 }
index-DInrB58P.js:48:11158
[MD][mapInputs] FIELD #0 index-DInrB58P.js:48:21750
[MD][mapInputs] Already transformed — skip index-DInrB58P.js:48:22019
[MD][mapInputs] FIELD #1 index-DInrB58P.js:48:21750
[MD][mapInputs] Already transformed — skip index-DInrB58P.js:48:22019
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-DInrB58P.js:48:18655
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 2 }
index-DInrB58P.js:48:11158
[prepareMdcDom] SKIP: already transformed
Object { field: div.cd-form-field.mdc-form-field
 }
index-DInrB58P.js:48:19419
[prepareMdcDom] SKIP: already transformed
Object { field: div.cd-form-field.mdc-form-field
 }
index-DInrB58P.js:48:19419
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-DInrB58P.js:48:11158
[MaterialDesignAdapter] mapAll() — END
```

/////////////////////////////////////////////////////
We have been able to clear the error.
Now the page is loading ok. But the effect is such that the label just disapears when the input is in focus.
Another unexpected effect, is that we have a standard boarder showing for the input. The boarder is highlighted with green and changes to blue when in focus.
What I have noted from material demos ( I prefer the standard, filled), i that the actual input boarder seem invisible.
If we were to make ours invisible, we may be a step closer because we already have the light gray background and the underline.
Another area of improvement is, for the standard, the underline for the rectangular background is bluish. When the input recieve focus, the placeholder, which is at around size 8 and coloured gray, animates to smaller size(around 5) above the invisible input boarders but within the gray background. This label then changes to bluish colour for the underline.
The references below seem to be complete with the animation. Is it something we can adopt.
I hope you are able to get the links and assess whether we can use what they already have. If not we can still continue refining out custom one.

Below are some references.
Reference: https://github.com/material-components/material-components-web/tree/master/packages/mdc-textfield
Example from:
https://material-components.github.io/material-components-web-catalog/#/component/text-field

Example script html

```html
<div class="mdc-text-field">
  <input class="mdc-text-field__input" id="text-field-hero-input" />
  <div class="mdc-line-ripple"></div>
  <label for="text-field-hero-input" class="mdc-floating-label">Name</label>
</div>
```

Browser html

```html
<div class="text-field-container">
  <div
    class="mdc-text-field text-field mdc-ripple-upgraded"
    style="--mdc-ripple-fg-size: 144px; --mdc-ripple-fg-scale: 1.7808802000832624; --mdc-ripple-fg-translate-start: 62px, -43.80000305175781px; --mdc-ripple-fg-translate-end: 48px, -44px;"
  >
    <input
      type="text"
      id="text-field-filled"
      class="mdc-text-field__input"
      aria-describedby="text-field-filled-helper-text"
    /><label class="mdc-floating-label" for="text-field-filled">Standard</label>
    <div
      class="mdc-line-ripple"
      style="transform-origin: 134px center 0px;"
    ></div>
  </div>
  <div class="mdc-text-field-helper-line">
    <p
      class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent mdc-text-field-helper-text--validation-msg"
      id="text-field-filled-helper-text"
    >
      Helper Text
    </p>
  </div>
</div>
```

///////////////////////////////////////////////////

What we are generating in our browser

```html
<div class="cd-form-field mdc-form-field" data-md-transformed="1">
  <div class="error-message" data-error-for="userName"></div>
  <div
    class="mdc-text-field mdc-text-field--filled cd-md-text-field mdc-ripple-upgraded"
    style="--mdc-ripple-fg-size: 959px; --mdc-ripple-fg-scale: 1.6788115874649367; --mdc-ripple-fg-translate-start: -334.5px, -451.5px; --mdc-ripple-fg-translate-end: 320px, -451.5px;"
  >
    <span class="mdc-text-field__ripple"></span
    ><input
      id="userName"
      name="userName"
      cdformcontrol=""
      placeholder=""
      class="mdc-text-field__input cd-valid"
    /><label class="mdc-floating-label" for="userName">Username</label
    ><span
      class="mdc-line-ripple"
      style="transform-origin: 129px center 0px;"
    ></span>
  </div>
</div>
```

////////////////////////////////////////

Full package.json.script

```json
"scripts": {
    "clean": "rm -rf dist dist-ts",
    "prebuild": "node scripts/prebuild-stubs.js",
    "compile-ts": "tsc --project tsconfig.json",
    "dev": "vite --debug",
    "build": "npm run clean && npm run prebuild && npm run compile-ts && vite build && npm run post-build",
    "post-build": "node scripts/post-build.js || bash scripts/post-build.sh",
    "preview": "vite preview --config src/vite.config.ts",
    "rebuild": "npm run clean && npm run build",
    "analyze": "vite build --mode analyze",
    "build-mdc": "sass public/assets/ui-systems/material-design/material.scss public/assets/ui-systems/material-design/material.min.css --no-source-map --style=compressed"
  },
```

///////////////////////////////////////////////
I am running into an issue as show below.
I have also shared some information that can be helpful in diagnosis.

```log
emp-12@emp-12 ~/cd-shell (main) [65]> npm run build-mdc

> cd-shell@1.0.0 build-mdc
> sass public/assets/ui-systems/material-design/material.scss public/assets/ui-systems/material-design/material.min.css --no-source-map --style=compressed

Error: Can't find stylesheet to import.
  ╷
1 │ @use "@material/floating-label/mdc-floating-label";
  │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  ╵
  public/assets/ui-systems/material-design/material.scss 1:1  root stylesheet
```

```sh
emp-12@emp-12 ~/cd-shell (main) [65]> tree public
public
├── assets
│   ├── css
│   │   ├── font-awesome-6.5.0
│   │   │   └── all.min.css
│   │   └── index.css
│   ├── fonts
│   ├── images
│   └── ui-systems
│       ├── bootstrap-502
│       │   ├── bootstrap.min.css
│       │   ├── bootstrap.min.js
│       │   └── descriptor.json
│       ├── bootstrap-538
│       │   ├── bootstrap.bundle.min.js
│       │   ├── bootstrap.min.css
│       │   ├── bridge.css
│       │   └── descriptor.json
│       ├── bulma
│       │   ├── bridge.css
│       │   ├── bulma.min.css
│       │   └── descriptor.json
│       ├── flowbite
│       │   ├── bridge.css
│       │   ├── descriptor.json
│       │   └── flowbite-adapter.service.ts
│       ├── foundation
│       │   ├── bridge.css
│       │   ├── descriptor.json
│       │   └── foundation-adapter.service.ts
│       ├── material-design
│       │   ├── bridge.css
│       │   ├── descriptor.json
│       │   ├── material-components-web.min.css
│       │   ├── material-components-web.min.js
│       │   ├── material.min.css
│       │   └── material.scss
│       └── primer
│           ├── bridge.css
│           ├── descriptor.json
│           └── primer-adapter.service.ts
├── shell.config.json
└── themes
    ├── common
    │   ├── base.css
    │   ├── forms
    │   │   ├── cd-forms.css
    │   │   └── variants
    │   │       ├── cd-form-compact.css
    │   │       ├── cd-form-floating.css
    │   │       └── cd-form-standard.css
    │   ├── layout.json
    │   └── menu-neutral.css
    ├── dark
    │   ├── menu-systems
    │   │   └── metismenu.css
    │   ├── theme.css
    │   └── theme.json
    └── default
        ├── logo.png
        ├── menu-systems
        │   └── metismenu.css
        ├── theme.css
        └── theme.json
```

```sh
emp-12@emp-12 ~/cd-shell (main)> cat public/assets/ui-systems/material-design/material.scss
@use "@material/floating-label/mdc-floating-label";
@use "@material/line-ripple/mdc-line-ripple";
@use "@material/notched-outline/mdc-notched-outline";
@use "@material/textfield";

@include textfield.core-styles;
```

/////////////////////////////////////////////
Below shows that node_modules/@material/floating-label/ exists.

```sh
emp-12@emp-12 ~/cd-shell (main)> tree node_modules/@material/floating-label/
node_modules/@material/floating-label/
├── adapter.d.ts
├── adapter.js
├── adapter.js.map
├── component.d.ts
├── component.js
├── component.js.map
├── constants.d.ts
├── constants.js
├── constants.js.map
├── dist
│   ├── mdc.floating-label.css
│   ├── mdc.floating-label.css.map
│   ├── mdc.floatingLabel.js
│   ├── mdc.floatingLabel.js.map
│   ├── mdc.floating-label.min.css
│   ├── mdc.floating-label.min.css.map
│   └── mdc.floatingLabel.min.js
├── foundation.d.ts
├── foundation.js
├── foundation.js.map
├── index.d.ts
├── index.js
├── index.js.map
├── _index.scss
├── LICENSE
├── mdc-floating-label.import.scss
├── mdc-floating-label.scss
├── _mixins.import.scss
├── _mixins.scss
├── package.json
├── README.md
├── _variables.import.scss
└── _variables.scss
```

///////////////////////////////////////////////
Below is the settings for package.json scripts property.
Assist me to modify so that when we run npm run build, it also executes the npm run build-mdc

```json
"scripts": {
    "clean": "rm -rf dist dist-ts",
    "prebuild": "node scripts/prebuild-stubs.js",
    "compile-ts": "tsc --project tsconfig.json",
    "dev": "vite --debug",
    "build": "npm run clean && npm run prebuild && npm run compile-ts && vite build && npm run post-build",
    "post-build": "node scripts/post-build.js || bash scripts/post-build.sh",
    "preview": "vite preview --config src/vite.config.ts",
    "rebuild": "npm run clean && npm run build",
    "analyze": "vite build --mode analyze",
    "build-mdc": "sass --load-path=node_modules public/assets/ui-systems/material-design/material.scss public/assets/ui-systems/material-design/material.min.css --no-source-map --style=compressed"
  },
```

//////////////////////////////////////////////////

The proposal for mapInputs(), has an error in the value for wrapper:
Error: An expression of type 'void' cannot be tested for truthiness.
I have shared the whole MaterialDesignAdapterService for your reference.

```ts
// src/CdShell/app/ui-adaptor-port/services/material-design-adapter.service.ts
import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class MaterialDesignAdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  /**
   * MDC initialization must not run multiple times during rapid DOM mutations, so we use this flag as a debounce guard.
   */
  private mdcInitQueued: boolean = false;

  constructor() {
    console.log("%c[MaterialDesignAdapter] constructor()", "color:#8cf");
  }

  // ---------------------------------------------------------------------------
  // ACTIVATION
  // ---------------------------------------------------------------------------
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    diag_css("[MaterialDesignAdapter] activate() START", {
      id: descriptor?.id,
    });

    this.descriptor = descriptor || null;
    if (!descriptor?.conceptMappings) {
      console.warn(
        "[MaterialDesignAdapter] descriptor.conceptMappings missing!"
      );
    } else {
      console.log(
        "%c[MaterialDesignAdapter] Loaded conceptMappings:",
        "color:#0ff",
        descriptor.conceptMappings
      );
    }

    // initial pass
    diag_css("[MaterialDesignAdapter] Initial mapAll() pass");
    this.mapAll();

    // attach observer
    this.observeMutations();

    diag_css("[MaterialDesignAdapter] activate() COMPLETE", {
      active: descriptor?.id,
    });
  }

  // ---------------------------------------------------------------------------
  // DEACTIVATION
  // ---------------------------------------------------------------------------
  async deactivate(): Promise<void> {
    diag_css("[MaterialDesignAdapter] deactivate() START");

    try {
      document.documentElement.removeAttribute("data-md-theme");
      console.log("[MaterialDesignAdapter] removed data-md-theme");
    } catch {}

    if (this.observer) {
      try {
        this.observer.disconnect();
        console.log("[MaterialDesignAdapter] MutationObserver disconnected");
      } catch {}
      this.observer = null;
    }
    this.descriptor = null;
    this.appliedSet = new WeakSet();

    diag_css("[MaterialDesignAdapter] deactivate() COMPLETE");
  }

  // ---------------------------------------------------------------------------
  // THEME APPLICATION
  // ---------------------------------------------------------------------------
  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    diag_css("[MaterialDesignAdapter] applyTheme()", { themeDescriptorOrId });

    try {
      if (!themeDescriptorOrId) {
        console.warn("[MaterialDesignAdapter] applyTheme ignored (null theme)");
        return;
      }

      let mode: string | undefined;
      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-md-theme",
        mode === "dark" ? "dark" : "light"
      );

      diag_css("[MaterialDesignAdapter] applied Material theme", { mode });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] applyTheme error", err);
    }
  }

  // ---------------------------------------------------------------------------
  // CONCEPT MAPPING
  // ---------------------------------------------------------------------------
  private getMapping(concept: string): Mapping {
    const mapping =
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined;

    console.log(
      `%c[MaterialDesignAdapter] getMapping('${concept}') =`,
      "color:#9f9",
      mapping
    );
    return mapping;
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;

    if (this.appliedSet.has(el)) {
      // already mapped: update attrs if provided
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    console.log(
      "%c[MaterialDesignAdapter] Applying mapping to element:",
      "color:#7ff;",
      { tag: el.tagName, mapping }
    );

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => {
        if (c) el.classList.add(c);
      });
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    // keep track so we don't reapply repeatedly
    this.appliedSet.add(el);
  }

  /**
   * Full prepareMdcDom(target)
   * - Consolidated helper to transform a .cd-form-field or a direct input element
   * - Ensures correct DOM shape required by MDCTextField
   * - Performs robust checks and logs internal state for debugging
   */
  private prepareMdcDom(field: HTMLElement) {
    console.log("[prepareMdcDom] START", { field });

    if (!field) return;

    // Already transformed?
    if (field.dataset.mdTransformed === "1") {
      console.log("[prepareMdcDom] SKIP: already transformed", { field });
      return;
    }

    // Locate input + label
    const input = field.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");
    const labelEl = field.querySelector<HTMLLabelElement>("label");

    if (!input) {
      console.warn("[prepareMdcDom] No input found inside field", field);
      return;
    }

    // Capture label text before removing
    const labelText =
      labelEl?.textContent?.trim() ||
      input.getAttribute("placeholder") ||
      input.name ||
      "Label";

    // Remove browser placeholder for MDC styling (only for inputs/textarea)
    if ("placeholder" in input) {
      (input as HTMLInputElement | HTMLTextAreaElement).placeholder = "";
    }

    // Generate unique id if missing
    if (!input.id) {
      input.id = `mdc-input-${Math.random().toString(36).slice(2, 8)}`;
    }

    // CREATE MDC STRUCTURE
    const wrapper = document.createElement("div");
    wrapper.className =
      "mdc-text-field mdc-text-field--filled cd-md-text-field";

    // ripple
    const ripple = document.createElement("span");
    ripple.className = "mdc-text-field__ripple";

    // label
    const floatingLabel = document.createElement("label");
    floatingLabel.className = "mdc-floating-label";
    floatingLabel.setAttribute("for", input.id);
    floatingLabel.textContent = labelText;

    // line ripple
    const lineRipple = document.createElement("span");
    lineRipple.className = "mdc-line-ripple";

    // Reparent input
    input.classList.add("mdc-text-field__input");

    // Build DOM
    wrapper.appendChild(ripple);
    wrapper.appendChild(input);
    wrapper.appendChild(floatingLabel);
    wrapper.appendChild(lineRipple);

    // Replace original
    labelEl?.remove();
    field.appendChild(wrapper);

    // Mark transformed
    field.dataset.mdTransformed = "1";

    console.log("[prepareMdcDom] COMPLETE", { wrapper });

    // Initialize MDC
    this.initMdcTextField(wrapper);
  }

  /**
   * attachCssFallback(wrapper)
   * - Adds simple focus/blur behavior that emulates MDC floating label when MDC is not available or fails.
   */
  private attachCssFallback(wrapper: HTMLElement) {
    try {
      const inputElement = wrapper.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");
      if (!inputElement) {
        console.warn("[attachCssFallback] no input to attach handlers to", {
          wrapper,
        });
        return;
      }

      // If value present, keep label floated
      if (
        (inputElement as HTMLInputElement).value &&
        (inputElement as HTMLInputElement).value.length > 0
      ) {
        wrapper.classList.add("mdc-text-field--focused");
      }

      // Avoid multiple handler attachments
      if (!(inputElement as any).__cd_md_handlers_attached) {
        inputElement.addEventListener("focus", () =>
          wrapper.classList.add("mdc-text-field--focused")
        );
        inputElement.addEventListener("blur", () => {
          if (
            !(inputElement as HTMLInputElement).value ||
            (inputElement as HTMLInputElement).value.length === 0
          ) {
            wrapper.classList.remove("mdc-text-field--focused");
          }
        });
        (inputElement as any).__cd_md_handlers_attached = true;
      }
    } catch (err) {
      console.warn("[attachCssFallback] error", err);
    }
  }

  private scheduleMdcInit() {
    if (this.mdcInitQueued) return;
    this.mdcInitQueued = true;

    setTimeout(() => {
      this.mdcInitQueued = false;
      this.initAllMdcTextFields();
    }, 20);
  }

  private initAllMdcTextFields() {
    const { MDCTextField } = (window as any).mdc || {};
    if (!MDCTextField) return;

    document.querySelectorAll(".cd-md-text-field").forEach((el) => {
      if ((el as HTMLElement).dataset.mdInitialized === "1") return;

      try {
        new MDCTextField(el);
        (el as HTMLElement).dataset.mdInitialized = "1";
      } catch (err) {
        console.warn("[MaterialDesignAdapter] MDCTextField init failed:", err);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // SPECIFIC MAPPING PASSES
  // ---------------------------------------------------------------------------
  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;

    const selector = "button[cdButton], button.cd-button";
    const nodes = document.querySelectorAll<HTMLElement>(selector);

    diag_css("[MaterialDesignAdapter] mapButtons()", { count: nodes.length });
    nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
  }

  /**
   * mapInputs()
   * Transforms each `.cd-form-field` into an MDC floating-label text field.
   * Includes extensive diagnostics to catch MDCTextField initialization problems.
   */
  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;

    // Find all form fields
    const formFieldNodes = Array.from(
      document.querySelectorAll<HTMLElement>(".cd-form-field")
    );

    diag_css("[MaterialDesignAdapter] mapInputs()", {
      candidates: formFieldNodes.length,
    });

    formFieldNodes.forEach((field, idx) => {
      try {
        console.debug(`[MD][mapInputs] FIELD #${idx}`, { field });

        // Find the input inside this field
        const input = field.querySelector<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input, textarea, select");

        if (!input) {
          console.debug("[MD][mapInputs] No input found in field — skipping", {
            field,
          });
          return;
        }

        console.debug("[MD][mapInputs] Input detected:", {
          tag: input.tagName,
          id: input.id || null,
          name: input.getAttribute("name"),
          placeholder: input.getAttribute("placeholder"),
        });

        // If field already transformed, skip
        if (field.dataset.mdTransformed === "1") {
          console.debug("[MD][mapInputs] Already transformed — skip");
          return;
        }

        // Run DOM transformation (creates MDC wrapper + clones input)
        const wrapper = this.prepareMdcDom(field);

        if (!wrapper) {
          console.warn(
            "[MD][mapInputs] prepareMdcDom() did not produce wrapper. Skip."
          );
          return;
        }

        console.debug("[MD][mapInputs] Wrapper created:", wrapper);

        // Apply mapping attrs to wrapper (if any)
        if (mapping.attrs) {
          Object.entries(mapping.attrs).forEach(([k, v]) =>
            wrapper.setAttribute(k, v as string)
          );
        }

        // Final MDC initialization
        try {
          this.initMdcTextField(wrapper);
          console.debug("[MD][mapInputs] MDC initialization success", {
            wrapper,
          });
        } catch (err) {
          console.warn("[MD][mapInputs] MDC init failed", err, { wrapper });
        }

        console.debug("[MD][mapInputs] COMPLETE", { field });
      } catch (err) {
        console.warn("[MaterialDesignAdapter] mapInputs: transform error", err);
      }
    });
  }

  /**
   * initMdcTextField(wrapper)
   * - If MDC Web is available (UMD global `mdc`), instantiate MDCTextField for the wrapper.
   * - If already instantiated, skip.
   */
  private initMdcTextField(wrapper: HTMLElement) {
    console.log("[MDC][initMdcTextField] ENTER", {
      wrapper,
      html: wrapper.outerHTML,
    });

    try {
      const mdcGlobal = (window as any).mdc;

      console.log("[MDC][initMdcTextField] mdcGlobal =", mdcGlobal);

      if (!mdcGlobal || !mdcGlobal.textField) {
        console.warn("[MDC][initMdcTextField] mdcGlobal.textField is missing");
        return;
      }

      console.log("[MDC][initMdcTextField] wrapper children:", {
        children: Array.from(wrapper.children).map((c) => ({
          tag: c.tagName,
          className: c.className,
        })),
      });

      const inputInside = wrapper.querySelector("input.mdc-text-field__input");
      console.log("[MDC][initMdcTextField] Detected input:", inputInside);

      if (!inputInside) {
        console.error(
          "[MDC][initMdcTextField] ERROR: MDC cannot find <input> inside wrapper!"
        );
      }

      if (!(wrapper as any).__mdc_textfield_inst) {
        console.log("[MDC][initMdcTextField] Constructing MDCTextField...");
        try {
          const tf = new mdcGlobal.textField.MDCTextField(wrapper);
          (wrapper as any).__mdc_textfield_inst = tf;
          console.log("[MDC][initMdcTextField] SUCCESS", tf);
        } catch (e) {
          console.error(
            "[MDC][initMdcTextField] MDCTextField construction failed:",
            e
          );
          (wrapper as any).__mdc_textfield_inst = null;
        }
      } else {
        console.log("[MDC][initMdcTextField] Skip: Already initialized");
      }
    } catch (err) {
      console.error("[MDC][initMdcTextField] FATAL ERROR", err);
    }
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;

    const selector = ".cd-form-field";
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    diag_css("[MaterialDesignAdapter] mapFormGroups()", {
      count: nodes.length,
    });
    // nodes.forEach((el) => this.applyMappingToElement(el, mapping));
    nodes.forEach((el) => {
      this.applyMappingToElement(el, mapping);
      this.prepareMdcDom(el); // NEW — build MDC wrapper
    });
  }

  private mapOtherConcepts() {
    const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
    const concepts = Object.keys(cm).filter(
      (c) => !["button", "input", "formGroup"].includes(c)
    );
    diag_css("[MaterialDesignAdapter] mapOtherConcepts()", { concepts });

    concepts.forEach((concept) => {
      const mapping = (cm as any)[concept];
      const selector = `[data-cd-${concept}], .cd-${concept}`;
      const nodes = document.querySelectorAll<HTMLElement>(selector);
      // nodes.forEach((el) => this.applyMappingToElement(el, mapping));
      nodes.forEach((el) => {
        this.applyMappingToElement(el, mapping);
        this.prepareMdcDom(el); // NEW — build MDC wrapper
      });
    });
  }

  // master mapping pass
  private mapAll() {
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — START",
      "background:#223;color:#9cf;padding:2px"
    );
    try {
      this.mapButtons();
      this.mapInputs();
      this.mapFormGroups();
      this.mapOtherConcepts();
      this.scheduleMdcInit();
    } catch (err) {
      console.warn("[MaterialDesignAdapter] mapAll error", err);
    }
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — END",
      "background:#223;color:#9cf;padding:2px"
    );
  }

  // ---------------------------------------------------------------------------
  // DOM OBSERVER
  // ---------------------------------------------------------------------------
  private observeMutations() {
    if (this.observer) return;

    diag_css("[MaterialDesignAdapter] MutationObserver ATTACH");

    this.observer = new MutationObserver((mutations) => {
      console.log(
        "%c[MaterialDesignAdapter] Mutation detected → scheduling mapAll()",
        "color:#ffb;"
      );
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] observer failed to attach", err);
      this.observer = null;
    }
  }
}

// Self-register with the adapter registry
UiSystemAdapterRegistry.register(
  "material-design",
  new MaterialDesignAdapterService()
);
```

////////////////////////////////////////////////////

We expected this format:

```html
<label class="mdc-text-field mdc-text-field--filled">
  <span class="mdc-text-field__ripple"></span>
  <span class="mdc-floating-label">Label text</span>
  <input class="mdc-text-field__input" type="text" />
  <span class="mdc-line-ripple"></span>
</label>
```

But we are getting:

```html
<div class="cd-form-field mdc-form-field" data-md-transformed="1">
  <label
    class="mdc-text-field mdc-text-field--filled cd-md-text-field mdc-ripple-upgraded"
    style="--mdc-ripple-fg-size: 959px; --mdc-ripple-fg-scale: 1.6788115874649367; --mdc-ripple-fg-translate-start: -343.5px, -453.5px; --mdc-ripple-fg-translate-end: 320px, -451.5px;"
    ><span class="mdc-text-field__ripple"></span
    ><input
      id="userName"
      name="userName"
      cdformcontrol=""
      placeholder=""
      class="mdc-text-field__input cd-valid" /><span
      class="mdc-floating-label"
      for="userName"
      >Username</span
    ><span
      class="mdc-line-ripple"
      style="transform-origin: 131px center 0px;"
    ></span
  ></label>
</div>
```

I have also tried to inject what we are expecting. The format is very close but would still need some work. But the animation is still not working.

////////////////////////////////////////

I have also tried the script with <label> wrapped in the <div>:
The result is the same. So we can still keep the <div>

```html
<div class="cd-form-field mdc-form-field" data-md-transformed="1">
  <label class="mdc-text-field mdc-text-field--filled">
    <span class="mdc-text-field__ripple"></span>
    <span class="mdc-floating-label">Label text</span>
    <input class="mdc-text-field__input" type="text" />
    <span class="mdc-line-ripple"></span>
  </label>
</div>
```

////////////////////////////////////////////
Case 1: Visual description of resulting html:
- The gray background for the material text-field stretches accross the whole div
- The underline for the background is centered by shorter than the background by about 50%
- The material place holder seem positioned well but does not react to on-focus
- When one types new characters, the floating label/placehoder is super imposed on top

Resulting html
```html
<label
  class="mdc-text-field mdc-text-field--filled cd-md-text-field"
  data-md-transformed="1"
  ><span class="mdc-text-field__ripple"></span
  ><span class="mdc-floating-label" for="userName">Username</span
  ><input
    id="userName"
    name="userName"
    cdformcontrol=""
    placeholder=""
    class="mdc-text-field__input cd-valid" /><span
    class="mdc-line-ripple"
  ></span
></label>
```

Case 2: Replace the resulting script for the <label> with the one below.
Visual description:
- The visual is closest to expectation
- The gray background is shrinks to specific width (about 20% of width of the content area)
- The gray background underline seem aligned properly. Unlike case 1.
- But just like the Case 1, the placeholder/floating lable, it does not react to on-focus
- also when typing the place holder is super imposed on the typed text
```html
<label class="mdc-text-field mdc-text-field--filled">
  <span class="mdc-text-field__ripple"></span>
  <span class="mdc-floating-label">Label text</span>
  <input class="mdc-text-field__input" type="text" />
  <span class="mdc-line-ripple"></span>
</label>
```
//////////////////////////////////////////////////////
Below your recommendation for target script.
I have tested it against the current css settings.
The background still get extended to 100%.
Only when you remove the class cd-md-text-field, then it adjusts to expected html.
I think this calls for something to be done on the bridge.css tame this behaviour.
```html
<label class="mdc-text-field mdc-text-field--filled cd-md-text-field">
  <span class="mdc-text-field__ripple"></span>
  <span class="mdc-floating-label" id="label-XXXX">Username</span>
  <input class="mdc-text-field__input" aria-labelledby="label-XXXX" id="userName">
  <span class="mdc-line-ripple"></span>
</label>
```

//////////////////////////////////////////

Before the correction is made the only issues are:
- no padding
- vertical spacing

After correction:
- padding is corrected
- vertical spacing is ok
But on input-focus:
- the floating label dissapears
- the bottom line moves up to the level where text is being typed. Net effect is user typing with the line superimposed and obstructing.

/////////////////////////////////

Results:
- Before on-focus, all the settings look ok
- on-focus, everything is ok except the padding.

In the demo for mdc, the padding is available.
There must be some rule in our setting that overrides the padding for mdc.

While on-focus, I copied the css setting that is displayed on the inspactor/syles.
I hope it may reveal some clue.

```css
element {
}
.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: rgba(0, 0, 0, 0.87);
}
.cd-md-text-field .mdc-text-field__input {
  color: var(--cd-input-text-color);
}
.mdc-text-field .mdc-text-field__input {
  caret-color: #6200ee;
  caret-color: var(--mdc-theme-primary, #6200ee);
}
.mdc-text-field__input {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: Roboto, sans-serif;
  font-family: var(--mdc-typography-subtitle1-font-family,var(--mdc-typography-font-family, Roboto, sans-serif) );
  font-size: 1rem;
  font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
  font-weight: 400;
  font-weight: var(--mdc-typography-subtitle1-font-weight, 400);
  letter-spacing: 0.009375em;
  letter-spacing: var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);
  text-decoration: inherit;
  -webkit-text-decoration: var(--mdc-typography-subtitle1-text-decoration, inherit);
  text-decoration: var(--mdc-typography-subtitle1-text-decoration, inherit);
  text-transform: inherit;
  text-transform: var(--mdc-typography-subtitle1-text-transform, inherit);
  height: 28px;
  transition: opacity 150ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  min-width: 0;
  border: none;
  border-radius: 0;
  background: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 0;
}
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
}
element {
  --mdc-ripple-fg-size: 959px;
  --mdc-ripple-fg-scale: 1.6788115874649367;
  --mdc-ripple-fg-translate-start: -466.5px, -445.5px;
  --mdc-ripple-fg-translate-end: 320px, -451.5px;
}
.mdc-text-field--filled {
  --mdc-ripple-fg-size: 0;
  --mdc-ripple-left: 0;
  --mdc-ripple-top: 0;
  --mdc-ripple-fg-scale: 1;
  --mdc-ripple-fg-translate-end: 0;
  --mdc-ripple-fg-translate-start: 0;
}
#cd-main-content {
  color: var(--cd-color-text);
}
body {
  color: var(--cd-color-text);
}
html, body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
```

/////////////////////////////////////
Below is the bridge.css in the state where everything works except the padding is overrdded to 0.
Do apply the correction and provide a full one with the correction implemented.
bridge.css
```css
/* ============================================================
   CORPDESK BRIDGE FOR MATERIAL COMPONENTS WEB (MDC)
   Purpose:
   - Provide Corpdesk theme tokens for MDC
   - Preserve MDC native filled-text-field behaviour
   - Only override colors, fonts, and spacing outside MDC layout
   ============================================================ */

/* ------------------------------------------------------------
   Root tokens
------------------------------------------------------------ */
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;

  --cd-primary-color: #1976d2;
  --cd-primary-color-contrast: #fff;

  --cd-input-text-color: #212121;
  --cd-input-placeholder: rgba(0,0,0,0.54);

  --cd-color-invalid: #e53935;

  /* MDC default filled surface */
  --cd-input-bg: #f4f6f8;
}

html[data-md-theme="dark"] {
  --cd-input-bg: #1b1f23;
  --cd-input-text-color: #e6e6e6;
  --cd-input-placeholder: rgba(255,255,255,0.6);
  --cd-primary-color: #90caf9;
}

/* ------------------------------------------------------------
   Typography
------------------------------------------------------------ */
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
}

/* ------------------------------------------------------------
   MDC TEXT FIELD BRIDGE — SAFE OVERRIDES ONLY
   We DO NOT override:
   - MDC padding
   - floating label transforms (JS-driven)
   - line ripple mechanics
   - measurements, height, or box model
------------------------------------------------------------ */

/* 1) Wrapper must not interfere with MDC geometry */
.cd-md-text-field {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  box-shadow: none;
  background: none !important;

  /* Vertical spacing between form fields */
  margin-bottom: 18px !important;
}

/* 2) Apply filled background ONLY on the filled variant */
.cd-md-text-field.mdc-text-field--filled {
  background-color: var(--cd-input-bg) !important;
  border-radius: 4px;
}

/* 3) Input color only */
.cd-md-text-field .mdc-text-field__input {
  color: var(--cd-input-text-color);
}
.cd-md-text-field .mdc-text-field__input::placeholder {
  color: var(--cd-input-placeholder);
}

/* 4) Label color only (movement handled by MDC JS) */
.cd-md-text-field .mdc-floating-label {
  color: var(--cd-input-placeholder);
}
.cd-md-text-field.mdc-text-field--focused .mdc-floating-label {
  color: var(--cd-primary-color);
}

/* 5) Line ripple color only */
.cd-md-text-field .mdc-line-ripple {
  background-color: transparent;
}
.cd-md-text-field.mdc-text-field--focused .mdc-line-ripple {
  background-color: var(--cd-primary-color);
}

/* 6) Invalid state colors only */
.cd-md-text-field.mdc-text-field--invalid .mdc-floating-label {
  color: var(--cd-color-invalid);
}
.cd-md-text-field.mdc-text-field--invalid .mdc-line-ripple {
  background-color: var(--cd-color-invalid);
}

/* ------------------------------------------------------------
   FORM SPACING + BUTTONS
------------------------------------------------------------ */
button[cdButton],
.cd-button {
  margin-top: 12px !important;
  margin-bottom: 12px !important;
}

form .cd-md-text-field:last-child {
  margin-bottom: 24px !important;
}

/* END bridge.css */

```

/////////////////////////////////////////////////////////
Even by removing the 0 padding, the changes was not reflecting.
So what I have done is is to add:
padding-left: 15px;
padding-right: 15px;
After this, everything seem ok.
So the current setting for the bridge.css looks like below.
Let me know from your view if this strategy is sound or we may still need a better one.


bridge.css
```css
/* ============================================================
   CORPDESK BRIDGE FOR MATERIAL COMPONENTS WEB (MDC)
   Purpose:
   - Provide Corpdesk theme tokens for MDC
   - Preserve MDC native filled-text-field behaviour
   - Only override colors, fonts, and spacing outside MDC layout
   ============================================================ */

/* ------------------------------------------------------------
   Root tokens
------------------------------------------------------------ */
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;

  --cd-primary-color: #1976d2;
  --cd-primary-color-contrast: #fff;

  --cd-input-text-color: #212121;
  --cd-input-placeholder: rgba(0,0,0,0.54);

  --cd-color-invalid: #e53935;

  /* MDC default filled surface */
  --cd-input-bg: #f4f6f8;
}

html[data-md-theme="dark"] {
  --cd-input-bg: #1b1f23;
  --cd-input-text-color: #e6e6e6;
  --cd-input-placeholder: rgba(255,255,255,0.6);
  --cd-primary-color: #90caf9;
}

/* ------------------------------------------------------------
   Typography
------------------------------------------------------------ */
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
}

/* ------------------------------------------------------------
   MDC TEXT FIELD BRIDGE — SAFE OVERRIDES ONLY
   We DO NOT override:
   - MDC padding
   - floating label transforms (JS-driven)
   - line ripple mechanics
   - measurements, height, or box model
------------------------------------------------------------ */

/* 1) Wrapper must not interfere with MDC geometry */
.cd-md-text-field {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  box-shadow: none;
  background: none !important;

  /* Vertical spacing between form fields */
  margin-bottom: 18px !important;
}

/* 2) Apply filled background ONLY on the filled variant */
.cd-md-text-field.mdc-text-field--filled {
  background-color: var(--cd-input-bg) !important;
  border-radius: 4px;
}

/* 3) Input color and padding */
.cd-md-text-field .mdc-text-field__input {
  color: var(--cd-input-text-color);
  padding-left: 15px;
  padding-right: 15px;
}

.cd-md-text-field .mdc-text-field__input::placeholder {
  color: var(--cd-input-placeholder);
}

/* 4) Label color only (movement handled by MDC JS) */
.cd-md-text-field .mdc-floating-label {
  color: var(--cd-input-placeholder);
}
.cd-md-text-field.mdc-text-field--focused .mdc-floating-label {
  color: var(--cd-primary-color);
}

/* 5) Line ripple color only */
.cd-md-text-field .mdc-line-ripple {
  background-color: transparent;
}
.cd-md-text-field.mdc-text-field--focused .mdc-line-ripple {
  background-color: var(--cd-primary-color);
}

/* 6) Invalid state colors only */
.cd-md-text-field.mdc-text-field--invalid .mdc-floating-label {
  color: var(--cd-color-invalid);
}
.cd-md-text-field.mdc-text-field--invalid .mdc-line-ripple {
  background-color: var(--cd-color-invalid);
}

/* ------------------------------------------------------------
   FORM SPACING + BUTTONS
------------------------------------------------------------ */
button[cdButton],
.cd-button {
  margin-top: 12px !important;
  margin-bottom: 12px !important;
}

form .cd-md-text-field:last-child {
  margin-bottom: 24px !important;
}

/* END bridge.css */

```

/////////////////////////////////////////

The current work flow is that the developer codes with established html convention then it is up to the admin/user to set what ui-system and theme are applied.
In the ui-systems, there are options for say input designs.
For example in material-desin, 
- the input can be filled or outlined, shapped outline and others.
- for any of the above, you can have an icon, or no icon and the icon can be on the left or extreme right.
We may need some configuration interface for each ui-system selected to allow admin/user to make detail settings.
Within this, there would also be default settings.
This process need to be easy, intuitive and at its best with gui/cli access via an api that can also be accessed by ai agent.
What is your take on this subject from theoretical and practical point of view.
The subject should be in the context of futuristing work flow of a modern developer, admin and end-user experience.


///////////////////////////////////////////
All this time I was working on the 'default' theme. 
Everything is ok.
But when I switched to 'dark', via the shellconfig.json, I realised there is some work to do.
The whole page seem to be in default theme but only the text boxes have a dark background.
I believe during adjustments for floating lable, we could have affected the dark theme settings in the bridge.css.

html from the browser
```html
<body>
    <header id="cd-header">
      <button id="cd-burger" aria-label="Menu toggle">
        <span class="bar top"></span>
        <span class="bar middle"></span>
        <span class="bar bottom"></span>
      </button>

      <img id="cd-logo" alt="Logo" src="/themes/default/logo.png">
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar"><ul class="metismenu" id="menu">
        <li id="menu-item-menu-item-cd-user" class="" data-id="menu-item-cd-user" data-type="route" data-route="sys/cd-user" tabindex="0" role="button">
          <a href="#" class="cd-menu-link has-arrow" data-id="menu-item-cd-user" aria-expanded="false"><span class="cd-menu-label">cd-user</span><i class="menu-arrow fa-solid fa-chevron-right"></i></a>
          <ul class="mm-collapse">
        <li id="menu-item-menu-item-cd-user-sign-in" class="" data-id="menu-item-cd-user-sign-in" data-type="route" data-route="sys/cd-user/sign-in" tabindex="0" role="button">
          <a href="/sys/cd-user/sign-in" class="cd-menu-link" data-id="menu-item-cd-user-sign-in"><span class="cd-menu-label">sign-in</span></a>
          
        </li>
      
        <li id="menu-item-menu-item-cd-user-sign-up" class="" data-id="menu-item-cd-user-sign-up" data-type="route" data-route="sys/cd-user/sign-up" tabindex="0" role="button">
          <a href="/sys/cd-user/sign-up" class="cd-menu-link" data-id="menu-item-cd-user-sign-up"><span class="cd-menu-label">sign-up</span></a>
          
        </li>
      </ul>
        </li>
      
        <li id="menu-item-menu-item-cd-admin" class="" data-id="menu-item-cd-admin" data-type="route" data-route="sys/cd-admin" tabindex="0" role="button">
          <a href="#" class="cd-menu-link has-arrow" data-id="menu-item-cd-admin" aria-expanded="false"><span class="cd-menu-label">cd-admin</span><i class="menu-arrow fa-solid fa-chevron-right"></i></a>
          <ul class="mm-collapse">
        <li id="menu-item-menu-item-cd-admin-settings" class="" data-id="menu-item-cd-admin-settings" data-type="route" data-route="sys/cd-admin/settings" tabindex="0" role="button">
          <a href="/sys/cd-admin/settings" class="cd-menu-link" data-id="menu-item-cd-admin-settings"><span class="cd-menu-label">settings</span></a>
          
        </li>
      </ul>
        </li>
      </ul></aside>
      <main id="cd-main-content">
      <form id="signInForm" class="cd-form">
        <label class="mdc-text-field mdc-text-field--filled cd-md-text-field mdc-ripple-upgraded mdc-text-field--label-floating" data-md-transformed="1" style="--mdc-ripple-fg-size: 959px; --mdc-ripple-fg-scale: 1.6788115874649367; --mdc-ripple-fg-translate-start: -410.5px, -452.5px; --mdc-ripple-fg-translate-end: 320px, -451.5px;"><span class="mdc-text-field__ripple"></span><span class="mdc-floating-label mdc-floating-label--float-above" for="userName">Username</span><input id="userName" name="userName" cdformcontrol="" placeholder="" class="mdc-text-field__input cd-valid"><span class="mdc-line-ripple" style="transform-origin: 69px center 0px;"></span></label>

        <label class="mdc-text-field mdc-text-field--filled cd-md-text-field mdc-ripple-upgraded" data-md-transformed="1"><span class="mdc-text-field__ripple"></span><span class="mdc-floating-label" for="password">Password</span><input id="password" name="password" type="password" cdformcontrol="" placeholder="" class="cd-valid mdc-text-field__input"><span class="mdc-line-ripple"></span></label>

        <button cdbutton="" class="mdc-button mdc-button--raised">Sign In</button>
      </form>
    </main>
    </div>

  

<script src="/assets/ui-systems/material-design/material-components-web.min.js" async="" data-cd-uisystem="material-design" data-cd-origin="ui-system"></script></body>
```
Section of css from browser inspect/styles
```css
element {
}
body {
  margin: 0;
  padding: 0;
  background-color: var(--cd-color-bg);
  color: var(--cd-color-text);
}
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
}
element {
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
  --cd-background-color: white;
  --cd-text-color: black;
  --cd-primary-color: #007bff;
}
html[data-md-theme="dark"] {
  --cd-input-bg: #1b1f23;
  --cd-input-text-color: #e6e6e6;
  --cd-input-placeholder: rgba(255,255,255,0.6);
  --cd-primary-color: #90caf9;
}
:root {
  --cd-color-bg: #ffffff;
  --cd-color-surface: #f5f5f5;
  --cd-color-text: #000000;
  --cd-color-primary: #0055ff;
  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;
  --cd-color-hint: #999;
  --cd-color-border: #cccccc;
  --cd-color-hover: rgba(0, 0, 0, 0.05);
  --cd-border-radius: 4px;
  --cd-transition: 0.2s ease;
  --cd-font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --cd-font-size: 14px;
  --cd-header-height: 60px;
  --cd-sidebar-width: 260px;
}
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;
  --cd-primary-color: #1976d2;
  --cd-primary-color-contrast: #fff;
  --cd-input-text-color: #212121;
  --cd-input-placeholder: rgba(0,0,0,0.54);
  --cd-color-invalid: #e53935;
  --cd-input-bg: #f4f6f8;
}
```

bridge.css
```css
/* ============================================================
   CORPDESK BRIDGE FOR MATERIAL COMPONENTS WEB (MDC)
   Purpose:
   - Provide Corpdesk theme tokens for MDC
   - Preserve MDC native filled-text-field behaviour
   - Only override colors, fonts, and spacing outside MDC layout
   ============================================================ */

/* ------------------------------------------------------------
   Root tokens
------------------------------------------------------------ */
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;

  --cd-primary-color: #1976d2;
  --cd-primary-color-contrast: #fff;

  --cd-input-text-color: #212121;
  --cd-input-placeholder: rgba(0,0,0,0.54);

  --cd-color-invalid: #e53935;

  /* MDC default filled surface */
  --cd-input-bg: #f4f6f8;
}

html[data-md-theme="dark"] {
  --cd-input-bg: #1b1f23;
  --cd-input-text-color: #e6e6e6;
  --cd-input-placeholder: rgba(255,255,255,0.6);
  --cd-primary-color: #90caf9;
}

/* ------------------------------------------------------------
   Typography
------------------------------------------------------------ */
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
}

/* ------------------------------------------------------------
   MDC TEXT FIELD BRIDGE — SAFE OVERRIDES ONLY
   We DO NOT override:
   - MDC padding
   - floating label transforms (JS-driven)
   - line ripple mechanics
   - measurements, height, or box model
------------------------------------------------------------ */

/* 1) Wrapper must not interfere with MDC geometry */
.cd-md-text-field {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  box-shadow: none;
  background: none !important;

  /* Vertical spacing between form fields */
  margin-bottom: 18px !important;
}

/* 2) Apply filled background ONLY on the filled variant */
.cd-md-text-field.mdc-text-field--filled {
  background-color: var(--cd-input-bg) !important;
  border-radius: 4px;
}

/* 3) Input color and padding */
.cd-md-text-field .mdc-text-field__input {
  color: var(--cd-input-text-color);
  padding-left: 15px;
  padding-right: 15px;
}

.cd-md-text-field .mdc-text-field__input::placeholder {
  color: var(--cd-input-placeholder);
}

/* 4) Label color only (movement handled by MDC JS) */
.cd-md-text-field .mdc-floating-label {
  color: var(--cd-input-placeholder);
}
.cd-md-text-field.mdc-text-field--focused .mdc-floating-label {
  color: var(--cd-primary-color);
}

/* 5) Line ripple color only */
.cd-md-text-field .mdc-line-ripple {
  background-color: transparent;
}
.cd-md-text-field.mdc-text-field--focused .mdc-line-ripple {
  background-color: var(--cd-primary-color);
}

/* 6) Invalid state colors only */
.cd-md-text-field.mdc-text-field--invalid .mdc-floating-label {
  color: var(--cd-color-invalid);
}
.cd-md-text-field.mdc-text-field--invalid .mdc-line-ripple {
  background-color: var(--cd-color-invalid);
}

/* ------------------------------------------------------------
   FORM SPACING + BUTTONS
------------------------------------------------------------ */
button[cdButton],
.cd-button {
  margin-top: 12px !important;
  margin-bottom: 12px !important;
}

form .cd-md-text-field:last-child {
  margin-bottom: 24px !important;
}

/* END bridge.css */

```

///////////////////////////////////

The sidebar is now ok.
The only item left is the floating label when not in focus.
Below is the css picked from the browser/inspector/styes for the <lable> when input is not in focus. 

```css
element {
  --mdc-ripple-fg-size: 959px;
  --mdc-ripple-fg-scale: 1.6788115874649367;
  --mdc-ripple-fg-translate-start: -227.5px, -448.5px;
  --mdc-ripple-fg-translate-end: 320px, -451.5px;
}
.cd-md-text-field.mdc-text-field--filled {
  background-color: var(--cd-input-bg) !important;
  border-radius: 4px;
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) {
  background-color: whitesmoke;
}
.cd-md-text-field {
  position: relative;
  width: 100%;
  margin: 0;
    margin-bottom: 0px;
  padding: 0;
  background: none !important;
    background-color: rgba(0, 0, 0, 0);
  box-shadow: none;
  margin-bottom: 18px !important;
}
.mdc-text-field--filled {
  height: 56px;
}
.mdc-text-field {
  border-top-left-radius: 4px;
  border-top-left-radius: var(--mdc-shape-small, 4px);
  border-top-right-radius: 4px;
  border-top-right-radius: var(--mdc-shape-small, 4px);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  display: inline-flex;
  align-items: baseline;
  padding: 0 16px;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  will-change: opacity,transform,color;
}
.mdc-text-field--filled {
  --mdc-ripple-fg-size: 0;
  --mdc-ripple-left: 0;
  --mdc-ripple-top: 0;
  --mdc-ripple-fg-scale: 1;
  --mdc-ripple-fg-translate-end: 0;
  --mdc-ripple-fg-translate-start: 0;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  will-change: transform,opacity;
}
#cd-main-content {
  color: var(--cd-color-text);
}
body {
  color: var(--cd-color-text);
}
html, body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
  color: var(--cd-color-text);
}
element {
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
  --cd-background-color: white;
  --cd-text-color: black;
  --cd-primary-color: #007bff;
}
html[data-md-theme="dark"] {
  --cd-color-bg: #0e0e0f;
  --cd-color-surface: #1c1c1e;
  --cd-color-text: #e4e4e4;
  --cd-menu-bg: #121212;
  --cd-menu-text: #dcdcdc;
  --cd-menu-active-bg: #1f1f1f;
  --cd-menu-active-text: #ffffff;
  --cd-menu-hover-bg: rgba(255,255,255,0.08);
  --cd-input-bg: #1b1f23;
  --cd-input-text-color: #eaeaea;
  --cd-input-placeholder: rgba(255,255,255,0.6);
  --cd-primary-color: #90caf9;
}
```

////////////////////////////////////////////////////////
Great. That worked. Now typed text had not been considered yet.
Typed text is almost black on black.

Below is the css when typed text is active.
```css
element {
}
.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: rgba(0, 0, 0, 0.87);
}
.cd-md-text-field .mdc-text-field__input {
  color: var(--cd-input-text-color);
  padding-left: 15px !important;
  padding-right: 15px !important;
}
.mdc-text-field .mdc-text-field__input {
  caret-color: #6200ee;
  caret-color: var(--mdc-theme-primary, #6200ee);
}
.mdc-text-field__input {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: Roboto, sans-serif;
  font-family: var(--mdc-typography-subtitle1-font-family,var(--mdc-typography-font-family, Roboto, sans-serif) );
  font-size: 1rem;
  font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
  font-weight: 400;
  font-weight: var(--mdc-typography-subtitle1-font-weight, 400);
  letter-spacing: 0.009375em;
  letter-spacing: var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);
  text-decoration: inherit;
  -webkit-text-decoration: var(--mdc-typography-subtitle1-text-decoration, inherit);
  text-decoration: var(--mdc-typography-subtitle1-text-decoration, inherit);
  text-transform: inherit;
  text-transform: var(--mdc-typography-subtitle1-text-transform, inherit);
  height: 28px;
  transition: opacity 150ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  min-width: 0;
  border: none;
  border-radius: 0;
  background: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 0;
    padding-right: 0px;
    padding-left: 0px;
}
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
  color: var(--cd-color-text);
}
element {
  --mdc-ripple-fg-size: 959px;
  --mdc-ripple-fg-scale: 1.6788115874649367;
  --mdc-ripple-fg-translate-start: -445.5px, -446.5px;
  --mdc-ripple-fg-translate-end: 320px, -451.5px;
}
.mdc-text-field--filled {
  --mdc-ripple-fg-size: 0;
  --mdc-ripple-left: 0;
  --mdc-ripple-top: 0;
  --mdc-ripple-fg-scale: 1;
  --mdc-ripple-fg-translate-end: 0;
  --mdc-ripple-fg-translate-start: 0;
}
#cd-main-content {
  color: var(--cd-color-text);
}
body {
  color: var(--cd-color-text);
}
```

///////////////////////////////////////////
Knowing how we had set up bootstrap and how material design had issues with similar process but eventually worked via a different process, assist me  to do a documentation for:
- ui-systems architecture
- setting up bootstrap
- setting up material-design

In the documentation, you mention why material design cannot work with the same setting as bootstrap. You can touch on likely pit falls and solutions

The above should assist future developers and mainteners of cd-shell



//////////////////////////////////////////////
I have taken the notes that are sufficient to represent what I needed for now. Moving foward: We are now able to switch between bootstrap and material-design and also change the theme of either from default to dark.
With the current development, we have achieved a milestone.
Remember that the current switching of ui-systems and themes is done at the shellconfig.json.
This affects only the launch of the system.
The next milestone will be effecting the same switches during runtime via the admin console.
Below is the document that we did at the previous milestone.
Take a look at it with the view of devloping:
1. Git commit message for the milestone that can be copy pasted
2. Outlining the next milestone. 








//////////////////////////////////////////////////////////////////

## Completed:

- Module Loader:module/services/module.service.ts → How modules are discovered and loaded.
  - build via 'npm run build'
    - process compilation to dist-ts
    - vite compiles to dist
    - execute post-build.js
  - index.html calls app.ts
  - app.ts calls main.ts
  - main.ts calls module loader
  - run 'npm run preview

- porting compliant codes for PWA environment
  - create environment.ts
  - modify node/cli restricted codes using shims.
  - selected imports to be done conditionally based on environment
  - cyclic codes in PWA/browser resolved using BaseService.get \_svSess() with dynamic import.

- Developing compiled code with support to integrate:
  - Reactive corpdesk forms
    - CdFormGroup
    - CdFormControl
    - CdValidators
    - CdDirectiveBinder
    - Model

---

- test setting of default theme via shell.config.json
- STATIC_UI_SYSTEM_REGISTRY to merge with shell.config.json so that configs are not hard coded
- test changing of theme during runtime
- How to install/uninstall/upgrade ui-system, theme, form variants

Change the design for lifecycle of dev-controllers to runtime-controller
Goal:

- raising the bar for live interactions with dev browser
- borrow from cd-cli code in terms of saving dev-code as objects
- is it possible to make use of git state in a given file to manage auto updates
- how can we implement watcher that can update browser during development
- use of descriptors
- goal: when codes are being changed, the browser can be configured to respond simultenously - capacity to make changes vie (manaual, cd-cli or ai) - capacity to run visual tests of functions for a given module which displays browser or device.
  Implementation:
- proof of concept (convert dev-controller to runtime-controller)
- implementation plan
- integration of cd-cli

PWA Technologies and Documentation:

- Menu System:
  - menu/services/menuRenderer.ts → How the raw menu config is turned into HTML/DOM.

- Theme Loader:
  - theme/services/theme-loader.ts → How CSS and JSON configs are applied dynamically.

- Config Files:
  - config/shell.config.ts
  - config/themeConfig.ts → Default settings, structure, and developer extension points.
  - environment and cross-environment code reuse

- Logger:
  - Utility:utils/logger.ts → For developers to know how to debug and integrate logs in their modules.

- Directives
- Forms:
  - Emulate angular form groups
  - Use the initial codes for form processing to do POC
  - mould the codes to work as Angulare corpdesk login process.
- cd-push:
  - sharing cd-push codes
  - define cd-push, cd-sio, cd-wss

- tesing controller loading
  - optional websocket node is working
  - forms working similar to Angular reactive forms
  - compile controller to view

Classing the codes:

- convert the codes from function to classes (Done)
- Make sure the process can compile all the codes into dist-ts

- update of documentation for
  - module loading (doc0005)
  - directives (doc0007)

- development of corpdesk-rfc-0005 for lifecycle of controller using **activate(), **deactivate() and ControllerCacheService
- implementation of corpdesk-rfc-0005
- implementation of (change) directive for dropdown controls

- UUD development
  - isDefault should not be property of ICdModule. This is an admin or user setting concern and should be Isolated in that area
  - menu module item are replicating the root
  - menu to load via element content replacement instead of browser routing
  - ui settings dropdowns, linked to configs and not manually set
  - race conditions to be resolved via MenuService.loadResource()
    - modify MenuService.loadResource()
    - modify ModuleService.loadModule() so that there is only one central controller loading point (MenuService.loadResource())
      - this can be done at the main using prepared menu via default module.
    - investigate why data is not loading on dropdown
    - modify controllers to match the controller loading policy

  - Each theme to have set of thematic colours

Milestone (26 Nov 2025)

- POC with bootstrap
- Switch between dark and default mode.
- stabilize css for:
  - themes
  - menu
  - header
  - reponsiveness

Next Milestone:

- switch ui-system between bootstrap and material-design
- Switch between dark and default mode.

////////////////////////////////

---

### implementing UUD

- Some interfaces repeat what is already in UiDescriptorBase. Why dont we extend?
  - in the src/CdShell/sys/dev-descriptor/models/ui-concept-descriptor.model.ts, most of interfaces need to extend UiDescriptorBase
  - UiSystemAdaptorService.render()
    Error:
    Conversion of type 'UiDescriptorBase' to type 'UiLayoutDescriptor' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    Property 'layoutType' is missing in type 'UiDescriptorBase' but required in type 'UiLayoutDescriptor'.ts(2352)
    - ui-concept-descriptor.model.ts(37, 3): 'layoutType' is declared here.

- UiSystemAdaptor changed to UiSystemAdaptorService
- MaterialUiTranslator changed to UiTranslatorMaterial
- Exampe below is given but not implementation for uiTranslationRegistry is not yet given.
  uiTranslationRegistry.register({
  id: 'material-design',
  label: 'Angular Material Design',
  translator: new MaterialUiTranslator(),
  version: '1.0.0',
  });

RawUiComponentMeta not yet implemented-

///////////////////////////////////////

## ToDo:

- Assigining thematic colours to sections:
  - header background
  - header vector pattern
  - navigation background
  - body background
  - Themes to be designed in a way that they can be packaged and commercialized

///////////////////////////////////////

## In Progress

////////////////////////////////////////////////////////////

Notes for improvement of rfc:

Note from both login process and dev-sync example:

- The communication can work as inter and intra application
- The communication can work as inter component communication
- Application users can also setup communication between individuals and groups communications.
  Base on the above, intra communication expects the launching process to publish appId.
  This publication should be available to other recources that are candidates for cd-sio communication.
  For example in module federtion, the cd-shell/SidbarComponent represent the whole application to initiate and save the appId in LocalStorage.
  Thereafter all remote modules are able to acdess the appId.
  Note that each component however have their own resourceGuid and resourceName in the CdObjId.

The life cycle need to show that:

- The consumer imports and initialize svSio: SioClientService,
  - it is this import that manageds the detail of socket.io-client details including
    - connection()
    - event listening
    - actual sending of messages
- initialize() hosts setAppId() and initSioClient()
  At this stage, details for setAppId() and initSioClient() can be given
- Note how, the component just calls listening in very simple sytax
- but also notice there is one main listen(event) in the class that does all the donkey work based on corpdesk cd-sio implementation details. And this is on top of socket.io-client as an import in form of svSioClient.
  It is worth noting that in the future corpdesk listen() method will be shared and not coded in each consumer.

## DEMO TARGET

- scrol menu to show case different types of applications in the pwa
- develop module via cli then send to registry
- download and install module from registry
- demonstrate change of ui-system
- demo change of theme
- demo change of variant forms and othe widgets
- set logo
- set theme colours
- configure menu options
- demo integration with cli
- demo integration with ai
