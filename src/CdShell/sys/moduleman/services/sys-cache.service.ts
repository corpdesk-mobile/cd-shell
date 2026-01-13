import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";
import {
  // CacheKey,
  CacheListener,
  CacheMeta,
  SysCacheMap,
} from "../models/sys-cache.model";
import { LoggerService } from "../../../utils/logger.service";

export class SysCacheService {
  private logger = new LoggerService();
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map<string, Set<CacheListener<any>>>();

  private versionCounter = 0;

  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  private constructor(private configService: ConfigService) {}

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
    this.logger.debug("[SysCacheService.loadAndCacheAll()] start");
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    // 🔑 PHASE-2 AWARE CONFIG RESOLUTION
    const shellConfig =
      this.get("shellConfig") ?? (await this.configService.loadConfig());

    const uiConfig = shellConfig.uiConfig || {};

    // Ensure canonical cache presence
    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", uiConfig, "static");

    // -------------------------------------------------
    // UI SYSTEMS (authoritative descriptors)
    // -------------------------------------------------
    const uiSystemsData =
      await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    this.cacheUiSystems(uiSystemsData, "static");

    // -------------------------------------------------
    // UI THEMES
    // -------------------------------------------------
    const uiThemesData =
      await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig, "static");

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

  // public async ensureReady(): Promise<void> {
  //   if (this.cache.size === 0) {
  //     await this.loadAndCacheAll();
  //   }
  // }

  // Refined ensureReady in SysCacheService.ts
  public async ensureReady(): Promise<void> {
    // Check if the config exists in the cache via the public get() method
    const existingConfig = this.get("shellConfig");

    if (existingConfig) {
      this.logger.debug("SysCache: Already ready (shellConfig present)");
      return;
    }

    // If we have loaders, we can try to recover
    if (this._uiSystemLoader && this._uiThemeLoader) {
      await this.loadAndCacheAll();
    } else {
      this.logger.warn(
        "SysCache: Not ready and no loaders available to fetch data."
      );
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
    this.logger.debug("[SysCacheService.normalizeUiSystemDescriptors()] start");
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
    this.logger.debug("[SysCacheService.cacheUiSystems()] start");
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

  public hasConsumerContext(): boolean {
    return !!this.get("shellConfig:meta")?.hasConsumerProfile;
  }

  // ------------------------------------------------------------------
  // PHASE-2 RESOLUTION (CONSUMER / USER OVERRIDES)
  // ------------------------------------------------------------------
  public applyResolvedShellConfig(
    resolvedShellConfig: any,
    source: CacheMeta["source"] = "resolved"
  ): void {
    this.logger.debug("[SysCacheService.applyResolvedShellConfig()] start");
    this.logger.debug(
      "[SysCacheService.applyResolvedShellConfig()] resolvedShellConfig:",
      resolvedShellConfig
    );

    if (!resolvedShellConfig) return;

    const uiConfig = resolvedShellConfig.uiConfig || {};
    const envConfig = resolvedShellConfig.envConfig || {};

    // Override canonical keys
    this.set("shellConfig", resolvedShellConfig, source);
    this.set("uiConfig", uiConfig, source);
    this.set("envConfig", envConfig, source);

    // Optional normalized alias (used by loaders)
    this.set("uiConfigNormalized", uiConfig, source);

    // Metadata flag (used by hasConsumerContext)
    this.set(
      "shellConfig:meta",
      {
        hasConsumerProfile: true,
        appliedAt: Date.now(),
      },
      source
    );

    console.log("[SysCacheService] Resolved shell config applied", {
      defaultUiSystemId: uiConfig.defaultUiSystemId,
      defaultThemeId: uiConfig.defaultThemeId,
      source,
    });
  }

  public getUiSystemById(systemId: string): any | undefined {
    const systems = this.get("uiSystemDescriptors") || [];
    return systems.find((s: any) => s.id === systemId);
  }

  public getThemeById(themeId: string): any | undefined {
    const themes = this.get("themeDescriptors") || [];
    return themes.find((t: any) => t.id === themeId);
  }

  public resolveTheme(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getThemeById(input);
    return input;
  }

  public resolveUiSystem(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getUiSystemById(input);
    return input;
  }
}
