import "reflect-metadata"; // MUST BE FIRST IMPORT
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { diag_css } from "./CdShell/sys/utils/diagnosis";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";
export class Main {
    constructor() {
        this.logger = new LoggerService();
        // private splashAnimDone = false;
        // private appReady = false;
        this.svUser = new UserService();
        // intentionally empty — setup moved to init()
        this.svConfig = new ConfigService();
        this.svSysCache = new SysCacheService(this.svConfig);
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
        // ✅ Load shell config and apply log level
        const shellConfig = await this.svConfig.loadConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        this.logger.debug("[Main] init(): completed");
    }
    async run() {
        //---------------------------------------
        // SPLASH: Show immediately
        //---------------------------------------
        this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
        await this.svUiSystemLoader.showSplash(this.svConfig);
        this.logger.setLevel("debug");
        this.logger.debug("starting bootstrapShell()");
        diag_css("Main.run() started");
        //---------------------------------------
        // STEP 0: Load base shell config (LEGACY)
        //---------------------------------------
        const baseShellConfig = await this.svConfig.loadShellConfig();
        if (baseShellConfig.logLevel) {
            this.logger.setLevel(baseShellConfig.logLevel);
        }
        //---------------------------------------
        // PHASE 1: Observe cache (non-invasive)
        //---------------------------------------
        this.svSysCache.subscribe("shellConfig", (value, meta) => {
            console.log("%c[PHASE][Cache] shellConfig", "color:#4CAF50", {
                source: meta.source,
                version: meta.version,
            });
        });
        //---------------------------------------
        // STEP 0.5: Anonymous login
        //---------------------------------------
        const fx = await this.svUser.loginAnonUser(baseShellConfig.envConfig.clientContext.consumerToken);
        this.logger.debug("[Main.run] fx:", fx);
        if (fx?.state && fx.data) {
            this.consumerProfile = fx.data.data.consumer.consumerProfile || null;
            this.userProfile = fx.data.data.userData.userProfile || null;
        }
        //---------------------------------------
        // STEP 1: Core service instantiation
        //---------------------------------------
        this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
        this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
        this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
        //---------------------------------------
        // STEP 2: Load STATIC cache (CRITICAL)
        //---------------------------------------
        await this.svSysCache.loadAndCacheAll();
        diag_css("Cache loaded (static)");
        //---------------------------------------
        // PHASE 2: Promote ACL-resolved shell config
        //---------------------------------------
        this.resolvedShellConfig = await this.svConfig.promoteResolvedShellConfig(this.svSysCache, this.consumerProfile, this.userProfile);
        this.logger.debug("[Main] Shell config promoted", this.resolvedShellConfig);
        this.svSysCache.applyResolvedShellConfig(this.resolvedShellConfig);
        const shellConfig = this.resolvedShellConfig;
        if (!this.svSysCache.hasConsumerContext()) {
            this.logger.info("[UI] Running in consumer-less mode");
        }
        //---------------------------------------
        // STEP 3: Apply UI-System + Theme pipeline
        //---------------------------------------
        await this.svUiSystemLoader.bootstrapUiSystemAndTheme(this.svSysCache);
        //---------------------------------------
        // STEP 4: Theme config (logo + title)
        //---------------------------------------
        const themeConfig = await this.svTheme.loadThemeConfig();
        diag_css("ThemeConfig loaded", themeConfig);
        document.title =
            shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
        const logoEl = document.getElementById("cd-logo");
        if (logoEl && themeConfig.logo)
            logoEl.src = themeConfig.logo;
        //---------------------------------------
        // STEP 5: Prepare menu
        //---------------------------------------
        const { preparedMenu, defaultModule } = await this.svMenu.structMenu();
        //---------------------------------------
        // STEP 6: Sidebar render
        //---------------------------------------
        await this.svUiSystemLoader.renderSidebar(this.svMenu, preparedMenu, shellConfig);
        //---------------------------------------
        // STEP 7: Auto-load default controller
        //---------------------------------------
        await this.svController.loadDefaultController(this.svMenu, preparedMenu, defaultModule);
        //---------------------------------------
        // STEP 8: Mobile UX config
        //---------------------------------------
        this.svUiSystemLoader.setupMobileUx();
        //---------------------------------------
        // APP READY
        //---------------------------------------
        this.logger.debug("[Main] app fully bootstrapped");
        this.svUiSystemLoader.appReady = true;
        this.svUiSystemLoader.tryHideSplash();
        diag_css("Main.run() complete");
    }
}
