Got it 👍 — I’ll treat **module loading** just like I did for the **menu system**, using your `moduleService.ts` as the base. This section will cover **contracts, workflow, runtime loading/unloading, and ecosystem perspective** (client ↔ backend ↔ cd-cli ↔ AI).

---

# 📖 Developer Guide: Module Loading in `cd-shell`

## 1. Principles of Design

The **module system** in `cd-shell` is built with the following principles:

1. **Dynamic Runtime Loading**

   * Modules are **not pre-wired**.
   * They are **discovered and loaded at runtime** via `import.meta.glob`.
   * This allows installing or uninstalling modules while the shell is running.

2. **Frontend ↔ Backend Symmetry**

   * Every **client module** has a **counterpart backend module** inside `cd-api`.
   * Together, they form a complete feature unit (UI + API).

3. **Self-Contained Modules**

   * Each module is an isolated folder:

     ```
     src/modules/{ctx}/{moduleId}/index.js
     ```
   * Exports its own metadata (`ICdModule`), templates, menus, and logic.

4. **Extensibility & Automation**

   * Developers can scaffold modules with **cd-cli**.
   * Eventually, **AI agents** will auto-generate modules end-to-end.
   * Ensures scalability of the ecosystem.

---

## 2. Bird’s Eye View

At a high level:

* **Discovery**:
  `import.meta.glob` scans `/src/modules/**/index.js`.

* **Loading**:
  `loadModule(ctx, moduleId)` dynamically imports the correct module.

* **Integration**:
  The shell renders its **default template** and **registers menus**.

* **Unloading** *(future-ready)*:
  A module can be uninstalled by detaching menus, clearing its content, and unregistering resources.

This mechanism makes the shell **plugin-oriented**, where modules can be added or removed at runtime without rebuilding the app.

---

## 3. Contracts

### `ICdModule`

Each module must export a `module` object that matches this contract:

```ts
export interface ICdModule {
  id: string;              // unique identifier
  name: string;            // human-readable name
  template: string;        // default HTML template
  menu?: MenuItem[];       // optional menu items
  setup?(): void;          // optional lifecycle hook
  teardown?(): void;       // optional cleanup hook
}
```

* **`id` / `name`** → uniquely identify the module.
* **`template`** → default content rendered in the main content area.
* **`menu?`** → menu items integrated into the sidebar.
* **`setup?`** → called when module loads (e.g., register services).
* **`teardown?`** → called when module unloads (cleanup).

---

### `loadModule(ctx, moduleId)`

Responsible for loading and integrating modules dynamically.

```ts
export async function loadModule(
  ctx: string,
  moduleId: string
): Promise<ICdModule> { ... }
```

#### 🔹 Parameters

* **`ctx`** → Logical namespace (e.g., `"app"`, `"sys"`).
* **`moduleId`** → The specific module identifier (e.g., `"users"`, `"finance"`).

#### 🔹 Behavior

1. Finds the module path using `import.meta.glob`.
2. Dynamically imports the module’s `index.js`.
3. Extracts the exported `module: ICdModule`.
4. Renders its template into `#cd-main-content`.
5. Returns the module info.

#### 🔹 Example

```ts
const usersModule = await loadModule("app", "users");
console.log("Loaded module:", usersModule.name);
```

---

## 4. Runtime Installing & Uninstalling

### Installing a Module

* Place the module folder under `src/modules/{ctx}/{moduleId}`.
* The shell automatically discovers it via glob.
* Call `loadModule(ctx, moduleId)` to load it into the runtime.

### Uninstalling a Module

* Invoke `module.teardown?.()` to clean up resources.
* Remove its menus from the sidebar.
* Clear `#cd-main-content` if active.
* Optionally, delete the folder (on disk or dynamically via a package manager).

> 🔑 **Key Requirement**: The shell must support both **installing and uninstalling modules at runtime** — no rebuilds required.

---

## 5. Developer Workflow

When building modules:

1. **Create a Module**

   * Use `cd-cli` to scaffold:

     ```bash
     cd-cli mod-craft create users
     ```

2. **Define Metadata**

   * Export an `ICdModule` from `index.ts/js`.

3. **Integrate Menu**

   * Add `menu?: MenuItem[]` to be displayed in the sidebar.

4. **Load Module**

   * Call `loadModule("app", "users")`.

5. **Test Uninstall**

   * Ensure `teardown` cleans up resources.

