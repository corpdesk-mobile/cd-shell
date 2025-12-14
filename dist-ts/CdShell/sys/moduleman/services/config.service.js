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
    /**
     * Convenience: returns uiConfig. Ensure loadConfig() called before.
     */
    getUiConfig() {
        if (!this.config) {
            throw new Error("ConfigService: config not loaded; call loadConfig()");
        }
        return this.config.uiConfig;
    }
}
