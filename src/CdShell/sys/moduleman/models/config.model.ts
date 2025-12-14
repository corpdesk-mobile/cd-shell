// import { ThemeShellConfig } from "../../base";

import { EnvConfig } from "../../base";

/** Root Shell Configuration interface */
// export interface ShellConfig {
//   /** Name of the application */
//   appName: string;

//   uiConfig: UiConfig;

//   /** Title to use when a specific page title is missing */
//   fallbackTitle: string;

//   /** Current version of the app */
//   appVersion: string;

//   /** Short description for metadata or UI */
//   appDescription: string;

//   /** Theming section */
//   themeConfig: ThemeShellConfig;

//   /** Default module route path (like sys/cd-user) */
//   defaultModulePath: string;

//   /** Log level for debugging */
//   // logLevel: "debug" | "info" | "warn" | "error" | "silent";

//   logLevel?: "debug" | "info" | "warn" | "error";
//   logToFile?: boolean;
//   logFilePath?: string;
//   logFileName?: string;
//   logFileMaxSize?: number;
//   logFileMaxFiles?: number;
// }

export interface UiConfig {
  defaultUiSystemId: string;
  defaultThemeId: string;
  defaultFormVariant: string;
  uiSystemBasePath: string;
  accessibleThemes?: string[];
}

// export interface ShellConfig {
//   appConfig: any;
//   uiConfig: UiConfig;
// }

// export interface ShellConfig {
//   appName: string;
//   fallbackTitle: string;
//   appVersion: string;
//   appDescription: string;
//   themeConfig: ThemeShellConfig;
//   defaultModulePath: string;
//   logLevel?: "debug" | "info" | "warn" | "error";
//   uiConfig: {
//     defaultUiSystemId: string;
//     defaultThemeId: string;
//     defaultFormVariant: string;
//     uiSystemBasePath: string;
//     accessibleThemes?: string[];
//   };
//   accessibleThemes?: string[];
// }

////////////////////////////////////////////////////

// -------------------------------------------------------------
// THEME CONFIG (existing)
// -------------------------------------------------------------

export interface ThemeConfig {
  currentThemePath: string;
  accessibleThemes: string[];
}

// export interface ThemeShellConfig {
//   /** Path to the currently active theme */
//   currentThemePath: string;

//   /** List of themes available for selection */
//   accessibleThemes: string[];

//   /** If true, the end-user may select themes at runtime */
//   allowUserSelection?: boolean;

//   /** Default theme id, e.g. “dark”, “default”, “contrast” */
//   defaultThemeId?: string;

//   /**
//    * Optional UI-system mapping for advanced UI-system adaptation pipelines.
//    * Backward compatible.
//    */
//   uiSystem?: {
//     base: "bootstrap" | "material" | "antd" | "tailwind" | "corpdesk";
//     overrideCss?: boolean;
//     componentMap?: Record<string, string>;
//   };

//   /**
//    * NEW (Tenant Policy)
//    * Tenant may restrict user theme choices.
//    */
//   lockedThemes?: string[];

//   /**
//    * NEW (User Personalization)
//    * If false, user personalization is disabled even if allowUserSelection = true.
//    */
//   personalizationEnabled?: boolean;
// }
export interface ThemeShellConfig {
  /** Path to the ACTIVE theme json */
  currentThemePath: string;

  /** Themes available to this entity (user or consumer) */
  accessibleThemes: string[];

  /** If true, user can pick a theme manually */
  allowUserSelection?: boolean;

  /** Optional default theme */
  defaultThemeId?: string;

  /**
   * Optional UI System constraints
   * A consumer may restrict UI frameworks available to users.
   */
  uiSystem?: {
    base: "bootstrap" | "material" | "antd" | "tailwind" | "corpdesk";

    /** If true, system CSS overrides UI-System defaults */
    overrideCss?: boolean;

    /** Custom component mapping for per-ui-system translation */
    componentMap?: Record<string, string>;

    /** Consumer-level locking of allowed UI-systems */
    allowedUiSystems?: string[];

    /** Allow users to override UI-system */
    allowUserUiSystemSelection?: boolean;
  };

  /** Optional: additional restrictions for multi-tenant operation */
  policy?: {
    /** Lock all UI options (consumer-forced UX) */
    lockTheme?: boolean;
    lockUiSystem?: boolean;

    /** Prevent users from using custom form variants */
    lockFormVariant?: boolean;
  };
}

// -------------------------------------------------------------
// UI CONFIG — harmonized with your shellconfig.json
// -------------------------------------------------------------
export interface UiShellConfig {
  /** e.g. "material-design", "bootstrap-538" */
  defaultUiSystemId: string;

  /** e.g. "dark" */
  defaultThemeId: string;

  /** e.g. "standard", "filled", "outlined" */
  defaultFormVariant: string;

  /** Base directory for UI system descriptors */
  uiSystemBasePath: string;

  /**
   * NEW: tenant locks — restrict which UI systems users may choose.
   */
  lockedUiSystems?: string[];

  /**
   * NEW: user-level personalization control.
   */
  allowUserSelection?: boolean;

  /**
   * NEW: admin-only overrides
   */
  adminOverrideAllowed?: boolean;
}

// -------------------------------------------------------------
// FULL SHELL CONFIG — harmonized and non-breaking
// -------------------------------------------------------------
// export interface IShellConfig {
//   appName: string;
//   fallbackTitle: string;
//   appVersion: string;
//   appDescription: string;

//   themeConfig: ThemeShellConfig;

//   /** The default module loaded on startup */
//   defaultModulePath: string;

//   /** debug | info | warn | error */
//   logLevel: string;

//   /** UI system preferences */
//   uiConfig: UiShellConfig;

//   /**
//    * NEW:
//    * Marks configs originating from system, consumer, or user level.
//    */
//   source?: "system" | "consumer" | "user";
// }

export interface IShellConfig {
  appName: string;
  fallbackTitle: string;
  appVersion: string;
  appDescription: string;

  themeConfig: ThemeShellConfig;

  /** Module bootstrapping */
  defaultModulePath: string;

  /** debug | info | warn | error */
  logLevel: "debug" | "info" | "warn" | "error";

  uiConfig: {
    defaultUiSystemId: string; // e.g., material-design
    defaultThemeId: string; // e.g., dark
    defaultFormVariant: string; // e.g., standard | filled | outline
    uiSystemBasePath: string; // e.g., /assets/ui-systems/
  };

  splash: {
    enabled: boolean;
    path: string;
    minDuration: number;
  };

  envConfig?: EnvConfig;
}
