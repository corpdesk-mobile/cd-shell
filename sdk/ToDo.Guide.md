

//////////////////////////////////////////////
Below is the latest logs.
The issue now is that getters are not being called for the dropdown to be populated.
```log
Menu clicked → ID: menu-item-cd-admin-settings, Label: settings index-Cv7mtIp5.js:31:4754
MenuService:onMenuClick()/item: { label: 'settings',
  itemType: 'route',
  route: 'sys/cd-admin/settings',
  template: [Function],
  controller: 
   { form: null,
     binder: null,
     uiSystemLoader: null,
     uiThemeLoader: null,
     svCdAdmin: null,
     currentUiSystemId: '',
     __init: [Function: __init],
     __template: [Function: __template],
     uiSystemOptionsHtml: [Getter],
     themeOptionsHtml: [Getter],
     formVariantOptionsHtml: [Getter],
     __setup: [Function: __setup],
     __activate: [Function: __activate],
     __afterInit: [Function: __afterInit],
     __deactivate: [Function: __deactivate],
     applySettings: [Function: applySettings],
     onUiSystemChange: [Function: onUiSystemChange],
     onThemeChange: [Function: onThemeChange],
     onFormVariantChange: [Function: onFormVariantChange] },
  moduleId: 'cd-admin',
  menuId: 'menu-item-cd-admin-settings' } index-Cv7mtIp5.js:31:4821
MenuService::loadResource()/start... index-Cv7mtIp5.js:31:5187
[MenuService][loadResource] options: 
Object { cdToken: undefined, item: {…} }
index-Cv7mtIp5.js:31:5239
[ControllerCacheService][getInstance] start... index-Cv7mtIp5.js:22:6771
MenuService::loadResource()/01: Executing __deactivate() on active controller index-Cv7mtIp5.js:31:5568
[ctlSignIn][__deactivate] 01 index-C9lWU5VA.js:28:436
CdDirectiveBinderService: Unbinding 0 listeners. cd-directive-binder.service-P6kntAs5.js:1:2653
MenuService::loadResource()/02: Retrieving controller via cache service index-Cv7mtIp5.js:31:5705
[ControllerCacheService][getOrInitializeController] start... index-Cv7mtIp5.js:22:6919
ControllerCacheService::getOrInitializeController()/01 (new instance) index-Cv7mtIp5.js:22:7109
ControllerCacheService::getOrInitializeController()/03 → __init() index-Cv7mtIp5.js:22:7256
[ctlCdAdminSettings][__init] start... index-B0mufbtO.js:1:1873
[ctlCdAdminSettings][__init] 01 index-B0mufbtO.js:1:1926
CdFormGroup::_constructor()/01 cd-directive-binder.service-P6kntAs5.js:1:46
CdDirectiveBinderService::constructor()/start - DOM lookups deferred. cd-directive-binder.service-P6kntAs5.js:1:1386
ControllerCacheService::getOrInitializeController()/04 → __setup() index-Cv7mtIp5.js:22:7380
[ctlCdAdminSettings][__setup] start... index-B0mufbtO.js:29:1380
[UiThemeLoaderService] Active theme asset loaded: default index-Cv7mtIp5.js:48:13629
[UiThemeLoaderService] Form variant loaded: standard index-Cv7mtIp5.js:48:14143
ControllerCacheService::getOrInitializeController()/05 (cached) index-Cv7mtIp5.js:22:7497
MenuService::loadResource()/03: Injecting template into DOM index-Cv7mtIp5.js:31:5980
MenuService::loadResource()/04: Executing __activate() index-Cv7mtIp5.js:31:6175
[ctlCdAdminSettings][__activate] start... index-B0mufbtO.js:29:1923
[CdDirectiveBinderService][bindToDom] 01 cd-directive-binder.service-P6kntAs5.js:1:1550
MenuService::loadResource()/05: Executing __afterInit() index-Cv7mtIp5.js:31:6302
[ctlCdAdminSettings][__afterInit] start... index-B0mufbtO.js:29:2073
[ctlCdAdminSettings][__afterInit] end: View is synchronized. index-B0mufbtO.js:29:2448
MenuService::loadResource()/end index-Cv7mtIp5.js:31:6420

```

```js
export const ctlCdAdminSettings = {
  // Ensure service properties are initialized here to avoid "null" access
  // if the framework calls getters before __init().
  // This is a common pattern for framework compilation of properties.
  form: null,
  binder: null,
  // 1. FIX: Initialize services to null/undefined. They must be set in __init().
  uiSystemLoader: null,
  uiThemeLoader: null,
  svCdAdmin: null,
  currentUiSystemId: "",

  /**
   * Initializes the controller's persistent state (runs ONCE).
   * NOTE: The code below needs to be adjusted based on the initializations above.
   * If they are initialized above, __init can focus on the form group.
   */

  __init() {
    console.log('[ctlCdAdminSettings][__init] start...')
    console.log('[ctlCdAdminSettings][__init] 01')
    // 1. Get the Singleton instance
    const sysCache = SysCacheService.getInstance();

    // 2. Instantiate dependencies ONLY here (ONCE per controller instance)
    this.uiSystemLoader = new UiSystemLoaderService(sysCache);
    if (!this.uiSystemLoader) {
      console.warn('[ctlCdAdminSettings][__init] SystemLoader not ready')
    }
    this.svCdAdmin = new CdAdminService(sysCache);
    if (!this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][__init] CdAdmin not ready')
    }
    this.uiThemeLoader = new UiThemeLoaderService(sysCache);
    if (!this.uiThemeLoader) {
      console.warn('[ctlCdAdminSettings][__init] ThemeLoader not ready')
    }

    // 3. Form and Binder initialization remain here.
    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [
        CdValidators.required("UI System selection is required"),
      ]),
      theme: new CdFormControl("", [
        CdValidators.required("Theme selection is required"),
      ]),
      formType: new CdFormControl("", [
        CdValidators.required("Form type is required"),
      ]),
    });

    // Initialize binder (includes our new Angular-style binding logic)
    this.binder = new CdDirectiveBinderService(
      this.form,
      "#settingsForm",
      this
    );
  },

  /**
   * Renders the HTML template using dynamic interpolation.
   */
  __template() {
    // Uses template interpolation to call the getter methods
    console.log('[ctlCdAdminSettings][__template] start...')
    return `
      <form id="settingsForm" class="cd-form">
        <div class="cd-form-field">
          <label for="uiSystem">UI System</label>
          <select id="uiSystem" name="uiSystem" cdFormControl (change)="onUiSystemChange($event)">
            ${this.uiSystemOptionsHtml}
          </select>
          <div class="error-message" data-error-for="uiSystem"></div>
        </div>

        <div class="cd-form-field">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" cdFormControl (change)="onThemeChange($event)">
            ${this.themeOptionsHtml}
          </select>
          <div class="error-message" data-error-for="theme"></div>
        </div>

        <div class="cd-form-field">
          <label for="formType">Form Variant</label>
          <select id="formType" name="formType" cdFormControl (change)="onFormVariantChange($event)">
            ${this.formVariantOptionsHtml}
          </select>
          <div class="error-message" data-error-for="formType"></div>
        </div>
        
        <button type="submit">Apply Settings</button>
      </form>
    `;
  },

  // --- GETTER METHODS (Equivalent to TypeScript getters) ---

  get uiSystemOptionsHtml() {
    console.log('[ctlCdAdminSettings][uiSystemOptionsHtml] start...')
    // The guard clause remains essential here, handling the timing anomaly gracefully
    if (!this.uiSystemLoader || !this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][uiSystemOptionsHtml] Loader not ready')
      return '<option value="">-- Loader Not Ready --</option>';
    }
    const activeSystem = this.uiSystemLoader.getActive();
    console.log('[ctlCdAdminSettings][uiSystemOptionsHtml] activeSystem:', activeSystem);
    const activeSystemId = activeSystem ? activeSystem.id : "";
    console.log('[ctlCdAdminSettings][uiSystemOptionsHtml] activeSystemId:', activeSystemId);

    return this.svCdAdmin.generateUiSystemOptions(activeSystemId);
  },

  get themeOptionsHtml() {
    console.log('[ctlCdAdminSettings][themeOptionsHtml] start...')
    // 💥 FIX: Removed redundant service instantiation here!
    if (!this.uiThemeLoader || !this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][themeOptionsHtml] Loader not ready')
      return '<option value="">-- Loader Not Ready --</option>';
    }

    const activeThemeId = this.uiThemeLoader.getActiveThemeId();
    console.log(
      "[ctlCdAdminSettings][get themeOptionsHtml] activeThemeId:",
      activeThemeId
    );

    return this.svCdAdmin.generateThemeOptions(
      this.currentUiSystemId,
      activeThemeId
    );
  },

  get formVariantOptionsHtml() {
    console.log('[ctlCdAdminSettings][formVariantOptionsHtml] start...')
    if (!this.uiThemeLoader || !this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][formVariantOptionsHtml] Loader not ready')
      return '<option value="">-- Loader Not Ready --</option>';
    }
    const activeVariantId = this.uiThemeLoader.getActiveFormVariantId();
    return this.svCdAdmin.generateFormVariantOptions(activeVariantId);
  },

  // --- LIFECYCLE HOOKS ---
  async __setup() {
    console.log('[ctlCdAdminSettings][__setup] start...')
    // 1. Ensure synchronous init is done first (if necessary)
    if (!this.form) {
      this.__init();
    }

    // 2. THEME AND VARIANT STATE INITIALIZATION (Anomaly 2 Fix)
    // This runs AFTER Main.run() loads the cache, but BEFORE __template() runs.
    const sysCache = SysCacheService.getInstance();
    // Get the cached configuration, which contains the defaults.
    const uiConfig = sysCache.get("uiConfig");

    // --- A. Initialize Active Theme ---
    let activeThemeId = this.uiThemeLoader.getActiveThemeId();
    if (!activeThemeId || activeThemeId === "") {
      activeThemeId = uiConfig.defaultThemeId || "default";
      this.uiThemeLoader.setActiveThemeId(activeThemeId); // Persist the default
    }
    await this.uiThemeLoader.loadThemeById(activeThemeId);

    // --- B. Initialize Form Variant ---
    let activeVariantId = this.uiThemeLoader.getActiveFormVariantId();
    if (
      activeVariantId === "standard" &&
      uiConfig.defaultFormVariant !== "standard"
    ) {
      activeVariantId = uiConfig.defaultFormVariant || "standard";
      this.uiThemeLoader.setActiveFormVariantId(activeVariantId);
    }
    await this.uiThemeLoader.loadFormVariant(activeVariantId);
  },

  async __activate() {
    console.log('[ctlCdAdminSettings][__activate] start...')

    // 1. Run DOM binding
    if (this.binder?.bindToDom) {
      await this.binder.bindToDom();
    }
    // ... (rest of DOM setup remains) ...
  },

  async __afterInit() {
    console.log('[ctlCdAdminSettings][__afterInit] start...')

    // 1. Retrieve the data from the single, initialized instances
    const activeSystem = this.uiSystemLoader.getActive();
    const formControls = this.form.controls;

    // 2. Set initial form control values
    if (activeSystem && formControls.uiSystem) {
      this.currentUiSystemId = activeSystem.id;
      formControls.uiSystem.setValue(activeSystem.id);
    }

    // These now read the state correctly set in __setup()
    formControls.theme.setValue(this.uiThemeLoader.getActiveThemeId());
    formControls.formType.setValue(this.uiThemeLoader.getActiveFormVariantId());

    // 3. Force Re-render (Final step to populate the dropdown HTML)
    if (this.binder?.refreshView) {
      this.binder.refreshView();
    }

    console.log("[ctlCdAdminSettings][__afterInit] end: View is synchronized.");
  },

  __deactivate() {
    console.log("[ctlCdAdminSettings][__deactivate] 01");
    if (this.binder?.unbindAllDomEvents) {
      this.binder.unbindAllDomEvents();
    }
  },

  // --- ACTION METHODS ---

  async applySettings() {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      console.warn(
        "Please select all required fields before applying settings."
      );
      return;
    }

    const selections = this.form.value;
    console.log("✅ Applied Configuration:", selections);

    await this.uiSystemLoader.activate(selections.uiSystem);
    await this.uiThemeLoader.loadThemeById(selections.theme);
    await this.uiThemeLoader.loadFormVariant(selections.formType);
  },

  async onUiSystemChange(e) {
    const newSystemId = e.target.value;
    console.log("🧩 UI System changed:", newSystemId);

    // 1. Update internal state and clear theme
    this.currentUiSystemId = newSystemId;
    this.form.controls.theme.setValue("");

    // 2. Assume re-rendering is handled by a binder method
    if (this.binder?.rebind) {
      // Rebind triggers __template() again, which refreshes themeOptionsHtml
      await this.binder.rebind();
    }
  },

  async onThemeChange(e) {
    console.log("🎨 Theme changed:", e.target.value);
  },

  async onFormVariantChange(e) {
    console.log("🧱 Form Variant changed:", e.target.value);
  },
};
```

