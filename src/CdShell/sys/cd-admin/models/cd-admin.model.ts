import config from "../../../../config";

/**
 * Defines the configuration state managed by the Admin module.
 * This will eventually house the active UI System and Theme settings.
 */
export interface IAdminConfig {
  activeUiSystemId: string;
  activeThemePath: string;
  // Add other global settings here later
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class AdminConfigModel implements IAdminConfig {
  activeUiSystemId: string = config.defaultUiConfig?.defaultUiSystemId || 'bootstrap-538';
  activeThemePath: string = '/themes/bootstrap-502/default.json';
  logLevel: 'debug' | 'info' | 'warn' | 'error' = 'debug';

  constructor(data?: Partial<IAdminConfig>) {
    Object.assign(this, data);
  }
}