---

## 6. Ecosystem Perspective

* **cd-shell (client)** → Hosts runtime modules, provides UI integration.
* **cd-api (backend)** → Hosts server-side counterparts of modules (business logic, persistence).
* **cd-cli (tooling)** → Automates scaffolding, linking client ↔ backend.
* **AI Agents (future)** → Will generate entire modules automatically, including:

  * `index.ts` with metadata.
  * Menus, templates, and default controllers.
  * Matching backend services.

---

## 7. Key Takeaways

* Modules are **self-contained, discoverable, and runtime-loadable**.
* **Frontend ↔ Backend symmetry** ensures every module has both UI and API.
* Developers should prepare for **runtime installation/uninstallation**.
* Ecosystem supports **automation via cd-cli**, moving toward **AI-generated modules**.

This modular approach transforms `cd-shell` into a **living system** — able to evolve dynamically without rebuilds, redeployments, or hard-coded wiring.

---

👉 George, would you like me to also document the **expected `index.ts` file structure** for a module (the one every module must export)? That could serve as a **boilerplate contract** for developers to follow.

---

Date: 2025-09-26, Time: 15:35

Perfect 🙌 — thanks for sharing the `ICdModule` definition. That clears up the **real contract** that modules must adhere to. Let me extend the **developer documentation** for module loading so it aligns with your actual `ICdModule` interface rather than the placeholder one I suggested earlier.

---

# 📖 Developer Guide: Module Loading in `cd-shell`

## 1. Principles of Design

* **Dynamic Runtime Modules** — Modules are **not compiled into the shell**. They are **discovered and loaded at runtime**.
* **Self-Contained** — Each module defines its own metadata, template, and optional menus.
* **Symmetry** — Every client module has a corresponding backend module in **cd-api**.
* **Install/Uninstall at Runtime** — Modules can be added or removed without rebuilding the shell.
* **Automation Ready** — Modules can be scaffolded by **cd-cli** and, in the future, fully generated by **AI agents**.

---

## 2. The `ICdModule` Contract

Each module must export an object that implements `ICdModule`:

```ts
export interface ICdModule {
  ctx: string;            // context (e.g., "app", "sys")
  moduleId: string;       // unique identifier
  moduleName: string;     // human-readable name
  moduleGuid?: string;    // optional GUID for uniqueness
  template?: any;         // HTML or template string
  menu?: MenuItem[];      // optional menu entries
  moduleVersion?: string; // semantic version
  modulePath?: string;    // relative path (internal use)
  moduleUrl?: string;     // external resource URL
  moduleType?: string;    // "feature", "widget", etc.
  moduleConfig?: string;  // serialized config or JSON
}
```

### 🔑 Key Fields

* **`ctx`** — logical namespace grouping (`app`, `sys`, etc.).
* **`moduleId`** — unique slug within its context.
* **`moduleName`** — display name for humans.
* **`template`** — default UI content, injected into `#cd-main-content`.
* **`menu`** — integrates module navigation into the sidebar.
* **`moduleVersion`** — helps with upgrade/downgrade/version tracking.
* **`moduleGuid`** — ensures uniqueness across distributed environments.
* **`moduleConfig`** — allows passing JSON-based configuration.

---

## 3. Module Loading Process

The **`loadModule`** function orchestrates discovery and runtime integration:

```ts
export async function loadModule(
  ctx: string,
  moduleId: string
): Promise<ICdModule> {
  const expectedPath = `/src/modules/${ctx}/${moduleId}/index.js`;
  const pathKey = Object.keys(modules).find((key) =>
    key.includes(expectedPath)
  );
  if (!pathKey) throw new Error(`Module not found: ${ctx}/${moduleId}`);

  const loader = modules[pathKey];
  const mod = (await loader()) as { module: ICdModule };
  const moduleInfo = mod.module;

  // Render default template into shell
  if (moduleInfo.template) {
    document.getElementById("cd-main-content")!.innerHTML =
      moduleInfo.template;
  }

  return moduleInfo;
}
```

### Workflow

1. **Discover** → Find the matching module path.
2. **Import** → Dynamically load `index.js`.
3. **Extract** → Ensure `module` export exists.
4. **Render** → Insert default `template` into the shell.
5. **Return** → Provide the `ICdModule` instance for further use (menus, actions, etc.).

---

## 4. Runtime Install & Uninstall

