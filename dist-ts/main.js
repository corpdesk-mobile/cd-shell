import "reflect-metadata"; // MUST BE FIRST IMPORT
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
            // 👉 Experimental: Load allowed modules (currently cd-user + cd-admin)
            const allowedModules = await this.svModule.getAllowedModules();
            this.logger.debug("Main::allowedModules", allowedModules);
            // Merge all menus into a single array, conforming to MenuItem[]
            // const mergedMenu: MenuItem[] = allowedModules.map((mod: ICdModule) => ({
            //   label: mod.moduleId.replace(/^cd-/, "").toUpperCase(),
            //   itemType: "route",
            //   route: `${mod.ctx}/${mod.moduleId}`,
            //   icon: { iconType: "fontawesome", icon: "fa-folder" },
            //   children: mod.menu || [],
            // }));
            const mergedMenu = allowedModules.map((mod) => {
                const moduleRoot = mod.menu?.length === 1 ? mod.menu[0] : null;
                if (moduleRoot &&
                    moduleRoot.label.toLowerCase() ===
                        mod.moduleId.replace(/^cd-/, "").toLowerCase()) {
                    // ✅ Use existing menu root directly, but ensure its route is complete
                    return {
                        ...moduleRoot,
                        route: `${mod.ctx}/${mod.moduleId}`,
                        children: moduleRoot.children || [],
                    };
                }
                // 🧩 Otherwise, wrap safely
                return {
                    label: mod.moduleId.replace(/^cd-/, "").toUpperCase(),
                    itemType: "route",
                    route: `${mod.ctx}/${mod.moduleId}`,
                    icon: { iconType: "fontawesome", icon: "fa-folder" },
                    children: mod.menu || [],
                };
            });
            // Log to verify
            this.logger.debug("Main::mergedMenu", JSON.stringify(mergedMenu, null, 2));
            // Load theme config for menu rendering
            const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
            if (!resTheme.ok) {
                const errorText = await resTheme.text();
                throw new Error(`Theme fetch failed: ${resTheme.status} ${resTheme.statusText}. Body: ${errorText}`);
            }
            const theme = (await resTheme.json());
            // Render combined menu
            this.svMenu.renderMenuWithSystem(mergedMenu, theme);
            // OPTIONAL: Automatically load default module's main view
            const defaultModule = allowedModules.find((m) => m.isDefault);
            if (defaultModule && defaultModule.template) {
                const contentEl = document.getElementById("cd-main-content");
                if (contentEl)
                    contentEl.innerHTML = defaultModule.template;
                if (defaultModule.controller?.__setup)
                    defaultModule.controller.__setup();
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
