export interface ShellConfig {
  appName: string;
  fallbackTitle: string;
  themeConfig: ThemeConfig;
  defaultModulePath: string;
  defaultLanguage?: string;
  logLevel?: "debug" | "info" | "warn" | "error";
  logToFile?: boolean;
  logFilePath?: string;
  logFileName?: string;
  logFileMaxSize?: number;
  logFileMaxFiles?: number;
}

export interface ThemeConfig {
  currentThemePath: string;
  accessibleThemes: string[];
}
