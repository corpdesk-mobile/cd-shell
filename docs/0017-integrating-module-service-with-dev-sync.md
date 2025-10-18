# INTEGRATING MODULE SERVICE AND DEV-SYNC

Note: 
- For reference on Actrors 001-004, see Reference section at the end<br>
- Also refer to corpdesk-rfc-0004 for the principles of the communications involved in this subject.


---

## 🧩 The Problem Statement

We need: 

1. To make sure **`IdeAgentService` (actor 003)** is always the **first dev-sync actor** to initialize when `cd-shell` starts.
2. To make sure **`IdeAgentClientService` (actor 004)** is initialized **only after** `IdeAgentService` has completed its setup and stored a valid `appId`.
3. To keep this orchestration **lightweight**, without introducing tight coupling or circular dependencies between modules.

---

## ⚙️ The Best Location for Control

You’re right — the ideal orchestration point is the **`ModuleService.loadModule()`** function.
This service is already acting as the **central conveyor belt** that loads default module at startup (system or app) in both **Node** and **Vite (browser)** environments. The rest of the modules are loaded on demand by the menu system.

If we embed initialization hooks into it, we gain deterministic control over initial load order — and it remains transparent to downstream modules.

---

## 🧠 The Refined Architecture Concept

Let’s extend the concept of `loadModule()` into a *two-phase conveyor belt*:

### **Phase 1 — Preload (special modules)**

Certain critical modules (like `dev-sync` and `cd-sio`) are **preloaded** automatically before any user or app modules.

### **Phase 2 — Regular Load**

Normal app modules (like `cd-user`, `cd-company`, etc.) are loaded afterward, using the menu system.

---

## ✅ Implementation Strategy

### Step 1: Introduce a preload list

We define a simple static list of system-level modules to load first:

```ts
private static preloadModules = [
  { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentService" },
  { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentClientService" },
];
```

This tells the loader:

> Before you start loading regular modules, load these in order.

---

### Step 2: Add a `preloadModules()` helper

```ts
private static async preloadModulesSequentially() {
  for (const mod of ModuleService.preloadModules) {
    try {
      const module = await ModuleService.instance.loadModule(mod.ctx, mod.moduleId);
      const controller = module.controller;

      // Defensive check to only run targeted service setup
      if (controller && typeof controller.__setup === "function") {
        console.log(`[ModuleService] Preloading ${mod.component}`);
        controller.__setup();
      }
    } catch (err) {
      console.error(`[ModuleService] Failed to preload ${mod.moduleId}:`, err);
    }
  }
}
```

---

### Step 3: Integrate preload into the main workflow

At the top of your **`loadModule()`**, right after `ensureInitialized()`:

```ts
async loadModule(ctx: string, moduleId: string): Promise<ICdModule> {
  await ModuleService.ensureInitialized();

  // --- Step 0: Preload system modules (only once) ---
  if (!ModuleService.hasPreloaded) {
    ModuleService.hasPreloaded = true;
    await ModuleService.preloadModulesSequentially();
  }

  // ... existing loadModule() logic continues below ...
}
```

---

### Step 4: Control sequencing between IdeAgentService & ClientService

Because they’re listed **in order**, we get deterministic execution:

1. `IdeAgentService.__setup()` → generates and stores appId.
2. `IdeAgentClientService.__setup()` → waits for the appId before starting.

This happens silently in the background before the first “interactive” module (like `cd-user`) is even loaded.

---

## 🪄 Optional Enhancement — Declarative Module Metadata

Later, we can evolve this pattern by letting each module declare **load priority** inside its own `module.json` file, like:

```json
{
  "moduleId": "dev-sync",
  "priority": 1,
  "autoLoad": true
}
```

Then, the `ModuleService` could sort and preload automatically, eliminating hardcoding altogether.

---

## 🧭 Summary of the Flow

```
cd-shell launches
│
├─► ModuleService.ensureInitialized()
│
├─► ModuleService.preloadModulesSequentially()
│      ├─ load dev-sync/IdeAgentService → generate appId
│      └─ load dev-sync/IdeAgentClientService → waitForAppId() → initSioClient()
│
└─► continue loading user modules (cd-user, etc.)
```

This achieves:
✅ Deterministic startup order
✅ No coupling between actors 003 & 004
✅ Works for both browser (Vite) and Node environments
✅ Simple to document and extend later

---

## IMPLEMENTATION

---

### 🧱 `module.service.ts` — Refactored Version (with Preload Support)