### Installing

* Place a new folder in `src/modules/{ctx}/{moduleId}/`.
* Export an `ICdModule` from `index.ts/js`.
* Load it with:

  ```ts
  const finance = await loadModule("app", "finance");
  ```

### Uninstalling

* Remove its menus from the sidebar.
* Clear its template from `#cd-main-content`.
* Optionally call `teardown` (future lifecycle hook).
* Module folder can then be deleted or replaced without shell restart.

---

## 5. Developer Workflow

1. **Scaffold**

   ```bash
   cd-cli mod-craft create finance
   ```
2. **Implement `index.ts`**

   ```ts
   import { ICdModule } from "@/module/models/module.model";
   import { myMenu } from "./menu";

   export const module: ICdModule = {
     ctx: "app",
     moduleId: "finance",
     moduleName: "Finance",
     template: `<h1>Finance Module</h1>`,
     menu: myMenu,
     moduleVersion: "1.0.0",
   };
   ```
3. **Load Dynamically**

   ```ts
   await loadModule("app", "finance");
   ```

---

## 6. Ecosystem Context

* **cd-shell** (frontend) — Runtime integration of modules.
* **cd-api** (backend) — Backend counterpart, ensuring full-stack modularity.
* **cd-cli** — Tooling for scaffolding, managing, and linking modules.
* **AI agents (future)** — Auto-generate complete modules (client + backend).

---

## 7. Key Takeaways

* **Every module exports an `ICdModule`.**
* **Modules are discovered and loaded dynamically.**
* **Install/uninstall at runtime is a core requirement.**
* **Frontend ↔ backend symmetry is mandatory.**
* **Automation and AI integration are part of the vision.**

---

👉 George, would you like me to now **expand this into a boilerplate `index.ts` template** that every new module can follow (with comments explaining each field)? That would serve as a ready-to-use **developer reference**.

---

Date: 2025-09-26, Time: 16:18

---

Excellent — this is now a mature enough stage to document the **Corpdesk Module Runtime Design** from source-to-runtime level.
Here’s a **developer documentation draft** that incorporates all your notes and adds detailed structure, rationale, and flow explanations.

---

## 🧩 Corpdesk Module Runtime Design

### 1. Overview

The **Corpdesk runtime architecture** is designed to support modular, dynamic loading of components both in development and production.
The system compiles TypeScript-based module sources into runtime-compatible JavaScript files, which can then be dynamically discovered and loaded during runtime—similar in spirit to Angular’s component and template system, but with independent runtime modularity.

---

## 2. Build-to-Execution Workflow

### **Step 1 — Build**

When you run:

```bash
npm run build
```

The following happens in order:

1. **TypeScript compilation** via `tsc`

   * Source files (`src/**/*.ts`) are compiled to JavaScript into `dist-ts/`
   * This ensures backend Node compatibility and preserves class-based source structure.

2. **Vite build**

   * Vite processes frontend-related files into the optimized `dist/` directory.
   * It bundles the `index.html`, `app.ts`, and `main.ts` entry chain.

3. **`post-build.js` execution**

   * Copies the latest runtime-ready controller scripts into the correct output directory.
   * Ensures that runtime controllers are transformed and available for the browser-based module loader.
   * Adds build timestamps to track the most recent successful build.

---

### **Step 2 — Preview or Launch**

When you run:

```bash
npm run preview
```

This serves the final app from the `dist/` directory via Vite’s preview server.
The runtime flow proceeds as follows:

* **`index.html`** → Bootstraps the frontend runtime.
* **`app.ts`** → Core shell bootstrapper. Sets up context and environment.
* **`main.ts`** → Invokes the `ModuleService` to discover and load modules.
* **`ModuleService`** → Dynamically imports and initializes runtime controllers.

---

## 3. Directory and File Structure

```
src/
├── CdShell/
│   ├── sys/
│   │   └── user/
│   │       ├── controller/
│   │       │   └── ctl-sign-in.ts
│   │       ├── models/
│   │       │   └── user.model.ts
│   │       └── services/
│   │           └── user.service.ts
│   └── app/
│       └── dashboard/
│           ├── controller/
│           │   └── ctl-dashboard.ts
│           ├── models/
│           └── services/
│
├── module/
│   └── services/
│       └── module.service.ts   ← Core Module Loader
│
├── app.ts
├── main.ts
└── index.html
```

### **Why this structure?**

