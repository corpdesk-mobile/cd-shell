import { LoggerService } from "../../../utils/logger.service";
export class SysCacheService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new LoggerService();
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
        this.logger.debug("[SysCacheService.loadAndCacheAll()] start");
        if (!this._uiSystemLoader || !this._uiThemeLoader) {
            throw new Error("SysCacheService: loaders must be set before load.");
        }
        if (this.cache.size > 0)
            return;
        console.log("[SysCacheService] Eager load starting");
        // 🔑 PHASE-2 AWARE CONFIG RESOLUTION
        const shellConfig = this.get("shellConfig") ?? (await this.configService.loadConfig());
        const uiConfig = shellConfig.uiConfig || {};
        // Ensure canonical cache presence
        this.set("shellConfig", shellConfig, "static");
        this.set("envConfig", shellConfig.envConfig || {}, "static");
        this.set("uiConfig", uiConfig, "static");
        // -------------------------------------------------
        // UI SYSTEMS (authoritative descriptors)
        // -------------------------------------------------
        const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
        this.cacheUiSystems(uiSystemsData, "static");
        // -------------------------------------------------
        // UI THEMES
        // -------------------------------------------------
        const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);
        this.set("themes", uiThemesData.themes || [], "static");
        this.set("formVariants", uiThemesData.variants || [], "static");
        this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
        this.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig, "static");
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
        this.logger.debug("[SysCacheService.normalizeUiSystemDescriptors()] start");
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
        this.logger.debug("[SysCacheService.cacheUiSystems()] start");
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
    hasConsumerContext() {
        return !!this.get("shellConfig:meta")?.hasConsumerProfile;
    }
    // ------------------------------------------------------------------
    // PHASE-2 RESOLUTION (CONSUMER / USER OVERRIDES)
    // ------------------------------------------------------------------
    applyResolvedShellConfig(resolvedShellConfig, source = "resolved") {
        this.logger.debug("[SysCacheService.applyResolvedShellConfig()] start");
        this.logger.debug("[SysCacheService.applyResolvedShellConfig()] resolvedShellConfig:", resolvedShellConfig);
        if (!resolvedShellConfig)
            return;
        const uiConfig = resolvedShellConfig.uiConfig || {};
        const envConfig = resolvedShellConfig.envConfig || {};
        // Override canonical keys
        this.set("shellConfig", resolvedShellConfig, source);
        this.set("uiConfig", uiConfig, source);
        this.set("envConfig", envConfig, source);
        // Optional normalized alias (used by loaders)
        this.set("uiConfigNormalized", uiConfig, source);
        // Metadata flag (used by hasConsumerContext)
        this.set("shellConfig:meta", {
            hasConsumerProfile: true,
            appliedAt: Date.now(),
        }, source);
        console.log("[SysCacheService] Resolved shell config applied", {
            defaultUiSystemId: uiConfig.defaultUiSystemId,
            defaultThemeId: uiConfig.defaultThemeId,
            source,
        });
    }
}
