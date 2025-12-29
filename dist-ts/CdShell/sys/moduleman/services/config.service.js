// import { ShellConfig } from "../../base";
import { LoggerService } from "../../../utils/logger.service";
// ConfigService (singleton)
export class ConfigService {
    static { this.instance = null; }
    constructor() {
        this.logger = new LoggerService();
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
        this.logger.debug("[ConfigService.resolveShellConfig] start");
        const base = await this.loadConfig();
        // --------------------------------------------------
        // STRUCTURAL VALIDATION (TYPE + RUNTIME)
        // --------------------------------------------------
        const hasConsumerShellConfig = !!consumerProfile &&
            typeof consumerProfile === "object" &&
            typeof consumerProfile.shellConfig === "object" &&
            consumerProfile.shellConfig !== null;
        const hasUserShellConfig = !!userProfile &&
            typeof userProfile === "object" &&
            typeof userProfile.shellConfig === "object" &&
            userProfile.shellConfig !== null;
        // --------------------------------------------------
        // OBSERVABILITY (EXPLICIT DEGRADATION SIGNALS)
        // --------------------------------------------------
        this.logger.info("[ConfigService.resolveShellConfig] input integrity", {
            hasConsumerProfile: !!consumerProfile,
            hasConsumerShellConfig,
            hasUserProfile: !!userProfile,
            hasUserShellConfig,
        });
        if (consumerProfile && !hasConsumerShellConfig) {
            this.logger.error("[ConfigService.resolveShellConfig] consumerProfile present but shellConfig missing or invalid", {
                consumerProfile,
                degradation: "Consumer policy ignored",
            });
        }
        if (userProfile && !hasUserShellConfig) {
            this.logger.warn("[ConfigService.resolveShellConfig] userProfile present but shellConfig missing or invalid", {
                userProfile,
                degradation: "User overrides ignored",
            });
        }
        // --------------------------------------------------
        // EFFECTIVE POLICY INPUTS
        // --------------------------------------------------
        const consumerShellConfig = hasConsumerShellConfig
            ? consumerProfile.shellConfig
            : undefined;
        const userShellConfig = hasUserShellConfig
            ? userProfile.shellConfig
            : undefined;
        // --------------------------------------------------
        // CONFIG RESOLUTION PIPELINE
        // --------------------------------------------------
        // 1. Apply consumer defaults (if valid)
        const withConsumer = this.applyConsumerShellConfig(base, consumerShellConfig);
        // 2. Apply user overrides (policy-aware)
        const final = this.applyUserShellConfigWithPolicy(withConsumer, userShellConfig, consumerShellConfig);
        this.logger.debug("[ConfigService.resolveShellConfig] resolved", final);
        return final;
    }
    hasValidConsumerShellConfig(consumerProfile) {
        return !!(consumerProfile &&
            typeof consumerProfile === "object" &&
            consumerProfile.shellConfig &&
            typeof consumerProfile.shellConfig === "object");
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
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] start");
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] base:", base);
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] userShell:", userShell);
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] consumerShell:", consumerShell);
        if (!userShell) {
            this.logger.debug("[ConfigService] No user shell config → base config retained");
            return base;
        }
        // USER_ONLY context → allow user overrides fully
        if (!consumerShell) {
            this.logger.info("[ConfigService] USER_ONLY context → applying unrestricted user shell config");
            return {
                ...base,
                ...userShell,
                uiConfig: {
                    ...base.uiConfig,
                    ...userShell.uiConfig,
                },
                themeConfig: {
                    ...base.themeConfig,
                    ...userShell.themeConfig,
                },
            };
        }
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] userProfile and consumerProfile present → enforcing lockDown and allowedOptions");
        const lockDown = consumerShell.lockDown ?? {};
        const allowed = consumerShell.allowedOptions ?? {};
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] lockDown:", lockDown);
        this.logger.debug("[ConfigService.applyUserShellConfigWithPolicy()] allowed:", allowed);
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
    // ConfigService.ts
    // public async promoteResolvedShellConfig(
    //   cache: SysCacheService,
    //   consumerProfile?: IConsumerProfile | null,
    //   userProfile?: IUserProfile | null
    // ): Promise<IUserShellConfig> {
    //   this.logger.debug("[ConfigService.promoteResolvedShellConfig()] start");
    //   this.logger.debug(
    //     "[ConfigService.promoteResolvedShellConfig()] consumerProfile:",
    //     consumerProfile
    //   );
    //   this.logger.debug(
    //     "[ConfigService.promoteResolvedShellConfig()] userProfile:",
    //     userProfile
    //   );
    //   const resolutionMode = this.classifyResolutionContext(
    //     consumerProfile,
    //     userProfile
    //   );
    //   this.logger.info("[ConfigService] Resolution context", {
    //     mode: resolutionMode,
    //     hasConsumer: !!consumerProfile,
    //     hasUser: !!userProfile,
    //   });
    //   console.groupCollapsed(
    //     "%c[PHASE 2][ConfigService] Promote resolved shell config",
    //     "color:#4CAF50"
    //   );
    //   const resolved = await this.resolveShellConfig(
    //     consumerProfile,
    //     userProfile
    //   );
    //   console.log("[PHASE 2] resolvedShellConfig:", resolved);
    //   cache.set("shellConfig", resolved, "consumer");
    //   cache.set("envConfig", resolved.envConfig || {}, "consumer");
    //   cache.set("uiConfig", resolved.uiConfig || {}, "consumer");
    //   console.log("[PHASE 2] Cache promotion complete");
    //   console.groupEnd();
    //   return resolved;
    // }
    async promoteResolvedShellConfig(cache, consumerProfile, userProfile) {
        this.logger.debug("[ConfigService.promoteResolvedShellConfig] start");
        const resolutionMode = this.classifyResolutionContext(consumerProfile, userProfile);
        this.logger.debug("[ConfigService.promoteResolvedShellConfig] resolutionMode:", resolutionMode);
        const cacheSource = this.mapResolutionModeToCacheSource(resolutionMode);
        console.groupCollapsed("%c[PHASE 2][ConfigService] Promote resolved shell config", "color:#4CAF50");
        this.logger.info("[PHASE 2] Resolution context", {
            resolutionMode,
            cacheSource,
            hasConsumer: !!consumerProfile,
            hasUser: !!userProfile,
        });
        const resolvedShellConfig = await this.resolveShellConfig(consumerProfile, userProfile);
        console.log("[PHASE 2] resolvedShellConfig:", resolvedShellConfig);
        // 🔒 Cache provenance is now explicit and valid
        cache.set("shellConfig", resolvedShellConfig, cacheSource);
        cache.set("envConfig", resolvedShellConfig.envConfig || {}, cacheSource);
        cache.set("uiConfig", resolvedShellConfig.uiConfig || {}, cacheSource);
        console.log("[PHASE 2] Cache promotion complete", { cacheSource });
        console.groupEnd();
        return resolvedShellConfig;
    }
    classifyResolutionContext(consumerProfile, userProfile) {
        if (consumerProfile && userProfile)
            return "FULL_CONTEXT";
        if (consumerProfile && !userProfile)
            return "CONSUMER_ONLY";
        if (!consumerProfile && userProfile)
            return "USER_ONLY";
        return "STATIC_ONLY";
    }
    mapResolutionModeToCacheSource(mode) {
        switch (mode) {
            case "STATIC_ONLY":
                return "static";
            case "CONSUMER_ONLY":
                return "consumer";
            case "USER_ONLY":
                return "user";
            case "FULL_CONTEXT":
                // user overrides consumer overrides static
                return "user";
            default:
                return "static";
        }
    }
}