/////////////////////////////////////////////////////

There is something that we have not discussed and is associated with the issue we are dealing with now.
I introduced the concept of system booting policy where I am proposing that just like operating systems, most system data should be loading during 'booting'.
In this strategy, we develop specific caches for different concerns to work just like ControllerCacheService. 
These cache systems should store data during booting so that later they can be accessible during runtime.
For the case we are dealing with, we expect the data for uiSystem, themes and form variant to be loaded to SysCacheService during booting time.
You have already noticed that the loaders are not being instanciated via injection of SysCacheService.
Can you review for me if the current implementation is ok? if it can be improved and most importantly, how can the dropdowns take advantage of it in the circumstance that we are grappling with currently?

```ts
export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>(); 
  private uiSystemLoader!: UiSystemLoaderService;
  private uiThemeLoader!: UiThemeLoaderService; // NEW: Theme loader dependency

  // Private constructor now accepts the global ConfigService instance
  constructor(private configService: ConfigService) {}

  public static getInstance(configService?: ConfigService): SysCacheService {
    if (!SysCacheService.instance) {
         if (!configService) {
            throw new Error("SysCacheService must be initialized with ConfigService on first call.");
        }
      SysCacheService.instance = new SysCacheService(configService);
    }
    return SysCacheService.instance;
  }

  // ⭐ Refactored Setter: Now accepts both loaders
  public setLoaders(loader: UiSystemLoaderService, themeLoader: UiThemeLoaderService): void {
    this.uiSystemLoader = loader;
    this.uiThemeLoader = themeLoader;
  }

  // CRITICAL: The single ASYNCHRONOUS entry point for system data loading
  public async loadAndCacheAll(): Promise<void> {
    if (!this.uiSystemLoader || !this.uiThemeLoader) {
      throw new Error("SysCacheService: All required loaders must be set before loading data.");
    }
    if (this.cache.size > 0) return;

    console.log("[SysCacheService] 01: Starting Eager Load (Singleton).");

    // 1. LOAD GLOBAL CONFIGURATION ONCE (Policy Enforcement)
    const uiConfig = await this.configService.loadConfig();
    this.cache.set("uiConfig", uiConfig);

    // 2. Load System Data (Pass the loaded config to the fetcher)
    const uiSystemsData = await this.uiSystemLoader.fetchAvailableSystems(uiConfig);
    this.cache.set("uiSystems", uiSystemsData);

    // 3. Load Theme Data (NEW)
    const uiThemesData = await this.uiThemeLoader.fetchAvailableThemes(uiConfig);
    this.cache.set('themes', uiThemesData);
    
    console.log(`[SysCacheService] Eager Load complete. Systems: ${uiSystemsData.length}, Themes Loaded.`);
  }

  // The synchronous getter for controllers/services
  public get(key: string): any {
    return this.cache.get(key) || [];
  }
}
```

```ts
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

    // cache system data
    this.svUiSystemLoader = new UiSystemLoaderService(this.svSysCache);
    this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
    this.svSysCache.loadAndCacheAll();

    // ----------------------------
    // STEP 2: Load Theme Config
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    // ----------------------------
    // STEP 3: Apply Basic UI Setup
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
    // STEP 4: Load Default Module Path
    // ----------------------------
    if (shellConfig.defaultModulePath) {
      // ⭐ STEP 5: EAGER LOAD SYSTEM METADATA (Final Corrected Sequence) ⭐

      // 1. Initialize the SysCache Singleton, injecting ConfigService.
      // NOTE: This MUST be the first instance created for the entire architecture.
      const sysCacheInstance = SysCacheService.getInstance(this.svConfig);

      // 2. Initialize UiSystemLoader and UiThemeLoader, injecting the SysCache Singleton.
      const uiSystemLoaderInstance = new UiSystemLoaderService(
        sysCacheInstance
      );
      const uiThemeLoaderInstance = new UiThemeLoaderService(sysCacheInstance);

      this.svUiSystemLoader = uiSystemLoaderInstance;
      this.svUiThemeLoader = uiThemeLoaderInstance;

      // 3. Inject BOTH Loaders back into the Cache Singleton (breaking the circular reference).
      sysCacheInstance.setLoaders(
        uiSystemLoaderInstance,
        uiThemeLoaderInstance
      );

      // 4. Trigger the single asynchronous load (loads config, then systems, then themes).
      this.logger.debug(
        "Main::bootstrapShell()/05: Awaiting SysCacheService Eager Load."
      );
      await sysCacheInstance.loadAndCacheAll();

      // ----------------------------
      // STEP 5: Load Allowed Modules
      // ----------------------------
      const allowedModules: ICdModule[] =
        await this.svModule.getAllowedModules();
      this.logger.debug("Main::allowedModules", allowedModules);

      // Get default module/controller info once for use in Step 6 & 10
      const defaultModule = allowedModules.find((m) => m.isDefault);
      const defaultControllerName = defaultModule?.controllers.find(
        (c) => c.default === true
      )?.name;

      // ----------------------------
      // STEP 6: Construct Base Menu & Inject Controller Metadata (AND MARK DEFAULT)
      // ----------------------------
      const rawMenu: MenuItem[] = allowedModules.flatMap((mod: ICdModule) => {
        // Helper function to recursively process the menu
        const processMenuChildren = (items: MenuItem[]): MenuItem[] => {
          return items.map((item) => {
            // Only process items that are designed to load a view (itemType === 'route')
            if (item.itemType === "route" && item.route) {
              const controllerInfo =
                this.svController.findControllerInfoByRoute(mod, item.route);

              if (controllerInfo) {
                // Inject the required controller instance and template function
                (item as any).controller = controllerInfo.instance;
                (item as any).template =
                  typeof controllerInfo.template === "function"
                    ? controllerInfo.template
                    : () => controllerInfo.template;

                (item as any).moduleId = mod.moduleId; // Ensure moduleId is present

                // ⭐ CRITICAL: MARK THE DEFAULT MENU ITEM HERE ⭐
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
      // STEP 7: Prepare Menu via MenuService
      // (assign IDs + normalize item types. moduleDefault is preserved.)
      // ----------------------------
      const preparedMenu = this.svMenu.prepareMenu(rawMenu);
      this.logger.debug(
        "Main::preparedMenu",
        inspect(preparedMenu, { depth: 4 })
      );

      // ----------------------------
      // STEP 8 & 9: Load Theme and Render Menu with System
      // ----------------------------
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      // ... (Error handling for theme fetch) ...
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      // ----------------------------
      // STEP 10: Auto-load Default Module View (Policy Enforcement)
      // ----------------------------
      // console.log('[Main][run] allowedModules:', allowedModules)
      // const dModule = allowedModules.find(
      //   (m) => m.isDefault === true
      // );
      // const defaultModuleName = defaultModule.moduleId;
      // console.log('[Main][run] defaultModuleName:', defaultModuleName)

      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule.moduleId
      );
      console.log("[Main][run] defaultModuleMenu:", defaultModuleMenu);
      // Search the PREPARED MENU for the item marked as default.
      const defaultMenuItem = defaultModuleMenu.children.find(
        (item) => item.moduleDefault === true
      );
      console.log("[Main][run] defaultMenuItem:", defaultMenuItem);

      if (defaultMenuItem) {
        // CRITICAL: Trigger the Sequential Activation Policy (SAP) via MenuService.
        this.logger.debug(
          `Main::bootstrapShell()/10: Triggering MenuService for default view: ${defaultMenuItem.route}`
        );
        this.svMenu.loadResource({ item: defaultMenuItem });
      } else {
        this.logger.warn(
          "Default menu item not found or marked. Auto-load skipped."
        );
      }
      this.logger.debug("bootstrapShell()/11: End of initialization sequence.");
    }

    // ----------------------------
    // STEP 11: Final UI Setup (Theme & Menu Toggle)
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
```

