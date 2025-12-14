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
import { diag_css, diag_sidebar } from "./CdShell/sys/utils/diagnosis";
export class Main {
    constructor() {
        // private svThemeLoader!: ThemeLoaderService;
        this.logger = new LoggerService();
        this.splashAnimDone = false;
        this.appReady = false;
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
        const shellConfig = await this.loadShellConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        this.logger.debug("[Main] init(): completed");
    }
    async run() {
        //---------------------------------------
        // SPLASH: Show immediately
        //---------------------------------------
        await this.showSplash(); // your animated SVG starts here
        this.logger.setLevel("debug");
        this.logger.debug("starting bootstrapShell()");
        diag_css("Main.run() started");
        //---------------------------------------
        // STEP 0: Load shell config
        //---------------------------------------
        const shellConfig = await this.loadShellConfig();
        if (shellConfig.logLevel)
            this.logger.setLevel(shellConfig.logLevel);
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
        //---------------------------------------
        await this.applyStartupUiSettings();
        diag_css("UI-System + Theme applied");
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
                        if (mod.isDefault && cinfo.name === defaultControllerName)
                            item.moduleDefault = true;
                    }
                }
                if (item.children)
                    item.children = recursive(item.children);
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
                await this.svMenu.loadResource({ item: defaultMenuItem });
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
                sidebar.classList.remove("open");
                overlay.classList.add("hidden");
                burger.classList.remove("open");
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
        this.logger.debug("bootstrapShell(): run() complete");
        diag_css("Main.run() complete");
    }
    /**
     * Purpose: Load UI System + Load Theme + Activate UI-System-specific logic.
     */
    async applyStartupUiSettings() {
        const cfgSvc = ConfigService.getInstance();
        // ensure sys cache is ready
        await this.svSysCache.ensureReady();
        const uiConfig = this.svSysCache.get("uiConfig");
        if (!uiConfig) {
            console.warn("[Main.applyStartupUiSettings] uiConfig missing");
            return;
        }
        const systemId = uiConfig.defaultUiSystemId;
        const themeId = uiConfig.defaultThemeId;
        diag_css("[MAIN.applyStartupUiSettings] start", { systemId, themeId });
        // Use singletons bound to same SysCache instance
        const uiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
        const uiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
        // 1) Activate UI system (loads CSS + JS)
        try {
            await uiSystemLoader.activate(systemId);
            diag_css("[MAIN.applyStartupUiSettings] ui-system activated", {
                systemId,
            });
        }
        catch (err) {
            console.warn("[MAIN.applyStartupUiSettings] activate failed", err);
            diag_css("[MAIN.applyStartupUiSettings] activate failed", { err });
        }
        // 2) Load structural shell CSS (base + index) AFTER system to ensure layering
        try {
            await uiSystemLoader.loadCSS("/themes/common/base.css", "shell-base");
            await uiSystemLoader.loadCSS("/assets/css/index.css", "shell-index");
            diag_css("[MAIN.applyStartupUiSettings] shell CSS loaded", {});
        }
        catch (err) {
            console.warn("[MAIN.applyStartupUiSettings] shell CSS load failed", err);
        }
        // 3) load theme override CSS
        try {
            await uiThemeLoader.loadThemeById(themeId);
            diag_css("[MAIN.applyStartupUiSettings] theme css injected", { themeId });
        }
        catch (err) {
            console.warn("[MAIN.applyStartupUiSettings] theme load failed", err);
        }
        // 4) per-system applyTheme (sets data-bs-theme, md classes, etc.)
        try {
            await uiSystemLoader.applyTheme(systemId, themeId);
            diag_css("[MAIN.applyStartupUiSettings] system applyTheme complete", {});
        }
        catch (err) {
            console.warn("[MAIN.applyStartupUiSettings] applyTheme failed", err);
        }
        diag_css("[MAIN.applyStartupUiSettings] done", {});
    }
    async loadShellConfig() {
        const res = await fetch("/shell.config.json");
        if (!res.ok) {
            throw new Error(`Failed to load shell config: ${res.statusText}`);
        }
        return await res.json();
    }
    // async showSplash(): Promise<void> {
    //   return new Promise(async (resolve) => {
    //     const splash = document.getElementById("cd-splash");
    //     if (!splash) return resolve();
    //     const path = "/splashscreens/corpdesk-default.html";
    //     this.logger.debug("[Splash] loading", path);
    //     try {
    //       const html = await fetch(path).then((r) => r.text());
    //       this.logger.debug("[Splash] injected HTML length", html.length);
    //       splash.innerHTML = html;
    //       splash.style.display = "block";
    //       resolve();
    //       this.logger.debug(
    //         "[Splash] container present",
    //         !!document.querySelector("#splash-container")
    //       );
    //     } catch (err) {
    //       console.error("[Splash] load failed", err);
    //       resolve();
    //     }
    //   });
    // }
    async showSplash() {
        return new Promise(async (resolve) => {
            const splash = document.getElementById("cd-splash");
            if (!splash)
                return resolve();
            const shellConfig = await this.loadShellConfig();
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
    // async hideSplash(): Promise<void> {
    //   this.logger.debug("[Splash] hide start");
    //   return new Promise<void>((resolve) => {
    //     const splash = document.getElementById("cd-splash");
    //     const root = document.getElementById("cd-root");
    //     if (splash) {
    //       const container = splash.querySelector(
    //         "#splash-container"
    //       ) as HTMLElement;
    //       if (container) container.classList.add("fade-out");
    //       this.logger.debug("[Splash] root visibility restored");
    //     }
    //     setTimeout(() => {
    //       splash?.remove();
    //       if (root) root.style.visibility = "visible";
    //       resolve();
    //     }, 800);
    //   });
    // }
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
