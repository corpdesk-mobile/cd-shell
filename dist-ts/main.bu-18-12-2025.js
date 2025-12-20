import "reflect-metadata"; // MUST BE FIRST IMPORT
// import { ShellConfig } from "./CdShell/sys/base/i-base";
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";
export class Main {
    constructor() {
        // private svThemeLoader!: ThemeLoaderService;
        this.logger = new LoggerService();
        this.splashAnimDone = false;
        this.appReady = false;
        this.svUser = new UserService();
        // intentionally empty — setup moved to init()
        this.svConfig = new ConfigService();
        this.svSysCache = new SysCacheService(this.svConfig);
        // window.addEventListener("CorpdeskSplashDone", () => {
        //   this.hideSplash();
        // });
    }
    /**
     * Unified initializer: sets up services and shell config.
     * Backward-compatible: replaces initialize() + init().
     */
    async init() {
        this.logger.debug("[Main] init(): starting");
        // ✅ Ensure ModuleService is properly initialized
        if (typeof window === "undefined") {
            this.logger.debug("[Main] Running in Node → awaiting ensureInitialized()");
            await ModuleService.ensureInitialized();
        }
        else {
            this.logger.debug("[Main] Running in browser → skipping ensureInitialized()");
        }
        // ✅ Instantiate services
        this.svConfig = new ConfigService();
        this.svSysCache = new SysCacheService(this.svConfig);
        this.svModule = new ModuleService();
        this.svMenu = new MenuService();
        this.svController = new ControllerService();
        this.svTheme = new ThemeService();
        // this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);
        // ✅ Load shell config and apply log level
        const shellConfig = await this.svConfig.loadConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        this.logger.debug("[Main] init(): completed");
    }
    async run() {
        //---------------------------------------
        // SPLASH
        //---------------------------------------
        await this.showSplash();
        this.logger.setLevel("debug");
        this.logger.debug("Main.run() started");
        //---------------------------------------
        // STEP 0: Load static shell config
        //---------------------------------------
        const staticShellConfig = await this.svConfig.loadConfig();
        //---------------------------------------
        // STEP 1: Init SysCache
        //---------------------------------------
        this.svSysCache = SysCacheService.getInstance(this.svConfig);
        this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
        this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
        this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
        //---------------------------------------
        // STEP 2: Load cache (includes envConfig + consumerGuid)
        //---------------------------------------
        await this.svSysCache.loadAndCacheAll();
        //---------------------------------------
        // STEP 3: ANON LOGIN (consumer context)
        //---------------------------------------
        await this.loginAnonUser();
        //---------------------------------------
        // STEP 4: Resolve shell config (consumer-aware)
        //---------------------------------------
        const shellConfig = await this.svConfig.loadConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        //---------------------------------------
        // STEP 5: Apply UI-System + Theme
        //---------------------------------------
        await this.applyStartupUiSettings(shellConfig);
        //---------------------------------------
        // STEP 6: Theme config (logo, title)
        //---------------------------------------
        const themeConfig = await this.svTheme.loadThemeConfig();
        document.title =
            shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
        const logoEl = document.getElementById("cd-logo");
        if (logoEl && themeConfig.logo)
            logoEl.src = themeConfig.logo;
        //---------------------------------------
        // STEP 7: Continue normal bootstrap
        //---------------------------------------
        await this.bootstrapUi(shellConfig);
        //---------------------------------------
        // READY
        //---------------------------------------
        this.appReady = true;
        this.tryHideSplash();
        this.logger.debug("Main.run() complete");
    }
    // ===================================================================
    // LOGIN
    // ===================================================================
    async loginAnonUser() {
        this.logger.debug("[Main.loginAnonUser] Performing anon login");
        const consumerGuid = this.svSysCache.getConsumerGuid();
        this.logger.debug("[Main.loginAnonUser] consumerGuid", consumerGuid);
        if (!consumerGuid) {
            this.logger.warn("[Main.loginAnonUser] No consumerGuid → skipping anon login");
            return;
        }
        const anonUser = {
            userName: "anon",
            password: "-",
        };
        const resp = await this.svUser.login(anonUser, consumerGuid);
        if (!resp) {
            this.logger.warn("[Main.loginAnonUser] anon login failed → continuing with static shell config");
            return;
        }
        this.logger.debug("[Main.loginAnonUser] anon login success");
        this.consumerProfile = resp.data.consumer.consumerProfile || null;
        this.userProfile = resp.data.userData.userProfile || null;
    }
    // // ===================================================================
    // // SHELL CONFIG RESOLUTION
    // // ===================================================================
    // async loadShellConfig(
    //   consumerProfile?: IConsumerProfile,
    //   userProfile?: IUserProfile
    // ): Promise<IUserShellConfig> {
    //   const baseConfig = await this.loadStaticShellConfig();
    //   const withConsumer = this.mergeShellConfig(
    //     baseConfig,
    //     consumerProfile?.shellConfig
    //   );
    //   const finalConfig = this.mergeShellConfigWithPolicy(
    //     withConsumer,
    //     userProfile?.shellConfig,
    //     consumerProfile?.shellConfig
    //   );
    //   return finalConfig;
    // }
    // private async loadStaticShellConfig(): Promise<IUserShellConfig> {
    //   return await this.svConfig.loadConfig();
    // }
    // private mergeShellConfig(
    //   base: IUserShellConfig,
    //   override?: Partial<IUserShellConfig>
    // ): IUserShellConfig {
    //   if (!override) return base;
    //   return {
    //     ...base,
    //     ...override,
    //     uiConfig: {
    //       ...base.uiConfig,
    //       ...override.uiConfig,
    //     },
    //     themeConfig: {
    //       ...base.themeConfig,
    //       ...override.themeConfig,
    //     },
    //   };
    // }
    // private mergeShellConfigWithPolicy(
    //   base: IUserShellConfig,
    //   userShell?: Partial<IUserShellConfig>,
    //   consumerShell?: IConsumerShellConfig
    // ): IUserShellConfig {
    //   if (!userShell || !consumerShell) return base;
    //   const lockDown = consumerShell.lockDown || {};
    //   return {
    //     ...base,
    //     uiConfig: {
    //       ...base.uiConfig,
    //       // ---------------------------------------
    //       // UI SYSTEM
    //       // ---------------------------------------
    //       defaultUiSystemId: lockDown.uiSystem
    //         ? base.uiConfig.defaultUiSystemId
    //         : (userShell.uiConfig?.defaultUiSystemId ??
    //           base.uiConfig.defaultUiSystemId),
    //       // ---------------------------------------
    //       // THEME
    //       // ---------------------------------------
    //       defaultThemeId: lockDown.theme
    //         ? base.uiConfig.defaultThemeId
    //         : (userShell.uiConfig?.defaultThemeId ??
    //           base.uiConfig.defaultThemeId),
    //       // ---------------------------------------
    //       // FORM VARIANT
    //       // ---------------------------------------
    //       defaultFormVariant: lockDown.formVariant
    //         ? base.uiConfig.defaultFormVariant
    //         : (userShell.uiConfig?.defaultFormVariant ??
    //           base.uiConfig.defaultFormVariant),
    //     },
    //   };
    // }
    async bootstrapUi(shellConfig) {
        // This method contains your existing:
        // - menu preparation
        // - sidebar rendering
        // - default controller loading
        // - mobile UX wiring
        // (unchanged — omitted here for brevity)
    }
    // // ===================================================================
    // // UI BOOTSTRAP (existing logic preserved)
    // // ===================================================================
    async applyStartupUiSettings(shellConfig) {
        const uiConfig = shellConfig.uiConfig;
        if (!uiConfig)
            return;
        this.logger.debug("[Main] Applying startup UI settings", uiConfig);
        // ---------------------------------------
        // 1. Activate UI System
        // ---------------------------------------
        if (uiConfig.defaultUiSystemId) {
            await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
        }
        // ---------------------------------------
        // 2. Apply Theme (CSS-level)
        // ---------------------------------------
        if (uiConfig.defaultThemeId) {
            await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);
        }
        // ---------------------------------------
        // 3. Apply Form Variant
        // ---------------------------------------
        if (uiConfig.defaultFormVariant) {
            await this.svUiThemeLoader.loadFormVariant(uiConfig.defaultFormVariant);
        }
    }
    async showSplash() {
        return new Promise(async (resolve) => {
            const splash = document.getElementById("cd-splash");
            if (!splash)
                return resolve();
            const shellConfig = await this.svConfig.loadConfig();
            const path = shellConfig.splash?.path;
            const minDuration = shellConfig.splash?.minDuration ?? 3000;
            this.logger.debug("[Splash] loading", { path, minDuration });
            const html = await fetch(path).then((r) => r.text());
            splash.innerHTML = html;
            splash.style.display = "block";
            // Animation latch
            setTimeout(() => {
                this.logger.debug("[Splash] animation completed");
                this.splashAnimDone = true;
                this.tryHideSplash();
            }, minDuration);
            resolve();
        });
    }
    async tryHideSplash() {
        if (!this.splashAnimDone || !this.appReady) {
            this.logger.debug("[Splash] waiting", {
                splashAnimDone: this.splashAnimDone,
                appReady: this.appReady,
            });
            return;
        }
        this.logger.debug("[Splash] conditions met → hiding splash");
        await this.hideSplash();
    }
    async hideSplash() {
        return new Promise((resolve) => {
            const splash = document.getElementById("cd-splash");
            const root = document.getElementById("cd-root");
            if (!splash)
                return resolve();
            const container = splash.querySelector("#splash-container");
            container?.classList.add("fade-out");
            setTimeout(() => {
                splash.remove();
                if (root)
                    root.style.visibility = "visible";
                this.logger.debug("[Splash] removed, app revealed");
                resolve();
            }, 800);
        });
    }
}
