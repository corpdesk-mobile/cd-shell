// /////////////////////////////////////////
// // PREVIOUS CODES
// /////////////////////////////////////////
// import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
// import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
// import { ConfigService } from "./config.service";
export class SysCacheService {
    constructor(configService) {
        this.configService = configService;
        /** Core cache store */
        // private cache = new Map<CacheKey | string, CacheEntry>();
        this.cache = new Map();
        /** Reactive listeners */
        this.listeners = new Map();
        this.versionCounter = 0;
    }
    // ------------------------------------------------------------------
    // SINGLETON
    // ------------------------------------------------------------------
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
    // Implementation
    set(key, value, source = "runtime") {
        const meta = {
            source,
            version: ++this.versionCounter,
            timestamp: Date.now(),
        };
        this.cache.set(key, { value, meta });
        this.notify(key, value, meta);
    }
    get(key) {
        const entry = this.cache.get(key);
        return entry?.value;
    }
    getMeta(key) {
        const entry = this.cache.get(key);
        return entry?.meta;
    }
    subscribe(key, listener, emitImmediately = true) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(listener);
        // Late subscriber → immediate sync
        if (emitImmediately && this.cache.has(key)) {
            const entry = this.cache.get(key);
            listener(entry.value, entry.meta);
        }
        // Unsubscribe
        return () => {
            this.listeners.get(key)?.delete(listener);
        };
    }
    notify(key, value, meta) {
        this.listeners.get(key)?.forEach((listener) => listener(value, meta));
    }
    // ------------------------------------------------------------------
    // EXISTING LOAD PIPELINE (UNCHANGED BEHAVIOR)
    // ------------------------------------------------------------------
    async loadAndCacheAll() {
        if (!this._uiSystemLoader || !this._uiThemeLoader) {
            throw new Error("SysCacheService: loaders must be set before load.");
        }
        if (this.cache.size > 0)
            return;
        console.log("[SysCacheService] Eager load starting");
        const shellConfig = await this.configService.loadConfig();
        this.set("shellConfig", shellConfig, "static");
        this.set("envConfig", shellConfig.envConfig || {}, "static");
        this.set("uiConfig", shellConfig.uiConfig || {}, "static");
        // const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
        //   shellConfig.uiConfig
        // );
        // this.set("uiSystems", uiSystemsData, "static");
        const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(shellConfig.uiConfig);
        const { simple, full } = this.normalizeUiSystemDescriptors(uiSystemsData);
        // 🔁 Restore legacy expectations
        this.set("uiSystems", simple, "static");
        this.set("uiSystemDescriptors", full, "static");
        const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(shellConfig.uiConfig);
        this.set("themes", uiThemesData.themes || [], "static");
        this.set("formVariants", uiThemesData.variants || [], "static");
        this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
        this.set("uiConfigNormalized", uiThemesData.uiConfig || shellConfig.uiConfig, "static");
        console.log("[SysCacheService] Load complete");
    }
    // ------------------------------------------------------------------
    // BACKWARD-COMPAT GETTERS (NO BREAKING CHANGES)
    // ------------------------------------------------------------------
    getUiSystems() {
        return this.get("uiSystems") || [];
    }
    getThemes() {
        return this.get("themes") || [];
    }
    getFormVariants() {
        return this.get("formVariants") || [];
    }
    getThemeDescriptors() {
        return this.get("themeDescriptors") || [];
    }
    getConfig() {
        return this.get("uiConfigNormalized") || {};
    }
    getEnvConfig() {
        return this.get("envConfig") || {};
    }
    getConsumerGuid() {
        const env = this.getEnvConfig();
        return env?.consumerGuid || env?.clientContext?.consumerToken;
    }
    getApiEndpoint() {
        return this.getEnvConfig()?.apiEndpoint;
    }
    async ensureReady() {
        if (this.cache.size === 0) {
            await this.loadAndCacheAll();
        }
    }
    /**
     * Normalizes UI system descriptors to legacy-compatible shape
     * Required by UiSystemLoaderService.activate()
     */
    normalizeUiSystemDescriptors(rawSystems) {
        const fullDescriptors = rawSystems.map((sys) => ({
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
        return {
            simple: simpleSystems,
            full: fullDescriptors,
        };
    }
    cacheUiSystems(rawSystems, source = "static") {
        const { simple, full } = this.normalizeUiSystemDescriptors(rawSystems);
        // 🔁 Legacy compatibility
        this.set("uiSystems", simple, source);
        this.set("uiSystemDescriptors", full, source);
        // 🔮 Optional future-facing unified key
        this.set("uiSystemsNormalized", { simple, full }, source);
        console.log("[SysCacheService] UI systems cached", {
            simpleCount: simple.length,
            fullCount: full.length,
            source,
        });
    }
}
