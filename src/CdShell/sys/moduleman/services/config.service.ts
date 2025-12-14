// import { ShellConfig } from "../../base";
import { UserService } from "../../cd-user/services/user.service";
import { IShellConfig, UiConfig } from "../models/config.model";
import { ConsumerService } from "./consumer.service";

// ConfigService (singleton)
export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: IShellConfig | null = null;
  private readonly CONFIG_PATH = "/shell.config.json";

  constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async loadConfig(): Promise<IShellConfig> {
    if (this.config) return this.config;

    try {
      const res = await fetch(this.CONFIG_PATH);
      if (!res.ok) throw new Error(`Failed to load config ${res.status}`);
      this.config = (await res.json()) as IShellConfig;
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
      } as IShellConfig;
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

  // async getEffectiveShellConfig(
  //   userId?: number,
  //   tenantId?: number
  // ): Promise<IShellConfig> {
  //   const svConsumer = new ConsumerService();
  //   const svUser = new UserService();
  //   // 1. Load consumer config (local cache or backend)
  //   const consumerCfg = await svConsumer.getShellConfig(tenantId);
  //   // 2. Load user profile
  //   const userProfile = await svUser.getUserProfile(userId);

  //   // base: shell file defaults
  //   const appShell = await AppShellConfigService.get(); // reads shellconfig.json or shell cache

  //   // Start with app defaults
  //   const effective: IShellConfig = deepClone(appShell);

  //   // Apply consumer-level overrides and policies
  //   if (consumerCfg?.uiConfig) {
  //     merge(effective.uiConfig, consumerCfg.uiConfig);
  //     // push policy into effective for use by UI
  //     effective.uiConfig = {
  //       ...effective.uiConfig,
  //       policy: consumerCfg.uiConfig.policy,
  //     };
  //   }
  //   if (consumerCfg?.themeConfig) {
  //     effective.themeConfig = {
  //       ...effective.themeConfig,
  //       ...(consumerCfg.themeConfig || {}),
  //     };
  //   }

  //   // Apply user preferences only if allowed
  //   if (
  //     userProfile?.shellConfig &&
  //     effective.themeConfig?.allowUserSelection !== false &&
  //     !effective.themeConfig?.policy?.locked
  //   ) {
  //     // Merge but keep consumer policy constraints
  //     const userPref = userProfile.shellConfig;
  //     // enforce allowed lists:
  //     if (effective.uiConfig?.policy?.allowedUiSystems?.length) {
  //       if (
  //         userPref.uiConfig?.defaultUiSystemId &&
  //         effective.uiConfig.policy.allowedUiSystems.includes(
  //           userPref.uiConfig.defaultUiSystemId
  //         )
  //       ) {
  //         effective.uiConfig.defaultUiSystemId =
  //           userPref.uiConfig.defaultUiSystemId;
  //       }
  //     } else if (userPref.uiConfig?.defaultUiSystemId) {
  //       effective.uiConfig.defaultUiSystemId =
  //         userPref.uiConfig.defaultUiSystemId;
  //     }
  //     // same for theme
  //     if (userPref.themeConfig?.defaultThemeId) {
  //       // ensure allowed by consumer policy
  //       const allowed =
  //         effective.themeConfig?.policy?.allowedThemeIds ??
  //         effective.themeConfig?.accessibleThemes;
  //       if (!allowed || allowed.includes(userPref.themeConfig.defaultThemeId)) {
  //         effective.themeConfig.defaultThemeId =
  //           userPref.themeConfig.defaultThemeId;
  //       }
  //     }
  //   }

  //   return effective;
  // }
}