///////////////////////////////////////////////////
You can proceed with refactoring the SysCacheService and and ctlCdAdminSettings. Their current states have been shared below.
```ts
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service"; // Assume import
import { ConfigService } from "./config.service";

export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>(); 
  private uiSystemLoader!: UiSystemLoaderService;
  private uiThemeLoader!: UiThemeLoaderService; // NEW: Theme loader dependency

  // Private constructor now accepts the global ConfigService instance
  constructor(private configService: ConfigService) {}

  public static getInstance(configService?: ConfigService): SysCacheService {
    if (!SysCacheService.instance) {
         if (!configService) {
            throw new Error("SysCacheService must be initialized with ConfigService on first call.");
        }
      SysCacheService.instance = new SysCacheService(configService);
    }
    return SysCacheService.instance;
  }

  // ⭐ Refactored Setter: Now accepts both loaders
  public setLoaders(loader: UiSystemLoaderService, themeLoader: UiThemeLoaderService): void {
    this.uiSystemLoader = loader;
    this.uiThemeLoader = themeLoader;
  }

  // CRITICAL: The single ASYNCHRONOUS entry point for system data loading
  public async loadAndCacheAll(): Promise<void> {
    if (!this.uiSystemLoader || !this.uiThemeLoader) {
      throw new Error("SysCacheService: All required loaders must be set before loading data.");
    }
    if (this.cache.size > 0) return;

    console.log("[SysCacheService] 01: Starting Eager Load (Singleton).");

    // 1. LOAD GLOBAL CONFIGURATION ONCE (Policy Enforcement)
    const uiConfig = await this.configService.loadConfig();
    this.cache.set("uiConfig", uiConfig);

    // 2. Load System Data (Pass the loaded config to the fetcher)
    const uiSystemsData = await this.uiSystemLoader.fetchAvailableSystems(uiConfig);
    this.cache.set("uiSystems", uiSystemsData);

    // 3. Load Theme Data (NEW)
    const uiThemesData = await this.uiThemeLoader.fetchAvailableThemes(uiConfig);
    this.cache.set('themes', uiThemesData);
    
    console.log(`[SysCacheService] Eager Load complete. Systems: ${uiSystemsData.length}, Themes Loaded.`);
  }

  // The synchronous getter for controllers/services
  public get(key: string): any {
    return this.cache.get(key) || [];
  }
}
```

```js
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";
import { ConfigService } from "../../moduleman/services/config.service";

import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { CdAdminService } from "../services/cd-admin.service";

export const ctlCdAdminSettings = {
  // Ensure service properties are initialized here to avoid "null" access
  // if the framework calls getters before __init().
  // This is a common pattern for framework compilation of properties.
  form: null,
  binder: null,
  // 1. FIX: Initialize services to null/undefined. They must be set in __init().
  uiSystemLoader: null,
  uiThemeLoader: null,
  svCdAdmin: null,
  currentUiSystemId: "",

  /**
   * Initializes the controller's persistent state (runs ONCE).
   * NOTE: The code below needs to be adjusted based on the initializations above.
   * If they are initialized above, __init can focus on the form group.
   */

  __init() {
    console.log('[ctlCdAdminSettings][__init] start...')
    console.log('[ctlCdAdminSettings][__init] 01')
    // 1. Get the Singleton instance
    const sysCache = SysCacheService.getInstance();

    // 2. Instantiate dependencies ONLY here (ONCE per controller instance)
    this.uiSystemLoader = new UiSystemLoaderService(sysCache);
    if (!this.uiSystemLoader) {
      console.warn('[ctlCdAdminSettings][__init] SystemLoader not ready')
    }
    this.svCdAdmin = new CdAdminService(sysCache);
    if (!this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][__init] CdAdmin not ready')
    }
    this.uiThemeLoader = new UiThemeLoaderService(sysCache);
    if (!this.uiThemeLoader) {
      console.warn('[ctlCdAdminSettings][__init] ThemeLoader not ready')
    }

    // 3. Form and Binder initialization remain here.
    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [
        CdValidators.required("UI System selection is required"),
      ]),
      theme: new CdFormControl("", [
        CdValidators.required("Theme selection is required"),
      ]),
      formType: new CdFormControl("", [
        CdValidators.required("Form type is required"),
      ]),
    });

    // Initialize binder (includes our new Angular-style binding logic)
    this.binder = new CdDirectiveBinderService(
      this.form,
      "#settingsForm",
      this
    );
  },

  /**
   * Renders the HTML template using dynamic interpolation.
   */
  __template() {
    // Uses template interpolation to call the getter methods
    console.log('[ctlCdAdminSettings][__template] start...')
    return `
      <form id="settingsForm" class="cd-form">
        <div class="cd-form-field">
          <label for="uiSystem">UI System</label>
          <select id="uiSystem" name="uiSystem" cdFormControl (change)="onUiSystemChange($event)">
            ${this.uiSystemOptionsHtml}
          </select>
          <div class="error-message" data-error-for="uiSystem"></div>
        </div>

        <div class="cd-form-field">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" cdFormControl (change)="onThemeChange($event)">
            ${this.themeOptionsHtml}
          </select>
          <div class="error-message" data-error-for="theme"></div>
        </div>

        <div class="cd-form-field">
          <label for="formType">Form Variant</label>
          <select id="formType" name="formType" cdFormControl (change)="onFormVariantChange($event)">
            ${this.formVariantOptionsHtml}
          </select>
          <div class="error-message" data-error-for="formType"></div>
        </div>
        
        <button type="submit">Apply Settings</button>
      </form>
    `;
  },

  // --- GETTER METHODS (Equivalent to TypeScript getters) ---

  get uiSystemOptionsHtml() {
    console.log('[ctlCdAdminSettings][uiSystemOptionsHtml] start...')
    // The guard clause remains essential here, handling the timing anomaly gracefully
    if (!this.uiSystemLoader || !this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][uiSystemOptionsHtml] Loader not ready')
      return '<option value="">-- Loader Not Ready --</option>';
    }
    const activeSystem = this.uiSystemLoader.getActive();
    console.log('[ctlCdAdminSettings][uiSystemOptionsHtml] activeSystem:', activeSystem);
    const activeSystemId = activeSystem ? activeSystem.id : "";
    console.log('[ctlCdAdminSettings][uiSystemOptionsHtml] activeSystemId:', activeSystemId);

    return this.svCdAdmin.generateUiSystemOptions(activeSystemId);
  },

  get themeOptionsHtml() {
    console.log('[ctlCdAdminSettings][themeOptionsHtml] start...')
    // 💥 FIX: Removed redundant service instantiation here!
    if (!this.uiThemeLoader || !this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][themeOptionsHtml] Loader not ready')
      return '<option value="">-- Loader Not Ready --</option>';
    }

    const activeThemeId = this.uiThemeLoader.getActiveThemeId();
    console.log(
      "[ctlCdAdminSettings][get themeOptionsHtml] activeThemeId:",
      activeThemeId
    );

    return this.svCdAdmin.generateThemeOptions(
      this.currentUiSystemId,
      activeThemeId
    );
  },

  get formVariantOptionsHtml() {
    console.log('[ctlCdAdminSettings][formVariantOptionsHtml] start...')
    if (!this.uiThemeLoader || !this.svCdAdmin) {
      console.warn('[ctlCdAdminSettings][formVariantOptionsHtml] Loader not ready')
      return '<option value="">-- Loader Not Ready --</option>';
    }
    const activeVariantId = this.uiThemeLoader.getActiveFormVariantId();
    return this.svCdAdmin.generateFormVariantOptions(activeVariantId);
  },

  // --- LIFECYCLE HOOKS ---
  async __setup() {
    console.log('[ctlCdAdminSettings][__setup] start...')
    // 1. Ensure synchronous init is done first (if necessary)
    if (!this.form) {
      this.__init();
    }

    // 2. THEME AND VARIANT STATE INITIALIZATION (Anomaly 2 Fix)
    // This runs AFTER Main.run() loads the cache, but BEFORE __template() runs.
    const sysCache = SysCacheService.getInstance();
    // Get the cached configuration, which contains the defaults.
    const uiConfig = sysCache.get("uiConfig");

    // --- A. Initialize Active Theme ---
    let activeThemeId = this.uiThemeLoader.getActiveThemeId();
    if (!activeThemeId || activeThemeId === "") {
      activeThemeId = uiConfig.defaultThemeId || "default";
      this.uiThemeLoader.setActiveThemeId(activeThemeId); // Persist the default
    }
    await this.uiThemeLoader.loadThemeById(activeThemeId);

    // --- B. Initialize Form Variant ---
    let activeVariantId = this.uiThemeLoader.getActiveFormVariantId();
    if (
      activeVariantId === "standard" &&
      uiConfig.defaultFormVariant !== "standard"
    ) {
      activeVariantId = uiConfig.defaultFormVariant || "standard";
      this.uiThemeLoader.setActiveFormVariantId(activeVariantId);
    }
    await this.uiThemeLoader.loadFormVariant(activeVariantId);
  },

  async __activate() {
    console.log('[ctlCdAdminSettings][__activate] start...')

    // 1. Run DOM binding
    if (this.binder?.bindToDom) {
      await this.binder.bindToDom();
    }
    // ... (rest of DOM setup remains) ...
  },

  async __afterInit() {
    console.log('[ctlCdAdminSettings][__afterInit] start...')

    // 1. Retrieve the data from the single, initialized instances
    const activeSystem = this.uiSystemLoader.getActive();
    const formControls = this.form.controls;

    // 2. Set initial form control values
    if (activeSystem && formControls.uiSystem) {
      this.currentUiSystemId = activeSystem.id;
      formControls.uiSystem.setValue(activeSystem.id);
    }

    // These now read the state correctly set in __setup()
    formControls.theme.setValue(this.uiThemeLoader.getActiveThemeId());
    formControls.formType.setValue(this.uiThemeLoader.getActiveFormVariantId());

    // 3. Force Re-render (Final step to populate the dropdown HTML)
    if (this.binder?.refreshView) {
      this.binder.refreshView();
    }

    console.log("[ctlCdAdminSettings][__afterInit] end: View is synchronized.");
  },

  __deactivate() {
    console.log("[ctlCdAdminSettings][__deactivate] 01");
    if (this.binder?.unbindAllDomEvents) {
      this.binder.unbindAllDomEvents();
    }
  },

  // --- ACTION METHODS ---

  async applySettings() {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      console.warn(
        "Please select all required fields before applying settings."
      );
      return;
    }

    const selections = this.form.value;
    console.log("✅ Applied Configuration:", selections);

    await this.uiSystemLoader.activate(selections.uiSystem);
    await this.uiThemeLoader.loadThemeById(selections.theme);
    await this.uiThemeLoader.loadFormVariant(selections.formType);
  },

  async onUiSystemChange(e) {
    const newSystemId = e.target.value;
    console.log("🧩 UI System changed:", newSystemId);

    // 1. Update internal state and clear theme
    this.currentUiSystemId = newSystemId;
    this.form.controls.theme.setValue("");

    // 2. Assume re-rendering is handled by a binder method
    if (this.binder?.rebind) {
      // Rebind triggers __template() again, which refreshes themeOptionsHtml
      await this.binder.rebind();
    }
  },

  async onThemeChange(e) {
    console.log("🎨 Theme changed:", e.target.value);
  },

  async onFormVariantChange(e) {
    console.log("🧱 Form Variant changed:", e.target.value);
  },
};

```

