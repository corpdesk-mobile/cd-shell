// /////////////////////////////////////////
// // PREVIOUS CODES
// /////////////////////////////////////////
// import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
// import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
// import { ConfigService } from "./config.service";

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
//    * - envConfig (NEW)
//    * - uiConfig
//    * - uiSystems
//    * - uiSystemDescriptors
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

//     // -------------------------------------------------------------------
//     // 1. LOAD SHELL CONFIG
//     // -------------------------------------------------------------------
//     const shellConfig = await this.configService.loadConfig();

//     // Extract the new envConfig block (replacing license/environment)
//     const envConfig = shellConfig.envConfig || {};

//     // Cache it
//     this.cache.set("envConfig", envConfig);

//     // Preserve uiConfig loading
//     const uiConfig = shellConfig.uiConfig;
//     this.cache.set("uiConfig", uiConfig);

//     // -------------------------------------------------------------------
//     // 2. UI SYSTEMS & THEMES
//     // -------------------------------------------------------------------
//     const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

//     const fullDescriptors = uiSystemsData.map((sys: any) => ({
//       id: sys.id,
//       name: sys.name,
//       version: sys.version,
//       description: sys.description,

//       cssUrl: sys.cssUrl,
//       jsUrl: sys.jsUrl,
//       assetPath: sys.assetPath,
//       stylesheets: sys.stylesheets || [],
//       scripts: sys.scripts || [],

//       themesAvailable: sys.themesAvailable || [],
//       themeActive: sys.themeActive || null,

//       conceptMappings: sys.conceptMappings || {},
//       directiveMap: sys.directiveMap || {},

//       tokenMap: sys.tokenMap || {},
//       containers: sys.containers || [],
//       components: sys.components || [],
//       renderRules: sys.renderRules || {},

//       metadata: sys.metadata || {},
//       extensions: sys.extensions || {},
//       author: sys.author,
//       license: sys.license,
//       repository: sys.repository,

//       displayName: sys.displayName || sys.name,
//     }));

//     const simpleSystems = fullDescriptors.map((sys) => ({
//       id: sys.id,
//       name: sys.name,
//       displayName: sys.displayName,
//       themesAvailable: sys.themesAvailable,
//     }));

//     const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

//     const themes = (uiThemesData.themes || []).map((t: any) => ({
//       id: t.id,
//       name: t.name,
//     }));

//     const variants = (uiThemesData.variants || []).map((v: any) => ({
//       id: v.id,
//       name: v.name,
//     }));

//     const descriptors = uiThemesData.descriptors || [];

//     // Cache everything
//     this.cache.set("uiSystems", simpleSystems);
//     this.cache.set("uiSystemDescriptors", fullDescriptors);
//     this.cache.set("themes", themes);
//     this.cache.set("formVariants", variants);
//     this.cache.set("themeDescriptors", descriptors);
//     this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

//     console.log("[SysCacheService] Load complete.");
//   }

//   // -------------------------------------------------------------
//   // BASIC GETTERS
//   // -------------------------------------------------------------
//   public get(key: string): any {
//     return this.cache.get(key);
//   }

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

//   // -------------------------------------------------------------
//   // NEW: ENV CONFIG HELPERS
//   // -------------------------------------------------------------
//   public getEnvConfig(): any {
//     return this.cache.get("envConfig") || {};
//   }

//   /** POC: direct access to consumerGuid (tenant identifier) */
//   public getConsumerGuid(): string | undefined {
//     const env = this.getEnvConfig();
//     return env?.consumerGuid || env?.clientContext?.consumerToken || undefined;
//   }

//   /** POC: convenience wrapper for apiEndpoint */
//   public getApiEndpoint(): string | undefined {
//     return this.getEnvConfig()?.apiEndpoint;
//   }

//   public async ensureReady(): Promise<void> {
//     if (this.cache.size === 0) await this.loadAndCacheAll();
//   }
// }

/////////////////////////////////////////
// LATEST CODES
/////////////////////////////////////////

import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";
import {
  // CacheKey,
  CacheListener,
  CacheMeta,
  SysCacheMap,
} from "../models/sys-cache.model";

