// ConfigService (singleton)
export class ConfigService {
    static { this.instance = null; }
    constructor() {
        this.config = null;
        this.CONFIG_PATH = "/shell.config.json";
    }
    static getInstance() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }
    async loadConfig() {
        if (this.config)
            return this.config;
        try {
            const res = await fetch(this.CONFIG_PATH);
            if (!res.ok)
                throw new Error(`Failed to load config ${res.status}`);
            this.config = (await res.json());
            console.log("[ConfigService] loaded config:", this.config);
            return this.config;
        }
        catch (err) {
            console.error("[ConfigService] loadConfig error:", err);
            // fallback defaults
            this.config = {
                appName: "Corpdesk",
                fallbackTitle: "Corpdesk",
                appVersion: "0.0.0",
                appDescription: "",
                themeConfig: {
                    currentThemePath: "/themes/default/theme.json",
                    accessibleThemes: ["default", "dark"],
                },
                defaultModulePath: "sys/cd-user",
                logLevel: "debug",
                uiConfig: {
                    defaultUiSystemId: "bootstrap-538",
                    defaultThemeId: "default",
                    defaultFormVariant: "standard",
                    uiSystemBasePath: "/public/assets/ui-systems/",
                },
            };
            return this.config;
        }
    }
    // ===================================================================
    // SHELL CONFIG RESOLUTION
    // ===================================================================
    async loadShellConfig(consumerProfile, userProfile) {
        // const baseConfig = await this.loadStaticShellConfig();
        const baseConfig = await this.loadConfig();
        const withConsumer = this.applyConsumerShellConfig(baseConfig, consumerProfile?.shellConfig);
        const finalConfig = this.applyUserShellConfigWithPolicy(withConsumer, userProfile?.shellConfig, consumerProfile?.shellConfig);
        return finalConfig;
    }
    async resolveShellConfig(consumerProfile, userProfile) {
        const base = await this.loadConfig();
        // 1. Apply consumer defaults
        const withConsumer = this.applyConsumerShellConfig(base, consumerProfile?.shellConfig);
        // 2. Apply user overrides (if allowed)
        const final = this.applyUserShellConfigWithPolicy(withConsumer, userProfile?.shellConfig, consumerProfile?.shellConfig);
        return final;
    }
    applyConsumerShellConfig(base, consumerShell) {
        if (!consumerShell)
            return base;
        return {
            ...base,
            ...consumerShell,
            uiConfig: {
                ...base.uiConfig,
                ...consumerShell.uiConfig,
            },
            themeConfig: {
                ...base.themeConfig,
                ...consumerShell.themeConfig,
            },
        };
    }
    applyUserShellConfigWithPolicy(base, userShell, consumerShell) {
        if (!userShell || !consumerShell)
            return base;
        const lockDown = consumerShell.lockDown ?? {};
        const allowed = consumerShell.allowedOptions ?? {};
        const resolveValue = (locked, allowedValues, userValue, baseValue) => {
            // Hard lock → ignore user
            if (locked)
                return baseValue;
            // No user value → keep base
            if (userValue === undefined)
                return baseValue;
            // Allowed list exists → validate
            if (allowedValues && !allowedValues.includes(userValue)) {
                console.info("[ConfigService] user value rejected by allowedOptions", userValue);
                return baseValue;
            }
            // Accept user value
            return userValue;
        };
        return {
            ...base,
            uiConfig: {
                ...base.uiConfig,
                // ----------------------------
                // UI SYSTEM
                // ----------------------------
                defaultUiSystemId: resolveValue(lockDown.uiSystem, allowed.uiSystems, userShell.uiConfig?.defaultUiSystemId, base.uiConfig.defaultUiSystemId),
                // ----------------------------
                // THEME
                // ----------------------------
                defaultThemeId: resolveValue(lockDown.theme, allowed.themes, userShell.uiConfig?.defaultThemeId, base.uiConfig.defaultThemeId),
                // ----------------------------
                // FORM VARIANT
                // ----------------------------
                defaultFormVariant: resolveValue(lockDown.formVariant, allowed.formVariants, userShell.uiConfig?.defaultFormVariant, base.uiConfig.defaultFormVariant),
            },
        };
    }
    /**
     * Convenience: returns uiConfig. Ensure loadConfig() called before.
     */
    getUiConfig() {
        if (!this.config) {
            throw new Error("ConfigService: config not loaded; call loadConfig()");
        }
        return this.config.uiConfig;
    }
    /////////////////////////////////////////
    // SUBSCRIPTION-BASED CONFIG UPDATES
    /////////////////////////////////////////
    /**
     * PHASE 1
     * Loads shell.config.json and seeds SysCacheService
     * without changing legacy behavior.
     */
    async seedStaticShellConfig(sysCache) {
        console.log("%c[PHASE 1][ConfigService] Loading static shell config", "color:#4CAF50;font-weight:bold");
        const shellConfig = await this.loadShellConfig();
        console.log("%c[PHASE 1][ConfigService] Seeding static config into SysCache", "color:#4CAF50");
        sysCache.set("shellConfig", shellConfig, "static");
        sysCache.set("envConfig", shellConfig.envConfig || {}, "static");
        sysCache.set("uiConfig", shellConfig.uiConfig || {}, "static");
        console.log("%c[PHASE 1][ConfigService] Static shell config seeded", "color:#4CAF50", {
            hasEnv: !!shellConfig.envConfig,
            hasUi: !!shellConfig.uiConfig,
        });
        return shellConfig;
    }
}
