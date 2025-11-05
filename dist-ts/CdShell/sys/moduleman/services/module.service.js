// --------------------------------------
// Node dynamic imports (preserve legacy behavior)
// --------------------------------------
let fs;
let path;
let url;
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
        }
        catch (e) {
            console.error("[ModuleService] Failed to load Node.js modules:", e);
        }
    }
};
// --------------------------------------
// ModuleService
// --------------------------------------
export class ModuleService {
    static { this.initPromise = null; }
    static { this.hasPreloaded = false; }
    // --- Preload configuration ---
    static { this.preloadModules = [
        { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentService" },
        { ctx: "sys", moduleId: "dev-sync", component: "IdeAgentClientService" },
    ]; }
    // --------------------------------------
    // Singleton Access
    // --------------------------------------
    static getInstance() {
        if (!ModuleService.instance) {
            ModuleService.instance = new ModuleService();
        }
        return ModuleService.instance;
    }
    // --------------------------------------
    // Environment Helpers (preserved)
    // --------------------------------------
    get isBrowser() {
        return typeof window !== "undefined";
    }
    get isViteMode() {
        return this.isBrowser;
    }
    get baseDir() {
        return this.isViteMode
            ? "/src/CdShell"
            : path?.resolve(process.cwd(), "dist-ts/CdShell");
    }
    // --------------------------------------
    // Initialization (preserved)
    // --------------------------------------
    static async ensureInitialized() {
        if (!this.initPromise)
            this.initPromise = initializeNodeModules();
        await this.initPromise;
    }
    // --------------------------------------
    // Constructor (preserved Vite setup)
    // --------------------------------------
    constructor() {
        // private logger = new Logger("ModuleService");
        this.modules = {};
        console.debug("[ModuleService][constructor]: starting");
        if (this.isViteMode) {
            console.debug("[ModuleService] Running under Vite (browser).");
            this.modules = import.meta.glob("/src/CdShell/**/index.js");
        }
        else {
            console.debug("[ModuleService] Running under Node (non-Vite).");
        }
    }
    // --------------------------------------
    // Preload Pipeline
    // --------------------------------------
    static async preloadModulesSequentially() {
        const instance = ModuleService.getInstance();
        for (const mod of this.preloadModules) {
            try {
                console.debug(`[Preload] Loading ${mod.moduleId}`);
                // loaded will now be of type ICdModule with the 'controllers' array
                const loaded = await instance.loadModule(mod.ctx, mod.moduleId);
                // --- 💡 UPDATE START: Find the specific controller instance ---
                // 1. Attempt to find the IControllerInfo that matches the component name
                // (Assuming mod.component name matches the IControllerInfo.name property)
                const targetControllerInfo = loaded.controllers.find((c) => c.name === mod.component);
                // Run controller setup if available
                if (targetControllerInfo?.instance &&
                    typeof targetControllerInfo.instance.__setup === "function") {
                    const controllerInstance = targetControllerInfo.instance;
                    console.debug(`[Preload] Setting up ${mod.component}`);
                    // Use 'await' to ensure the asynchronous __setup completes
                    await controllerInstance.__setup();
                }
                else {
                    // Log if the target component/controller wasn't found in the module's definition
                    console.warn(`[Preload] Controller component '${mod.component}' not found in module ${mod.moduleId}.`);
                }
                // --- 💡 UPDATE END ---
                console.debug(`[Preload] Completed ${mod.component}`);
            }
            catch (err) {
                console.error(`[Preload] Failed ${mod.moduleId}: ${err}`);
            }
        }
    }
    // --------------------------------------
    // Module Loader (core unified version)
    // --------------------------------------
    async loadModule(ctx, moduleId) {
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
                console.error("[ModuleService] Available module keys:", Object.keys(this.modules));
                throw new Error(`[ModuleService] Module not found for ctx=${ctx}, moduleId=${moduleId}`);
            }
            try {
                console.debug("[ModuleService][loadModule] pathKey:", pathKey);
                const loader = this.modules[pathKey];
                const mod = (await loader());
                const moduleInfo = mod.module; // Now contains 'controllers' array
                if (!moduleInfo)
                    throw new Error(`Missing 'module' export in: ${pathKey}`);
                console.debug("[ModuleService][loadModule] moduleInfo:", moduleInfo);
                console.debug("[ModuleService][loadModule] moduleInfo.controllers:", moduleInfo.controllers);
                // 💡 NEW LOGIC: Identify the default controller for potential launch
                const defaultControllerInfo = moduleInfo.controllers.find((c) => c.default === true);
                /////////////////////////////////
                // DEPRICATED
                // 🛑 CRITICAL FIX: Only run __setup() and inject template if:
                // 1. The module is marked as the application's default module (set in getAllowedModules).
                // 2. A default controller exists for this module.
                // if (moduleInfo.isDefault && defaultControllerInfo) {
                //   const controller = defaultControllerInfo.instance;
                //   const template = defaultControllerInfo.template;
                //   // Inject the default controller's template into DOM
                //   const container = document.getElementById("cd-main-content");
                //   if (container && template) {
                //     console.debug(
                //       `[ModuleService] Injecting default template for: ${moduleId}/${defaultControllerInfo.name}`
                //     );
                //     container.innerHTML = template;
                //   }
                //   // Initialize the default controller
                //   if (controller?.__setup && typeof controller.__setup === "function") {
                //     console.debug(
                //       `[ModuleService] Executing __setup() for default controller: ${defaultControllerInfo.name}`
                //     );
                //     await controller.__setup();
                //   }
                // }
                // NEW RECOMENDATION
                // ...
                // 🛑 CRITICAL FIX: Only run __setup() and inject template if:
                // 1. The module is marked as the application's default module (set in getAllowedModules).
                // 2. A default controller exists for this module.
                if (moduleInfo.isDefault && defaultControllerInfo) {
                    // const controller = defaultControllerInfo.instance;
                    // const template = defaultControllerInfo.template;
                    // // Inject the default controller's template into DOM
                    // const container = document.getElementById("cd-main-content");
                    // if (container && template) {
                    //   console.debug(
                    //     `[ModuleService] Injecting default template for: ${moduleId}/${defaultControllerInfo.name}`
                    //   );
                    //   container.innerHTML = template;
                    // }
                    // 🔴 REMOVE THIS BLOCK! Setup must be handled by MenuService.loadResource() or the central boot.
                    /*
                      if (controller?.__setup && typeof controller.__setup === "function") {
                          console.debug(
                              `[ModuleService] Executing __setup() for default controller: ${defaultControllerInfo.name}`
                          );
                          await controller.__setup();
                      }
                      */
                    // 💡 NEW POLICY: For default module, call MenuService.loadResource() to complete lifecycle
                    // const svMenu = new MenuService();
                    // svMenu.loadResource({
                    //   item: {
                    //     // Create a pseudo-menu item to launch the default controller
                    //     route: "default-app-route",
                    //     controller: controller,
                    //     template: template,
                    //   },
                    // });
                }
                else {
                    // All other modules (cd-admin) or non-default controllers are loaded passively.
                    console.debug(`[ModuleService] Loaded module metadata passively: ${moduleId}. Setup skipped.`);
                }
                const now = new Date();
                console.log(`[ModuleService] Loaded '${moduleId}' (Vite mode) at ${now.toLocaleString()}`);
                return moduleInfo;
            }
            catch (err) {
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
            console.log(`[ModuleService] Loaded '${moduleId}' (Node mode) at ${now.toLocaleString()}`);
            return mod.module;
        }
        catch (err) {
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
    // async getAllowedModules(): Promise<ICdModule[]> {
    //   const allowedModules: ICdModule[] = [];
    //   // Load cd-user (default)
    //   const userModule = await this.loadModule("sys", "cd-user");
    //   if (userModule) {
    //     userModule.isDefault = true;
    //     allowedModules.push(userModule);
    //   }
    //   // Load cd-admin
    //   const adminModule = await this.loadModule("sys", "cd-admin");
    //   if (adminModule) {
    //     adminModule.isDefault = false;
    //     allowedModules.push(adminModule);
    //   }
    //   return allowedModules;
    // }
    async getAllowedModules() {
        const allowedModules = [];
        // Load cd-user (default)
        const userModule = await this.loadModule("sys", "cd-user");
        if (userModule) {
            // 💡 Set the isDefault flag after loading
            userModule.isDefault = true;
            allowedModules.push(userModule);
        }
        // Load cd-admin (non-default)
        const adminModule = await this.loadModule("sys", "cd-admin");
        if (adminModule) {
            // 💡 Set the isDefault flag after loading
            adminModule.isDefault = false;
            allowedModules.push(adminModule);
        }
        return allowedModules;
    }
}
