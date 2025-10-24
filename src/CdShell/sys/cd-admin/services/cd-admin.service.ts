// src/CdShell/adm/admin/services/cd-admin.service.ts

import { AdminConfigModel, IAdminConfig } from "../models/cd-admin.model";

/**
 * Service to handle persistence and retrieval of global Admin configuration.
 */
export class AdminService {
  private config: AdminConfigModel;

  constructor() {
    // Load default or fetch from persistence layer (stubbed for now)
    this.config = new AdminConfigModel();
  }

  getConfig(): AdminConfigModel {
    // In a real system, this would fetch from a database or config file
    return this.config;
  }

  saveConfig(newConfig: IAdminConfig): Promise<void> {
    // Stub implementation: log the attempt
    console.log("[AdminService] Attempting to save configuration:", newConfig);
    Object.assign(this.config, newConfig);
    return Promise.resolve();
  }
}