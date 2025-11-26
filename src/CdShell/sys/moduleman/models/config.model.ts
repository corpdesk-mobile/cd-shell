import { ThemeShellConfig } from "../../base";

/** Root Shell Configuration interface */
export interface ShellConfig {
  /** Name of the application */
  appName: string;

  uiConfig: UiConfig;

  /** Title to use when a specific page title is missing */
  fallbackTitle: string;

  /** Current version of the app */
  appVersion: string;

  /** Short description for metadata or UI */
  appDescription: string;

  /** Theming section */
  themeConfig: ThemeShellConfig;

  /** Default module route path (like sys/cd-user) */
  defaultModulePath: string;

  /** Log level for debugging */
  // logLevel: "debug" | "info" | "warn" | "error" | "silent";

  logLevel?: "debug" | "info" | "warn" | "error";
  logToFile?: boolean;
  logFilePath?: string;
  logFileName?: string;
  logFileMaxSize?: number;
  logFileMaxFiles?: number;
}

export interface UiConfig {
  defaultUiSystemId: string;
  defaultThemeId: string;
  defaultFormVariant: string;
  uiSystemBasePath: string;
  accessibleThemes?: string[];
}

export interface ShellConfig {
  appConfig: any;
  uiConfig: UiConfig;
}

export interface ShellConfig {
  appName: string;
  fallbackTitle: string;
  appVersion: string;
  appDescription: string;
  themeConfig: ThemeShellConfig;
  defaultModulePath: string;
  logLevel?: "debug" | "info" | "warn" | "error";
  uiConfig: {
    defaultUiSystemId: string;
    defaultThemeId: string;
    defaultFormVariant: string;
    uiSystemBasePath: string;
    accessibleThemes?: string[];
  };
  accessibleThemes?: string[];
}
