// import "reflect-metadata"; // MUST BE FIRST IMPORT
// import { LoggerService } from "./CdShell/utils/logger.service";
// import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
// import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
// import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
// import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
// import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
// import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
// import {
//   IConsumerProfile,
// } from "./CdShell/sys/moduleman/models/consumer.model";
// import {
//   IUserProfile,
//   IUserShellConfig,
//   UserModel,
// } from "./CdShell/sys/cd-user/models/user.model";
// import { UserService } from "./CdShell/sys/cd-user/services/user.service";
// export class Main {
//   private svSysCache!: SysCacheService;
//   private svUiSystemLoader!: UiSystemLoaderService;
//   private svConfig: ConfigService;
//   private svUiThemeLoader!: UiThemeLoaderService;
//   private svTheme!: ThemeService;
//   private logger = new LoggerService();
//   private splashAnimDone = false;
//   private appReady = false;
//   private svUser = new UserService();
//   public consumerProfile: IConsumerProfile | null = null;
//   public userProfile: IUserProfile | null = null;
//   constructor() {
//     this.svConfig = new ConfigService();
//     this.svSysCache = new SysCacheService(this.svConfig);
//   }
//   /**
//    * Unified initializer: sets up services and shell config.
//    * Backward-compatible: replaces initialize() + init().
//    */
//   async init() {
//     this.logger.debug("[Main] init(): starting");
//     // ✅ Ensure ModuleService is properly initialized
//     if (typeof window === "undefined") {
//       this.logger.debug(
//         "[Main] Running in Node → awaiting ensureInitialized()"
//       );
//       await ModuleService.ensureInitialized();
//     } else {
//       this.logger.debug(
//         "[Main] Running in browser → skipping ensureInitialized()"
//       );
//     }
//     // ✅ Instantiate services
//     this.svConfig = new ConfigService();
//     this.svSysCache = new SysCacheService(this.svConfig);
//     this.svTheme = new ThemeService();
//     // this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);
//     // ✅ Load shell config and apply log level
//     const shellConfig = await this.svConfig.loadConfig();
//     if (shellConfig.logLevel) {
//       this.logger.setLevel(shellConfig.logLevel);
//     }
//     this.logger.debug("[Main] init(): completed");
//   }
//   async run() {
//     //---------------------------------------
//     // SPLASH
//     //---------------------------------------
//     await this.showSplash();
//     this.logger.setLevel("debug");
//     this.logger.debug("Main.run() started");
//     //---------------------------------------
//     // STEP 0: Load static shell config
//     //---------------------------------------
//     const staticShellConfig = await this.svConfig.loadConfig();
//     //---------------------------------------
//     // STEP 1: Init SysCache
//     //---------------------------------------
//     this.svSysCache = SysCacheService.getInstance(this.svConfig);
//     this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
//     this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
//     this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
//     //---------------------------------------
//     // STEP 2: Load cache (includes envConfig + consumerGuid)
//     //---------------------------------------
//     await this.svSysCache.loadAndCacheAll();
//     //---------------------------------------
//     // STEP 3: ANON LOGIN (consumer context)
//     //---------------------------------------
//     await this.loginAnonUser();
//     //---------------------------------------
//     // STEP 4: Resolve shell config (consumer-aware)
//     //---------------------------------------
//     const shellConfig = await this.svConfig.resolveShellConfig();
//     if (shellConfig.logLevel) {
//       this.logger.setLevel(shellConfig.logLevel);
//     }
//     //---------------------------------------
//     // STEP 5: Apply UI-System + Theme
//     //---------------------------------------
//     await this.applyStartupUiSettings(shellConfig);
//     //---------------------------------------
//     // STEP 6: Theme config (logo, title)
//     //---------------------------------------
//     const themeConfig = await this.svTheme.loadThemeConfig();
//     document.title =
//       shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
//     const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
//     if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;
//     //---------------------------------------
//     // STEP 7: Continue normal bootstrap
//     //---------------------------------------
//     await this.bootstrapUi(shellConfig);
//     //---------------------------------------
//     // READY
//     //---------------------------------------
//     this.appReady = true;
//     this.tryHideSplash();
//     this.logger.debug("Main.run() complete");
//   }
//   // ===================================================================
//   // LOGIN
//   // ===================================================================
//   private async loginAnonUser(): Promise<void> {
//     this.logger.debug("[Main.loginAnonUser] Performing anon login");
//     const consumerGuid = this.svSysCache.getConsumerGuid();
//     this.logger.debug("[Main.loginAnonUser] consumerGuid", consumerGuid);
//     if (!consumerGuid) {
//       this.logger.warn(
//         "[Main.loginAnonUser] No consumerGuid → skipping anon login"
//       );
//       return;
//     }
//     const anonUser: UserModel = {
//       userName: "anon",
//       password: "-",
//     };
//     const resp = await this.svUser.login(anonUser, consumerGuid);
//     if (!resp) {
//       this.logger.warn(
//         "[Main.loginAnonUser] anon login failed → continuing with static shell config"
//       );
//       return;
//     }
//     this.logger.debug("[Main.loginAnonUser] anon login success");
//     this.consumerProfile = resp.data.consumer.consumerProfile || null;
//     this.userProfile = resp.data.userData.userProfile || null;
//   }
//   // // ===================================================================
//   // // SHELL CONFIG RESOLUTION
//   // // ===================================================================
//   // async loadShellConfig(
//   //   consumerProfile?: IConsumerProfile,
//   //   userProfile?: IUserProfile
//   // ): Promise<IUserShellConfig> {
//   //   const baseConfig = await this.loadStaticShellConfig();
//   //   const withConsumer = this.mergeShellConfig(
//   //     baseConfig,
//   //     consumerProfile?.shellConfig
//   //   );
//   //   const finalConfig = this.mergeShellConfigWithPolicy(
//   //     withConsumer,
//   //     userProfile?.shellConfig,
//   //     consumerProfile?.shellConfig
//   //   );
//   //   return finalConfig;
//   // }
//   // private async loadStaticShellConfig(): Promise<IUserShellConfig> {
//   //   return await this.svConfig.loadConfig();
//   // }
//   // private mergeShellConfig(
//   //   base: IUserShellConfig,
//   //   override?: Partial<IUserShellConfig>
//   // ): IUserShellConfig {
//   //   if (!override) return base;
//   //   return {
//   //     ...base,
//   //     ...override,
//   //     uiConfig: {
//   //       ...base.uiConfig,
//   //       ...override.uiConfig,
//   //     },
//   //     themeConfig: {
//   //       ...base.themeConfig,
//   //       ...override.themeConfig,
//   //     },
//   //   };
//   // }
//   // private mergeShellConfigWithPolicy(
//   //   base: IUserShellConfig,
//   //   userShell?: Partial<IUserShellConfig>,
//   //   consumerShell?: IConsumerShellConfig
//   // ): IUserShellConfig {
//   //   if (!userShell || !consumerShell) return base;
//   //   const lockDown = consumerShell.lockDown || {};
//   //   return {
//   //     ...base,
//   //     uiConfig: {
//   //       ...base.uiConfig,
//   //       // ---------------------------------------
//   //       // UI SYSTEM
//   //       // ---------------------------------------
//   //       defaultUiSystemId: lockDown.uiSystem
//   //         ? base.uiConfig.defaultUiSystemId
//   //         : (userShell.uiConfig?.defaultUiSystemId ??
//   //           base.uiConfig.defaultUiSystemId),
//   //       // ---------------------------------------
//   //       // THEME
//   //       // ---------------------------------------
//   //       defaultThemeId: lockDown.theme
//   //         ? base.uiConfig.defaultThemeId
//   //         : (userShell.uiConfig?.defaultThemeId ??
//   //           base.uiConfig.defaultThemeId),
//   //       // ---------------------------------------
//   //       // FORM VARIANT
//   //       // ---------------------------------------
//   //       defaultFormVariant: lockDown.formVariant
//   //         ? base.uiConfig.defaultFormVariant
//   //         : (userShell.uiConfig?.defaultFormVariant ??
//   //           base.uiConfig.defaultFormVariant),
//   //     },
//   //   };
//   // }
//   private async bootstrapUi(shellConfig: IUserShellConfig) {
//     // This method contains your existing:
//     // - menu preparation
//     // - sidebar rendering
//     // - default controller loading
//     // - mobile UX wiring
//     // (unchanged — omitted here for brevity)
//   }
//   // // ===================================================================
//   // // UI BOOTSTRAP (existing logic preserved)
//   // // ===================================================================
//   private async applyStartupUiSettings(
//     shellConfig: IUserShellConfig
//   ): Promise<void> {
//     const uiConfig = shellConfig.uiConfig;
//     if (!uiConfig) return;
//     this.logger.debug("[Main] Applying startup UI settings", uiConfig);
//     // ---------------------------------------
//     // 1. Activate UI System
//     // ---------------------------------------
//     if (uiConfig.defaultUiSystemId) {
//       await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
//     }
//     // ---------------------------------------
//     // 2. Apply Theme (CSS-level)
//     // ---------------------------------------
//     if (uiConfig.defaultThemeId) {
//       await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);
//     }
//     // ---------------------------------------
//     // 3. Apply Form Variant
//     // ---------------------------------------
//     if (uiConfig.defaultFormVariant) {
//       await this.svUiThemeLoader.loadFormVariant(uiConfig.defaultFormVariant);
//     }
//   }
//   async showSplash(): Promise<void> {
//     return new Promise(async (resolve) => {
//       const splash = document.getElementById("cd-splash");
//       if (!splash) return resolve();
//       const shellConfig = await this.svConfig.resolveShellConfig();
//       const path = shellConfig.splash?.path;
//       const minDuration = shellConfig.splash?.minDuration ?? 3000;
//       this.logger.debug("[Splash] loading", { path, minDuration });
//       const html = await fetch(path).then((r) => r.text());
//       splash.innerHTML = html;
//       splash.style.display = "block";
//       // Animation latch
//       setTimeout(() => {
//         this.logger.debug("[Splash] animation completed");
//         this.splashAnimDone = true;
//         this.tryHideSplash();
//       }, minDuration);
//       resolve();
//     });
//   }
//   private async tryHideSplash() {
//     if (!this.splashAnimDone || !this.appReady) {
//       this.logger.debug("[Splash] waiting", {
//         splashAnimDone: this.splashAnimDone,
//         appReady: this.appReady,
//       });
//       return;
//     }
//     this.logger.debug("[Splash] conditions met → hiding splash");
//     await this.hideSplash();
//   }
//   async hideSplash(): Promise<void> {
//     return new Promise<void>((resolve) => {
//       const splash = document.getElementById("cd-splash");
//       const root = document.getElementById("cd-root");
//       if (!splash) return resolve();
//       const container = splash.querySelector(
//         "#splash-container"
//       ) as HTMLElement;
//       container?.classList.add("fade-out");
//       setTimeout(() => {
//         splash.remove();
//         if (root) root.style.visibility = "visible";
//         this.logger.debug("[Splash] removed, app revealed");
//         resolve();
//       }, 800);
//     });
//   }
// }
import "reflect-metadata"; // MUST BE FIRST IMPORT
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { diag_css, diag_sidebar } from "./CdShell/sys/utils/diagnosis";
export class Main {
    constructor() {
        this.logger = new LoggerService();
        this.svUser = new UserService();
        this.svModule = new ModuleService();
        this.svMenu = new MenuService();
        this.svController = new ControllerService();
        this.splashAnimDone = false;
        this.appReady = false;
        this.consumerProfile = null;
        this.userProfile = null;
        this.svConfig = new ConfigService();
        this.svSysCache = new SysCacheService(this.svConfig);
        this.svTheme = new ThemeService();
        this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);
        this.svUiSystemLoader = new UiSystemLoaderService(this.svSysCache);
    }
    // ===================================================================
    // INIT
    // ===================================================================
    async init() {
        this.logger.debug("[Main] init(): starting");
        if (typeof window === "undefined") {
            await ModuleService.ensureInitialized();
        }
        const shellConfig = await this.svConfig.loadConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        this.logger.debug("[Main] init(): completed");
    }
    // ===================================================================
    // RUN
    // ===================================================================
    // async run() {
    //   await this.showSplash();
    //   this.logger.debug("Main.run() started");
    //   //---------------------------------------
    //   // STEP 0–2: Cache + UI infra
    //   //---------------------------------------
    //   this.svSysCache = SysCacheService.getInstance(this.svConfig);
    //   this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    //   this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    //   this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
    //   await this.svSysCache.loadAndCacheAll();
    //   //---------------------------------------
    //   // STEP 3: ANON LOGIN
    //   //---------------------------------------
    //   await this.loginAnonUser();
    //   //---------------------------------------
    //   // STEP 4: Resolve shell config
    //   //---------------------------------------
    //   const shellConfig = await this.svConfig.resolveShellConfig();
    //   if (shellConfig.logLevel) {
    //     this.logger.setLevel(shellConfig.logLevel);
    //   }
    //   //---------------------------------------
    //   // STEP 5: UI system + theme
    //   //---------------------------------------
    //   await this.applyStartupUiSettings(shellConfig);
    //   //---------------------------------------
    //   // STEP 6: Theme identity
    //   //---------------------------------------
    //   const themeConfig = await this.svTheme.loadThemeConfig();
    //   document.title =
    //     shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
    //   const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    //   if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;
    //   //---------------------------------------
    //   // STEP 7: SHELL CONTENT (THIS WAS MISSING)
    //   //---------------------------------------
    //   await this.bootstrapUi(shellConfig);
    //   //---------------------------------------
    //   // READY
    //   //---------------------------------------
    //   this.appReady = true;
    //   this.tryHideSplash();
    //   this.logger.debug("Main.run() complete");
    // }
    async run() {
        //---------------------------------------
        // SPLASH: Show immediately
        //---------------------------------------
        await this.showSplash();
        this.logger.setLevel("debug");
        this.logger.debug("starting Main.run()");
        diag_css("Main.run() started");
        //---------------------------------------
        // STEP 0: Resolve shell config FIRST
        // (restores original invariant)
        //---------------------------------------
        const shellConfig = await this.svConfig.resolveShellConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        //---------------------------------------
        // STEP 1: Core service instantiation
        //---------------------------------------
        this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
        this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
        this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
        //---------------------------------------
        // STEP 2: Load cached metadata
        //---------------------------------------
        await this.svSysCache.loadAndCacheAll();
        diag_css("Cache loaded");
        //---------------------------------------
        // STEP 3: Apply UI-System + Theme pipeline
        // (must happen BEFORE any DOM population)
        //---------------------------------------
        await this.applyStartupUiSettings(shellConfig);
        diag_css("UI-System + Theme applied");
        //---------------------------------------
        // STEP 4: Theme config (logo + title)
        //---------------------------------------
        const themeConfig = await this.svTheme.loadThemeConfig();
        diag_css("ThemeConfig loaded", themeConfig);
        document.title =
            shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
        const logoEl = document.getElementById("cd-logo");
        if (logoEl && themeConfig.logo) {
            logoEl.src = themeConfig.logo;
        }
        //---------------------------------------
        // STEP 5: Prepare menu
        //---------------------------------------
        const allowedModules = await this.svModule.getAllowedModules();
        const defaultModule = allowedModules.find((m) => m.isDefault);
        const defaultControllerName = defaultModule?.controllers.find((c) => c.default)?.name;
        diag_css("Modules Loaded", { allowedModules });
        const rawMenu = allowedModules.flatMap((mod) => {
            const recursive = (items) => items.map((item) => {
                if (item.itemType === "route" && item.route) {
                    const cinfo = this.svController.findControllerInfoByRoute(mod, item.route);
                    if (cinfo) {
                        item.controller = cinfo.instance;
                        item.template =
                            typeof cinfo.template === "function"
                                ? cinfo.template
                                : () => cinfo.template;
                        item.moduleId = mod.moduleId;
                        if (mod.isDefault && cinfo.name === defaultControllerName) {
                            item.moduleDefault = true;
                        }
                    }
                }
                if (item.children) {
                    item.children = recursive(item.children);
                }
                return item;
            });
            return recursive(mod.menu || []);
        });
        const preparedMenu = this.svMenu.prepareMenu(rawMenu);
        diag_css("Menu prepared", preparedMenu);
        //---------------------------------------
        // STEP 6: Sidebar render
        //---------------------------------------
        try {
            const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
            const theme = (await resTheme.json());
            this.svMenu.renderMenuWithSystem(preparedMenu, theme);
            const sidebarEl = document.getElementById("cd-sidebar");
            if (sidebarEl &&
                (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")) {
                this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
            }
            diag_css("Sidebar rendered");
            diag_sidebar();
        }
        catch (err) {
            console.error("[Main] Failed rendering menu", err);
        }
        //---------------------------------------
        // STEP 7: Auto-load default controller
        //---------------------------------------
        try {
            const defaultModuleMenu = preparedMenu.find((m) => m.label === defaultModule?.moduleId);
            const defaultMenuItem = defaultModuleMenu?.children?.find((it) => it.moduleDefault);
            if (defaultMenuItem) {
                await this.svMenu.loadResource({
                    item: defaultMenuItem,
                });
            }
            diag_css("Default controller loaded");
        }
        catch (err) {
            console.warn("[Main] auto-load default view failed", err);
        }
        //---------------------------------------
        // STEP 8: Mobile UX config
        //---------------------------------------
        const burger = document.getElementById("cd-burger");
        const sidebar = document.getElementById("cd-sidebar");
        const overlay = document.getElementById("cd-overlay");
        const isMobile = () => window.matchMedia("(max-width: 900px)").matches;
        const applyMobileState = () => {
            if (!isMobile()) {
                sidebar?.classList.remove("open");
                overlay?.classList.add("hidden");
                burger?.classList.remove("open");
            }
        };
        if (burger && sidebar && overlay) {
            burger.addEventListener("click", () => {
                burger.classList.toggle("open");
                sidebar.classList.toggle("open");
                overlay.classList.toggle("hidden");
            });
            overlay.addEventListener("click", () => {
                burger.classList.remove("open");
                sidebar.classList.remove("open");
                overlay.classList.add("hidden");
            });
            window.addEventListener("resize", applyMobileState);
            applyMobileState();
        }
        //---------------------------------------
        // APP READY
        //---------------------------------------
        this.logger.debug("[Main] app fully bootstrapped");
        this.appReady = true;
        this.tryHideSplash();
        this.logger.debug("Main.run() complete");
        diag_css("Main.run() complete");
    }
    // ===================================================================
    // LOGIN
    // ===================================================================
    async loginAnonUser() {
        const consumerGuid = this.svSysCache.getConsumerGuid();
        if (!consumerGuid)
            return;
        const anonUser = { userName: "anon", password: "-" };
        const resp = await this.svUser.login(anonUser, consumerGuid);
        if (!resp)
            return;
        this.consumerProfile = resp.data.consumer.consumerProfile || null;
        this.userProfile = resp.data.userData.userProfile || null;
    }
    // ===================================================================
    // SHELL BOOTSTRAP (RESTORED LOGIC)
    // ===================================================================
    async bootstrapUi(shellConfig) {
        this.logger.debug("[Main] bootstrapUi(): start");
        //---------------------------------------
        // 1. Prepare menu
        //---------------------------------------
        const allowedModules = await this.svModule.getAllowedModules();
        const defaultModule = allowedModules.find((m) => m.isDefault);
        const defaultControllerName = defaultModule?.controllers.find((c) => c.default)?.name;
        const rawMenu = allowedModules.flatMap((mod) => {
            const walk = (items) => items.map((item) => {
                if (item.itemType === "route" && item.route) {
                    const cinfo = this.svController.findControllerInfoByRoute(mod, item.route);
                    if (cinfo) {
                        item.controller = cinfo.instance;
                        item.template =
                            typeof cinfo.template === "function"
                                ? cinfo.template
                                : () => cinfo.template;
                        item.moduleId = mod.moduleId;
                        if (mod.isDefault && cinfo.name === defaultControllerName) {
                            item.moduleDefault = true;
                        }
                    }
                }
                if (item.children)
                    item.children = walk(item.children);
                return item;
            });
            return walk(mod.menu || []);
        });
        const preparedMenu = this.svMenu.prepareMenu(rawMenu);
        //---------------------------------------
        // 2. Sidebar render
        //---------------------------------------
        const themeConfig = await this.svTheme.loadThemeConfig();
        this.svMenu.renderMenuWithSystem(preparedMenu, themeConfig);
        const sidebarEl = document.getElementById("cd-sidebar");
        if (sidebarEl &&
            (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")) {
            this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
        }
        //---------------------------------------
        // 3. Load default controller
        //---------------------------------------
        const defaultModuleMenu = preparedMenu.find((m) => m.label === defaultModule?.moduleId);
        const defaultMenuItem = defaultModuleMenu?.children?.find((it) => it.moduleDefault);
        if (defaultMenuItem) {
            await this.svMenu.loadResource({ item: defaultMenuItem });
        }
        //---------------------------------------
        // 4. Mobile UX wiring
        //---------------------------------------
        const burger = document.getElementById("cd-burger");
        const sidebar = document.getElementById("cd-sidebar");
        const overlay = document.getElementById("cd-overlay");
        const isMobile = () => window.matchMedia("(max-width: 900px)").matches;
        const applyMobileState = () => {
            if (!isMobile()) {
                sidebar?.classList.remove("open");
                overlay?.classList.add("hidden");
                burger?.classList.remove("open");
            }
        };
        if (burger && sidebar && overlay) {
            burger.addEventListener("click", () => {
                burger.classList.toggle("open");
                sidebar.classList.toggle("open");
                overlay.classList.toggle("hidden");
            });
            overlay.addEventListener("click", () => {
                burger.classList.remove("open");
                sidebar.classList.remove("open");
                overlay.classList.add("hidden");
            });
            window.addEventListener("resize", applyMobileState);
            applyMobileState();
        }
        this.logger.debug("[Main] bootstrapUi(): complete");
    }
    // ===================================================================
    // UI SYSTEM / THEME
    // ===================================================================
    async applyStartupUiSettings(shellConfig) {
        const uiConfig = shellConfig.uiConfig;
        if (!uiConfig) {
            this.logger.debug("[Main] No uiConfig → skipping UI startup settings");
            return;
        }
        this.logger.debug("[Main] Applying startup UI settings", uiConfig);
        // ---------------------------------------
        // 1. Activate UI System (loads core UI CSS + JS)
        // ---------------------------------------
        if (uiConfig.defaultUiSystemId) {
            this.logger.debug("[Main] Activating UI system", uiConfig.defaultUiSystemId);
            await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
        }
        // ---------------------------------------
        // 2. Apply Theme (theme-level CSS variables & colors)
        // ---------------------------------------
        if (uiConfig.defaultThemeId) {
            this.logger.debug("[Main] Loading UI theme", uiConfig.defaultThemeId);
            await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);
        }
        // ---------------------------------------
        // 3. Apply Form Variant (component-level overrides)
        // ---------------------------------------
        if (uiConfig.defaultFormVariant) {
            this.logger.debug("[Main] Applying form variant", uiConfig.defaultFormVariant);
            await this.svUiThemeLoader.loadFormVariant(uiConfig.defaultFormVariant);
        }
        // ---------------------------------------
        // 4. 🔑 Re-assert Shell Layout CSS (MUST be last)
        // ---------------------------------------
        if (typeof this.svUiSystemLoader.reapplyShellLayout === "function") {
            this.logger.debug("[Main] Reapplying shell layout CSS to restore layout dominance");
        }
        else {
            this.logger.warn("[Main] reapplyShellLayout() not found on UiSystemLoaderService");
        }
    }
    // ===================================================================
    // SPLASH
    // ===================================================================
    async showSplash() {
        const splash = document.getElementById("cd-splash");
        if (!splash)
            return;
        const shellConfig = await this.svConfig.resolveShellConfig();
        const path = shellConfig.splash?.path;
        const minDuration = shellConfig.splash?.minDuration ?? 3000;
        const html = await fetch(path).then((r) => r.text());
        splash.innerHTML = html;
        splash.style.display = "block";
        setTimeout(() => {
            this.splashAnimDone = true;
            this.tryHideSplash();
        }, minDuration);
    }
    async tryHideSplash() {
        if (!this.splashAnimDone || !this.appReady)
            return;
        await this.hideSplash();
    }
    async hideSplash() {
        const splash = document.getElementById("cd-splash");
        const root = document.getElementById("cd-root");
        if (!splash)
            return;
        splash.remove();
        if (root)
            root.style.visibility = "visible";
    }
}
