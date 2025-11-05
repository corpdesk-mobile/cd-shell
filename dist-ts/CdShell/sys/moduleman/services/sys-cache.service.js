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
export class SysCacheService {
    constructor(configService) {
        this.configService = configService;
        this.cache = new Map();
    }
    static getInstance(configService) {
        if (!SysCacheService.instance) {
            if (!configService) {
                throw new Error("SysCacheService must be initialized with ConfigService on first call.");
            }
            SysCacheService.instance = new SysCacheService(configService);
        }
        return SysCacheService.instance;
    }
    setLoaders(systemLoader, themeLoader) {
        this._uiSystemLoader = systemLoader;
        this._uiThemeLoader = themeLoader;
    }
    async loadAndCacheAll() {
        if (!this._uiSystemLoader || !this._uiThemeLoader) {
            throw new Error("SysCacheService: loaders must be set before load.");
        }
        if (this.cache.size > 0)
            return;
        console.log("[SysCacheService] 01: Starting Eager Load (Singleton)");
        const uiConfig = await this.configService.loadConfig();
        this.cache.set("uiConfig", uiConfig);
        const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
        const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);
        // 🧩 Normalize system data
        const normalizedSystems = uiSystemsData.map((sys) => ({
            id: sys.id,
            name: sys.name,
            displayName: sys.name, // unify naming for UI
            themesAvailable: sys.themesAvailable || [],
            themeActive: sys.themeActive || null,
        }));
        // 🧩 Normalize theme data
        const normalizedThemes = {
            themes: (uiThemesData.themes || []).map((t) => ({
                id: t.id,
                name: t.name,
                displayName: t.name,
            })),
            variants: (uiThemesData.variants || []).map((v) => ({
                id: v.id,
                name: v.name,
                displayName: v.name,
            })),
            uiConfig: uiThemesData.uiConfig,
        };
        this.cache.set("uiSystems", normalizedSystems);
        this.cache.set("themes", normalizedThemes.themes);
        this.cache.set("formVariants", normalizedThemes.variants);
        this.cache.set("uiConfigNormalized", normalizedThemes.uiConfig);
        console.log(`[SysCacheService] Eager Load complete. Systems: ${normalizedSystems.length}, Themes: ${normalizedThemes.themes.length}`);
    }
    // --------- Public Getters (safe + normalized) ---------
    getUiSystems() {
        return this.cache.get("uiSystems") || [];
    }
    getThemes() {
        return this.cache.get("themes") || [];
    }
    getFormVariants() {
        return this.cache.get("formVariants") || [];
    }
    getConfig() {
        return this.cache.get("uiConfigNormalized") || {};
    }
    // Expose the loaders for controllers
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
    get(key) {
        return this.cache.get(key);
    }
}
