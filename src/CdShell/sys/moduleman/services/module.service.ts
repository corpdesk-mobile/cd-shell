// import { LoggerService } from "../../../utils/logger.service";
// import { CdDirectiveBinder } from "../../base/cd-directive-binder";
// import { ICdModule } from "../models/module.model";

// // Node.js module placeholders
// let fs: any;
// let path: any;
// let url: any;

// /**
//  * Dynamically loads Node.js modules only when running in Node context.
//  */
// const initializeNodeModules = async () => {
//   console.log("starting initializeNodeModules()-01");
//   if (typeof window === "undefined") {
//     console.log("initializeNodeModules()-02");
//     try {
//       const [fsModule, pathModule, urlModule] = await Promise.all([
//         import("fs"),
//         import("path"),
//         import("url"),
//       ]);
//       console.log("initializeNodeModules()-03");
//       fs = fsModule;
//       path = pathModule;
//       url = urlModule;
//     } catch (e) {
//       console.log("initializeNodeModules()-04");
//       console.error("[ModuleService] Failed to load Node.js modules:", e);
//     }
//   }
// };

// /**
//  * ModuleService
//  * Handles dynamic loading of Corpdesk modules in both browser (Vite) and Node contexts.
//  */
// export class ModuleService {
//   private logger = new LoggerService();
//   private static initPromise: Promise<void> | null = null;
//   private modules: Record<string, any> = {};

//   // --- Environment flags ---
//   private get isBrowser() {
//     return typeof window !== "undefined";
//   }

//   private get isViteMode() {
//     // Vite mode implies running inside browser context
//     return this.isBrowser;
//   }

//   private get baseDir() {
//     return this.isViteMode
//       ? "/src/CdShell"
//       : path?.resolve(process.cwd(), "dist-ts/CdShell");
//   }

//   /**
//    * Ensures Node modules (fs, path, url) are loaded only once.
//    */
//   public static async ensureInitialized(): Promise<void> {
//     console.log("[ModuleService][ensureInitialized]: starting");
//     if (!this.initPromise) this.initPromise = initializeNodeModules();
//     return this.initPromise;
//   }

//   constructor() {
//     console.debug("[ModuleService][constructor]: starting");
//     if (this.isViteMode) {
//       console.debug("[ModuleService] isViteMode=true");

//       // FIX: Use the ABSOLUTE path relative to the project root.
//       // This is often the most reliable pattern to force Vite to find files.
//       this.modules = import.meta.glob("/src/CdShell/**/index.js");

//       console.debug("[ModuleService] Running under Vite (browser).");
//     } else {
//       console.debug("[ModuleService] Running under Node (non-Vite).");
//     }
//   }

//   /**
//    * Loads a module dynamically by context and moduleId.
//    * Example: ctx="sys", moduleId="cd-user" → /src/CdShell/sys/cd-user/view/index.js
//    */
//   async loadModule(ctx: string, moduleId: string): Promise<ICdModule> {
//     await ModuleService.ensureInitialized();
//     console.debug("ModuleService::loadModule()/01:");

//     const isVite = this.isViteMode;
//     const baseDirectory = this.baseDir;

//     // --- Step 1: Compute normalized target fragment ---
//     const expectedFragment = isVite
//       ? `src/CdShell/${ctx}/${moduleId}/view/index.js`
//       : `${baseDirectory}/${ctx}/${moduleId}/view/index.js`;

//     console.debug(
//       "[ModuleService] expectedPathFragment:",
//       expectedFragment
//     );

//     // --- Step 2: Vite (Browser) Mode ---
//     if (isVite) {
//       // The expectedFragment is calculated as: "src/CdShell/sys/cd-user/view/index.js"

//       // Find the correct key from the modules map
//       const pathKey = Object.keys(this.modules).find((key) => {
//         // Normalizes key: removes a leading './' OR a leading '/' (if present).
//         // This makes the key match the expectedFragment ("src/CdShell/...")
//         const normalizedKey = key.replace(/^\.?\//, "");

//         return normalizedKey === expectedFragment;
//       });