export class SysCacheService {
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map<string, Set<CacheListener<any>>>();

  private versionCounter = 0;

  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

  // ------------------------------------------------------------------
  // SINGLETON
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // CORE CACHE API (NEW)
  // ------------------------------------------------------------------
  // Legacy + typed set
  public set<T>(key: string, value: T, source?: CacheMeta["source"]): void;

  public set<K extends keyof SysCacheMap>(
    key: K,
    value: SysCacheMap[K],
    source?: CacheMeta["source"]
  ): void;

  // Implementation
  public set(
    key: string,
    value: any,
    source: CacheMeta["source"] = "runtime"
  ): void {
    const meta: CacheMeta = {
      source,
      version: ++this.versionCounter,
      timestamp: Date.now(),
    };

    this.cache.set(key, { value, meta });
    this.notify(key, value, meta);
  }

  public get(key: string): any | undefined;
  public get<K extends keyof SysCacheMap>(key: K): SysCacheMap[K] | undefined;

  public get(key: string): any | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }

  public getMeta(key: string): CacheMeta | undefined {
    const entry = this.cache.get(key);
    return entry?.meta;
  }

  public subscribe<T>(
    key: string,
    listener: CacheListener<T>,
    emitImmediately = true
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Late subscriber → immediate sync
    if (emitImmediately && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      listener(entry.value, entry.meta);
    }

    // Unsubscribe
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify<T>(key, value: T, meta: CacheMeta): void {
    this.listeners.get(key)?.forEach((listener) => listener(value, meta));
  }

  // ------------------------------------------------------------------
  // EXISTING LOAD PIPELINE (UNCHANGED BEHAVIOR)
  // ------------------------------------------------------------------
  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    const shellConfig = await this.configService.loadConfig();

    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", shellConfig.uiConfig || {}, "static");

    // const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
    //   shellConfig.uiConfig
    // );

    // this.set("uiSystems", uiSystemsData, "static");
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      shellConfig.uiConfig
    );

    const { simple, full } = this.normalizeUiSystemDescriptors(uiSystemsData);

    // 🔁 Restore legacy expectations
    this.set("uiSystems", simple, "static");
    this.set("uiSystemDescriptors", full, "static");

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      shellConfig.uiConfig
    );

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set(
      "uiConfigNormalized",
      uiThemesData.uiConfig || shellConfig.uiConfig,
      "static"
    );

    console.log("[SysCacheService] Load complete");
  }

  // ------------------------------------------------------------------
  // BACKWARD-COMPAT GETTERS (NO BREAKING CHANGES)
  // ------------------------------------------------------------------
  public getUiSystems(): any[] {
    return this.get("uiSystems") || [];
  }

  public getThemes(): any[] {
    return this.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.get("uiConfigNormalized") || {};
  }

  public getEnvConfig(): any {
    return this.get("envConfig") || {};
  }

  public getConsumerGuid(): string | undefined {
    const env = this.getEnvConfig();
    return env?.consumerGuid || env?.clientContext?.consumerToken;
  }

  public getApiEndpoint(): string | undefined {
    return this.getEnvConfig()?.apiEndpoint;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) {
      await this.loadAndCacheAll();
    }
  }

  /**
   * Normalizes UI system descriptors to legacy-compatible shape
   * Required by UiSystemLoaderService.activate()
   */
  private normalizeUiSystemDescriptors(rawSystems: any[]): {
    simple: any[];
    full: any[];
  } {
    const fullDescriptors = rawSystems.map((sys: any) => ({
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

    return {
      simple: simpleSystems,
      full: fullDescriptors,
    };
  }

  private cacheUiSystems(
    rawSystems: any[],
    source: CacheMeta["source"] = "static"
  ): void {
    const { simple, full } = this.normalizeUiSystemDescriptors(rawSystems);

    // 🔁 Legacy compatibility
    this.set("uiSystems", simple, source);
    this.set("uiSystemDescriptors", full, source);

    // 🔮 Optional future-facing unified key
    this.set("uiSystemsNormalized", { simple, full }, source);

    console.log("[SysCacheService] UI systems cached", {
      simpleCount: simple.length,
      fullCount: full.length,
      source,
    });
  }
}