```ts
import url from "url";
import { CdDirectiveBinder } from "../directives/cd-directive-binder";
import { ICdModule } from "../interfaces/icd-module";
import { Logger } from "../utils/logger";

export class ModuleService {
  private static instance: ModuleService;
  private static initialized = false;
  private static hasPreloaded = false;

  private readonly logger = new Logger("ModuleService");

  private baseDir = process.cwd() + "/src/CdShell";
  private isViteMode = typeof window !== "undefined";
  private modules: Record<string, any> = {};

  // --- Preload configuration: define system-critical modules here ---
  private static preloadModules = [
    { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentService" },
    { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentClientService" },
  ];

  // ----------------------------------------------------------
  // Singleton Access
  // ----------------------------------------------------------
  static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService();
    }
    return ModuleService.instance;
  }

  // ----------------------------------------------------------
  // Initialization
  // ----------------------------------------------------------
  static async ensureInitialized(): Promise<void> {
    if (ModuleService.initialized) return;
    const instance = ModuleService.getInstance();
    instance.logger.debug("ModuleService initialized");
    ModuleService.initialized = true;
  }

  // ----------------------------------------------------------
  // Preload Pipeline (System Modules)
  // ----------------------------------------------------------
  private static async preloadModulesSequentially(): Promise<void> {
    const instance = ModuleService.getInstance();

    for (const mod of ModuleService.preloadModules) {
      try {
        instance.logger.debug(`[Preload] Loading ${mod.moduleId}`);
        const loaded = await instance.loadModule(mod.ctx, mod.moduleId);

        // Run controller setup if available
        if (loaded?.controller && typeof loaded.controller.__setup === "function") {
          instance.logger.debug(`[Preload] Setting up ${mod.component}`);
          await loaded.controller.__setup();
        }

        instance.logger.debug(`[Preload] Completed ${mod.component}`);
      } catch (err) {
        instance.logger.error(`[Preload] Failed ${mod.moduleId}: ${err}`);
      }
    }
  }

  // ----------------------------------------------------------
  // Module Loading
  // ----------------------------------------------------------
  async loadModule(ctx: string, moduleId: string): Promise<ICdModule> {
    await ModuleService.ensureInitialized();

    // --- Step 0: Preload system modules (only once per session) ---
    if (!ModuleService.hasPreloaded) {
      ModuleService.hasPreloaded = true;
      await ModuleService.preloadModulesSequentially();
    }

    this.logger.debug("ModuleService::loadModule()/01:");
    const isVite = this.isViteMode;
    const baseDirectory = this.baseDir;

    // --- Step 1: Compute normalized target fragment ---
    const expectedFragment = isVite
      ? `src/CdShell/${ctx}/${moduleId}/view/index.js`
      : `${baseDirectory}/${ctx}/${moduleId}/view/index.js`;

    this.logger.debug("[ModuleService] expectedPathFragment:", expectedFragment);

    // --- Step 2: Browser (Vite) Mode ---
    if (isVite) {
      const pathKey = Object.keys(this.modules).find((key) => {
        const normalizedKey = key.replace(/^\.?\//, "");
        return normalizedKey === expectedFragment;
      });

      if (!pathKey) {
        console.error("[ModuleService] Available module keys:", Object.keys(this.modules));
        throw new Error(`[ModuleService] Module not found for ctx=${ctx}, moduleId=${moduleId}`);
      }

      try {
        const loader = this.modules[pathKey];
        const mod = (await loader()) as { module: ICdModule };
        const moduleInfo = mod.module;

        if (!moduleInfo) throw new Error(`Missing 'module' export in: ${pathKey}`);

        // Inject template into DOM
        const container = document.getElementById("cd-main-content");
        if (container) container.innerHTML = moduleInfo.template;

        // Initialize controller if defined
        if (moduleInfo.controller?.__setup) moduleInfo.controller.__setup();

        // Apply directive bindings
        const binder = new CdDirectiveBinder(moduleInfo.controller);
        binder.bind(container);

        const now = new Date();
        console.log(`[ModuleService] Loaded '${moduleId}' (Vite mode) at ${now.toLocaleString()}`);
        return moduleInfo;
      } catch (err) {
        console.error("[ModuleService] Browser import failed:", err);
        throw err;
      }
    }

    // --- Step 3: Node (Non-Browser) Mode ---
    const normalizedBase = baseDirectory.replace(/\\/g, "/").replace(/\/+$/, "");
    const filePath = `${normalizedBase}/${ctx}/${moduleId}/view/index.js`;

    this.logger.debug("[ModuleService] Importing (Node):", filePath);

    try {
      const fileUrl = url.pathToFileURL(filePath).href;
      const mod = await import(fileUrl);
      const now = new Date();
      console.log(`[ModuleService] Loaded '${moduleId}' (Node mode) at ${now.toLocaleString()}`);
      return mod.module;
    } catch (err) {
      console.error("[ModuleService] Node import failed:", err);
      throw err;
    }
  }
}
```