////////////////////////////////////////////

latest observations:
The usSystem dropdown has one item whose name is undefined
The themes dropdown reports no available data
The forms variants has two items: stantart and compact 
Earlier bootstrap theme was rendering but now it is not

Below is the latest logs.
- Data seem available but probably the method of accessing the data needs to be refined.

Let me know if you have further observations from the log and suggested fix for arising issues.

```log
Menu clicked → ID: menu-item-cd-admin-settings, Label: settings index-bZCAJZXJ.js:31:4754
MenuService:onMenuClick()/item: { label: 'settings',
  itemType: 'route',
  route: 'sys/cd-admin/settings',
  template: [Function: template],
  controller: 
   { form: null,
     binder: null,
     uiSystemLoader: null,
     uiThemeLoader: null,
     svCdAdmin: null,
     currentUiSystemId: '',
     __init: [Function: __init],
     __template: [Function: __template],
     uiSystemOptionsHtml: [Getter],
     themeOptionsHtml: [Getter],
     formVariantOptionsHtml: [Getter],
     __setup: [Function: __setup],
     __activate: [Function: __activate],
     __afterInit: [Function: __afterInit],
     __deactivate: [Function: __deactivate],
     onUiSystemChange: [Function: onUiSystemChange],
     onThemeChange: [Function: onThemeChange],
     onFormVariantChange: [Function: onFormVariantChange] },
  moduleId: 'cd-admin',
  menuId: 'menu-item-cd-admin-settings' } index-bZCAJZXJ.js:31:4821
MenuService::loadResource()/start... index-bZCAJZXJ.js:31:5187
[MenuService][loadResource] options: 
Object { cdToken: undefined, item: {…} }
index-bZCAJZXJ.js:31:5239
[ControllerCacheService][getInstance] start... index-bZCAJZXJ.js:22:6771
MenuService::loadResource()/01: Executing __deactivate() on active controller index-bZCAJZXJ.js:31:5568
[ctlSignIn][__deactivate] 01 index-C9lWU5VA.js:28:436
CdDirectiveBinderService: Unbinding 0 listeners. cd-directive-binder.service-P6kntAs5.js:1:2653
MenuService::loadResource()/02: Retrieving controller via cache service index-bZCAJZXJ.js:31:5705
[ControllerCacheService][getOrInitializeController] start... index-bZCAJZXJ.js:22:6919
[ControllerCacheService] Creating new instance for: sys/cd-admin/settings index-bZCAJZXJ.js:22:7100
[ControllerCacheService] Running __init() for sys/cd-admin/settings index-bZCAJZXJ.js:22:7369
[ctlCdAdminSettings][__init] start... index-BbfbUN7H.js:1:1873
CdFormGroup::_constructor()/01 cd-directive-binder.service-P6kntAs5.js:1:46
CdDirectiveBinderService::constructor()/start - DOM lookups deferred. cd-directive-binder.service-P6kntAs5.js:1:1386
[ControllerCacheService] Running __setup() for sys/cd-admin/settings index-bZCAJZXJ.js:22:7562
[ctlCdAdminSettings][__setup] start... index-BbfbUN7H.js:26:1262
[ControllerCacheService] Cached instance for sys/cd-admin/settings index-bZCAJZXJ.js:22:7754
MenuService::loadResource()/03: Injecting template into DOM index-bZCAJZXJ.js:31:6171
[ctlCdAdminSettings][__template] start... index-BbfbUN7H.js:1:2285
[ctlCdAdminSettings][uiSystemOptionsHtml] start... index-BbfbUN7H.js:26:42
[ctlCdAdminSettings][uiSystemOptionsHtml] uiSystems: [ { id: 'bootstrap-5',
    name: 'Bootstrap 5',
    scripts: [ '/assets/ui-systems/bootstrap-5/bootstrap.min.js' ],
    themesAvailable: [ [Object] ],
    themeActive: { id: 'default', name: 'Default Light', stylesheets: [Object] } } ] index-BbfbUN7H.js:26:154
[ctlCdAdminSettings][themeOptionsHtml] start... index-BbfbUN7H.js:26:453
[ctlCdAdminSettings][themeOptionsHtml] themes: { themes: 
   [ { id: 'default', name: 'Default Theme (from config)' },
     { id: 'dark', name: 'Dark Mode' } ],
  variants: 
   [ { id: 'standard', name: 'Standard' },
     { id: 'rounded', name: 'Rounded' },
     { id: 'outlined', name: 'Outlined' } ],
  uiConfig: 
   { defaultUiSystemId: 'bootstrap-5',
     defaultThemeId: 'default',
     defaultFormVariant: 'standard',
     uiSystemBasePath: '/public/assets/ui-systems/' } } index-BbfbUN7H.js:26:559
[ctlCdAdminSettings][formVariantOptionsHtml] start... index-BbfbUN7H.js:26:857
[ctlCdAdminSettings][formVariantOptionsHtml] variants: [ { id: 'standard', displayName: 'Standard' },
  { id: 'compact', displayName: 'Compact' } ] index-BbfbUN7H.js:26:975
MenuService::loadResource()/04: Executing __activate() index-bZCAJZXJ.js:31:6426
[ctlCdAdminSettings][__activate] start... index-BbfbUN7H.js:26:1378
[CdDirectiveBinderService][bindToDom] 01 cd-directive-binder.service-P6kntAs5.js:1:1550
MenuService::loadResource()/05: Executing __afterInit() index-bZCAJZXJ.js:31:6553
[ctlCdAdminSettings][__afterInit] start... index-BbfbUN7H.js:26:1528
[ctlCdAdminSettings][__afterInit] end. index-BbfbUN7H.js:26:1866
MenuService::loadResource()/end
```

