import 'reflect-metadata'; // MUST BE FIRST IMPORT
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ThempeLoaderService } from "./CdShell/sys/theme/services/theme-loader.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
export class Main {
    constructor() {
        this.logger = new LoggerService();
        // intentionally empty — setup moved to init()
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
        this.svModule = new ModuleService();
        this.svMenu = new MenuService();
        this.svTheme = new ThemeService();
        this.svThemeLoader = new ThempeLoaderService();
        // ✅ Load shell config and apply log level
        const shellConfig = await this.loadShellConfig();
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        this.logger.debug("[Main] init(): completed");
    }
    async run() {
        this.logger.setLevel("debug");
        this.logger.debug("starting bootstrapShell()");
        this.logger.debug("bootstrapShell()/01:");
        const shellConfig = await this.loadShellConfig();
        this.logger.debug("bootstrapShell()/02:");
        if (shellConfig.logLevel) {
            this.logger.setLevel(shellConfig.logLevel);
        }
        this.logger.debug("bootstrapShell()/03:");
        const themeConfig = await this.svTheme.loadThemeConfig();
        this.logger.debug("bootstrapShell()/04:");
        this.logger.debug("bootstrapShell()/themeConfig:", themeConfig);
        // Set title
        document.title =
            shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
        this.logger.debug("bootstrapShell()/05:");
        // Set logo
        const logoEl = document.getElementById("cd-logo");
        this.logger.debug("bootstrapShell()/06:");
        if (logoEl && themeConfig.logo) {
            logoEl.src = themeConfig.logo;
        }
        this.logger.debug("bootstrapShell()/07:");
        if (themeConfig.colors.primary) {
            document.documentElement.style.setProperty("--theme-color", themeConfig.colors.primary);
        }
        this.logger.debug("bootstrapShell()/08:");
        if (shellConfig.defaultModulePath) {
            this.logger.debug("bootstrapShell()/09:");
            const [ctx, moduleId] = shellConfig.defaultModulePath.split("/");
            this.logger.debug("bootstrapShell()/ctx:", ctx);
            this.logger.debug("bootstrapShell()/moduleId:", moduleId);
            this.logger.debug("bootstrapShell()/10:");
            // 👉 Load module
            const moduleInfo = await this.svModule.loadModule(ctx, moduleId);
            if (moduleInfo.menu) {
                this.logger.debug("Main::loadModule()/menu:", moduleInfo.menu);
                // Load theme config for menu rendering
                const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
                if (!resTheme.ok) {
                    const errorText = await resTheme.text();
                    throw new Error(`Theme fetch failed: ${resTheme.status} ${resTheme.statusText}. Body: ${errorText}`);
                }
                const theme = (await resTheme.json());
                this.logger.debug("Main::loadModule()/theme:", theme);
                this.svMenu.renderMenuWithSystem(moduleInfo.menu, theme);
            }
            else {
                this.logger.debug("Main::loadModule()/no menu to render");
            }
            this.logger.debug("bootstrapShell()/11:");
        }
        // Load theme
        this.svThemeLoader.loadTheme("default");
        // Menu toggle
        const burger = document.getElementById("cd-burger");
        const sidebar = document.getElementById("cd-sidebar");
        const overlay = document.getElementById("cd-overlay");
        burger.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("hidden");
        });
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.add("hidden");
        });
    }
    async loadShellConfig() {
        const res = await fetch("/shell.config.json");
        if (!res.ok) {
            throw new Error(`Failed to load shell config: ${res.statusText}`);
        }
        return await res.json();
    }
}
