// import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
// import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
// import { ConfigService } from "./config.service";
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
     * - envConfig (NEW)
     * - uiConfig
     * - uiSystems
     * - uiSystemDescriptors
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
        // -------------------------------------------------------------------
        // 1. LOAD SHELL CONFIG
        // -------------------------------------------------------------------
        const shellConfig = await this.configService.loadConfig();
        // Extract the new envConfig block (replacing license/environment)
        const envConfig = shellConfig.envConfig || {};
        // Cache it
        this.cache.set("envConfig", envConfig);
        // Preserve uiConfig loading
        const uiConfig = shellConfig.uiConfig;
        this.cache.set("uiConfig", uiConfig);
        // -------------------------------------------------------------------
        // 2. UI SYSTEMS & THEMES
        // -------------------------------------------------------------------
        const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
        const fullDescriptors = uiSystemsData.map((sys) => ({
            id: sys.id,
            name: sys.name,
            version: sys.version,
            description: sys.description,
            cssUrl: sys.cssUrl,
            jsUrl: sys.jsUrl,
            assetPath: sys.assetPath,
            stylesheets: sys.stylesheets || [],
            scripts: sys.scripts || [],
            themesAvailable: sys.themesAvailable || [],
            themeActive: sys.themeActive || null,
            conceptMappings: sys.conceptMappings || {},
            directiveMap: sys.directiveMap || {},
            tokenMap: sys.tokenMap || {},
            containers: sys.containers || [],
            components: sys.components || [],
            renderRules: sys.renderRules || {},
            metadata: sys.metadata || {},
            extensions: sys.extensions || {},
            author: sys.author,
            license: sys.license,
            repository: sys.repository,
            displayName: sys.displayName || sys.name,
        }));
        const simpleSystems = fullDescriptors.map((sys) => ({
            id: sys.id,
            name: sys.name,
            displayName: sys.displayName,
            themesAvailable: sys.themesAvailable,
        }));
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
        // Cache everything
        this.cache.set("uiSystems", simpleSystems);
        this.cache.set("uiSystemDescriptors", fullDescriptors);
        this.cache.set("themes", themes);
        this.cache.set("formVariants", variants);
        this.cache.set("themeDescriptors", descriptors);
        this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);
        console.log("[SysCacheService] Load complete.");
    }
    // -------------------------------------------------------------
    // BASIC GETTERS
    // -------------------------------------------------------------
    get(key) {
        return this.cache.get(key);
    }
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
    // -------------------------------------------------------------
    // NEW: ENV CONFIG HELPERS
    // -------------------------------------------------------------
    getEnvConfig() {
        return this.cache.get("envConfig") || {};
    }
    /** POC: direct access to consumerGuid (tenant identifier) */
    getConsumerGuid() {
        const env = this.getEnvConfig();
        return env?.consumerGuid || env?.clientContext?.consumerToken || undefined;
    }
    /** POC: convenience wrapper for apiEndpoint */
    getApiEndpoint() {
        return this.getEnvConfig()?.apiEndpoint;
    }
    async ensureReady() {
        if (this.cache.size === 0)
            await this.loadAndCacheAll();
    }
}
