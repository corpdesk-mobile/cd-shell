// --------------------------------------
// Imports
// --------------------------------------
// import { CdDirectiveBinder } from "../../cd-guig/services/cd-directive-binder.service";
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

  /**
   * Returns an array of moduleInfo objects for all currently allowed modules.
   * For now, this returns hardcoded cd-user (default) and cd-admin.
   * Eventually, this will query the ACL system to filter by permissions.
   * isDefault should not be property of ICdModule. 
   * This is an admin or user setting concern and should be Isolated in that area
   */
  async getAllowedModules(): Promise<ICdModule[]> {
    const allowedModules: ICdModule[] = [];

    // Load cd-user (default)
    const userModule = await this.loadModule("sys", "cd-user");
    if (userModule) {
      userModule.isDefault = true;
      allowedModules.push(userModule);
    }

    // Load cd-admin
    const adminModule = await this.loadModule("sys", "cd-admin");
    if (adminModule) {
      adminModule.isDefault = false;
      allowedModules.push(adminModule);
    }

    return allowedModules;
  }
}
