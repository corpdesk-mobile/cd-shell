export interface ShellConfig {
  appName: string;
  fallbackTitle: string;
  themeConfig: string;
  defaultModulePath: string;
  defaultLanguage?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logToFile?: boolean;
  logFilePath?: string;
  logFileName?: string;
  logFileMaxSize?: number;
  logFileMaxFiles?: number;
}