```js
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";
import { inspect } from "util";

import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { CdAdminService } from "../services/cd-admin.service";

export const ctlCdAdminSettings = {
  form: null,
  binder: null,
  uiSystemLoader: null,
  uiThemeLoader: null,
  svCdAdmin: null,
  currentUiSystemId: "",

  // ------------------------
  // 🔹 INIT (Runs Once)
  // ------------------------
  __init() {
    console.log("[ctlCdAdminSettings][__init] start...");
    const sysCache = SysCacheService.getInstance();

    // Reuse boot-loaded services instead of new instances
    this.uiSystemLoader = sysCache["uiSystemLoader"];
    this.uiThemeLoader = sysCache["uiThemeLoader"];

    // Create AdminService (stateless, lightweight)
    this.svCdAdmin = new CdAdminService(sysCache);

    // Build form
    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [CdValidators.required("Select UI System")]),
      theme: new CdFormControl("", [CdValidators.required("Select Theme")]),
      formType: new CdFormControl("", [CdValidators.required("Select Form Type")]),
    });

    // Setup binder
    this.binder = new CdDirectiveBinderService(this.form, "#settingsForm", this);
  },

  // ------------------------
  // 🔹 TEMPLATE
  // ------------------------
  __template() {
    console.log("[ctlCdAdminSettings][__template] start...");
    return `
      <form id="settingsForm" class="cd-form">
        <div class="cd-form-field">
          <label for="uiSystem">UI System</label>
          <select id="uiSystem" name="uiSystem" cdFormControl (change)="onUiSystemChange($event)">
            ${this.uiSystemOptionsHtml}
          </select>
        </div>

        <div class="cd-form-field">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" cdFormControl (change)="onThemeChange($event)">
            ${this.themeOptionsHtml}
          </select>
        </div>

        <div class="cd-form-field">
          <label for="formType">Form Variant</label>
          <select id="formType" name="formType" cdFormControl (change)="onFormVariantChange($event)">
            ${this.formVariantOptionsHtml}
          </select>
        </div>

        <button type="submit">Apply Settings</button>
      </form>
    `;
  },

  // ------------------------
  // 🔹 DROPDOWN DATA (CACHED)
  // ------------------------
  get uiSystemOptionsHtml() {
    console.log("[ctlCdAdminSettings][uiSystemOptionsHtml] start...");
    const sysCache = SysCacheService.getInstance();
    const uiSystems = sysCache.getUiSystems();
    console.log("[ctlCdAdminSettings][uiSystemOptionsHtml] uiSystems:", inspect(uiSystems, {depth: 2}));
    if (!uiSystems.length) return `<option value="">-- No Systems Found --</option>`;

    const options = uiSystems
      .map((sys) => `<option value="${sys.id}">${sys.displayName}</option>`)
      .join("");

    return `<option value="">-- Select UI System --</option>${options}`;
  },

  get themeOptionsHtml() {
    console.log("[ctlCdAdminSettings][themeOptionsHtml] start...");
    const sysCache = SysCacheService.getInstance();
    const themes = sysCache.getThemes();
    console.log("[ctlCdAdminSettings][themeOptionsHtml] themes:", inspect(themes, {depth: 2}));
    if (!themes.length) return `<option value="">-- No Themes Available --</option>`;

    const options = themes
      .map((t) => `<option value="${t.id}">${t.displayName}</option>`)
      .join("");

    return `<option value="">-- Select Theme --</option>${options}`;
  },

  get formVariantOptionsHtml() {
    console.log("[ctlCdAdminSettings][formVariantOptionsHtml] start...");
    const sysCache = SysCacheService.getInstance();
    const variants = sysCache.getFormVariants();
    console.log("[ctlCdAdminSettings][formVariantOptionsHtml] variants:", inspect(variants, {depth: 2}));
    if (!variants.length) return `<option value="">-- No Variants --</option>`;

    const options = variants
      .map((v) => `<option value="${v.id}">${v.displayName}</option>`)
      .join("");

    return `<option value="">-- Select Variant --</option>${options}`;
  },

  // ------------------------
  // 🔹 LIFECYCLE HOOKS
  // ------------------------
  async __setup() {
    console.log("[ctlCdAdminSettings][__setup] start...");
    const sysCache = SysCacheService.getInstance();
    await sysCache.ensureReady(); // ensure all data preloaded
  },

  async __activate() {
    console.log("[ctlCdAdminSettings][__activate] start...");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlCdAdminSettings][__afterInit] start...");
    const formControls = this.form.controls;
    const sysCache = SysCacheService.getInstance();

    // Use first available system/theme/variant as defaults
    const systems = sysCache.getUiSystems();
    const themes = sysCache.getThemes();
    const variants = sysCache.getFormVariants();

    if (systems.length) formControls.uiSystem.setValue(systems[0].id);
    if (themes.length) formControls.theme.setValue(themes[0].id);
    if (variants.length) formControls.formType.setValue(variants[0].id);

    if (this.binder?.refreshView) this.binder.refreshView();
    console.log("[ctlCdAdminSettings][__afterInit] end.");
  },

  __deactivate() {
    console.log("[ctlCdAdminSettings][__deactivate]");
    if (this.binder?.unbindAllDomEvents) this.binder.unbindAllDomEvents();
  },

  // ------------------------
  // 🔹 EVENT HANDLERS
  // ------------------------
  async onUiSystemChange(e) {
    console.log("🧩 UI System changed:", e.target.value);
    this.currentUiSystemId = e.target.value;
  },

  async onThemeChange(e) {
    console.log("🎨 Theme changed:", e.target.value);
  },

  async onFormVariantChange(e) {
    console.log("🧱 Form Variant changed:", e.target.value);
  },
};

```

/////////////////////////////////////////
I am currently working of effecting your recommendations.
But for your FYI:
Below are excerpts from the data source for your information to build the correct expectations.

```ts
export class UiSystemLoaderService{
  async fetchAvailableSystems(uiConfig: UiConfig): Promise<UiSystemDescriptor[]> {
    console.log('[UiSystemLoaderService][fetchAvailableSystems] starting async data load.');
    
    // Config is provided. No redundant await this.configService.loadConfig() here.
    
    const systems: UiSystemDescriptor[] = [];
    
    // Simulate 'discover' logic 
    STATIC_UI_SYSTEM_REGISTRY.forEach(descriptor => {
        systems.push(descriptor);
    });
    
    return systems;
  }
}
```

```ts
export const STATIC_UI_SYSTEM_REGISTRY: UiSystemDescriptor[] = [
  {
    id: "bootstrap-5",
    name: "Bootstrap 5",
    // ... (other properties)
    scripts: ["/assets/ui-systems/bootstrap-5/bootstrap.min.js"], // Added core script
    themesAvailable: [
      {
        id: "default",
        name: "Default Light",
        isDefault: true,
        // FIX: Pointing to the known location of the main CSS file
        stylesheets: ["/assets/ui-systems/bootstrap-5/bootstrap.min.css"], 
      },
      // ... (other themes would use custom CSS paths, assuming they exist elsewhere)
    ],
    themeActive: {
      id: "default",
      name: "Default Light",
      // FIX: Ensure themeActive uses the correct path too
      stylesheets: ["/assets/ui-systems/bootstrap-5/bootstrap.min.css"],
    },
  },
  // ... (corpdesk-ui entry remains the same, assuming its paths will be fixed later)
];
```

```ts
export class UiThemeLoadService{
  async fetchAvailableThemes(uiConfig: UiConfig): Promise<any> {
    console.log(
      "[UiThemeLoaderService][fetchAvailableThemes] starting async data load."
    );

    // 1. Configuration is provided by SysCacheService.

    // 2. Simulate Discovery/Configuration based on uiConfig.
    const themesData = [
      { id: uiConfig.defaultThemeId, name: "Default Theme (from config)" },
      { id: "dark", name: "Dark Mode" },
      // ...
    ];

    const variantsData = [
      { id: "standard", name: "Standard" },
      { id: "rounded", name: "Rounded" },
      { id: "outlined", name: "Outlined" },
    ];

    return {
      themes: themesData,
      variants: variantsData,
      uiConfig: uiConfig,
    };
  }
}
```