//       if (!pathKey) {
//         console.error(
//           "[ModuleService] Available module keys:",
//           Object.keys(this.modules)
//         );
//         throw new Error(
//           `[ModuleService] Module not found for ctx=${ctx}, moduleId=${moduleId}`
//         );
//       }

//       try {
//         const loader = this.modules[pathKey];
//         const mod = (await loader()) as { module: ICdModule };
//         const moduleInfo = mod.module;

//         if (!moduleInfo)
//           throw new Error(`Missing 'module' export in: ${pathKey}`);

//         // Inject module template into the DOM
//         const container = document.getElementById("cd-main-content");
//         if (container) container.innerHTML = moduleInfo.template;

//         // Initialize controller if defined
//         if (moduleInfo.controller?.__setup) moduleInfo.controller.__setup();

//         // Apply directive bindings
//         const binder = new CdDirectiveBinder(moduleInfo.controller);
//         binder.bind(container);

//         // Timestamp log
//         const now = new Date();
//         console.log(
//           `[ModuleService] Loaded '${moduleId}' (Vite mode) at ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
//         );

//         return moduleInfo;
//       } catch (err) {
//         console.error("[ModuleService] Browser import failed:", err);
//         throw err;
//       }
//     }

//     // --- Step 3: Node (Non-Browser) Mode ---
//     const normalizedBase = baseDirectory
//       .replace(/\\/g, "/")
//       .replace(/\/+$/, "");
//     const filePath = `${normalizedBase}/${ctx}/${moduleId}/view/index.js`;

//     console.debug("[ModuleService] Importing (Node):", filePath);

//     try {
//       const fileUrl = url.pathToFileURL(filePath).href;
//       const mod = await import(fileUrl);
//       const now = new Date();
//       console.log(
//         `[ModuleService] Loaded '${moduleId}' (Node mode) at ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
//       );
//       return mod.module;
//     } catch (err) {
//       console.error("[ModuleService] Node import failed:", err);
//       throw err;
//     }
//   }
// }

// --------------------------------------
// Imports
// --------------------------------------
import { CdDirectiveBinder } from "../../base/cd-directive-binder";
import { ICdModule } from "../models/module.model";

// --------------------------------------
// Node dynamic imports (preserve legacy behavior)
// --------------------------------------
let fs: any;
let path: any;
let url: any;

const initializeNodeModules = async () => {
  if (typeof window === "undefined") {
    try {
      const [fsModule, pathModule, urlModule] = await Promise.all([
        import("fs"),
        import("path"),
        import("url"),
      ]);
      fs = fsModule;
      path = pathModule;
      url = urlModule;
    } catch (e) {
      console.error("[ModuleService] Failed to load Node.js modules:", e);
    }
  }
};

// --------------------------------------
// ModuleService
// --------------------------------------
export class ModuleService {
  private static instance: ModuleService;
  private static initPromise: Promise<void> | null = null;
  private static hasPreloaded = false;

  // private logger = new Logger("ModuleService");
  private modules: Record<string, any> = {};

  // --- Preload configuration ---
  private static preloadModules = [
    { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentService" },
    { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentClientService" },
  ];

  // --------------------------------------
  // Singleton Access
  // --------------------------------------
  static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService();
    }
    return ModuleService.instance;
  }

  // --------------------------------------
  // Environment Helpers (preserved)
  // --------------------------------------
  private get isBrowser() {
    return typeof window !== "undefined";
  }

  private get isViteMode() {
    return this.isBrowser;
  }

  private get baseDir() {
    return this.isViteMode
      ? "/src/CdShell"
      : path?.resolve(process.cwd(), "dist-ts/CdShell");
  }

  // --------------------------------------
  // Initialization (preserved)
  // --------------------------------------
  public static async ensureInitialized(): Promise<void> {
    if (!this.initPromise) this.initPromise = initializeNodeModules();
    await this.initPromise;
  }

