export class ConfigService {
    constructor() {
        this.config = null;
        this.CONFIG_PATH = "/shell.config.json";
    }
    /**
     * Loads the configuration file once.
     */
    async loadConfig() {
        console.log('[ConfigService][loadConfig] start');
        if (this.config) {
            return this.config.uiConfig;
        }
        console.log('[ConfigService][loadConfig] 01');
        try {
            console.log('[ConfigService][loadConfig] 02');
            const response = await fetch(this.CONFIG_PATH);
            console.log('[ConfigService][loadConfig] 03');
            console.log('[ConfigService][loadConfig] response:', response);
            if (!response.ok) {
                throw new Error(`Failed to load config from ${this.CONFIG_PATH}`);
            }
            console.log('[ConfigService][loadConfig] 04');
            this.config = (await response.json());
            console.log('[ConfigService][loadConfig] config:', this.config);
            console.log('[ConfigService][loadConfig] 05');
            return this.config.uiConfig;
        }
        catch (error) {
            console.error("[ConfigService] Error loading configuration:", error);
            // Provide sensible defaults if loading fails
            return {
                defaultUiSystemId: "bootstrap-5",
                defaultThemeId: "default",
                defaultFormVariant: "standard",
                uiSystemBasePath: "/public/assets/ui-systems/"
            };
        }
    }
    getUiConfig() {
        if (!this.config) {
            throw new Error("[ConfigService] Configuration not loaded. Call loadConfig() first.");
        }
        return this.config.uiConfig;
    }
}