---

### 🧭 What This Version Does

1. **Preloads dev-sync actors (003 + 004)** before any user module is ever loaded.
2. Guarantees the **sequence**:
   → `IdeAgentService.__setup()`
   → `IdeAgentClientService.__setup()`.
3. Runs in both **Node** and **Vite** environments seamlessly.
4. Keeps preloading **idempotent** — runs only once per session.
5. Maintains your existing logic intact after preloading.

---

### ⚡ How to Extend Later

If, say, `cd-telemetry` or `cd-auth` also need early initialization, simply append them:

```ts
private static preloadModules = [
  { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentService" },
  { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentClientService" },
  { ctx: "sys", moduleId: "cd-telemetry", component: "TelemetryService" },
];
```

---

Would you like me to prepare a **corresponding bootstrap snippet** that you can drop in your main `index.ts` (or `cd-shell` entrypoint) to trigger `ModuleService.loadModule("sys", "cd-user")` after preload completes?
That would complete the cycle from shell startup → preload → user module activation.

# Reference:
REFERENCE(Refined Model):<br>
Below is comparison and analysis of bi-directional process in module federation inter-module communication and IDE to PWA runtime communication.
Underlying mission: Develop a way in which when a developer saves work, a custom compilation process is initiated and the runtime codes are updated before eentually having the PWA test on the browser be updated while running live.

## CASE 1: Module federation Sample:

Actor id: 001
Module: cd-shell
Module type: shell // module federation host
Component: SidebarComponent
Comunication Description:

- publishes appId in LocalStorage for sharing with components and modules within the module federation ecosystem
- Listens for login status by Actor 002,
- process login status
- load menu from Actor 002

Actor id: 002
Module: cd-user
Module type: remote
Component: LoginComponent
Comunication Description: On login response,

- notify Actor 002 of status
- include associated menu in the payload

Notes:

- Actor 002 is remote but child to 001. They share common appId created by 001 during launch
- By the time Actor 002 is invoked, Actor 001 had initialize and placed shared appId in LocalStorage

## CASE 2: IDE to PWA runtime communication Sample:

Actor id: 003
Module: dev-sync
Module type: PWA development utility
Component: IdeAgentService
Comunication Description:

- publishes appId in CdStorage for sharing with components and modules within cd-shell PWA
- Listens for save event by developer,
- on save,
  - custom compile developer source codes to 'view'(runtime code) directory
  - send cd-sio message to runtime listener with relevant data
  - trigger vite to reload the page
- listen and handle response from runtime listener

Actor id: 004
Module: dev-sync
Module type: PWA development utility
Component: IdeAgentClientService
Comunication Description: Listen for save events from the IDE,

- on 'save update page
- inform IDE of status

Notes:

- Actor 004 is part of live version of 003. They share common appId created by 001 during launch
- By the time Actor 004 is invoked, Actor 001 had initialize and placed shared appId in CdStorage


Now we have done the following:
1. Done a systematic comparison of login process and dev-syc proces
2. Looked at the codes for login process and how they can be transformed for dev-syc
3. Done corpdesk-rfc-0004 as a reference for cd-sio client processes
4. Modified initial model of design to align with the corpdesk-rfc-0004

Below is halfway done IdeAgentService based on earlier proposal.
Note that the sections labled 'Save Detection Logic' were done before going though the above specifications.
Note that two of the methods are trying to call:
this.svDevSync.sendSioMessage(data);
In both cased the data has typescript error because the process did not follow the required protocal.
And even if they were to get it right it would be labourious with repeated codes.
The process that both may have followed to make work easier and proper is:
1. make use of the mathod configPushPayload() where all the hardles already have easy to use templates.
2. The initialization did not also follow protocal by use of imported svSio, setAppId(), initSioClient() and listen().
And all the mentioned codes just need to be copy pasted. You can always as for a missing reference.
In the absence of the above, the message may not have been relayed by the server.

So, try to make use of specification we know so far to try to finnish of IdeAgentService
