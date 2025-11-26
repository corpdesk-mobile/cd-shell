/**
 * SysCacheService
 * ---------------
 * Centralized cache for system-level data (UI systems, themes, variants).
 * Acts as the "kernel cache" of the Corpdesk shell.
 *
 * Responsibilities:
 *  - Load & store all UI-related system data during boot (via loadAndCacheAll()).
 *  - Expose quick accessors for cached data (for controllers & loaders).
 *  - Ensure no redundant data fetching after boot.
 */
// export class SysCacheService {
//   private static instance: SysCacheService;
//   private cache = new Map<string, any>();
//   private _uiSystemLoader!: UiSystemLoaderService;
//   private _uiThemeLoader!: UiThemeLoaderService;
//   constructor(private configService: ConfigService) {}
//   public static getInstance(configService?: ConfigService): SysCacheService {
//     if (!SysCacheService.instance) {
//       if (!configService) {
//         throw new Error("SysCacheService must be initialized with ConfigService on first call.");
//       }
//       SysCacheService.instance = new SysCacheService(configService);
//     }
//     return SysCacheService.instance;
//   }
//   public setLoaders(systemLoader: UiSystemLoaderService, themeLoader: UiThemeLoaderService): void {
//     this._uiSystemLoader = systemLoader;
//     this._uiThemeLoader = themeLoader;
//   }
//   public async loadAndCacheAll(): Promise<void> {
//     if (!this._uiSystemLoader || !this._uiThemeLoader) {
//       throw new Error("SysCacheService: loaders must be set before load.");
//     }
//     if (this.cache.size > 0) return;
//     console.log("[SysCacheService] 01: Starting Eager Load (Singleton)");
//     const uiConfig = await this.configService.loadConfig();
//     this.cache.set("uiConfig", uiConfig);
//     const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
//     console.log("[SysCacheService][loadAndCacheAll] uiSystemsData:", uiSystemsData);
//     const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);
//     console.log("[SysCacheService][loadAndCacheAll] uiThemesData:", uiThemesData);
//     // 🧩 Normalize system data
//     const normalizedSystems = uiSystemsData.map((sys) => ({
//       id: sys.id,
//       name: sys.name,
//       cssUrl: sys.cssUrl,
//       jsUrl: sys.jsUrl,
//       displayName: sys.name, // unify naming for UI
//       themesAvailable: sys.themesAvailable || [],
//       themeActive: sys.themeActive || null,
//     }));
//     // 🧩 Normalize theme data
//     const normalizedThemes = {
//       themes: (uiThemesData.themes || []).map((t) => ({
//         id: t.id,
//         name: t.name,
//         displayName: t.name,
//       })),
//       variants: (uiThemesData.variants || []).map((v) => ({
//         id: v.id,
//         name: v.name,
//         displayName: v.name,
//       })),
//       uiConfig: uiThemesData.uiConfig,
//     };
//     this.cache.set("uiSystems", normalizedSystems);
//     this.cache.set("themes", normalizedThemes.themes);
//     this.cache.set("formVariants", normalizedThemes.variants);
//     this.cache.set("uiConfigNormalized", normalizedThemes.uiConfig);
//     console.log(`[SysCacheService] Eager Load complete. Systems: ${normalizedSystems.length}, Themes: ${normalizedThemes.themes.length}`);
//   }
//   // --------- Public Getters (safe + normalized) ---------
//   public getUiSystems(): any[] {
//     return this.cache.get("uiSystems") || [];
//   }
//   public getThemes(): any[] {
//     return this.cache.get("themes") || [];
//   }
//   public getFormVariants(): any[] {
//     return this.cache.get("formVariants") || [];
//   }
//   public getConfig(): any {
//     return this.cache.get("uiConfigNormalized") || {};
//   }
//   // Expose the loaders for controllers
//   public get uiSystemLoader(): UiSystemLoaderService {
//     return this._uiSystemLoader;
//   }
//   public get uiThemeLoader(): UiThemeLoaderService {
//     return this._uiThemeLoader;
//   }
//   public async ensureReady(): Promise<void> {
//     if (this.cache.size === 0) await this.loadAndCacheAll();
//   }
//   public get(key: string): any {
//     console.log(`[SysCacheService][get] key: ${key}`);
//     console.log('[SysCacheService][get] this.cache:', this.cache);
//     return this.cache.get(key);
//   }
// }
export class SysCacheService {
    constructor(configService) {
        this.configService = configService;
        this.cache = new Map();
    }
    static getInstance(configService) {
        if (!SysCacheService.instance) {
            if (!configService) {
                throw new Error("SysCacheService must be initialized with ConfigService on first instantiation.");
            }
            SysCacheService.instance = new SysCacheService(configService);
        }
        return SysCacheService.instance;
    }
    setLoaders(systemLoader, themeLoader) {
        this._uiSystemLoader = systemLoader;
        this._uiThemeLoader = themeLoader;
    }
    /**
     * Loads:
     * - uiConfig
     * - uiSystems (simple list)
     * - uiSystemDescriptors (FULL expanded descriptors)
     * - themes
     * - formVariants
     * - themeDescriptors
     */
    async loadAndCacheAll() {
        if (!this._uiSystemLoader || !this._uiThemeLoader) {
            throw new Error("SysCacheService: loaders must be set before load.");
        }
        if (this.cache.size > 0)
            return; // already loaded
        console.log("[SysCacheService] 01: Starting Eager Load");
        const shellConfig = await this.configService.loadConfig();
        const uiConfig = shellConfig.uiConfig;
        this.cache.set("uiConfig", uiConfig);
        // ---------------------------------------------
        // Fetch available systems (raw descriptors)
        // ---------------------------------------------
        const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
        console.log("[SysCacheService] uiSystemsData:", uiSystemsData);
        // ---------------------------------------------
        // Normalize full descriptors
        // ---------------------------------------------
        const fullDescriptors = uiSystemsData.map((sys) => {
            return {
                id: sys.id,
                name: sys.name,
                version: sys.version,
                description: sys.description,
                // Assets
                cssUrl: sys.cssUrl,
                jsUrl: sys.jsUrl,
                assetPath: sys.assetPath,
                stylesheets: sys.stylesheets || [],
                scripts: sys.scripts || [],
                // Themes
                themesAvailable: sys.themesAvailable || [],
                themeActive: sys.themeActive || null,
                // Concept Mapping & directives
                conceptMappings: sys.conceptMappings || {},
                directiveMap: sys.directiveMap || {},
                // Rendering metadata
                tokenMap: sys.tokenMap || {},
                containers: sys.containers || [],
                components: sys.components || [],
                renderRules: sys.renderRules || {},
                // Metadata
                metadata: sys.metadata || {},
                extensions: sys.extensions || {},
                author: sys.author,
                license: sys.license,
                repository: sys.repository,
                displayName: sys.displayName || sys.name,
            };
        });
        // ---------------------------------------------
        // Simple list for UI (id + name only)
        // ---------------------------------------------
        const simpleSystems = fullDescriptors.map((sys) => ({
            id: sys.id,
            name: sys.name,
            displayName: sys.displayName,
            themesAvailable: sys.themesAvailable,
        }));
        console.log("[SysCacheService] Normalized Systems:", simpleSystems);
        // ---------------------------------------------
        // Load theme lists & full theme.json descriptors
        // ---------------------------------------------
        const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);
        const themes = (uiThemesData.themes || []).map((t) => ({
            id: t.id,
            name: t.name,
        }));
        const variants = (uiThemesData.variants || []).map((v) => ({
            id: v.id,
            name: v.name,
        }));
        const descriptors = uiThemesData.descriptors || [];
        // ---------------------------------------------
        // Store everything
        // ---------------------------------------------
        this.cache.set("uiSystems", simpleSystems);
        this.cache.set("uiSystemDescriptors", fullDescriptors);
        this.cache.set("themes", themes);
        this.cache.set("formVariants", variants);
        this.cache.set("themeDescriptors", descriptors);
        this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);
        console.log(`[SysCacheService] Load complete. Systems: ${simpleSystems.length}, Themes: ${themes.length}`);
    }
    // ---------------------------------------------
    // Accessors
    // ---------------------------------------------
    getUiSystems() {
        return this.cache.get("uiSystems") || [];
    }
    getUiSystemDescriptors() {
        return this.cache.get("uiSystemDescriptors") || [];
    }
    getThemes() {
        return this.cache.get("themes") || [];
    }
    getFormVariants() {
        return this.cache.get("formVariants") || [];
    }
    getThemeDescriptors() {
        return this.cache.get("themeDescriptors") || [];
    }
    getConfig() {
        return this.cache.get("uiConfigNormalized") || {};
    }
    get(key) {
        return this.cache.get(key);
    }
    get uiSystemLoader() {
        return this._uiSystemLoader;
    }
    get uiThemeLoader() {
        return this._uiThemeLoader;
    }
    async ensureReady() {
        if (this.cache.size === 0)
            await this.loadAndCacheAll();
    }
}