* **`sys/`** contains system-level modules essential for the core framework.
* **`app/`** contains installable or feature-specific modules.
* Each module is self-contained in three parts:

  * **Controller** → Runtime logic + UI binding
  * **Model** → Data structures and entities
  * **Service** → Business logic or communication layer

This separation mirrors the Angular architectural pattern while keeping runtime modularity flexible and dynamic.

---

## 4. Module Loader (`module.service.ts`)

### Purpose

The **ModuleService** is responsible for:

* Discovering modules under `src/CdShell/**/index.js`
* Importing them dynamically using Vite’s `import.meta.glob`
* Registering controllers for runtime rendering

### Workflow Summary

| Stage          | Mode    | Action                             |
| -------------- | ------- | ---------------------------------- |
| Initialization | Node    | Loads from compiled `dist-ts`      |
| Initialization | Vite    | Uses `import.meta.glob()`          |
| Registration   | Both    | Normalizes discovered modules      |
| Runtime        | Browser | Instantiates controllers on demand |

---

## 5. Controller Architecture

Each controller class in the source directory must extend:

```ts
export abstract class CdShellController {
  abstract template(): string;
  abstract setup(): void;
  abstract processFormData(): Record<string, any>;

  // optional methods
  auth?(data: any): void;
  onInit?(): void;
  onDestroy?(): void;
}
```

### Method Responsibilities

| Method              | Required | Description                                                                                               |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `template()`        | ✅        | Returns an HTML string representing the UI template for the module. Similar to Angular’s inline template. |
| `setup()`           | ✅        | Initializes event handlers, DOM bindings, and component setup logic.                                      |
| `processFormData()` | ✅        | Extracts and structures data from the DOM or component inputs.                                            |
| `auth(data)`        | Optional | Handles authentication or other gated logic.                                                              |
| `onInit()`          | Optional | Lifecycle hook invoked immediately after setup.                                                           |
| `onDestroy()`       | Optional | Cleanup logic when the module is unloaded.                                                                |

---

## 6. Runtime Controller Format

After the build and post-build transformation, each controller is converted into a runtime-compatible structure such as:

```js
export const ctlSignIn = {
  __template() {
    return `<form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <label for="username">Username</label>
        <input id="username" type="text" cd-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" cd-model="password" required />

        <button type="submit" class="cd-button">Sign In</button>
      </form>`;
  },

  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  __processFormData() {
    const username = document.querySelector('[cd-model="username"]').value || "";
    const password = document.querySelector('[cd-model="password"]').value || "";
    return { username, password };
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};
```

### Key Points:

* Each method is **prefixed with `__`** to indicate runtime-bound implementations.
* Mirrors the original abstract methods from `CdShellController`.
* Fully browser-executable — no `import` or class references required.
* These are the files dynamically imported by `ModuleService` during runtime.

---

## 7. `post-build.js` — Runtime Controller Processor

### Purpose

* Copies transformed controller scripts from the build output (`dist-ts`) to the runtime output (`dist`).
* Ensures all modules in `/src/CdShell/{app,sys}` are reflected in the runtime environment.
* Appends a timestamp at the end of the process for traceability.

### Example Timestamp Log:

```
[POST-BUILD] Module transformation complete.
[POST-BUILD] Build timestamp: 2025-10-04T18:23:41+03:00
```

This allows developers to confirm that newly generated files are from the **current** build.

---

## 8. Design Principles

| Principle                 | Description                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| **Isolation**             | Each module (app or sys) is self-contained and can be installed/uninstalled independently. |
| **Dynamic Loading**       | Modules are discovered and loaded at runtime without precompilation linking.               |
| **Runtime Compatibility** | Controllers are class-based in source but function-based in runtime for browser safety.    |
| **Extensibility**         | The design allows future federation-style module installation (both backend and frontend). |

---

## 9. Future Enhancements

* **Hot Reload Support:** Allow runtime refresh of updated modules without full rebuild.
* **Module Federation (Frontend & Backend):** Dynamic installation of modules post-deployment.
* **Descriptor-Driven Instantiation:** Integration with `CdModuleDescriptorService` for metadata-based runtime assembly.

---

Would you like me to format this into a **developer handbook layout** (markdown or docx) with headers, diagrams, and code sections for inclusion in Corpdesk documentation?

---

**Date: 2025-10-04, Time: 21:12**
──────────────────────────────