///////////////////////////////////////////////////
Use the information beneth to add material-design as UiSystemDescriptor to STATIC_UI_SYSTEM_REGISTRY
```ts
export const STATIC_UI_SYSTEM_REGISTRY: UiSystemDescriptor[] = [
  {
    id: "bootstrap-5",
    name: "Bootstrap 5",
    // ... (other properties)
    scripts: ["/assets/ui-systems/bootstrap-5/bootstrap.min.js"], // Added core script
    themesAvailable: [
      {
        id: "default",
        name: "Default Light",
        isDefault: true,
        // FIX: Pointing to the known location of the main CSS file
        stylesheets: ["/assets/ui-systems/bootstrap-5/bootstrap.min.css"], 
      },
      // ... (other themes would use custom CSS paths, assuming they exist elsewhere)
    ],
    themeActive: {
      id: "default",
      name: "Default Light",
      // FIX: Ensure themeActive uses the correct path too
      stylesheets: ["/assets/ui-systems/bootstrap-5/bootstrap.min.css"],
    },
  },
  // ... (corpdesk-ui entry remains the same, assuming its paths will be fixed later)
];
```

```sh
emp-12@emp-12 ~/cd-shell (main)> tree public/
public/
├── assets
│   ├── css
│   │   ├── font-awesome-6.5.0
│   │   │   └── all.min.css
│   │   └── index.css
│   ├── fonts
│   ├── images
│   └── ui-systems
│       ├── bootstrap-5
│       │   ├── bootstrap.min.css
│       │   ├── bootstrap.min.js
│       │   └── descriptor.json
│       └── material-design
│           ├── descriptor.json
│           ├── material-components-web.min.css
│           └── material-components-web.min.js
├── shell.config.json
└── themes
    ├── common
    │   ├── base.css
    │   ├── forms
    │   │   ├── cd-forms.css
    │   │   └── variants
    │   │       ├── cd-form-compact.css
    │   │       ├── cd-form-floating.css
    │   │       └── cd-form-standard.css
    │   ├── layout.json
    │   └── menu-neutral.css
    ├── dark
    │   ├── menu-systems
    │   │   └── metismenu.css
    │   ├── theme.css
    │   └── theme.json
    └── default
        ├── logo.png
        ├── menu-systems
        │   └── metismenu.css
        ├── theme.css
        └── theme.json
```
// shell.config.json
```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig":  {"currentThemePath": "/themes/default/theme.json","accessibleThemes":["default", "dark", "contrast"]},
   "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "bootstrap-5", 
    "defaultThemeId": "default", 
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/public/assets/ui-systems/"
  }
}
```

/////////////////////////////////////////////////////
Now we are in a very good position:
1. When the admin settings is clicked, we have a way of loading system data ready for application.
2. The data flow and architecture is working as expected.
Key short fals: 
1. Activating ui-systems, themes and form variants 
While everything is working as expected, the ui-systems, themes and form variants are in place but they do not seem active.
2. Without trying to do everything at once, we need to focus how the defaults are set during Main.run() until such time that the setting are changed at the admin settings page.
3. Just like we are relying on SysCacheService to access the cached system data, during Main.run(), the process should be able to tel defauls and how to set them. This should apply for ui-system, themes and form variants. This list will keep on going up as we add features.

```ts
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
  private svUiThemeLoader!:UiThemeLoaderService;
  private svTheme!: ThemeService;
  // private svThemeLoader!: ThemeLoaderService;
  private logger = new LoggerService();

  constructor() {
    // intentionally empty — setup moved to init()
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig)
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

    // cache system data
    this.svUiSystemLoader = new UiSystemLoaderService(this.svSysCache);
    this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);
    this.svSysCache.loadAndCacheAll();

    // ----------------------------
    // STEP 2: Load Theme Config
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    // ----------------------------
    // STEP 3: Apply Basic UI Setup
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
    // STEP 4: Load Default Module Path
    // ----------------------------
    if (shellConfig.defaultModulePath) {
      // ⭐ STEP 5: EAGER LOAD SYSTEM METADATA (Final Corrected Sequence) ⭐

      // 1. Initialize the SysCache Singleton, injecting ConfigService.
      // NOTE: This MUST be the first instance created for the entire architecture.
      const sysCacheInstance = SysCacheService.getInstance(this.svConfig);

      // 2. Initialize UiSystemLoader and UiThemeLoader, injecting the SysCache Singleton.
      const uiSystemLoaderInstance = new UiSystemLoaderService(
        sysCacheInstance
      );
      const uiThemeLoaderInstance = new UiThemeLoaderService(sysCacheInstance);

      this.svUiSystemLoader = uiSystemLoaderInstance;
      this.svUiThemeLoader = uiThemeLoaderInstance;

      // 3. Inject BOTH Loaders back into the Cache Singleton (breaking the circular reference).
      sysCacheInstance.setLoaders(
        uiSystemLoaderInstance,
        uiThemeLoaderInstance
      );

      // 4. Trigger the single asynchronous load (loads config, then systems, then themes).
      this.logger.debug(
        "Main::bootstrapShell()/05: Awaiting SysCacheService Eager Load."
      );
      await sysCacheInstance.loadAndCacheAll();

      // ----------------------------
      // STEP 5: Load Allowed Modules
      // ----------------------------
      const allowedModules: ICdModule[] =
        await this.svModule.getAllowedModules();
      this.logger.debug("Main::allowedModules", allowedModules);

      // Get default module/controller info once for use in Step 6 & 10
      const defaultModule = allowedModules.find((m) => m.isDefault);
      const defaultControllerName = defaultModule?.controllers.find(
        (c) => c.default === true
      )?.name;

      // ----------------------------
      // STEP 6: Construct Base Menu & Inject Controller Metadata (AND MARK DEFAULT)
      // ----------------------------
      const rawMenu: MenuItem[] = allowedModules.flatMap((mod: ICdModule) => {
        // Helper function to recursively process the menu
        const processMenuChildren = (items: MenuItem[]): MenuItem[] => {
          return items.map((item) => {
            // Only process items that are designed to load a view (itemType === 'route')
            if (item.itemType === "route" && item.route) {
              const controllerInfo =
                this.svController.findControllerInfoByRoute(mod, item.route);

              if (controllerInfo) {
                // Inject the required controller instance and template function
                (item as any).controller = controllerInfo.instance;
                (item as any).template =
                  typeof controllerInfo.template === "function"
                    ? controllerInfo.template
                    : () => controllerInfo.template;

                (item as any).moduleId = mod.moduleId; // Ensure moduleId is present

                // ⭐ CRITICAL: MARK THE DEFAULT MENU ITEM HERE ⭐
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
      // STEP 7: Prepare Menu via MenuService
      // (assign IDs + normalize item types. moduleDefault is preserved.)
      // ----------------------------
      const preparedMenu = this.svMenu.prepareMenu(rawMenu);
      this.logger.debug(
        "Main::preparedMenu",
        inspect(preparedMenu, { depth: 4 })
      );

      // ----------------------------
      // STEP 8 & 9: Load Theme and Render Menu with System
      // ----------------------------
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      // ... (Error handling for theme fetch) ...
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      // ----------------------------
      // STEP 10: Auto-load Default Module View (Policy Enforcement)
      // ----------------------------
      // console.log('[Main][run] allowedModules:', allowedModules)
      // const dModule = allowedModules.find(
      //   (m) => m.isDefault === true
      // );
      // const defaultModuleName = defaultModule.moduleId;
      // console.log('[Main][run] defaultModuleName:', defaultModuleName)

      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule.moduleId
      );
      console.log("[Main][run] defaultModuleMenu:", defaultModuleMenu);
      // Search the PREPARED MENU for the item marked as default.
      const defaultMenuItem = defaultModuleMenu.children.find(
        (item) => item.moduleDefault === true
      );
      console.log("[Main][run] defaultMenuItem:", defaultMenuItem);

      if (defaultMenuItem) {
        // CRITICAL: Trigger the Sequential Activation Policy (SAP) via MenuService.
        this.logger.debug(
          `Main::bootstrapShell()/10: Triggering MenuService for default view: ${defaultMenuItem.route}`
        );
        this.svMenu.loadResource({ item: defaultMenuItem });
      } else {
        this.logger.warn(
          "Default menu item not found or marked. Auto-load skipped."
        );
      }
      this.logger.debug("bootstrapShell()/11: End of initialization sequence.");
    }

    // ----------------------------
    // STEP 11: Final UI Setup (Theme & Menu Toggle)
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

```

////////////////////////////////////////////////////////

The menu items are hierachical.
So currently, under 'cd-user', there is 'sign-in' and 'sign-up'.
I have shared an example of how the cdUserModule.menu is configured.
Thne under 'cd-admin', we only have 'settings'.
We have not set any page that should load, when the item 'cd-user' or 'cd-admin' are clicked.
Also notice the property MenuItem.itemType and how it has been used.
There is a behaviour that we need to deal with:
Right now when 'cd-user' or 'cd-admin' are clicked, it tries to fill up the html page area with nothing so the area becomes blank until one clicks and active page set with __template().
But this analogy can be best managed by the MenuItem.itemType.
So when itemType === 'route', it should redraw the page otherwise, the only effect should just be expanding the menu item node.
Refactor the MenuService to corrent the current behaviour.

```ts
export interface MenuItem {
  menuId?: string;
  moduleId?: string;
  label: string;
  itemType: "action" | "template" | "route";
  action?: () => void; // optional custom handler
  template?: () => string; // optional for resource loading
  route?: string; // optional, legacy
  icon?: IMenuIcon;
  controller?: any; // controller instance
  children?: MenuItem[];
  moduleDefault?: boolean;
}
```

