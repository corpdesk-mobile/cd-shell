// import { ShellConfig } from "../../base";
import { IShellConfig } from "../../base";
import {
  IUserProfile,
  IUserShellConfig,
} from "../../cd-user/models/user.model";
import { UserService } from "../../cd-user/services/user.service";
import { UiConfig } from "../models/config.model";
import {
  IConsumerProfile,
  IConsumerShellConfig,
} from "../models/consumer.model";
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

  // ===================================================================
  // SHELL CONFIG RESOLUTION
  // ===================================================================

  async loadShellConfig(
    consumerProfile?: IConsumerProfile,
    userProfile?: IUserProfile
  ): Promise<IUserShellConfig> {
    // const baseConfig = await this.loadStaticShellConfig();
    const baseConfig = await this.loadConfig();

    // const withConsumer = this.mergeShellConfig(
    //   baseConfig,
    //   consumerProfile?.shellConfig
    // );

    const withConsumer = this.applyConsumerShellConfig(
      baseConfig,
      consumerProfile?.shellConfig
    );

    // const finalConfig = this.mergeShellConfigWithPolicy(
    //   withConsumer,
    //   userProfile?.shellConfig,
    //   consumerProfile?.shellConfig
    // );
    const finalConfig = this.applyUserShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return finalConfig;
  }

  async resolveShellConfig(
    consumerProfile?: IConsumerProfile | null,
    userProfile?: IUserProfile | null
  ): Promise<IUserShellConfig> {
    const base = await this.loadConfig();

    // 1. Apply consumer defaults
    const withConsumer = this.applyConsumerShellConfig(
      base,
      consumerProfile?.shellConfig
    );

    // 2. Apply user overrides (if allowed)
    const final = this.applyUserShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return final;
  }

  // private mergeShellConfig(
  //   base: IUserShellConfig,
  //   override?: Partial<IUserShellConfig>
  // ): IUserShellConfig {
  //   if (!override) return base;

  //   return {
  //     ...base,
  //     ...override,
  //     uiConfig: {
  //       ...base.uiConfig,
  //       ...override.uiConfig,
  //     },
  //     themeConfig: {
  //       ...base.themeConfig,
  //       ...override.themeConfig,
  //     },
  //   };
  // }
  private applyConsumerShellConfig(
    base: IUserShellConfig,
    consumerShell?: IConsumerShellConfig
  ): IUserShellConfig {
    if (!consumerShell) return base;

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

  // private mergeShellConfigWithPolicy(
  //   base: IUserShellConfig,
  //   userShell?: Partial<IUserShellConfig>,
  //   consumerShell?: IConsumerShellConfig
  // ): IUserShellConfig {
  //   if (!userShell || !consumerShell) return base;

  //   const lockDown = consumerShell.lockDown || {};

  //   return {
  //     ...base,

  //     uiConfig: {
  //       ...base.uiConfig,

  //       // ---------------------------------------
  //       // UI SYSTEM
  //       // ---------------------------------------
  //       defaultUiSystemId: lockDown.uiSystem
  //         ? base.uiConfig.defaultUiSystemId
  //         : (userShell.uiConfig?.defaultUiSystemId ??
  //           base.uiConfig.defaultUiSystemId),

  //       // ---------------------------------------
  //       // THEME
  //       // ---------------------------------------
  //       defaultThemeId: lockDown.theme
  //         ? base.uiConfig.defaultThemeId
  //         : (userShell.uiConfig?.defaultThemeId ??
  //           base.uiConfig.defaultThemeId),

  //       // ---------------------------------------
  //       // FORM VARIANT
  //       // ---------------------------------------
  //       defaultFormVariant: lockDown.formVariant
  //         ? base.uiConfig.defaultFormVariant
  //         : (userShell.uiConfig?.defaultFormVariant ??
  //           base.uiConfig.defaultFormVariant),
  //     },
  //   };
  // }
  private applyUserShellConfigWithPolicy(
    base: IUserShellConfig,
    userShell?: Partial<IUserShellConfig>,
    consumerShell?: IConsumerShellConfig
  ): IUserShellConfig {
    if (!userShell || !consumerShell) return base;

    const lockDown = consumerShell.lockDown ?? {};
    const allowed = consumerShell.allowedOptions ?? {};

    const resolveValue = <T>(
      locked: boolean | undefined,
      allowedValues: T[] | undefined,
      userValue: T | undefined,
      baseValue: T
    ): T => {
      // Hard lock → ignore user
      if (locked) return baseValue;

      // No user value → keep base
      if (userValue === undefined) return baseValue;

      // Allowed list exists → validate
      if (allowedValues && !allowedValues.includes(userValue)) {
        console.info(
          "[ConfigService] user value rejected by allowedOptions",
          userValue
        );
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
        defaultUiSystemId: resolveValue(
          lockDown.uiSystem,
          allowed.uiSystems,
          userShell.uiConfig?.defaultUiSystemId,
          base.uiConfig.defaultUiSystemId
        ),

        // ----------------------------
        // THEME
        // ----------------------------
        defaultThemeId: resolveValue(
          lockDown.theme,
          allowed.themes,
          userShell.uiConfig?.defaultThemeId,
          base.uiConfig.defaultThemeId
        ),

        // ----------------------------
        // FORM VARIANT
        // ----------------------------
        defaultFormVariant: resolveValue(
          lockDown.formVariant,
          allowed.formVariants,
          userShell.uiConfig?.defaultFormVariant,
          base.uiConfig.defaultFormVariant
        ),
      },
    };
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