  // --------------------------------------
  // Constructor (preserved Vite setup)
  // --------------------------------------
  constructor() {
    console.debug("[ModuleService][constructor]: starting");

    if (this.isViteMode) {
      console.debug("[ModuleService] Running under Vite (browser).");
      this.modules = import.meta.glob("/src/CdShell/**/index.js");
    } else {
      console.debug("[ModuleService] Running under Node (non-Vite).");
    }
  }

  // --------------------------------------
  // Preload Pipeline
  // --------------------------------------
  private static async preloadModulesSequentially(): Promise<void> {
    const instance = ModuleService.getInstance();

    for (const mod of this.preloadModules) {
      try {
        console.debug(`[Preload] Loading ${mod.moduleId}`);
        const loaded = await instance.loadModule(mod.ctx, mod.moduleId);

        // Run controller setup if available
        if (
          loaded?.controller &&
          typeof loaded.controller.__setup === "function"
        ) {
          console.debug(`[Preload] Setting up ${mod.component}`);
          await loaded.controller.__setup();
        }

        console.debug(`[Preload] Completed ${mod.component}`);
      } catch (err) {
        console.error(`[Preload] Failed ${mod.moduleId}: ${err}`);
      }
    }
  }

  // --------------------------------------
  // Module Loader (core unified version)
  // --------------------------------------
  async loadModule(ctx: string, moduleId: string): Promise<ICdModule> {
    await ModuleService.ensureInitialized();

    // --- Step 0: Preload system modules (first run only) ---
    if (!ModuleService.hasPreloaded) {
      ModuleService.hasPreloaded = true;
      await ModuleService.preloadModulesSequentially();
    }

    console.debug("ModuleService::loadModule()/01:");
    const isVite = this.isViteMode;
    const baseDirectory = this.baseDir;

    // --- Step 1: Compute target path ---
    const expectedFragment = isVite
      ? `src/CdShell/${ctx}/${moduleId}/view/index.js`
      : `${baseDirectory}/${ctx}/${moduleId}/view/index.js`;

    console.debug("[ModuleService] expectedPathFragment:", expectedFragment);

    // --- Step 2: Browser (Vite) Mode ---
    if (isVite) {
      console.debug("[ModuleService] 1");
      const pathKey = Object.keys(this.modules).find((key) => {
        const normalizedKey = key.replace(/^\.?\//, "");
        return normalizedKey === expectedFragment;
      });

      if (!pathKey) {
        console.error(
          "[ModuleService] Available module keys:",
          Object.keys(this.modules)
        );
        throw new Error(
          `[ModuleService] Module not found for ctx=${ctx}, moduleId=${moduleId}`
        );
      }

      try {
        const loader = this.modules[pathKey];
        const mod = (await loader()) as { module: ICdModule };
        const moduleInfo = mod.module;

        if (!moduleInfo)
          throw new Error(`Missing 'module' export in: ${pathKey}`);

        // Inject template into DOM
        const container = document.getElementById("cd-main-content");
        if (container) container.innerHTML = moduleInfo.template;

        // Initialize controller
        if (moduleInfo.controller?.__setup) {
          moduleInfo.controller.__setup(); // Controller handles binder internally
        }

        const now = new Date();
        console.log(
          `[ModuleService] Loaded '${moduleId}' (Vite mode) at ${now.toLocaleString()}`
        );
        return moduleInfo;
      } catch (err) {
        console.error("[ModuleService] Browser import failed:", err);
        throw err;
      }
    }

    // --- Step 3: Node (Non-Browser) Mode ---
    const normalizedBase = baseDirectory
      .replace(/\\/g, "/")
      .replace(/\/+$/, "");
    const filePath = `${normalizedBase}/${ctx}/${moduleId}/view/index.js`;

    console.debug("[ModuleService] Importing (Node):", filePath);

    try {
      const fileUrl = url.pathToFileURL(filePath).href;
      const mod = await import(fileUrl);
      const now = new Date();
      console.log(
        `[ModuleService] Loaded '${moduleId}' (Node mode) at ${now.toLocaleString()}`
      );
      return mod.module;
    } catch (err) {
      console.error("[ModuleService] Node import failed:", err);
      throw err;
    }
  }
}
