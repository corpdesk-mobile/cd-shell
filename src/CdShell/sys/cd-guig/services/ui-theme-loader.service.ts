import { loadStyle } from "../../../utils/load-style.service";
import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-theme-descriptor.model";
import { UiConfig } from "../../moduleman/models/config.model";
import { ConfigService } from "../../moduleman/services/config.service";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { UiSystemSchema } from "../models/ui-system-schema.model";

export class UiThemeLoaderService {
  // private static readonly ACTIVE_THEME_KEY = "cd-active-theme-id";

  private static readonly ACTIVE_THEME_KEY = "cd-active-theme-id";
  // NEW: Key for storing the active form variant
  private static readonly ACTIVE_FORM_VARIANT_KEY = "cd-active-form-variant";

  private configService = new ConfigService();

  constructor(private sysCache: SysCacheService) {
    // this.sysCache is now the data source.
  }

  /**
   * NEW METHOD: Bootstraps the Theme Loader and applies initial settings.
   * 1. Reads configuration defaults.
   * 2. Checks localStorage for existing user choices.
   * 3. Loads and activates the saved or default theme/form variant.
   */
  async bootstrap(): Promise<void> {
    // const uiConfig = this.configService.getUiConfig(); // Config must be loaded beforehand

    // 1. Load configuration defaults
    const uiConfig: UiConfig = await this.configService.loadConfig();
    console.log("[UiSystemLoaderService][bootstrap] uiConfig:", uiConfig);

    // --- 1. Initialize Active Theme ---
    let activeThemeId = this.getActiveThemeId();
    if (!activeThemeId) {
      // If no theme is saved in localStorage, use the default from config
      activeThemeId = uiConfig.defaultThemeId;
      this.setActiveThemeId(activeThemeId); // Persist the default
    }

    // Attempt to load the final active theme asset (if necessary for global styling)
    // NOTE: The main system activation logic might already load the theme, but
    // this ensures persistence and state is set early.
    try {
      await this.loadThemeById(activeThemeId);
    } catch (e) {
      console.warn(
        `[UiThemeLoaderService] Failed to load default theme assets for ID: ${activeThemeId}`
      );
    }

    // --- 2. Initialize Form Variant ---
    let activeVariantId = this.getActiveFormVariantId();
    if (
      activeVariantId === "standard" &&
      uiConfig.defaultFormVariant !== "standard"
    ) {
      // Only override if the persisted value is the hardcoded default "standard"
      // AND the config is different.
      activeVariantId = uiConfig.defaultFormVariant;
      this.setActiveFormVariantId(activeVariantId); // Persist the default
    }

    // Load the active form variant asset
    try {
      await this.loadFormVariant(activeVariantId);
    } catch (e) {
      console.warn(
        `[UiThemeLoaderService] Failed to load default form variant: ${activeVariantId}`
      );
    }

    console.log(
      `[UiThemeLoaderService] Bootstrapped. Theme: ${this.getActiveThemeId()}, Variant: ${this.getActiveFormVariantId()}`
    );
  }

  /**
   * ⭐ fetchAvailableThemes: Now takes the pre-loaded config (uiConfig: UiConfig).
   */
  async fetchAvailableThemes(uiConfig: UiConfig): Promise<any> {
    console.log(
      "[UiThemeLoaderService][fetchAvailableThemes] starting async data load."
    );

    // 1. Configuration is provided by SysCacheService.

    // 2. Simulate Discovery/Configuration based on uiConfig.
    const themesData = [
      { id: uiConfig.defaultThemeId, name: "Default Theme (from config)" },
      { id: "dark", name: "Dark Mode" },
      // ...
    ];

    const variantsData = [
      { id: "standard", name: "Standard" },
      { id: "rounded", name: "Rounded" },
      { id: "outlined", name: "Outlined" },
    ];

    return {
      themes: themesData,
      variants: variantsData,
      uiConfig: uiConfig,
    };
  }

  listThemes(): any[] {
    const data = this.sysCache.get("themes");
    return data?.themes || [];
  }

  listFormVariants(): any[] {
    const data = this.sysCache.get("themes");
    return data?.variants || [];
  }

  /**
   * Loads all available theme assets defined in a UiSystemSchema for the purpose
   * of runtime theme switching.
   *
   * @param system The descriptor containing the list of available themes.
   */
  async loadAvailableThemes(system: UiSystemSchema): Promise<void> {
    // NOTE: This method should be revised if the intent is to load ALL theme assets
    // into memory at once, which is typically avoided in production.
    // For now, we update it to use the correct 'stylesheets' property.

    const availableThemes = system.themes;

    if (!availableThemes || availableThemes.length === 0) {
      console.warn(
        `[UiThemeLoaderService] No themes found for ${system.displayName}`
      );
      return;
    }

    for (const theme of availableThemes) {
      // FIX: Check for the 'stylesheets' array and iterate over paths
      if (theme.stylesheets) {
        for (const path of theme.stylesheets) {
          // In a real app, you might only load the active theme,
          // or load all stylesheets with unique IDs for easy removal/switching.
          await loadStyle(path);
          console.debug(
            `[UiThemeLoaderService] Pre-loaded theme asset: ${theme.name} (${path})`
          );
        }
      }
    }
  }

