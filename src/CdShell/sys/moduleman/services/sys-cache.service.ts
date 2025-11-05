import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";

/**
 * SysCacheService
 * ---------------
 * Centralized cache for system-level data (UI systems, themes, variants).
 * Acts as the "kernel cache" of the Corpdesk shell.
 * 
 * Responsibilities:
 *  - Load & store all UI-related system data during boot (via loadAndCacheAll()).
 *  - Expose quick accessors for cached data (for controllers & loaders).
 *  - Ensure no redundant data fetching after boot.
 */
export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>();
  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

  public static getInstance(configService?: ConfigService): SysCacheService {
    if (!SysCacheService.instance) {
      if (!configService) {
        throw new Error("SysCacheService must be initialized with ConfigService on first call.");
      }
      SysCacheService.instance = new SysCacheService(configService);
    }
    return SysCacheService.instance;
  }

  public setLoaders(systemLoader: UiSystemLoaderService, themeLoader: UiThemeLoaderService): void {
    this._uiSystemLoader = systemLoader;
    this._uiThemeLoader = themeLoader;
  }

  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }
    if (this.cache.size > 0) return;

    console.log("[SysCacheService] 01: Starting Eager Load (Singleton)");

    const uiConfig = await this.configService.loadConfig();
    this.cache.set("uiConfig", uiConfig);

    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    // 🧩 Normalize system data
    const normalizedSystems = uiSystemsData.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.name, // unify naming for UI
      themesAvailable: sys.themesAvailable || [],
      themeActive: sys.themeActive || null,
    }));

    // 🧩 Normalize theme data
    const normalizedThemes = {
      themes: (uiThemesData.themes || []).map((t) => ({
        id: t.id,
        name: t.name,
        displayName: t.name,
      })),
      variants: (uiThemesData.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        displayName: v.name,
      })),
      uiConfig: uiThemesData.uiConfig,
    };

    this.cache.set("uiSystems", normalizedSystems);
    this.cache.set("themes", normalizedThemes.themes);
    this.cache.set("formVariants", normalizedThemes.variants);
    this.cache.set("uiConfigNormalized", normalizedThemes.uiConfig);

    console.log(`[SysCacheService] Eager Load complete. Systems: ${normalizedSystems.length}, Themes: ${normalizedThemes.themes.length}`);
  }

  // --------- Public Getters (safe + normalized) ---------
  public getUiSystems(): any[] {
    return this.cache.get("uiSystems") || [];
  }

  public getThemes(): any[] {
    return this.cache.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.cache.get("formVariants") || [];
  }

  public getConfig(): any {
    return this.cache.get("uiConfigNormalized") || {};
  }

  // Expose the loaders for controllers
  public get uiSystemLoader(): UiSystemLoaderService {
    return this._uiSystemLoader;
  }

  public get uiThemeLoader(): UiThemeLoaderService {
    return this._uiThemeLoader;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) await this.loadAndCacheAll();
  }

  public get(key: string): any {
    return this.cache.get(key);
  }
}


