import "reflect-metadata"; // MUST BE FIRST IMPORT
// import { ShellConfig } from "./CdShell/sys/base/i-base";
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { ITheme } from "./CdShell/sys/theme/models/themes.model";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ThemeLoaderService } from "./CdShell/sys/theme/services/theme-loader.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { ICdModule } from "./CdShell/sys/moduleman/models/module.model";
import { MenuItem } from "./CdShell/sys/moduleman/models/menu.model";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { inspect } from "util";
import { ShellConfig } from "./CdShell/sys/moduleman/models/config.model";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";

export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  // private svThemeLoader!: ThemeLoaderService;
  private logger = new LoggerService();

  constructor() {
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
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
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
    // ----------------------------
    // STEP 1: Initialize Logger
    // ----------------------------
    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");

    const shellConfig: ShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    // ----------------------------
    // STEP 2: Initialize Core Services
    // ----------------------------
    this.svUiSystemLoader = new UiSystemLoaderService(this.svSysCache);
    this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    // ----------------------------
    // STEP 3: Load and Cache All Data
    // ----------------------------
    this.logger.debug("Main::run()/03 → Loading cache data...");
    await this.svSysCache.loadAndCacheAll();

    // ----------------------------
    // STEP 4: Apply Boot-Time Default Activations
    // ----------------------------
    const uiConfig = this.svSysCache.get("uiConfig");

    if (uiConfig) {
      const { defaultUiSystemId, defaultThemeId, defaultFormVariant } =
        uiConfig;
      this.logger.debug(
        "[Main] Applying boot defaults from uiConfig:",
        uiConfig
      );

      // ✅ Activate default UI system
      this.logger.debug(
        `[Main] Activating default UI system: ${defaultUiSystemId}`
      );
      await this.svUiSystemLoader.activate(defaultUiSystemId);

      // ✅ Activate default theme
      this.logger.debug(`[Main] Activating default theme: ${defaultThemeId}`);
      this.svUiThemeLoader.setActiveThemeId(defaultThemeId);
      await this.svUiThemeLoader.loadThemeById(defaultThemeId);

      // ✅ Activate default form variant
      this.logger.debug(
        `[Main] Activating default form variant: ${defaultFormVariant}`
      );
      this.svUiThemeLoader.setActiveFormVariantId(defaultFormVariant);
      await this.svUiThemeLoader.loadFormVariant(defaultFormVariant);
    } else {
      this.logger.warn(
        "[Main] No uiConfig found in SysCache — skipping defaults."
      );
    }

    // ----------------------------
    // STEP 5: Load Theme Config (For Global Assets)
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    // ----------------------------
    // STEP 6: Apply Basic UI Setup
    // ----------------------------
    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    if (themeConfig.colors.primary) {
      document.documentElement.style.setProperty(
        "--theme-color",
        themeConfig.colors.primary
      );
    }

    // ----------------------------
    // STEP 7: Load Default Module Path
    // ----------------------------
    if (shellConfig.defaultModulePath) {
      // ⭐ EAGER LOAD SYSTEM METADATA ⭐
      const sysCacheInstance = SysCacheService.getInstance(this.svConfig);

      const uiSystemLoaderInstance = new UiSystemLoaderService(
        sysCacheInstance
      );
      const uiThemeLoaderInstance = new UiThemeLoaderService(sysCacheInstance);

      this.svUiSystemLoader = uiSystemLoaderInstance;
      this.svUiThemeLoader = uiThemeLoaderInstance;

      sysCacheInstance.setLoaders(
        uiSystemLoaderInstance,
        uiThemeLoaderInstance
      );

      this.logger.debug(
        "Main::bootstrapShell()/07 → Awaiting SysCacheService Eager Load."
      );
      await sysCacheInstance.loadAndCacheAll();

      // ----------------------------
      // STEP 8: Load Allowed Modules
      // ----------------------------
      const allowedModules: ICdModule[] =
        await this.svModule.getAllowedModules();
      this.logger.debug("Main::allowedModules", allowedModules);

      const defaultModule = allowedModules.find((m) => m.isDefault);
      const defaultControllerName = defaultModule?.controllers.find(
        (c) => c.default === true
      )?.name;

      // ----------------------------
      // STEP 9: Construct Base Menu & Inject Controller Metadata
      // ----------------------------
      const rawMenu: MenuItem[] = allowedModules.flatMap((mod: ICdModule) => {
        const processMenuChildren = (items: MenuItem[]): MenuItem[] => {
          return items.map((item) => {
            if (item.itemType === "route" && item.route) {
              const controllerInfo =
                this.svController.findControllerInfoByRoute(mod, item.route);

              if (controllerInfo) {
                (item as any).controller = controllerInfo.instance;
                (item as any).template =
                  typeof controllerInfo.template === "function"
                    ? controllerInfo.template
                    : () => controllerInfo.template;

                (item as any).moduleId = mod.moduleId;

                if (
                  mod.isDefault &&
                  controllerInfo.name === defaultControllerName
                ) {
                  (item as any).moduleDefault = true;
                  this.logger.debug(
                    `[Main][processMenuChildren] Marked default menu item: ${item.route}`
                  );
                }
              } else if (!item.controller) {
                this.logger.warn(
                  `Menu item route ${item.route} not mapped to a specific controller.`
                );
              }
            }

            if (item.children) {
              item.children = processMenuChildren(item.children);
            }
            return item;
          });
        };
        return processMenuChildren(mod.menu || []);
      });

      // ----------------------------
      // STEP 10: Prepare Menu via MenuService
      // ----------------------------
      const preparedMenu = this.svMenu.prepareMenu(rawMenu);
      this.logger.debug(
        "Main::preparedMenu",
        inspect(preparedMenu, { depth: 4 })
      );

      // ----------------------------
      // STEP 11: Load Theme and Render Menu
      // ----------------------------
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      // ----------------------------
      // STEP 12: Auto-load Default Module View
      // ----------------------------
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule.moduleId
      );
      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (item) => item.moduleDefault === true
      );

      if (defaultMenuItem) {
        this.logger.debug(
          `Main::bootstrapShell()/12 → Triggering MenuService for default view: ${defaultMenuItem.route}`
        );
        this.svMenu.loadResource({ item: defaultMenuItem });
      } else {
        this.logger.warn(
          "Default menu item not found or marked. Auto-load skipped."
        );
      }

      this.logger.debug("bootstrapShell()/13: End of initialization sequence.");
    }

    // ----------------------------
    // STEP 14: Final UI Setup (Sidebar/Menu Toggle)
    // ----------------------------
    this.svUiThemeLoader.loadThemeById("default");

    const burger = document.getElementById("cd-burger")!;
    const sidebar = document.getElementById("cd-sidebar")!;
    const overlay = document.getElementById("cd-overlay")!;

    burger.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("hidden");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.add("hidden");
    });
  }

  async loadShellConfig(): Promise<ShellConfig> {
    const res = await fetch("/shell.config.json");
    if (!res.ok) {
      throw new Error(`Failed to load shell config: ${res.statusText}`);
    }
    return await res.json();
  }
}