  /**
   * Loads a specific theme by ID and persists it as the active theme.
   * This is intended to be called when the user selects a theme in the GUI.
   */
  // async loadThemeById(themeId: string): Promise<void> {
  //   // In a real scenario, this would:
  //   // 1. Find the full UiThemeDescriptor for themeId.
  //   // 2. Remove old theme stylesheets.
  //   // 3. Inject new theme stylesheets (theme.stylesheets).

  //   // For now, we only persist the selection:
  //   this.setActiveThemeId(themeId);

  //   // Example path loading (assuming common theme structure):
  //   const path = `/themes/common/style/${themeId}.css`;
  //   await loadStyle(path);
  //   console.debug(
  //     `[UiThemeLoaderService] Active theme asset loaded: ${themeId}`
  //   );
  // }
  async loadThemeById(themeId: string): Promise<void> {
    // In a real scenario, this would:
    // 1. Find the full UiThemeDescriptor for themeId.
    // 2. Remove old theme stylesheets.
    // 3. Inject new theme stylesheets (theme.stylesheets).
    // ... (persists selection) ...
    this.setActiveThemeId(themeId);

    // FIX: Updated path to point to the theme-specific theme.css file
    const path = `/themes/${themeId}/theme.css`;

    // Fallback: Check if the theme is part of a UI System that loaded it already
    // If not, proceed to load the asset manually.
    await loadStyle(path);
    console.debug(
      `[UiThemeLoaderService] Active theme asset loaded: ${themeId}`
    );
  }

  // -------------------------------------------------------------------
  // State Management Implementation (Resolves Point 2)
  // -------------------------------------------------------------------

  // /**
  //  * Returns the ID of the theme currently selected and persisted in storage.
  //  * Resolves the method used by CdAdminService.
  //  */
  // getActiveThemeId(): string {
  //   // Retrieve the ID from localStorage, defaulting to an empty string if not set.
  //   return localStorage.getItem(UiThemeLoaderService.ACTIVE_THEME_KEY) || "";
  // }
  /**
   * Returns the ID of the theme currently selected and persisted in storage.
   */
  getActiveThemeId(): string {
    // Retrieve the ID from localStorage, defaulting to an empty string if not set.
    return localStorage.getItem(UiThemeLoaderService.ACTIVE_THEME_KEY) || "";
  }

  /**
   * Persists the newly selected active theme ID.
   */
  setActiveThemeId(themeId: string): void {
    localStorage.setItem(UiThemeLoaderService.ACTIVE_THEME_KEY, themeId);
  }

  // -------------------------------------------------------------------
  // Original methods remain, with minor fixes if applicable
  // -------------------------------------------------------------------

  // /**
  //  * Loads a specific form variant (standard, rounded, outlined, etc.)
  //  */
  // async loadFormVariant(formType = "standard"): Promise<void> {
  //   const path = `/themes/common/forms/variants/cd-form-${formType}.css`;
  //   await loadStyle(path);
  //   localStorage.setItem("cd-form-variant", formType);
  //   console.debug(`[UiThemeLoaderService] Form variant loaded: ${formType}`);
  // }

  // -------------------------------------------------------------------
  // NEW: Form Variant State Management
  // -------------------------------------------------------------------

  // /**
  //  * Returns the ID of the form variant currently selected and persisted in storage.
  //  */
  // getActiveFormVariantId(): string {
  //   // Retrieve the ID from localStorage, defaulting to 'standard' if not set.
  //   return (
  //     localStorage.getItem(UiThemeLoaderService.ACTIVE_FORM_VARIANT_KEY) ||
  //     "standard"
  //   );
  // }

  /**
   * Returns the ID of the form variant currently selected and persisted in storage.
   */
  getActiveFormVariantId(): string {
    // Retrieve the ID from localStorage, defaulting to 'standard' if not set.
    return (
      localStorage.getItem(UiThemeLoaderService.ACTIVE_FORM_VARIANT_KEY) ||
      "standard"
    );
  }

  /**
   * Persists the newly selected active form variant ID.
   */
  setActiveFormVariantId(variantId: string): void {
    localStorage.setItem(
      UiThemeLoaderService.ACTIVE_FORM_VARIANT_KEY,
      variantId
    );
  }

  /**
   * Loads a specific form variant (standard, rounded, outlined, etc.)
   * This method remains async and returns void, as its job is to perform an action (load CSS).
   * It now uses the new state management methods.
   */
  async loadFormVariant(formType = "standard"): Promise<void> {
    const path = `/themes/common/forms/variants/cd-form-${formType}.css`;
    await loadStyle(path);

    // Use the new setter method
    this.setActiveFormVariantId(formType);
    console.debug(`[UiThemeLoaderService] Form variant loaded: ${formType}`);
  }
}