```js
export const cdUserModule = {
  ctx: "sys",
  isDefault: true,
  moduleId: "cd-user",
  moduleName: "Auto-Generated Module",
  moduleGuid: "auto-guid",
  // controller: ctlSignIn,
  // template: ctlSignIn.__template(),
  controllers: [
    { name: "sign-in", instance: ctlSignIn, template: ctlSignIn.__template(), default: true, },
    { name: "sign-up", instance: ctlSignUp, template: ctlSignUp.__template(), default: false, },
    // { name: "session", instance: ctlSession, template: ctlSession.__template(), default: false, },
  ],
  menu: [ // Menu structure is generated separately or hardcoded
    {
      label: 'cd-user',
      route: 'sys/cd-user',
      children: [
        { label: 'sign-in', itemType: 'route',  route: 'sys/cd-user/sign-in', template: ctlSignIn.__template() },
        { label: 'sign-up', itemType: 'route', route: 'sys/cd-user/sign-up', template: ctlSignUp.__template() }
      ]
    }
  ], 
};
```

```ts
import { IMenuAdapter, MenuItem } from "../models/menu.model";
import type { ITheme } from "../../theme/models/themes.model";
import { MetisMenuAdapter } from "./metismenu-adaptor.service";
import { ControllerCacheService } from "./controller-cache.service";
import { inspect } from "util";
// import { logger } from "../../../utils/logger";

export class MenuService {
  currentAdapter: any = null;
  private _activeController: any | null = null; // 💡 NEW: Tracks the current controller instance
  private activeController: any = null;

  renderMenuWithSystem(
    menu: MenuItem[],
    theme: ITheme,
    containerId = "cd-sidebar"
  ): void {
    console.debug("Starting renderMenuWithSystem()");
    console.debug("renderMenuWithSystem()/01");
    // Always render plain HTML
    this.renderPlainMenu(menu, containerId);

    // Initialize adapter if needed
    const system = theme?.layout?.sidebar?.menu?.menuSystem || "plain";
    const adapter = this.menuAdapterFactory(system);
    console.debug("renderMenuWithSystem()/adapter:", JSON.stringify(adapter));
    if (this.currentAdapter?.destroy) {
      console.debug("renderMenuWithSystem()/02");
      this.currentAdapter.destroy();
    }
    if (adapter) {
      console.debug("renderMenuWithSystem()/03");
      adapter.initialize(containerId, theme.id);
      this.currentAdapter = adapter;
    }
    console.debug("renderMenuWithSystem()/04");
  }

  renderPlainMenu(
    menu: MenuItem[],
    containerId: string = "sidebar",
    cdToken?: string
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;
    console.log(
      `MenuService::renderPlainMenu()/menu:`,
      this.renderMenuHtml(menu)
    );
    container.innerHTML = `<ul class="cd-menu-root">${this.renderMenuHtml(
      menu
    )}</ul>`;
    // Attach handlers to <li> elements
    this.attachClickHandlers(container, menu, cdToken);
  }

  attachClickHandlers(
    container: HTMLElement,
    menu: MenuItem[],
    cdToken?: string
  ) {
    const links = container.querySelectorAll(".cd-menu-link");
    links.forEach((linkEl) => {
      linkEl.addEventListener("click", (e) => {
        e.preventDefault(); // prevent `#` navigation
        e.stopPropagation();

        const id = linkEl.getAttribute("data-id");
        if (!id) return;

        const item = this.findMenuItemById(menu, id);
        if (item) this.onMenuClick(item, cdToken);
      });
    });
  }

  findMenuItemById(menu: MenuItem[], id: string): MenuItem | null {
    for (const item of menu) {
      if (item.menuId === id) return item;
      if (item.children) {
        const found = this.findMenuItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  walkMenu(
    menu: MenuItem[],
    parentEl: Element | HTMLElement,
    items: NodeListOf<Element>,
    index: number,
    cdToken: string
  ) {
    for (const item of menu) {
      const li = items[index++];
      if (li) {
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onMenuClick(item, cdToken);
        });
      }
      if (item.children?.length) {
        this.walkMenu(item.children, li, items, index, cdToken);
      }
    }
  }

  onMenuClick(item: MenuItem, cdToken?: string) {
    console.debug(`Menu clicked → ID: ${item.menuId}, Label: ${item.label}`);
    console.debug(
      "MenuService:onMenuClick()/item:",
      inspect(item, { depth: 2 })
    );

    if (item.itemType === "action" && item.action) {
      item.action();
      return;
    }

    if (item.itemType === "template" && item.template) {
      this.loadResource({ cdToken, item });
      return;
    }

    if (item.itemType === "route" && item.route) {
      this.loadResource({ cdToken, item });
      return;
    }

    console.warn("Unhandled menu item type:", item.itemType);
  }

  async loadResource(options: { cdToken?: string; item?: MenuItem } = {}) {
    console.log("MenuService::loadResource()/start...");
    console.log("[MenuService][loadResource] options:", options);

    const { cdToken, item } = options;
    if (!item) {
      console.error(
        "MenuService.loadResource() called without a valid MenuItem."
      );
      return;
    }

    const cacheService = ControllerCacheService.getInstance();
    const contentEl = document.getElementById("cd-main-content");
    let targetController;

    // --- 1️⃣ Deactivate currently active controller ---
    if (
      this.activeController &&
      typeof this.activeController.__deactivate === "function"
    ) {
      console.log(
        "MenuService::loadResource()/01: Executing __deactivate() on active controller"
      );
      await this.activeController.__deactivate();
    }

    // --- 2️⃣ Retrieve or initialize the target controller (now auto-runs __init + __setup) ---
    console.log(
      "MenuService::loadResource()/02: Retrieving controller via cache service"
    );
    targetController = await cacheService.getOrInitializeController(
      item.route || `${item.moduleId}-${item.label}`,
      item.controller
    );

    if (!targetController) {
      console.error(
        `[MenuService] Failed to initialize controller for route: ${item.route}`
      );
      return;
    }

    // --- 3️⃣ Safety Guard: Wait until essential loaders exist ---
    let waitCount = 0;
    while (
      (!targetController.uiSystemLoader || !targetController.svCdAdmin) &&
      waitCount < 10
    ) {
      console.warn(
        `[MenuService] Waiting for controller services to initialize... attempt ${waitCount + 1}`
      );
      await new Promise((res) => setTimeout(res, 20)); // 20ms delay
      waitCount++;
    }

    if (contentEl) {
      console.log(
        "MenuService::loadResource()/03: Injecting template into DOM"
      );

      let html = "";
      if (typeof item.template === "function") {
        html = item.template.call(targetController);
      } else if (typeof targetController.__template === "function") {
        html = targetController.__template.call(targetController);
      } else {
        html = item.template || "";
      }

      contentEl.innerHTML = html;
    }

    // --- 5️⃣ Activate Controller (DOM Binding Phase) ---
    if (typeof targetController.__activate === "function") {
      console.log("MenuService::loadResource()/04: Executing __activate()");
      await targetController.__activate();
    }

    // --- 6️⃣ AfterInit Hook (Final View Sync Phase) ---
    if (typeof targetController.__afterInit === "function") {
      console.log("MenuService::loadResource()/05: Executing __afterInit()");
      await targetController.__afterInit();
    }

    // --- 7️⃣ Mark as active controller ---
    this.activeController = targetController;
    console.log("MenuService::loadResource()/end");
  }

  /**
   * Retrieves the controller instance currently active in the main content area.
   */
  public getActiveController(): any | null {
    return this._activeController;
  }

  /**
   * Sets the controller instance that will be considered 'active'.
   */
  private setActiveController(controller: any | null): void {
    this._activeController = controller;
  }

  /**
   * Recursively renders the menu items into HTML.
   * @param menu - The menu items to render.
   * @returns The rendered HTML string.
   */

  renderMenuHtml(menu: MenuItem[]): string {
    return menu
      .map((item, index) => {
        const hasChildren = item.children && item.children.length > 0;
        const encodedIcon = item.icon ? btoa(JSON.stringify(item.icon)) : "";
        const itemType = item.itemType || "route";
        const route = item.route || "";
        const itemId =
          item.menuId ||
          `auto-${index}-${Math.random().toString(36).slice(2, 8)}`;

        // 🔁 Ensure stable id for later lookup
        item.menuId = itemId;

        return `
        <li 
          id="menu-item-${itemId}"
          class="cd-menu-item" 
          data-id="${itemId}"
          data-type="${itemType}"
          data-route="${route}"
          ${encodedIcon ? `data-icon="${encodedIcon}"` : ""}
          tabindex="0"
          role="button"
        >
          <a href="#" class="cd-menu-link" data-id="${itemId}">
            <span class="cd-menu-label">${item.label}</span>
            ${
              hasChildren
                ? `<span class="cd-menu-toggle-icon fa fa-chevron-right"></span>`
                : ""
            }
          </a>
          ${
            hasChildren
              ? `<ul class="cd-submenu">${this.renderMenuHtml(item.children!)}</ul>`
              : ""
          }
        </li>
      `;
      })
      .join("");
  }

  /**
   * Factory function to create a menu adapter based on the system type.
   * @param system - The system type (e.g., "metismenu", "plain").
   * @returns An instance of the corresponding menu adapter or null if no adapter is needed.
   */
  menuAdapterFactory(system: string): IMenuAdapter | null {
    switch (system) {
      case "metismenu":
        return new MetisMenuAdapter();
      // Add more as needed
      case "plain":
      default:
        return null; // plain menu needs no JS enhancement
    }
  }

  // 🧠 Convert string to kebab-case
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }

  // 🧩 Recursively assign deterministic menu IDs
  public assignMenuIds(menu: MenuItem[], parentId: string = ""): MenuItem[] {
    return menu.map((item) => {
      const baseName = item.label || item.route || "item";
      const itemId = `menu-item-${parentId ? parentId + "-" : ""}${this.toKebabCase(baseName)}`;

      const withId: MenuItem = {
        ...item,
        menuId: itemId,
      };

      if (item.children && item.children.length > 0) {
        withId.children = this.assignMenuIds(
          item.children,
          this.toKebabCase(baseName)
        );
      }

      return withId;
    });
  }

  // 🚀 High-level helper to prepare full menu
  public prepareMenu(menu: MenuItem[]): MenuItem[] {
    // 1️⃣ Assign stable menu IDs
    const menuWithIds = this.assignMenuIds(menu);

    // 2️⃣ Normalize item types (route, template, action, etc.)
    const normalizedMenu = this.ensureItemTypes(menuWithIds);

    // 3️⃣ Return fully prepared structure
    return normalizedMenu;
  }

  /**
   * Ensures that each menu item has an explicit itemType based on its properties.
   */
  private ensureItemTypes(menu: MenuItem[]): MenuItem[] {
    return menu.map((item) => {
      // Restrict inferredType to the same union used by MenuItem.itemType and default to "route"
      let inferredType: "route" | "template" | "action" = "route";

      if (item.itemType) {
        inferredType = item.itemType; // respect explicit type
      } else if (item.action) {
        inferredType = "action";
      } else if (item.template) {
        inferredType = "template";
      } else if (item.route) {
        inferredType = "route";
      }

      const normalizedItem: MenuItem = {
        ...item,
        itemType: inferredType,
      };

      if (item.children && item.children.length > 0) {
        normalizedItem.children = this.ensureItemTypes(item.children);
      }

      return normalizedItem;
    });
  }
}

