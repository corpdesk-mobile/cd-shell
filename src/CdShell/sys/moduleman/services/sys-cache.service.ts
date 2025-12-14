// import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
// import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
// import { ConfigService } from "./config.service";

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

// export class SysCacheService {
//   private static instance: SysCacheService;
//   private cache = new Map<string, any>();
//   private _uiSystemLoader!: UiSystemLoaderService;
//   private _uiThemeLoader!: UiThemeLoaderService;

//   constructor(private configService: ConfigService) {}

//   public static getInstance(configService?: ConfigService): SysCacheService {
//     if (!SysCacheService.instance) {
//       if (!configService) {
//         throw new Error(
//           "SysCacheService must be initialized with ConfigService on first instantiation."
//         );
//       }
//       SysCacheService.instance = new SysCacheService(configService);
//     }
//     return SysCacheService.instance;
//   }

//   public setLoaders(
//     systemLoader: UiSystemLoaderService,
//     themeLoader: UiThemeLoaderService
//   ): void {
//     this._uiSystemLoader = systemLoader;
//     this._uiThemeLoader = themeLoader;
//   }

//   /**
//    * Loads:
//    * - uiConfig
//    * - uiSystems (simple list)
//    * - uiSystemDescriptors (FULL expanded descriptors)
//    * - themes
//    * - formVariants
//    * - themeDescriptors
//    */
//   public async loadAndCacheAll(): Promise<void> {
//     if (!this._uiSystemLoader || !this._uiThemeLoader) {
//       throw new Error("SysCacheService: loaders must be set before load.");
//     }
//     if (this.cache.size > 0) return; // already loaded

//     console.log("[SysCacheService] 01: Starting Eager Load");

//     const shellConfig = await this.configService.loadConfig();
//     const uiConfig = shellConfig.uiConfig;
//     this.cache.set("uiConfig", uiConfig);

//     // ---------------------------------------------
//     // Fetch available systems (raw descriptors)
//     // ---------------------------------------------
//     const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
//       uiConfig
//     );

//     console.log("[SysCacheService] uiSystemsData:", uiSystemsData);

//     // ---------------------------------------------
//     // Normalize full descriptors
//     // ---------------------------------------------
//     const fullDescriptors = uiSystemsData.map((sys: any) => {
//       return {
//         id: sys.id,
//         name: sys.name,
//         version: sys.version,
//         description: sys.description,

//         // Assets
//         cssUrl: sys.cssUrl,
//         jsUrl: sys.jsUrl,
//         assetPath: sys.assetPath,
//         stylesheets: sys.stylesheets || [],
//         scripts: sys.scripts || [],

//         // Themes
//         themesAvailable: sys.themesAvailable || [],
//         themeActive: sys.themeActive || null,

//         // Concept Mapping & directives
//         conceptMappings: sys.conceptMappings || {},
//         directiveMap: sys.directiveMap || {},

//         // Rendering metadata
//         tokenMap: sys.tokenMap || {},
//         containers: sys.containers || [],
//         components: sys.components || [],
//         renderRules: sys.renderRules || {},

//         // Metadata
//         metadata: sys.metadata || {},
//         extensions: sys.extensions || {},
//         author: sys.author,
//         license: sys.license,
//         repository: sys.repository,

//         displayName: sys.displayName || sys.name,
//       };
//     });

//     // ---------------------------------------------
//     // Simple list for UI (id + name only)
//     // ---------------------------------------------
//     const simpleSystems = fullDescriptors.map((sys) => ({
//       id: sys.id,
//       name: sys.name,
//       displayName: sys.displayName,
//       themesAvailable: sys.themesAvailable,
//     }));

//     console.log("[SysCacheService] Normalized Systems:", simpleSystems);

//     // ---------------------------------------------
//     // Load theme lists & full theme.json descriptors
//     // ---------------------------------------------
//     const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
//       uiConfig
//     );

//     const themes = (uiThemesData.themes || []).map((t: any) => ({
//       id: t.id,
//       name: t.name,
//     }));

//     const variants = (uiThemesData.variants || []).map((v: any) => ({
//       id: v.id,
//       name: v.name,
//     }));

//     const descriptors = uiThemesData.descriptors || [];

//     // ---------------------------------------------
//     // Store everything
//     // ---------------------------------------------
//     this.cache.set("uiSystems", simpleSystems);
//     this.cache.set("uiSystemDescriptors", fullDescriptors);
//     this.cache.set("themes", themes);
//     this.cache.set("formVariants", variants);
//     this.cache.set("themeDescriptors", descriptors);
//     this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

//     console.log(
//       `[SysCacheService] Load complete. Systems: ${simpleSystems.length}, Themes: ${themes.length}`
//     );
//   }

//   // ---------------------------------------------
//   // Accessors
//   // ---------------------------------------------
//   public getUiSystems(): any[] {
//     return this.cache.get("uiSystems") || [];
//   }

//   public getUiSystemDescriptors(): any[] {
//     return this.cache.get("uiSystemDescriptors") || [];
//   }

//   public getThemes(): any[] {
//     return this.cache.get("themes") || [];
//   }

