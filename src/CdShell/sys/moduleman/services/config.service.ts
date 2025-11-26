// import { ShellConfig } from "../../base";
import { ShellConfig, UiConfig } from "../models/config.model";

// export class ConfigService {
//   private config: ShellConfig | null = null;
//   private readonly CONFIG_PATH = "/shell.config.json";
//   private static instance: ConfigService | null = null;

//   static getInstance(): ConfigService {
//     if (!ConfigService.instance) {
//       ConfigService.instance = new ConfigService();
//     }
//     return ConfigService.instance;
//   }

//   /**
//    * Loads the configuration file once.
//    */
//   async loadConfig(): Promise<UiConfig> {
//     console.log("[ConfigService][loadConfig] start");
//     if (this.config) {
//       return this.config.uiConfig;
//     }
//     console.log("[ConfigService][loadConfig] 01");
//     try {
//       console.log("[ConfigService][loadConfig] 02");
//       const response = await fetch(this.CONFIG_PATH);
//       console.log("[ConfigService][loadConfig] 03");
//       console.log("[ConfigService][loadConfig] response:", response);
//       if (!response.ok) {
//         throw new Error(`Failed to load config from ${this.CONFIG_PATH}`);
//       }
//       console.log("[ConfigService][loadConfig] 04");
//       this.config = (await response.json()) as ShellConfig;
//       console.log("[ConfigService][loadConfig] config:", this.config);
//       console.log("[ConfigService][loadConfig] 05");
//       return this.config.uiConfig;
//     } catch (error) {
//       console.error("[ConfigService] Error loading configuration:", error);
//       // Provide sensible defaults if loading fails
//       return {
//         defaultUiSystemId: "bootstrap-502",
//         defaultThemeId: "default",
//         defaultFormVariant: "standard",
//         uiSystemBasePath: "/public/assets/ui-systems/",
//       };
//     }
//   }

//   getUiConfig(): UiConfig {
//     if (!this.config) {
//       throw new Error(
//         "[ConfigService] Configuration not loaded. Call loadConfig() first."
//       );
//     }
//     return this.config.uiConfig;
//   }
// }

// ConfigService (singleton)
export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: ShellConfig | null = null;
  private readonly CONFIG_PATH = "/shell.config.json";

  constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async loadConfig(): Promise<ShellConfig> {
    if (this.config) return this.config;

    try {
      const res = await fetch(this.CONFIG_PATH);
      if (!res.ok) throw new Error(`Failed to load config ${res.status}`);
      this.config = (await res.json()) as ShellConfig;
      console.log("[ConfigService] loaded config:", this.config);
      return this.config;
    } catch (err) {
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
      } as ShellConfig;
      return this.config;
    }
  }

  /**
   * Convenience: returns uiConfig. Ensure loadConfig() called before.
   */
  getUiConfig(): UiConfig {
    if (!this.config) {
      throw new Error("ConfigService: config not loaded; call loadConfig()");
    }
    return this.config.uiConfig;
  }
}
