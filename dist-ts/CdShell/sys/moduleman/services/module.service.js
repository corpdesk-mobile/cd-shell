// import { LoggerService } from "../../../utils/logger.service";
// import { CdDirectiveBinder } from "../../base/cd-directive-binder";
// import { ICdModule } from "../models/module.model";
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
                const loaded = await instance.loadModule(mod.ctx, mod.moduleId);
                // Run controller setup if available
                if (loaded?.controller &&
                    typeof loaded.controller.__setup === "function") {
                    console.debug(`[Preload] Setting up ${mod.component}`);
                    await loaded.controller.__setup();
                }
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
                const loader = this.modules[pathKey];
                const mod = (await loader());
                const moduleInfo = mod.module;
                if (!moduleInfo)
                    throw new Error(`Missing 'module' export in: ${pathKey}`);
                // Inject template into DOM
                const container = document.getElementById("cd-main-content");
                if (container)
                    container.innerHTML = moduleInfo.template;
                // Initialize controller
                if (moduleInfo.controller?.__setup) {
                    moduleInfo.controller.__setup(); // Controller handles binder internally
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
}