```

///////////////////////////////////////////

Assist me to revice the corpdesk-rfc-0005 attached based on various solutions that we had had to do to achive the principles contained in the document.
For example, how the process is achored on SysCacheService.
Knowing the problems we have encountered and how they were resolved, make notes about best practice and cautions of wrong implementations that can compromise the system. Or in the context of rfc, the details that must be observed for the system to work as designed.

//////////////////////////////////////////

We are now in a milestone moment.
For us to appreciate this moment we have to step back and review what we set to achive in this phase.
Primary targe:
- set up a POC for UUD for corpdesk PWA 
Secondary objectives:
- publish a guiding document corpdesk-rfc-0005
- set up a mechanisme to manage cache for system data loaded at boot time
- set up robust and dynamic management for:
  - ui-system
  - ui-themes
  - forms variants

- set up admin page to manage the following via dropdown:
  - ui-system
  - ui-themes
  - forms variants

Achievements:
While all the above are working, including logged changes when the dropdowns are selected, the actual changes using the dropdowns have to been effected.
Now that we have this moment, I would like you to assist with a git commit message that can reflect the above.




//////////////////////////////////////////////////////////////////

## Completed:

- Module Loader:module/services/module.service.ts → How modules are discovered and loaded.
  - build via 'npm run build'
    - process compilation to dist-ts
    - vite compiles to dist
    - execute post-build.js
  - index.html calls app.ts
  - app.ts calls main.ts
  - main.ts calls module loader
  - run 'npm run preview

- porting compliant codes for PWA environment
  - create environment.ts
  - modify node/cli restricted codes using shims.
  - selected imports to be done conditionally based on environment
  - cyclic codes in PWA/browser resolved using BaseService.get \_svSess() with dynamic import.

- Developing compiled code with support to integrate:
  - Reactive corpdesk forms
    - CdFormGroup
    - CdFormControl
    - CdValidators
    - CdDirectiveBinder
    - Model

///////////////////////////////////////

## In Progress

### implementing UUD

- Some interfaces repeat what is already in UiDescriptorBase. Why dont we extend?
  - in the src/CdShell/sys/dev-descriptor/models/ui-concept-descriptor.model.ts, most of interfaces need to extend UiDescriptorBase
  - UiSystemAdaptorService.render()
    Error:
    Conversion of type 'UiDescriptorBase' to type 'UiLayoutDescriptor' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    Property 'layoutType' is missing in type 'UiDescriptorBase' but required in type 'UiLayoutDescriptor'.ts(2352)
    - ui-concept-descriptor.model.ts(37, 3): 'layoutType' is declared here.

- UiSystemAdaptor changed to UiSystemAdaptorService
- MaterialUiTranslator changed to UiTranslatorMaterial
- Exampe below is given but not implementation for uiTranslationRegistry is not yet given.
  uiTranslationRegistry.register({
  id: 'material-design',
  label: 'Angular Material Design',
  translator: new MaterialUiTranslator(),
  version: '1.0.0',
  });

RawUiComponentMeta not yet implemented-

///////////////////////////////////////

## ToDo:

PWA Technoloties and Documentation:

- Menu System:
  - menu/services/menuRenderer.ts → How the raw menu config is turned into HTML/DOM.

- Theme Loader:
  - theme/services/theme-loader.ts → How CSS and JSON configs are applied dynamically.

- Config Files:
  - config/shell.config.ts
  - config/themeConfig.ts → Default settings, structure, and developer extension points.
  - environment and cross-environment code reuse

- Logger:
  - Utility:utils/logger.ts → For developers to know how to debug and integrate logs in their modules.

- Directives
- Forms:
  - Emulate angular form groups
  - Use the initial codes for form processing to do POC
  - mould the codes to work as Angulare corpdesk login process.
- cd-push:
  - sharing cd-push codes
  - define cd-push, cd-sio, cd-wss

- tesing controller loading
  - optional websocket node is working
  - forms working similar to Angular reactive forms
  - compile controller to view

Classing the codes:

- convert the codes from function to classes (Done)
- Make sure the process can compile all the codes into dist-ts

- update of documentation for
  - module loading (doc0005)
  - directives (doc0007)

- development of corpdesk-rfc-0005 for lifecycle of controller using __activate(), __deactivate() and ControllerCacheService
- implementation of corpdesk-rfc-0005
- implementation of (change) directive for dropdown controls

- UUD development
  - isDefault should not be property of ICdModule. This is an admin or user setting concern and should be Isolated in that area
  - menu module item are replicating the root
  - menu to load via element content replacement instead of browser routing
  - ui settings dropdowns, linked to configs and not manually set
  - race conditions to be resolved via MenuService.loadResource()
    - modify MenuService.loadResource()
    - modify ModuleService.loadModule() so that there is only one central controller loading point (MenuService.loadResource())
      - this can be done at the main using prepared menu via default module.
    - investigate why data is not loading on dropdown
    - modify controllers to match the controller loading policy




Change the design for lifecycle of dev-controllers to runtime-controller
Goal:

- raising the bar for live interactions with dev browser
- borrow from cd-cli code in terms of saving dev-code as objects
- is it possible to make use of git state in a given file to manage auto updates
- how can we implement watcher that can update browser during development
- use of descriptors
- goal: when codes are being changed, the browser can be configured to respond simultenously - capacity to make changes vie (manaual, cd-cli or ai) - capacity to run visual tests of functions for a given module which displays browser or device.
  Implementation:
- proof of concept (convert dev-controller to runtime-controller)
- implementation plan
- integration of cd-cli

////////////////////////////////////////////////////////////

Notes for improvement of rfc:

Note from both login process and dev-sync example:

- The communication can work as inter and intra application
- The communication can work as inter component communication
- Application users can also setup communication between individuals and groups communications.
  Base on the above, intra communication expects the launching process to publish appId.
  This publication should be available to other recources that are candidates for cd-sio communication.
  For example in module federtion, the cd-shell/SidbarComponent represent the whole application to initiate and save the appId in LocalStorage.
  Thereafter all remote modules are able to acdess the appId.
  Note that each component however have their own resourceGuid and resourceName in the CdObjId.

The life cycle need to show that:

- The consumer imports and initialize svSio: SioClientService,
  - it is this import that manageds the detail of socket.io-client details including
    - connection()
    - event listening
    - actual sending of messages
- initialize() hosts setAppId() and initSioClient()
  At this stage, details for setAppId() and initSioClient() can be given
- Note how, the component just calls listening in very simple sytax
- but also notice there is one main listen(event) in the class that does all the donkey work based on corpdesk cd-sio implementation details. And this is on top of socket.io-client as an import in form of svSioClient.
  It is worth noting that in the future corpdesk listen() method will be shared and not coded in each consumer.


## DEMO TARGET

- scrol menu to show case different types of applications in the pwa
- develop module via cli then send to registry
- download and install module from registry
- demonstrate change of ui-system
- demo change of theme
- demo change of variant forms and othe widgets
- set logo
- set theme colours
- configure menu options
- demo integration with cli
- demo integration with ai
