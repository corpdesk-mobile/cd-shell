// src/CdShell/adm/admin/services/cd-admin.service.ts

import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { AdminConfigModel, IAdminConfig } from "../models/cd-admin.model";

// --- Universal Form Variants Definition (or external configuration) ---
const FORM_VARIANTS = [
  { id: "standard", name: "Standard" },
  { id: "compact", name: "Compact" },
  { id: "floating", name: "Floating Labels" },
];

/**
 * Service to handle persistence and retrieval of global Admin configuration.
 */
export class CdAdminService {
  private config = new AdminConfigModel();
  private uiSystemLoader!:UiSystemLoaderService;

  constructor(private sysCache: SysCacheService) {
    this.uiSystemLoader = new UiSystemLoaderService(this.sysCache)
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

  // -------------------------------------------------------------------
  // 1. UI System Options
  // -------------------------------------------------------------------

  /**
   * Generates the HTML string for the UI System <select> options.
   *
   * @param activeSystemId The ID of the currently active UI system (from shell.config.json).
   */
  // generateUiSystemOptions(activeSystemId: string): string {
  //   const systems = this.uiSystemLoader.list();
  //   let optionsHtml = '<option value="">-- Select UI System --</option>';

  //   if (!systems || systems.length === 0) {
  //     return '<option value="">-- No UI Systems Available --</option>';
  //   }

  //   systems.forEach(system => {
  //     const isSelected = system.id === activeSystemId ? 'selected' : '';
  //     // Use system.name for display and system.id for the value
  //     optionsHtml += `<option value="${system.id}" ${isSelected}>${system.name || system.id}</option>`;
  //   });

  //   return optionsHtml;
  // }
  generateUiSystemOptions(activeSystemId: string): string {
    console.log("[CdAdminService][generateUiSystemOptions] start");
    // 1. Get the list of systems (which is populated synchronously by the manual register fallback)
    const systems = this.uiSystemLoader.list();
    
    // Default options string should always be defined
    let optionsHtml = '<option value="">-- Select UI System --</option>';
    console.log("[CdAdminService][generateUiSystemOptions] optionsHtml", optionsHtml);

    // 2. The registry is populated via the synchronous fallback, so systems.length should be > 0.
    if (!systems || systems.length === 0) {
      // This is the fallback for a total system failure.
      return '<option value="">-- No UI Systems Available --</option>';
    }

    // 3. Generate options from the available list
    systems.forEach(system => {
      const isSelected = system.id === activeSystemId ? 'selected' : '';
      optionsHtml += `<option value="${system.id}" ${isSelected}>${system.name || system.id}</option>`;
    });
    console.log("[CdAdminService][generateUiSystemOptions] optionsHtml", optionsHtml);
    return optionsHtml;
  }

  // -------------------------------------------------------------------
  // 2. Theme Options (Existing Method)
  // -------------------------------------------------------------------

  /**
   * Generates the HTML string for the Theme <select> options for a given UI system ID.
   *
   * @param uiSystemId The ID of the currently selected UI System (e.g., 'bootstrap-502').
   * @param activeThemeId The ID of the currently active theme (to pre-select the option).
   */
  generateThemeOptions(uiSystemId: string, activeThemeId: string): string {
    const system = this.uiSystemLoader.getSystemById(uiSystemId);

    // Explicitly reference the 'themesAvailable' array
    const availableThemes = system?.themesAvailable;

    if (!system || !availableThemes || availableThemes.length === 0) {
      return '<option value="">-- No Themes Available --</option>';
    }

    let optionsHtml = '<option value="">-- Select Theme --</option>';

    availableThemes.forEach((theme) => {
      const isSelected = theme.id === activeThemeId ? "selected" : "";
      optionsHtml += `<option value="${theme.id}" ${isSelected}>${theme.name}</option>`;
    });

    return optionsHtml;
  }

  // -------------------------------------------------------------------
  // 3. Form Variant Options
  // -------------------------------------------------------------------

  /**
   * Generates the HTML string for the Form Variant <select> options.
   *
   * @param activeVariantId The ID of the currently active form variant (e.g., 'standard').
   */
  generateFormVariantOptions(activeVariantId: string): string {
    const variants = FORM_VARIANTS;
    let optionsHtml = '<option value="">-- Select Form Variant --</option>';
    
    // Note: In a complex system, these variants could also be loaded dynamically 
    // based on the active UI System's descriptor. For now, we use a static list.

    variants.forEach(variant => {
      const isSelected = variant.id === activeVariantId ? 'selected' : '';
      optionsHtml += `<option value="${variant.id}" ${isSelected}>${variant.name}</option>`;
    });

    return optionsHtml;
  }
  
}