//   public getFormVariants(): any[] {
//     return this.cache.get("formVariants") || [];
//   }

//   public getThemeDescriptors(): any[] {
//     return this.cache.get("themeDescriptors") || [];
//   }

//   public getConfig(): any {
//     return this.cache.get("uiConfigNormalized") || {};
//   }

//   public get(key: string): any {
//     console.log(`[SysCacheService][get] key: ${key}`);
//     console.log("[SysCacheService][get] this.cache:", this.cache);
//     return this.cache.get(key);
//   }

//   public get uiSystemLoader(): UiSystemLoaderService {
//     return this._uiSystemLoader;
//   }

//   public get uiThemeLoader(): UiThemeLoaderService {
//     return this._uiThemeLoader;
//   }

//   public async ensureReady(): Promise<void> {
//     if (this.cache.size === 0) await this.loadAndCacheAll();
//   }
// }

import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";

export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>();
  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

  public static getInstance(configService?: ConfigService): SysCacheService {
    if (!SysCacheService.instance) {
      if (!configService) {
        throw new Error(
          "SysCacheService must be initialized with ConfigService on first instantiation."
        );
      }
      SysCacheService.instance = new SysCacheService(configService);
    }
    return SysCacheService.instance;
  }

  public setLoaders(
    systemLoader: UiSystemLoaderService,
    themeLoader: UiThemeLoaderService
  ): void {
    this._uiSystemLoader = systemLoader;
    this._uiThemeLoader = themeLoader;
  }

  /**
   * Loads:
   * - envConfig (NEW)
   * - uiConfig
   * - uiSystems
   * - uiSystemDescriptors
   * - themes
   * - formVariants
   * - themeDescriptors
   */
  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }
    if (this.cache.size > 0) return; // already loaded

    console.log("[SysCacheService] 01: Starting Eager Load");

    // -------------------------------------------------------------------
    // 1. LOAD SHELL CONFIG
    // -------------------------------------------------------------------
    const shellConfig = await this.configService.loadConfig();

    // Extract the new envConfig block (replacing license/environment)
    const envConfig = shellConfig.envConfig || {};

    // Cache it
    this.cache.set("envConfig", envConfig);

    // Preserve uiConfig loading
    const uiConfig = shellConfig.uiConfig;
    this.cache.set("uiConfig", uiConfig);

    // -------------------------------------------------------------------
    // 2. UI SYSTEMS & THEMES
    // -------------------------------------------------------------------
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    const fullDescriptors = uiSystemsData.map((sys: any) => ({
      id: sys.id,
      name: sys.name,
      version: sys.version,
      description: sys.description,

      cssUrl: sys.cssUrl,
      jsUrl: sys.jsUrl,
      assetPath: sys.assetPath,
      stylesheets: sys.stylesheets || [],
      scripts: sys.scripts || [],

      themesAvailable: sys.themesAvailable || [],
      themeActive: sys.themeActive || null,

      conceptMappings: sys.conceptMappings || {},
      directiveMap: sys.directiveMap || {},

      tokenMap: sys.tokenMap || {},
      containers: sys.containers || [],
      components: sys.components || [],
      renderRules: sys.renderRules || {},

      metadata: sys.metadata || {},
      extensions: sys.extensions || {},
      author: sys.author,
      license: sys.license,
      repository: sys.repository,

      displayName: sys.displayName || sys.name,
    }));

    const simpleSystems = fullDescriptors.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.displayName,
      themesAvailable: sys.themesAvailable,
    }));

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    const themes = (uiThemesData.themes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
    }));

    const variants = (uiThemesData.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
    }));

    const descriptors = uiThemesData.descriptors || [];

    // Cache everything
    this.cache.set("uiSystems", simpleSystems);
    this.cache.set("uiSystemDescriptors", fullDescriptors);
    this.cache.set("themes", themes);
    this.cache.set("formVariants", variants);
    this.cache.set("themeDescriptors", descriptors);
    this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

    console.log("[SysCacheService] Load complete.");
  }

  // -------------------------------------------------------------
  // BASIC GETTERS
  // -------------------------------------------------------------
  public get(key: string): any {
    return this.cache.get(key);
  }

  public getUiSystems(): any[] {
    return this.cache.get("uiSystems") || [];
  }

  public getUiSystemDescriptors(): any[] {
    return this.cache.get("uiSystemDescriptors") || [];
  }

  public getThemes(): any[] {
    return this.cache.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.cache.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.cache.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.cache.get("uiConfigNormalized") || {};
  }

  // -------------------------------------------------------------
  // NEW: ENV CONFIG HELPERS
  // -------------------------------------------------------------
  public getEnvConfig(): any {
    return this.cache.get("envConfig") || {};
  }

  /** POC: direct access to consumerGuid (tenant identifier) */
  public getConsumerGuid(): string | undefined {
    const env = this.getEnvConfig();
    return env?.consumerGuid || env?.clientContext?.consumerToken || undefined;
  }

  /** POC: convenience wrapper for apiEndpoint */
  public getApiEndpoint(): string | undefined {
    return this.getEnvConfig()?.apiEndpoint;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) await this.loadAndCacheAll();
  }
}




