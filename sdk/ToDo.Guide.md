//////////////////////////////////////////////
Hey Chase. We are still stuck with a page the cannot apply bootstrap.
You are highly trained and intelligent machine. I am a seasoned developer. Yet we are failing on this.
My take is that we need to assume we are reasearching and it not a matter of guessing but for every assertion we make, we must be able to proove and demonstrate the assertion.
In effect I expect you to inform me of a suspect area and how to eliminate the suspicion or further test to confirm a given assertion.
When you need details of given codes of suspect area just let me know. Some of the process may just be inserting more detail logs for provable or elimination of a given theory.
We approach it as a process not like one round should lead to an eureka.
Any theory has to be proovable.
Attached is the latest logs.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Corpdesk Shell</title>

    <!-- Vendor-only static dependencies -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />

    <!-- 🧩 All system and theme CSS are dynamically injected by UiSystemLoaderService & UiThemeLoaderService -->
  </head>

  <body>
    <header id="cd-header">
      <button id="cd-burger">&#9776;</button>
      <img id="cd-logo" alt="Logo" />
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar"></aside>
      <main id="cd-main-content"></main>
    </div>

    <script type="module" src="/src/app.ts"></script>
  </body>
</html>
```

// public/themes/common/base.css

```css
/* ============================================================
   CORPDESK BASE THEME TOKENS
   These are intentionally minimal so UI systems remain in control.
   Themes override only these variables.
   ============================================================ */

:root {
  --cd-color-bg: #ffffff;
  --cd-color-surface: #f5f5f5;
  --cd-color-text: #000000;
  --cd-color-primary: #0055ff;

  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;
  --cd-color-hint: #999;

  --cd-color-border: #cccccc;
  --cd-color-hover: rgba(0, 0, 0, 0.05);

  --cd-border-radius: 4px;
  --cd-transition: 0.2s ease;

  --cd-font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --cd-font-size: 14px;

  /* Shell layout metrics */
  --cd-header-height: 60px;
  --cd-sidebar-width: 260px;
}

/* ============================================================
   GLOBAL DEFAULTS (Safe — does not break Bootstrap)
   ============================================================ */

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
  /* Global colors controlled by Bootstrap theme */
}

/* ============================================================
   SHELL LAYOUT (Isolated from UI systems)
   ============================================================ */

/* HEADER (fixed-height bar) */
#cd-header {
  height: var(--cd-header-height);
  background: var(--cd-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

/* LAYOUT WRAPPER */
#cd-layout {
  display: flex;
  height: calc(100vh - var(--cd-header-height));
  overflow: hidden;
  width: 100%;
  position: relative;
}

/* SIDEBAR */
#cd-sidebar {
  width: var(--cd-sidebar-width);
  flex-shrink: 0;
  background: var(--cd-color-surface);
  border-right: 1px solid var(--cd-color-border);
  overflow-y: auto;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* OVERLAY (mobile) */
#cd-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: none;
}

#cd-overlay.visible {
  display: block;
}

/* MAIN CONTENT */
#cd-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  /* background controlled by Bootstrap or global theme variables */
  min-width: 0; /* Fixes flex children overflow */
}

/* ============================================================
   FORM ELEMENTS (Non-destructive, Bootstrap-safe)
   ============================================================ */

.cd-form-field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  /* Background/color controlled by Bootstrap theme */
}

.cd-form-field input {
  /* Background/color controlled by Bootstrap theme */
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-border-radius);
  padding: 0.6rem;
  transition:
    border-color var(--cd-transition),
    box-shadow var(--cd-transition);
}

/* Validation */
.cd-form-field input.cd-valid {
  border-color: var(--cd-color-valid);
  box-shadow: 0 0 4px var(--cd-color-valid);
}

.cd-form-field input.cd-invalid {
  border-color: var(--cd-color-invalid);
  box-shadow: 0 0 4px var(--cd-color-invalid);
}

/* Feedback */
.error-message,
.cd-hint {
  font-size: 0.85rem;
  margin-top: 4px;
  color: var(--cd-color-hint);
}

.cd-form-field input.cd-invalid + .error-message,
.cd-form-field input.cd-invalid + .cd-hint {
  color: var(--cd-color-invalid);
}

/* Focus */
.cd-form-field input:focus {
  border-color: var(--cd-color-primary);
  box-shadow: 0 0 5px var(--cd-color-primary);
  outline: none;
}
```

// public/assets/css/index.css

```css
:root {
  --cd-primary-color: #1976d2;
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
}

/* Global reset (safe) */
html,
body {
  /* Global theme controlled by Bootstrap */
}

/* ---------------------------------------
   HEADER (cosmetic overrides only)
---------------------------------------- */
#cd-header {
  /* Removed !important */
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--cd-primary-color);
  color: #ffffff;
}

/* LOGO */
#cd-logo {
  height: 40px;
  margin-right: 12px;
  display: block;
}

/* ---------------------------------------
   Ensure sidebar honors theme vars
---------------------------------------- */
#cd-sidebar {
  /* Removed !important */
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
}

/* Sidebar menu items */
.cd-menu-item {
  /* Removed !important */
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
}

.cd-menu-item:hover {
  /* Removed !important */
  background-color: var(--cd-color-hover);
}

/* OPTIONAL: arbitrary utility classes */
.cd-flex {
  display: flex;
}

.cd-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

```ts
export class Main {
  async run() {
    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");

    // ----------------------------
    // STEP 0: Load shell config
    // ----------------------------
    const shellConfig: ShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    // ----------------------------
    // STEP 1: Core service instantiation
    // ----------------------------

    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);

    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    // ----------------------------
    // STEP 2: Load all cached metadata (uiConfig, uiSystems, themes)
    // ----------------------------
    await this.svSysCache.loadAndCacheAll();

    const uiConfig = this.svSysCache.get("uiConfig") as UiConfig;
    console.log("[Main][run] uiConfig:", uiConfig);

    // ----------------------------
    // STEP 3: Apply UI-system + Theme pipeline
    // ----------------------------
    await this.applyStartupUiSettings();

    // ----------------------------
    // STEP 3B: Shell layout CSS (base.css + index.css)
    // NOTE: Must load AFTER ui-system but BEFORE modules + menu
    // ----------------------------
    // try {
    //   await this.svUiSystemLoader.loadCSS(
    //     "/themes/common/base.css",
    //     "shell-base"
    //   );
    //   await this.svUiSystemLoader.loadCSS(
    //     "/assets/css/index.css",
    //     "shell-index"
    //   );
    // } catch (err) {
    //   console.warn("[Main] failed to load shell CSS", err);
    // }

    // ----------------------------
    // STEP 4: Theme config (logo + title)
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById(
      "cd-logo"
    ) as HTMLImageElement | null;
    if (logoEl && themeConfig.logo) {
      logoEl.src = themeConfig.logo;
    }

    if (themeConfig.colors?.primary) {
      document.documentElement.style.setProperty(
        "--theme-color",
        themeConfig.colors.primary
      );
    }

    // ----------------------------
    // STEP 5: Prepare menu using your existing logic
    // ----------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }
          if (item.children) item.children = recursive(item.children);
          return item;
        });
      };
      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);

    // ----------------------------
    // STEP 6: Render sidebar with the active UI-system adapter
    // ----------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;

      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");

      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    // ----------------------------
    // STEP 7: Auto-load default controller
    // ----------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );

      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    // ----------------------------
    // STEP 8: Setup burger menu (unchanged)
    // ----------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });
      overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });
    }

    this.logger.debug("bootstrapShell(): run() complete");
  }

  /**
   * Purpose: Load UI System + Load Theme + Activate UI-System-specific logic.
   */
  async applyStartupUiSettings(): Promise<void> {
    const cfgSvc = ConfigService.getInstance();
    // ensure sys cache is ready
    await this.svSysCache.ensureReady();

    const uiConfig = this.svSysCache.get("uiConfig") as UiConfig;
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
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] activate failed", err);
      diag_css("[MAIN.applyStartupUiSettings] activate failed", { err });
    }

    // 2) Load structural shell CSS (base + index) AFTER system to ensure layering
    try {
      await uiSystemLoader.loadCSS("/themes/common/base.css", "shell-base");
      await uiSystemLoader.loadCSS("/assets/css/index.css", "shell-index");
      diag_css("[MAIN.applyStartupUiSettings] shell CSS loaded", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] shell CSS load failed", err);
    }

    // 3) load theme override CSS
    try {
      await uiThemeLoader.loadThemeById(themeId);
      diag_css("[MAIN.applyStartupUiSettings] theme css injected", { themeId });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] theme load failed", err);
    }

    // 4) per-system applyTheme (sets data-bs-theme, md classes, etc.)
    try {
      await uiSystemLoader.applyTheme(systemId, themeId);
      diag_css("[MAIN.applyStartupUiSettings] system applyTheme complete", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] applyTheme failed", err);
    }

    diag_css("[MAIN.applyStartupUiSettings] done", {});
  }
}
```

```ts
export class UiSystemLoaderService {
  /**
   * applyTheme(systemId, themeId)
   * - find adapter for systemId, fetch theme descriptor via SysCacheService / UiThemeLoaderService
   * - call adapter.applyTheme(themeDescriptor)
   */
  public async applyTheme(systemId: string, themeId: string): Promise<void> {
    diag_css("[UiSystemLoaderService.applyTheme] start", { systemId, themeId });
    const adapter = UiSystemAdapterFactory.getAdapter(systemId);
    console.log(
      "[UiSystemLoaderService.applyTheme] adapter received:",
      adapter
    );
    if (!adapter) {
      console.warn(
        "[UiSystemLoaderService.applyTheme] no adapter for",
        systemId
      );
      return;
    }

    // get theme descriptor from cache
    const descriptors = this.sysCache.get("themeDescriptors") || [];
    console.log(
      "[UiSystemLoaderService][applyTheme] descriptors:",
      descriptors
    );
    const themeDescriptor = descriptors.find((d: any) => d.id === themeId);
    console.log(
      "[UiSystemLoaderService][applyTheme] descriptors:",
      themeDescriptor
    );

    // supply descriptor if found, else just themeId
    await adapter.applyTheme(themeDescriptor || themeId);
    diag_css("[UiSystemLoaderService.applyTheme] done", { systemId, themeId });
  }

  public async loadCSS(path: string, id: string): Promise<string> {
    diag_css("[UiSystemLoaderService.loadCSS] REQUEST", { path, id });

    return new Promise((resolve, reject) => {
      try {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return reject(new Error("document.head missing"));

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;
        link.setAttribute("data-cd-uisystem", id);
        link.setAttribute("data-cd-origin", "ui-system");

        link.onload = () => {
          const resolved = (link as HTMLLinkElement).href;
          diag_css("[UiSystemLoaderService.loadCSS] LOADED", {
            path,
            id,
            resolved,
            order: Array.from(head.querySelectorAll("link")).map(
              (l) => (l as HTMLLinkElement).href
            ),
          });
          resolve(resolved);
        };

        link.onerror = (ev) => {
          diag_css("[UiSystemLoaderService.loadCSS] ERROR", { path, id, ev });
          reject(new Error(`Failed to load CSS: ${path}`));
        };

        head.insertAdjacentElement("beforeend", link);
      } catch (err) {
        diag_css("[UiSystemLoaderService.loadCSS] EXCEPTION", {
          path,
          id,
          err,
        });
        reject(err);
      }
    });
  }

  public async loadScript(path: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = path;
        script.async = true;
        script.setAttribute("data-cd-uisystem", id);
        script.setAttribute("data-cd-origin", "ui-system");
        script.onload = () => resolve();
        script.onerror = (ev) => reject(ev);

        const body = document.body || document.getElementsByTagName("body")[0];
        if (!body) return reject(new Error("document.body missing"));
        body.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }
}
```

```ts
export class UiThemeLoaderService {
  /**
   * Fetch available themes:
   * - Read uiConfig.accessibleThemes or infer
   * - For each theme id, fetch /themes/<id>/theme.json (descriptor)
   * - Return shape: { themes: [{id,name}], variants: [...], descriptors: [full objects], uiConfig }
   */
  public async fetchAvailableThemes(uiConfig: UiConfig): Promise<any> {
    console.log("[UiThemeLoaderService][fetchAvailableThemes] start", uiConfig);

    const accessible = (uiConfig && uiConfig.accessibleThemes) ||
      (this.configService as any).config?.themeConfig?.accessibleThemes || [
        "default",
        "dark",
      ];
    const descriptors: any[] = [];

    for (const id of accessible) {
      const path = `/themes/${id}/theme.json`;
      try {
        const res = await fetch(path);
        if (!res.ok) {
          console.warn(
            `[UiThemeLoaderService] theme descriptor not found: ${path}`
          );
          continue;
        }
        const desc = await res.json();
        descriptors.push(desc);
      } catch (err) {
        console.warn(
          `[UiThemeLoaderService] error fetching theme descriptor ${path}`,
          err
        );
      }
    }

    // produce lightweight lists
    const themes = descriptors.map((d) => ({ id: d.id, name: d.name }));
    const variants = [
      { id: "standard", name: "Standard" },
      { id: "compact", name: "Compact" },
      { id: "floating", name: "Floating" },
    ];

    return {
      themes,
      variants,
      descriptors,
      uiConfig,
    };
  }

  /**
   * loadThemeById - injects ONLY the theme override CSS (theme.css)
   * base + index should be loaded by Main (or UiSystemLoader) earlier
   */
  public async loadThemeById(themeId: string): Promise<void> {
    diag_css("[UiThemeLoaderService.loadThemeById] start", { themeId });
    // remove previous theme links (data-cd-theme)
    document.querySelectorAll("link[data-cd-theme]").forEach((l) => l.remove());

    const desc = this.getThemeDescriptor(themeId);
    if (!desc) {
      diag_css("[UiThemeLoaderService.loadThemeById] descriptor not found", {
        themeId,
      });
      // still try fallback path
      const fallback = `/themes/${themeId}/theme.css`;
      await this.injectStyle(fallback, themeId, "theme");
      return;
    }

    // prefer descriptor.css or descriptor.css path
    const cssPath = desc.css || desc.cssPath || `/themes/${themeId}/theme.css`;
    await this.injectStyle(cssPath, themeId, "theme");

    diag_css("[UiThemeLoaderService.loadThemeById] loaded", {
      themeId,
      cssPath,
    });
  }

  /**
   * Return full descriptor previously cached in SysCacheService
   */
  public getThemeDescriptor(themeId: string): any | undefined {
    const descriptors = this.sysCache.get("themeDescriptors") || [];
    return descriptors.find((d: any) => d.id === themeId);
  }

  public async loadFormVariant(formType = "standard"): Promise<void> {
    document
      .querySelectorAll("link[data-cd-form]")
      .forEach((el) => el.remove());
    const path = `/themes/common/forms/variants/cd-form-${formType}.css`;
    await this.injectStyle(path, formType, "form");
  }

  private async injectStyle(
    path: string,
    key: string,
    type: "theme" | "form" = "theme"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return reject(new Error("document.head missing"));

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;

        if (type === "theme") link.setAttribute("data-cd-theme", key);
        else link.setAttribute("data-cd-form", key);

        link.onload = () => resolve();
        link.onerror = (ev) => reject(new Error(`failed to load ${path}`));

        // preserve order: append to head end
        head.insertAdjacentElement("beforeend", link);
      } catch (err) {
        reject(err);
      }
    });
  }
}
```

```ts
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { IUiSystemAdapter } from "../models/ui-system-adaptor.model";

/**
 * Bootstrap502Adapter: sets data-bs-theme on <html> for Bootstrap v5.0.2
 */
export class Bootstrap502Adapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap502Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap502Adapter] applyTheme error", err);
    }
  }
}

/**
 * Bootstrap538Adapter — supports Bootstrap 5.3.8 with official dark-mode variables
 * Dark mode works natively using the <html data-bs-theme="dark">
 */
export class Bootstrap538Adapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    // No-op: CSS/JS already injected by UiSystemLoaderService
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    console.log("[Bootstrap538Adapter][applyTheme] start");
    console.log(
      "[Bootstrap538Adapter][applyTheme] themeDescriptorOrId:",
      themeDescriptorOrId
    );
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      // Bootstrap 5.3.x controls dark mode via:
      // <html data-bs-theme="dark">
      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap538Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap538Adapter] applyTheme error", err);
    }
  }
}

/**
 * MaterialAdapter — applies Material Design theme logic
 */
export class MaterialAdapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-md-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    if (!themeDescriptorOrId) return;

    const mode =
      typeof themeDescriptorOrId === "string"
        ? themeDescriptorOrId
        : themeDescriptorOrId.mode;

    if (mode === "dark") {
      document.documentElement.classList.add("md-dark");
      document.documentElement.classList.remove("md-light");
    } else {
      document.documentElement.classList.remove("md-dark");
      document.documentElement.classList.add("md-light");
    }

    console.log("[MaterialAdapter] applyTheme:", mode);
  }
}

/**
 * Factory for UI system adapters
 */
export class UiSystemAdapterFactory {
  public static getAdapter(systemId: string): IUiSystemAdapter | null {
    console.group("[UiSystemAdapterFactory] Adapter Lookup");
    console.log("Requested systemId:", JSON.stringify(systemId));

    let adapter: IUiSystemAdapter | null = null;

    switch (systemId) {
      case "bootstrap-502":
        adapter = new Bootstrap502Adapter();
        break;

      case "bootstrap-538":
        adapter = new Bootstrap538Adapter();
        break;

      case "material":
      case "material-design":
        adapter = new MaterialAdapter();
        break;

      default:
        console.warn(
          "[UiSystemAdapterFactory] ❌ Unknown systemId — returning null"
        );
        console.groupEnd();
        return null;
    }

    console.log("Resolved adapter instance:", adapter?.constructor.name);
    console.groupEnd();
    return adapter;
  }
}
```

/////////////////////////////////////////////

```html
<head>
  <meta charset="UTF-8" />
  <title>Corpdesk PWA</title>

  <!-- Vendor-only static dependencies -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
  />

  <!-- 🧩 All system and theme CSS are dynamically injected by UiSystemLoaderService & UiThemeLoaderService -->
  <script type="module" crossorigin="" src="/assets/index-fOHRi1nm.js"></script>
  <link
    rel="stylesheet"
    href="/assets/ui-systems/bootstrap-538/bootstrap.min.css"
    data-cd-uisystem="bootstrap-538"
    data-cd-origin="ui-system"
  />
  <link
    rel="stylesheet"
    href="/themes/common/base.css"
    data-cd-uisystem="shell-base"
    data-cd-origin="ui-system"
  />
  <link
    rel="stylesheet"
    href="/assets/css/index.css"
    data-cd-uisystem="shell-index"
    data-cd-origin="ui-system"
  />
  <link rel="stylesheet" href="/themes/dark/theme.css" data-cd-theme="dark" />
  <link
    rel="modulepreload"
    as="script"
    crossorigin=""
    href="/assets/index-C9lWU5VA.js"
  />
  <link
    rel="modulepreload"
    as="script"
    crossorigin=""
    href="/assets/cd-directive-binder.service-P6kntAs5.js"
  />
  <link
    rel="modulepreload"
    as="script"
    crossorigin=""
    href="/assets/index-BJeR7udt.js"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.css"
  />
  <script
    src="https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.js"
    async=""
  ></script>
  <link rel="stylesheet" href="/themes/default/menu-systems/metismenu.css" />
</head>
```

/////////////////////////////////////////
I have shared the relevant files and their contents for your consideration.
For any that is modified, you can give me the full version to avoid introduction of any bug during changes.
// public/themes/common/base.css

```css
/* ============================================================
   CORPDESK BASE THEME TOKENS
   These are intentionally minimal so UI systems remain in control.
   Themes override only these variables.
   ============================================================ */

:root {
  --cd-color-bg: #ffffff;
  --cd-color-surface: #f5f5f5;
  --cd-color-text: #000000;
  --cd-color-primary: #0055ff;

  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;
  --cd-color-hint: #999;

  --cd-color-border: #cccccc;
  --cd-color-hover: rgba(0, 0, 0, 0.05);

  --cd-border-radius: 4px;
  --cd-transition: 0.2s ease;

  --cd-font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --cd-font-size: 14px;

  /* Shell layout metrics */
  --cd-header-height: 60px;
  --cd-sidebar-width: 260px;
}

/* ============================================================
   GLOBAL DEFAULTS (Safe — does not break Bootstrap)
   ============================================================ */

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
  /* 💡 FIX: Removed conflicting color and background rules here. */
  /* Let Bootstrap control global colors via [data-bs-theme] */
}

/* ============================================================
   SHELL LAYOUT (Isolated from UI systems)
   ============================================================ */

/* HEADER (fixed-height bar) */
#cd-header {
  height: var(--cd-header-height);
  background: var(--cd-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

/* LAYOUT WRAPPER */
#cd-layout {
  display: flex;
  height: calc(100vh - var(--cd-header-height));
  overflow: hidden;
  width: 100%;
  position: relative;
}

/* SIDEBAR */
#cd-sidebar {
  width: var(--cd-sidebar-width);
  flex-shrink: 0;
  background: var(--cd-color-surface);
  border-right: 1px solid var(--cd-color-border);
  overflow-y: auto;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* OVERLAY (mobile) */
#cd-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: none;
}

#cd-overlay.visible {
  display: block;
}

/* MAIN CONTENT */
#cd-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  /* 💡 FIX: Removed conflicting background rule. */
  /* background: var(--cd-color-bg); */
  min-width: 0; /* Fixes flex children overflow */
}

/* ============================================================
   FORM ELEMENTS (Non-destructive, Bootstrap-safe)
   ============================================================ */

.cd-form-field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  /* 💡 FIX: Removed conflicting background/color rules to let Bootstrap theme control input appearance */
  /* background: var(--cd-color-surface); */
  /* color: var(--cd-color-text); */
}

.cd-form-field input {
  /* 💡 FIX: Removed conflicting background/color rules to let Bootstrap theme control input appearance */
  /* background: var(--cd-color-surface); */
  /* color: var(--cd-color-text); */
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-border-radius);
  padding: 0.6rem;
  transition:
    border-color var(--cd-transition),
    box-shadow var(--cd-transition);
}

/* Validation */
.cd-form-field input.cd-valid {
  border-color: var(--cd-color-valid);
  box-shadow: 0 0 4px var(--cd-color-valid);
}

.cd-form-field input.cd-invalid {
  border-color: var(--cd-color-invalid);
  box-shadow: 0 0 4px var(--cd-color-invalid);
}

/* Feedback */
.error-message,
.cd-hint {
  font-size: 0.85rem;
  margin-top: 4px;
  color: var(--cd-color-hint);
}

.cd-form-field input.cd-invalid + .error-message,
.cd-form-field input.cd-invalid + .cd-hint {
  color: var(--cd-color-invalid);
}

/* Focus */
.cd-form-field input:focus {
  border-color: var(--cd-color-primary);
  box-shadow: 0 0 5px var(--cd-color-primary);
  outline: none;
}
```

// public/assets/css/index.css

```css
:root {
  --cd-primary-color: #1976d2;
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;

  /* Keep as fallbacks only */
  /* 💡 FIX: Removed redundant theme color variables. */
  /* --cd-background-color: var(--cd-color-bg); */
  /* --cd-text-color: var(--cd-color-text); */
}

/* Global reset (safe) */
html,
body {
  /* ❌ REMOVED: Conflicting color and background rules with !important */
  /* margin: 0 !important; */
  /* padding: 0 !important; */
  /* background-color: var(--cd-background-color); */
  /* color: var(--cd-text-color); */
}

/* ---------------------------------------
   HEADER (cosmetic overrides only)
---------------------------------------- */
#cd-header {
  /* 💡 Recommended: ID selector is already high-specificity. Removed !important. */
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--cd-primary-color);
  color: #ffffff;
}

/* LOGO */
#cd-logo {
  height: 40px;
  margin-right: 12px;
  display: block;
}

/* ---------------------------------------
   Ensure sidebar honors theme vars
---------------------------------------- */
#cd-sidebar {
  /* 💡 Recommended: ID selector is high-specificity. Removed !important. */
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
}

/* Sidebar menu items */
.cd-menu-item {
  /* 💡 Recommended: Removed !important. */
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
}

.cd-menu-item:hover {
  /* 💡 Recommended: Removed !important. */
  background-color: var(--cd-color-hover);
}

/* OPTIONAL: arbitrary utility classes */
.cd-flex {
  display: flex;
}

.cd-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

// public/themes/dark/theme.css

```css
:root {
  --cd-color-bg: #121212;
  --cd-color-surface: #1e1e1e;
  --cd-color-text: #e6e6e6;

  --cd-color-primary: #0d6efd;

  --cd-color-hint: #aaaaaa;
  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;

  --cd-color-border: #333333;
  --cd-color-hover: #2a2a2a;
}
```

// public/themes/default/theme.css

```css
:root {
  --cd-color-bg: #ffffff;
  --cd-color-surface: #f8f8f8;
  --cd-color-text: #000000;

  --cd-color-primary: #007bff;
  --cd-color-hint: #666;
  --cd-color-valid: #28a745;
  --cd-color-invalid: #dc3545;

  --cd-color-border: #cccccc;
  --cd-color-hover: #f0f0f0;
}
```

// src/CdShell/sys/cd-guig/services/ui-system-adapters.ts

```ts
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { IUiSystemAdapter } from "../models/ui-system-adaptor.model";

/**
 * Bootstrap502Adapter: sets data-bs-theme on <html> for Bootstrap v5.0.2
 */
export class Bootstrap502Adapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap502Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap502Adapter] applyTheme error", err);
    }
  }
}

/**
 * Bootstrap538Adapter — supports Bootstrap 5.3.8 with official dark-mode variables
 * Dark mode works natively using the <html data-bs-theme="dark">
 */
export class Bootstrap538Adapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    // No-op: CSS/JS already injected by UiSystemLoaderService
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    console.log("[Bootstrap538Adapter][applyTheme] start");
    console.log(
      "[Bootstrap538Adapter][applyTheme] themeDescriptorOrId:",
      themeDescriptorOrId
    );
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      // Bootstrap 5.3.x controls dark mode via:
      // <html data-bs-theme="dark">
      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap538Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap538Adapter] applyTheme error", err);
    }
  }
}

/**
 * MaterialAdapter — applies Material Design theme logic
 */
export class MaterialAdapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-md-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    if (!themeDescriptorOrId) return;

    const mode =
      typeof themeDescriptorOrId === "string"
        ? themeDescriptorOrId
        : themeDescriptorOrId.mode;

    if (mode === "dark") {
      document.documentElement.classList.add("md-dark");
      document.documentElement.classList.remove("md-light");
    } else {
      document.documentElement.classList.remove("md-dark");
      document.documentElement.classList.add("md-light");
    }

    console.log("[MaterialAdapter] applyTheme:", mode);
  }
}

/**
 * Factory for UI system adapters
 */
export class UiSystemAdapterFactory {
  public static getAdapter(systemId: string): IUiSystemAdapter | null {
    console.group("[UiSystemAdapterFactory] Adapter Lookup");
    console.log("Requested systemId:", JSON.stringify(systemId));

    let adapter: IUiSystemAdapter | null = null;

    switch (systemId) {
      case "bootstrap-502":
        adapter = new Bootstrap502Adapter();
        break;

      case "bootstrap-538":
        adapter = new Bootstrap538Adapter();
        break;

      case "material":
      case "material-design":
        adapter = new MaterialAdapter();
        break;

      default:
        console.warn(
          "[UiSystemAdapterFactory] ❌ Unknown systemId — returning null"
        );
        console.groupEnd();
        return null;
    }

    console.log("Resolved adapter instance:", adapter?.constructor.name);
    console.groupEnd();
    return adapter;
  }
}
```

/////////////////////////////////

Note that there was a special utility that was meant to help show the exact order of css loading.
So everywhere where UiSystemLoaderSersvice.loadCSS() was called, the utility was used to do some logging.
You may want to review the logs with this in reference with the codes shared below.

// src/CdShell/sys/utils/diagnosis.ts

```ts
export function diag_css(message: string, data: any = {}) {
  console.log(
    `%c[CSS-DIAG] ${message}`,
    "background:#222;color:#0f0;padding:2px 4px;border-radius:3px",
    data
  );
}

export function diag_sidebar() {
  const sb = document.getElementById("cd-sidebar");
  if (!sb) return;

  const style = window.getComputedStyle(sb);

  console.warn(
    "%c[SIDEBAR-DIAG] Sidebar State:",
    "background:#440;color:#fff;padding:3px"
  );

  console.log("display:", style.display);
  console.log("position:", style.position);
  console.log("width:", style.width);
  console.log("flex-direction:", style.flexDirection);
  console.log("css file winning:", sb);
}
```

```ts
export class UiSystemLoaderSersvice {
  public async loadCSS(path: string, id: string): Promise<string> {
    diag_css("[UiSystemLoaderService.loadCSS] REQUEST", { path, id });

    return new Promise((resolve, reject) => {
      try {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return reject(new Error("document.head missing"));

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;
        link.setAttribute("data-cd-uisystem", id);
        link.setAttribute("data-cd-origin", "ui-system");

        link.onload = () => {
          const resolved = (link as HTMLLinkElement).href;
          diag_css("[UiSystemLoaderService.loadCSS] LOADED", {
            path,
            id,
            resolved,
            order: Array.from(head.querySelectorAll("link")).map(
              (l) => (l as HTMLLinkElement).href
            ),
          });
          resolve(resolved);
        };

        link.onerror = (ev) => {
          diag_css("[UiSystemLoaderService.loadCSS] ERROR", { path, id, ev });
          reject(new Error(`Failed to load CSS: ${path}`));
        };

        head.insertAdjacentElement("beforeend", link);
      } catch (err) {
        diag_css("[UiSystemLoaderService.loadCSS] EXCEPTION", {
          path,
          id,
          err,
        });
        reject(err);
      }
    });
  }

  public async loadScript(path: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = path;
        script.async = true;
        script.setAttribute("data-cd-uisystem", id);
        script.setAttribute("data-cd-origin", "ui-system");
        script.onload = () => resolve();
        script.onerror = (ev) => reject(ev);

        const body = document.body || document.getElementsByTagName("body")[0];
        if (!body) return reject(new Error("document.body missing"));
        body.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }
}
```

////////////////////////////////////////////

I will be sending the results one post at a time:
The first one is based on testing the assertion: Bootstrap CSS is NEVER successfully loaded
Searching for 'data-cd-uisystem="bootstrap-538"' in DevTools → Elements → head
My observation is that this is not the case because the search came up positive.

```html
<head>
  <meta charset="UTF-8" />
  <title>Corpdesk PWA</title>

  <!-- Vendor-only static dependencies -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
  />

  <!-- 🧩 All system and theme CSS are dynamically injected by UiSystemLoaderService & UiThemeLoaderService -->
  <script type="module" crossorigin="" src="/assets/index-fOHRi1nm.js"></script>
  <link
    rel="stylesheet"
    href="/assets/ui-systems/bootstrap-538/bootstrap.min.css"
    data-cd-uisystem="bootstrap-538"
    data-cd-origin="ui-system"
  />
  <link
    rel="stylesheet"
    href="/themes/common/base.css"
    data-cd-uisystem="shell-base"
    data-cd-origin="ui-system"
  />
  <link
    rel="stylesheet"
    href="/assets/css/index.css"
    data-cd-uisystem="shell-index"
    data-cd-origin="ui-system"
  />
  <link rel="stylesheet" href="/themes/dark/theme.css" data-cd-theme="dark" />
  <link
    rel="modulepreload"
    as="script"
    crossorigin=""
    href="/assets/index-C9lWU5VA.js"
  />
  <link
    rel="modulepreload"
    as="script"
    crossorigin=""
    href="/assets/cd-directive-binder.service-P6kntAs5.js"
  />
  <link
    rel="modulepreload"
    as="script"
    crossorigin=""
    href="/assets/index-BJeR7udt.js"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.css"
  />
  <script
    src="https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.js"
    async=""
  ></script>
  <link rel="stylesheet" href="/themes/default/menu-systems/metismenu.css" />
</head>
```

////////////////////////////////////////////////
Below are the request/response headers.
response screeshot is also attached
Request headers

```log
GET /assets/ui-systems/bootstrap-538/bootstrap.min.css HTTP/2
Host: localhost:5173
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0
Accept: text/css,*/*;q=0.1
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br, zstd
Connection: keep-alive
Referer: https://localhost:5173/
Sec-Fetch-Dest: style
Sec-Fetch-Mode: no-cors
Sec-Fetch-Site: same-origin
Priority: u=2
Pragma: no-cache
Cache-Control: no-cache
TE: trailers
```

// Response headers

```log
HTTP/2 200
vary: Origin
cross-origin-opener-policy: same-origin
cross-origin-embedder-policy: require-corp
content-type: text/css
last-modified: Thu, 20 Nov 2025 19:17:01 GMT
etag: W/"232111-1763666221278"
cache-control: no-cache
content-encoding: gzip
date: Fri, 21 Nov 2025 07:36:33 GMT
X-Firefox-Spdy: h2
```

/////////////////////////////////////////
Unfortunately, I am being prevented from sharing any more images.
However, injecting:
<button class="btn btn-primary">Test</button>
into the browser inspector as part of the form items was the most revealing.
I could see a bootstrap blue button.
I may have been the one who made a wrong assertion that the form elements did not reflect presence of bootstrap.
Earlier, the generated form was typical bootsrap form and that is what I have been expecting.
In retrospect, I think what we are seeing is the correct display. If we needed to make it fully bootstrap, we have to use bootstrap elements in out html construction.
Below is a copy past of one of the css from the browser inspect/styles section.
From here, I would be interested in your reflection of what is happening and where we are in terms of design goals and looking forward.

```css
.btn-primary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #0d6efd;
  --bs-btn-border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0b5ed7;
  --bs-btn-hover-border-color: #0a58ca;
  --bs-btn-focus-shadow-rgb: 49, 132, 253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0a58ca;
  --bs-btn-active-border-color: #0a53be;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #0d6efd;
  --bs-btn-disabled-border-color: #0d6efd;
}
```

///////////////////////////////////////////
I am happy that we have scientifically proved that the bootstrap is available and working.
You interpretation is very enlightening and rightfully put the right questions for determination.
This is my response and we can discuss to chart way forward.
My vision is based on what would work best for most developers in terms of working experience.
Idealy this is the experience that I hope developers can have. I am not limiting myself to how difficult it is to achieve but what I believe development experience should be.
Expectations:
At its best, developers should just use a standard scripting without puting any ui-system specific elements.
When the configuration has been set for bootstrap-538 and dark theme, the page should render a typical bootstrap page.
It would be up to developer to set details like the dominant colour (default being blue) or layout preferences can be changed at the base configuration or changed during runtime (with option of locking for users by admin)
This behaviour should cut accross for all ui-systems that have been worked for corpdesk ui system.
Earlier in the development, this is how this interface was behaving. How did this happen? There must be some simple ways.
In fact this was happening without applying 'dark' mode. So we introduced adaptors, made sure we moved from bootstrap-502 to bootstrap-538 with the expectation that the 'dark' mode would be applied to the typical bootstrap form.
Now the question is how to achive this kind of experience.

/////////////////////////////////////////////////
I suggest, without doing this process in one shot, we do it step by step.
First, we can start with setting up the sign-in.controller.js(supposedly compliled by for now being developed manually)
Question: when we use systax like <input cdFormControl>, I am assuming we will be making use of already existing CdDirectiveBinderService?
If this is the case, we may need to update the

// src/CdShell/sys/cd-user/view/sign-in.controller.js

```js
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export const ctlSignIn = {
  form: null,
  binder: null,

  /**
   * Initializes the controller — constructs the form and binder.
   */
  __init() {
    this.form = new CdFormGroup({
      userName: new CdFormControl("", [
        CdValidators.required("Username is required"),
      ]),
      password: new CdFormControl("", [
        CdValidators.required("Password is required"),
        CdValidators.minLength(4, "Password must be at least 4 characters"),
      ]),
    });

    // Initialize binder — form selector must match template form ID
    this.binder = new CdDirectiveBinderService(this.form, "#signInForm", this);
  },

  /**
   * HTML template for the view.
   */
  __template() {
    return `
      <form id="signInForm" class="cd-form">
        <div class="cd-form-field">
          <label for="userName">Username</label>
          <input
            id="userName"
            name="userName"
            cdFormControl
            placeholder="Enter username"
          />
          <div class="error-message" data-error-for="userName"></div>
        </div>

        <div class="cd-form-field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            cdFormControl
            placeholder="Enter password"
          />
          <div class="error-message" data-error-for="password"></div>
        </div>

        <button type="submit">Sign In</button>
      </form>
    `;
  },

  /**
   * Runs after template is rendered to DOM.
   */
  __setup() {
    // Initialize form and binder if not already
    if (!this.form) this.__init();

    const form = document.querySelector("#signInForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.auth();
      });
    }
  },

  /**
   * Authentication handler.
   */
  async auth() {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      alert("Please correct the highlighted errors.");
      return;
    }

    const user = this.form.value;
    console.log("Authenticating:", user);
    alert(`Welcome, ${user.userName}!`);
  },

  // 💡 NEW: Deactivation Hook - Runs when user clicks *away*
  __deactivate() {
    console.log("[ctlSignIn][__deactivate] 01");
    // Stop any active animations, remove DOM-dependent listeners, etc.
    // The binder must provide a way to remove all listeners.
    if (this.binder?.unbindAllDomEvents) {
      this.binder.unbindAllDomEvents();
    }
  },

  // 💡 NEW: Activation Hook - Runs when view is *injected*
  async __activate() {
    console.log("[ctlSignIn][__activate] 01");
    // Re-establish DOM bindings and apply current form state
    if (this.binder?.bindToDom) {
      // This method must find the newly injected DOM (#settingsForm)
      // and re-attach all form control listeners (input, change, blur)
      await this.binder.bindToDom();
    }
    // Optional: Restore scroll position, run focus logic, etc.
  },
};
```

// src/CdShell/sys/cd-guig/services/cd-directive-binder.service.ts

```ts
import { CdFormGroup } from "../controllers/cd-form-group.control";

export class CdDirectiveBinderService {
  private form: CdFormGroup;
  private formElement: HTMLFormElement; // Will be set later in bindToDom()
  private controllerInstance: any;
  private formSelector: string; // 💡 Store the selector here

  // 💡 NEW: Array to store references for listener removal
  private eventListeners: {
    element: HTMLElement;
    event: string;
    handler: (e: Event) => void;
  }[] = [];

  constructor(
    form: CdFormGroup,
    formSelector: string,
    controllerInstance: any
  ) {
    console.log(
      "CdDirectiveBinderService::constructor()/start - DOM lookups deferred."
    );
    this.form = form;
    this.controllerInstance = controllerInstance;
    this.formSelector = formSelector; // Store the selector for later use in bindToDom()

    // 🛑 All DOM querying logic is removed from the constructor.
  }

  // 💡 NEW: Binds control listeners to the current DOM elements
  /**
   * 💡 NEW: Binds control listeners and Angular-style event listeners to the current DOM elements.
   */
  public async bindToDom(): Promise<void> {
    console.log("[CdDirectiveBinderService][bindToDom] 01");

    // 1. Find the Form Element using the stored selector
    this.formElement = document.querySelector(
      this.formSelector
    ) as HTMLFormElement;

    if (!this.formElement) {
      console.error(
        `[Binder Error] Form element not found in DOM for selector: ${this.formSelector}`
      );
      // If the form isn't found, stop binding but don't crash.
      return;
    }

    if (!this.formElement) return;

    // --- 1. Bind cdFormControl inputs (Input/Blur) ---
    Object.entries(this.form.controls).forEach(([key, control]) => {
      const input = this.formElement.querySelector(
        `[name="${key}"][cdFormControl]`
      ) as HTMLInputElement;

      if (!input) return;

      // Handler for 'input' (value change)
      const inputHandler = (e: Event) => {
        const target = e.target as HTMLInputElement;
        control.setValue(target.value);
        this.applyValidationStyles({ [key]: control.error });
      };

      // Handler for 'blur' (touched state and validation)
      const blurHandler = () => {
        control.markAsTouched();
        this.applyValidationStyles({ [key]: control.error });
      };

      input.addEventListener("input", inputHandler);
      input.addEventListener("blur", blurHandler);

      // 💡 Store references for removal
      this.eventListeners.push({
        element: input,
        event: "input",
        handler: inputHandler,
      });
      this.eventListeners.push({
        element: input,
        event: "blur",
        handler: blurHandler,
      });

      // 4. Apply current control values and validation styles
      input.value = control.value;
      this.applyValidationStyles({ [key]: control.error });
    });

    // --- 2. Bind Angular-style event bindings ((change)="method()") ---
    const elements = this.formElement.querySelectorAll("*");

    elements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const match = attr.name.match(/^\(([^)]+)\)$/); // e.g., (change)
        if (match) {
          const eventName = match[1];
          const expression = attr.value;

          // Handler for the custom event binding
          const customHandler = (e: Event) =>
            this.invokeDirectiveMethod(expression, e);

          el.addEventListener(eventName, customHandler);

          // 💡 Store reference for removal
          this.eventListeners.push({
            element: el as HTMLElement,
            event: eventName,
            handler: customHandler,
          });
        }
      });
    });
  }

  // 💡 NEW: Removes all listeners created by bindToDom()
  /**
   * 💡 NEW: Removes all listeners created by bindToDom() from the DOM and clears the tracking array.
   */
  public unbindAllDomEvents(): void {
    console.log(
      `CdDirectiveBinderService: Unbinding ${this.eventListeners.length} listeners.`
    );

    // Iterate through the stored references and remove the listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Crucial: Clear the array to prevent memory leaks in the binder itself
    this.eventListeners = [];
  }

  /**
   * Invokes a controller method referenced by directive attributes.
   */
  private invokeDirectiveMethod(expression: string, event: Event): void {
    try {
      const fnMatch = expression.match(/^([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (!fnMatch) return;

      const fnName = fnMatch[1];
      const hasEventArg = fnMatch[2]?.includes("$event");

      const controller = this.controllerInstance; // 👈 USE STORED INSTANCE

      if (controller && typeof controller[fnName] === "function") {
        // 🛑 CRITICAL FIX: Use .call() or .apply() to set the 'this' context!
        controller[fnName].call(controller, hasEventArg ? event : undefined);
      } else {
        console.warn(`[UUD] Method not found: ${fnName}`);
      }
    } catch (err) {
      console.error(
        `[UUD] Error invoking directive method: ${expression}`,
        err
      );
    }
  }

  /**
   * Detects which controller is currently active based on a naming convention.
   * (You can refine this logic later for module contexts.)
   */
  validateAll(): void {
    const result = this.form.validateAll();
    this.applyValidationStyles(result);
  }

  applyValidationStyles(result: Record<string, string | null>): void {
    for (const [key, error] of Object.entries(result)) {
      const input = this.formElement.querySelector(
        `[name="${key}"]`
      ) as HTMLInputElement;
      const errorDiv = this.formElement.querySelector(
        `[data-error-for="${key}"]`
      ) as HTMLElement;

      if (!input) continue;

      input.classList.remove("cd-valid", "cd-invalid");
      if (error) {
        input.classList.add("cd-invalid");
        if (errorDiv) errorDiv.textContent = error;
      } else {
        input.classList.add("cd-valid");
        if (errorDiv) errorDiv.textContent = "";
      }
    }
  }
}
```

//////////////////////////////////////////

I am assuming you are suggesting:
src/CdShell/sys/cd-user/view/sign-in.controller.js
is good to go for now and that we can move to:
src/CdShell/sys/cd-guig/services/cd-directive-binder.service.ts
So we can "Add minimal UI-System-awareness to CdDirectiveBinderService"
Or we start with it before coming back to src/CdShell/sys/cd-user/view/sign-in.controller.js.
Either way I am ok with this.
Below is its current state:

// src/CdShell/sys/cd-guig/services/cd-directive-binder.service.ts

```ts
import { CdFormGroup } from "../controllers/cd-form-group.control";

export class CdDirectiveBinderService {
  private form: CdFormGroup;
  private formElement: HTMLFormElement; // Will be set later in bindToDom()
  private controllerInstance: any;
  private formSelector: string; // 💡 Store the selector here

  // 💡 NEW: Array to store references for listener removal
  private eventListeners: {
    element: HTMLElement;
    event: string;
    handler: (e: Event) => void;
  }[] = [];

  constructor(
    form: CdFormGroup,
    formSelector: string,
    controllerInstance: any
  ) {
    console.log(
      "CdDirectiveBinderService::constructor()/start - DOM lookups deferred."
    );
    this.form = form;
    this.controllerInstance = controllerInstance;
    this.formSelector = formSelector; // Store the selector for later use in bindToDom()

    // 🛑 All DOM querying logic is removed from the constructor.
  }

  // 💡 NEW: Binds control listeners to the current DOM elements
  /**
   * 💡 NEW: Binds control listeners and Angular-style event listeners to the current DOM elements.
   */
  public async bindToDom(): Promise<void> {
    console.log("[CdDirectiveBinderService][bindToDom] 01");

    // 1. Find the Form Element using the stored selector
    this.formElement = document.querySelector(
      this.formSelector
    ) as HTMLFormElement;

    if (!this.formElement) {
      console.error(
        `[Binder Error] Form element not found in DOM for selector: ${this.formSelector}`
      );
      // If the form isn't found, stop binding but don't crash.
      return;
    }

    if (!this.formElement) return;

    // --- 1. Bind cdFormControl inputs (Input/Blur) ---
    Object.entries(this.form.controls).forEach(([key, control]) => {
      const input = this.formElement.querySelector(
        `[name="${key}"][cdFormControl]`
      ) as HTMLInputElement;

      if (!input) return;

      // Handler for 'input' (value change)
      const inputHandler = (e: Event) => {
        const target = e.target as HTMLInputElement;
        control.setValue(target.value);
        this.applyValidationStyles({ [key]: control.error });
      };

      // Handler for 'blur' (touched state and validation)
      const blurHandler = () => {
        control.markAsTouched();
        this.applyValidationStyles({ [key]: control.error });
      };

      input.addEventListener("input", inputHandler);
      input.addEventListener("blur", blurHandler);

      // 💡 Store references for removal
      this.eventListeners.push({
        element: input,
        event: "input",
        handler: inputHandler,
      });
      this.eventListeners.push({
        element: input,
        event: "blur",
        handler: blurHandler,
      });

      // 4. Apply current control values and validation styles
      input.value = control.value;
      this.applyValidationStyles({ [key]: control.error });
    });

    // --- 2. Bind Angular-style event bindings ((change)="method()") ---
    const elements = this.formElement.querySelectorAll("*");

    elements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const match = attr.name.match(/^\(([^)]+)\)$/); // e.g., (change)
        if (match) {
          const eventName = match[1];
          const expression = attr.value;

          // Handler for the custom event binding
          const customHandler = (e: Event) =>
            this.invokeDirectiveMethod(expression, e);

          el.addEventListener(eventName, customHandler);

          // 💡 Store reference for removal
          this.eventListeners.push({
            element: el as HTMLElement,
            event: eventName,
            handler: customHandler,
          });
        }
      });
    });
  }

  // 💡 NEW: Removes all listeners created by bindToDom()
  /**
   * 💡 NEW: Removes all listeners created by bindToDom() from the DOM and clears the tracking array.
   */
  public unbindAllDomEvents(): void {
    console.log(
      `CdDirectiveBinderService: Unbinding ${this.eventListeners.length} listeners.`
    );

    // Iterate through the stored references and remove the listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Crucial: Clear the array to prevent memory leaks in the binder itself
    this.eventListeners = [];
  }

  /**
   * Invokes a controller method referenced by directive attributes.
   */
  private invokeDirectiveMethod(expression: string, event: Event): void {
    try {
      const fnMatch = expression.match(/^([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (!fnMatch) return;

      const fnName = fnMatch[1];
      const hasEventArg = fnMatch[2]?.includes("$event");

      const controller = this.controllerInstance; // 👈 USE STORED INSTANCE

      if (controller && typeof controller[fnName] === "function") {
        // 🛑 CRITICAL FIX: Use .call() or .apply() to set the 'this' context!
        controller[fnName].call(controller, hasEventArg ? event : undefined);
      } else {
        console.warn(`[UUD] Method not found: ${fnName}`);
      }
    } catch (err) {
      console.error(
        `[UUD] Error invoking directive method: ${expression}`,
        err
      );
    }
  }

  /**
   * Detects which controller is currently active based on a naming convention.
   * (You can refine this logic later for module contexts.)
   */
  validateAll(): void {
    const result = this.form.validateAll();
    this.applyValidationStyles(result);
  }

  applyValidationStyles(result: Record<string, string | null>): void {
    for (const [key, error] of Object.entries(result)) {
      const input = this.formElement.querySelector(
        `[name="${key}"]`
      ) as HTMLInputElement;
      const errorDiv = this.formElement.querySelector(
        `[data-error-for="${key}"]`
      ) as HTMLElement;

      if (!input) continue;

      input.classList.remove("cd-valid", "cd-invalid");
      if (error) {
        input.classList.add("cd-invalid");
        if (errorDiv) errorDiv.textContent = error;
      } else {
        input.classList.add("cd-valid");
        if (errorDiv) errorDiv.textContent = "";
      }
    }
  }
}
```

////////////////////////////////////////////
I currently have global.d.ts.
Is it where we can integrate CD_ACTIVE_UISYSTEM?
// src/global.d.ts

```ts
export {};

declare global {
  interface CdShellNotify {
    success(msg: string): void;
    error(msg: string): void;
    info?(msg: string): void;
    warn?(msg: string): void;
  }

  interface CdShellProgress {
    start(label?: string): void;
    done(): void;
    set?(percent: number): void;
  }

  interface Window {
    cdShell?: {
      logger?: {
        debug?: (...args: any[]) => void;
        warn?: (...args: any[]) => void;
        error?: (...args: any[]) => void;
      };
      lifecycle?: {
        onViewLoaded?: (item?: any, cdToken?: string) => void;
      };
      notify?: CdShellNotify;
      progress?: CdShellProgress;
    };
    CD_ACTIVE_UISYSTEM?: string;
  }
}
```

////////////////////////////////////////

////////////////////////////////////////

From corpdesk design, I am suggeting the the content of /src/ui-system-detector.ts can be organised like this:

1. The following can go to src/CdShell/sys/cd-guig/models/ui-system-adaptor.model.ts

```ts
export type UiSystemId =
  | "bootstrap-538"
  | "bootstrap-502"
  | "tailwind"
  | "material-mui"
  | "custom";

export interface UiSystemDescriptor {
  id: UiSystemId;
  version?: string;
  theme?: "light" | "dark";
  manifestUrl?: string; // where descriptor.json was loaded from
  cssLoaded?: boolean; // internal use
}

const DEFAULT_SYSTEM: UiSystemDescriptor = {
  id: "bootstrap-538",
  version: "5.3.8",
  theme: "light",
};
```

2. Your proposed function detectUiSystem() can be integrated into UiSystemLoaderService shared below as part of existing reusable material.

3. Optional: See the section REFINING ADAPTOR MACHANISM FOR SCALABILITY

EXISTING MATERIAL THAT CAN BE INTEGRATED

// Current state of src/CdShell/sys/cd-guig/models/ui-system-adaptor.model.ts

```ts
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { Bootstrap502Adapter } from "../services/bootstrap-502-adaptor.service";
import { MaterialAdapter } from "../services/material-adaptor.service";
import { PlainAdapter } from "../services/plain-adaptor.service";
import { Bootstrap538Adapter } from "../services/ui-system-adapters";

export interface IUiSystemAdapter {
  activate(descriptor: UiSystemDescriptor): Promise<void>;
  deactivate(): Promise<void>;
  applyTheme(themeId: string): Promise<void>;
}

export const SYSTEM_ADAPTERS: Record<string, IUiSystemAdapter> = {
  "bootstrap-502": new Bootstrap502Adapter(),
  "bootstrap-538": new Bootstrap538Adapter(),
  "material-design": new MaterialAdapter(),
  plain: new PlainAdapter(),
};
```

// src/CdShell/sys/cd-guig/services/ui-system-loader.service.ts

```ts
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { UiConfig } from "../../moduleman/models/config.model";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { diag_css } from "../../utils/diagnosis";
import {
  IUiSystemAdapter,
  SYSTEM_ADAPTERS,
} from "../models/ui-system-adaptor.model";
import { STATIC_UI_SYSTEM_REGISTRY } from "../models/ui-system-schema.model";
import { PlainAdapter } from "./plain-adaptor.service";
import { UiSystemAdapterFactory } from "./ui-system-adapters";

/**
 * @class UiSystemLoaderService
 * @description
 * Centralized runtime manager for UI systems (Material, Bootstrap, etc.)
 * Handles discovery, loading, caching, activation, and theme switching.
 *
 * Expected directory structure:
 * public/assets/ui-systems/
 * ├── material/
 * │   ├── descriptor.json
 * │   ├── css/
 * │   ├── js/
 * │   └── templates/
 * ├── bootstrap/
 * │   ├── descriptor.json
 * │   └── ...
 *
 * Each `descriptor.json` must comply with `UiSystemDescriptor` format.
 */

export class UiSystemLoaderService {
  private static instance: UiSystemLoaderService | null = null;
  private activeSystem: UiSystemDescriptor | null = null;
  private sysCache!: SysCacheService;

  constructor(sysCache: SysCacheService) {
    this.sysCache = sysCache;
  }

  public static getInstance(sysCache?: SysCacheService): UiSystemLoaderService {
    if (!UiSystemLoaderService.instance) {
      if (!sysCache)
        throw new Error(
          "UiSystemLoaderService.getInstance requires SysCacheService on first call."
        );
      UiSystemLoaderService.instance = new UiSystemLoaderService(sysCache);
    }
    return UiSystemLoaderService.instance;
  }

  async fetchAvailableSystems(
    uiConfig: UiConfig
  ): Promise<UiSystemDescriptor[]> {
    // Example static registry read — adapt to your existing STATIC_UI_SYSTEM_REGISTRY
    console.log(
      "[UiSystemLoaderService.fetchAvailableSystems] uiConfig:",
      uiConfig
    );
    // Use existing STATIC_UI_SYSTEM_REGISTRY if available
    const registry =
      typeof STATIC_UI_SYSTEM_REGISTRY !== "undefined" &&
      STATIC_UI_SYSTEM_REGISTRY
        ? STATIC_UI_SYSTEM_REGISTRY
        : [
            {
              id: "bootstrap-502",
              name: "Bootstrap 5",
              cssUrl: "/assets/ui-systems/bootstrap-502/bootstrap.min.css",
              jsUrl: "/assets/ui-systems/bootstrap-502/bootstrap.min.js",
              themesAvailable: [{ id: "dark" }],
              themeActive: null,
            },
          ];
    // ensure basePath if provided by uiConfig
    return registry.map((d: any) => ({
      ...d,
      basePath: `${uiConfig.uiSystemBasePath || "/public/assets/ui-systems/"}${d.id}/`,
    }));
  }

  list(): UiSystemDescriptor[] {
    return this.sysCache.get("uiSystems") || [];
  }

  getSystemById(id: string): UiSystemDescriptor | undefined {
    const available = this.sysCache.get("uiSystems") || [];
    return available.find((s: any) => s.id === id);
  }

  public async activate(id: string): Promise<void> {
    diag_css("[UiSystemLoaderService.activate] START", { id });
    const descriptorFromCache = this.getSystemById(id);
    console.log(
      "[UiSystemLoaderService.activate] descriptorFromCache:",
      descriptorFromCache
    );

    // If not in cache, we still accept descriptor from fetchAvailableSystems fallback
    const descriptor = descriptorFromCache || {
      id,
      cssUrl: `/assets/ui-systems/${id}/${id}.min.css`,
      jsUrl: `/assets/ui-systems/${id}/${id}.min.js`,
    };

    console.log(
      "[UiSystemLoaderService.activate] Using descriptor:",
      descriptor
    );

    this.activeSystem = descriptor as UiSystemDescriptor;

    // remove old assets belonging to any ui-system
    document
      .querySelectorAll("link[data-cd-uisystem], script[data-cd-uisystem]")
      .forEach((el) => el.remove());
    diag_css("[UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS", {});

    // resolve fallback paths already present on descriptor
    const cssPath =
      (descriptor as any).cssUrl || `/assets/ui-systems/${id}/${id}.min.css`;
    const jsPath =
      (descriptor as any).jsUrl || `/assets/ui-systems/${id}/${id}.min.js`;

    diag_css("[UiSystemLoaderService.activate] RESOLVED PATHS", {
      cssPath,
      jsPath,
    });

    try {
      await this.loadCSS(cssPath, id);
      diag_css("[UiSystemLoaderService.activate] CSS LOADED", { cssPath });
    } catch (err) {
      diag_css("[UiSystemLoaderService.activate] CSS LOAD FAILED", {
        cssPath,
        err,
      });
    }

    // load script but don't necessarily block entire bootstrap if JS fails
    try {
      await this.loadScript(jsPath, id);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOADED", { jsPath });
    } catch (err) {
      console.warn("[UiSystemLoaderService.activate] script load failed", err);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOAD FAILED", {
        jsPath,
        err,
      });
    }

    diag_css("[UiSystemLoaderService.activate] COMPLETE", { activeSystem: id });
  }

  /**
   * applyTheme(systemId, themeId)
   * - find adapter for systemId, fetch theme descriptor via SysCacheService / UiThemeLoaderService
   * - call adapter.applyTheme(themeDescriptor)
   */
  public async applyTheme(systemId: string, themeId: string): Promise<void> {
    diag_css("[UiSystemLoaderService.applyTheme] start", { systemId, themeId });
    const adapter = UiSystemAdapterFactory.getAdapter(systemId);
    console.log(
      "[UiSystemLoaderService.applyTheme] adapter received:",
      adapter
    );
    if (!adapter) {
      console.warn(
        "[UiSystemLoaderService.applyTheme] no adapter for",
        systemId
      );
      return;
    }

    // get theme descriptor from cache
    const descriptors = this.sysCache.get("themeDescriptors") || [];
    console.log(
      "[UiSystemLoaderService][applyTheme] descriptors:",
      descriptors
    );
    const themeDescriptor = descriptors.find((d: any) => d.id === themeId);
    console.log(
      "[UiSystemLoaderService][applyTheme] descriptors:",
      themeDescriptor
    );

    // supply descriptor if found, else just themeId
    await adapter.applyTheme(themeDescriptor || themeId);
    diag_css("[UiSystemLoaderService.applyTheme] done", { systemId, themeId });
  }

  public async loadCSS(path: string, id: string): Promise<string> {
    diag_css("[UiSystemLoaderService.loadCSS] REQUEST", { path, id });

    return new Promise((resolve, reject) => {
      try {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return reject(new Error("document.head missing"));

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;
        link.setAttribute("data-cd-uisystem", id);
        link.setAttribute("data-cd-origin", "ui-system");

        link.onload = () => {
          const resolved = (link as HTMLLinkElement).href;
          diag_css("[UiSystemLoaderService.loadCSS] LOADED", {
            path,
            id,
            resolved,
            order: Array.from(head.querySelectorAll("link")).map(
              (l) => (l as HTMLLinkElement).href
            ),
          });
          resolve(resolved);
        };

        link.onerror = (ev) => {
          diag_css("[UiSystemLoaderService.loadCSS] ERROR", { path, id, ev });
          reject(new Error(`Failed to load CSS: ${path}`));
        };

        head.insertAdjacentElement("beforeend", link);
      } catch (err) {
        diag_css("[UiSystemLoaderService.loadCSS] EXCEPTION", {
          path,
          id,
          err,
        });
        reject(err);
      }
    });
  }

  public async loadScript(path: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = path;
        script.async = true;
        script.setAttribute("data-cd-uisystem", id);
        script.setAttribute("data-cd-origin", "ui-system");
        script.onload = () => resolve();
        script.onerror = (ev) => reject(ev);

        const body = document.body || document.getElementsByTagName("body")[0];
        if (!body) return reject(new Error("document.body missing"));
        body.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }

  getActive(): UiSystemDescriptor | null {
    console.log(`[UiSystemLoaderService][getActive] start.`);
    return this.activeSystem;
  }
}
```

REFINING ADAPTOR MACHANISM FOR SCALABILITY
Take a look at the corpdesk-rfc-0001.
Given the effort to architect a scalable adapters for ui-systems and that currently, we are using a place holder: src/CdShell/sys/cd-guig/services/ui-system-adapters.ts, we need to develop an 'app' module which can interact with 'sys' adapter to server the system wide adapter service.
While we are using this a place holder, considering that the adaptor is at system level, it should not be that adptable options are hard coded in the system. Or rather, specific ui-systems should be pluggable from 'outside' the system.
Now the system is built in terms of sys and app modules.
And each module is orgnaized into controllers, models and services.
This simplistic architectured should be maintained.
So I would like you to give me proposal for mutilating the current src/CdShell/sys/cd-guig/services/ui-system-adapters.ts into a core that remains in the 'sys', then a module(ui-adaptor-port) is introduced that goes to 'app' directory which contains specific adaptors that are called by the sys adaptor.
In fact, sys/core adaptor should not know what is available. It should auto discover from the ui-adaptor-port module.

```sh
emp-12@emp-12 ~/cd-shell (main)> tree src/CdShell/sys/cd-guig/
src/CdShell/sys/cd-guig/
├── controllers
│   ├── cd-form.control.ts
│   ├── cd-form-group.control.ts
│   └── cd-validators.controller.ts
├── models
│   ├── ui-directive.model.ts
│   ├── ui-system-adaptor.model.ts
│   ├── ui-system-introspector.model.ts
│   ├── ui-system-schema.model.ts
│   └── ui-translator.model.ts
├── services
│   ├── bootstrap-502-adaptor.service.ts
│   ├── cd-directive-binder.service.ts
│   ├── forms.service.ts
│   ├── material-adaptor.service.ts
│   ├── plain-adaptor.service.ts
│   ├── ui-auto-descriptor.service.ts
│   ├── ui-directove-mapper.service.ts
│   ├── ui-dom-factory.service.ts
│   ├── ui-generic-renderer.service.ts
│   ├── ui-render-engine.service.ts
│   ├── ui-system-adapters.ts
│   ├── ui-system-adaptor.service.ts
│   ├── ui-system-loader.service.ts
│   ├── ui-system-registry.service.ts
│   ├── ui-theme-loader.service.ts
│   ├── ui-translator-registry.service.ts
│   └── ui-uud.service.ts
└── view
    └── index.js
```

// src/CdShell/sys/cd-guig/services/ui-system-adapters.ts

```ts
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { IUiSystemAdapter } from "../models/ui-system-adaptor.model";

/**
 * Bootstrap502Adapter: sets data-bs-theme on <html> for Bootstrap v5.0.2
 */
export class Bootstrap502Adapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap502Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap502Adapter] applyTheme error", err);
    }
  }
}

/**
 * Bootstrap538Adapter — supports Bootstrap 5.3.8 with official dark-mode variables
 * Dark mode works natively using the <html data-bs-theme="dark">
 */
export class Bootstrap538Adapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    // No-op: CSS/JS already injected by UiSystemLoaderService
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    console.log("[Bootstrap538Adapter][applyTheme] start");
    console.log(
      "[Bootstrap538Adapter][applyTheme] themeDescriptorOrId:",
      themeDescriptorOrId
    );
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      // Bootstrap 5.3.x controls dark mode via:
      // <html data-bs-theme="dark">
      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap538Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap538Adapter] applyTheme error", err);
    }
  }
}

/**
 * MaterialAdapter — applies Material Design theme logic
 */
export class MaterialAdapter implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-md-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    if (!themeDescriptorOrId) return;

    const mode =
      typeof themeDescriptorOrId === "string"
        ? themeDescriptorOrId
        : themeDescriptorOrId.mode;

    if (mode === "dark") {
      document.documentElement.classList.add("md-dark");
      document.documentElement.classList.remove("md-light");
    } else {
      document.documentElement.classList.remove("md-dark");
      document.documentElement.classList.add("md-light");
    }

    console.log("[MaterialAdapter] applyTheme:", mode);
  }
}

/**
 * Factory for UI system adapters
 */
export class UiSystemAdapterFactory {
  public static getAdapter(systemId: string): IUiSystemAdapter | null {
    console.group("[UiSystemAdapterFactory] Adapter Lookup");
    console.log("Requested systemId:", JSON.stringify(systemId));

    let adapter: IUiSystemAdapter | null = null;

    switch (systemId) {
      case "bootstrap-502":
        adapter = new Bootstrap502Adapter();
        break;

      case "bootstrap-538":
        adapter = new Bootstrap538Adapter();
        break;

      case "material":
      case "material-design":
        adapter = new MaterialAdapter();
        break;

      default:
        console.warn(
          "[UiSystemAdapterFactory] ❌ Unknown systemId — returning null"
        );
        console.groupEnd();
        return null;
    }

    console.log("Resolved adapter instance:", adapter?.constructor.name);
    console.groupEnd();
    return adapter;
  }
}
```

///////////////////////////////////////////////

In your proposed method detectFromRuntime(), you are making reference window.CdShellActiveUiSystem.
Should we include window.CdShellActiveUiSystem in the global.d.ts?
If so suggest the new contensts for global.d.ts

```ts
private detectFromRuntime(): string | null {
    return window.CdShellActiveUiSystem || window.CD_ACTIVE_UISYSTEM || null;
  }
```

// src/global.d.ts

```ts
export {};

declare global {
  interface CdShellNotify {
    success(msg: string): void;
    error(msg: string): void;
    info?(msg: string): void;
    warn?(msg: string): void;
  }

  interface CdShellProgress {
    start(label?: string): void;
    done(): void;
    set?(percent: number): void;
  }

  interface Window {
    CD_ACTIVE_UISYSTEM?: string; // <-- ADD THIS LINE

    cdShell?: {
      logger?: {
        debug?: (...args: any[]) => void;
        warn?: (...args: any[]) => void;
        error?: (...args: any[]) => void;
      };
      lifecycle?: {
        onViewLoaded?: (item?: any, cdToken?: string) => void;
      };
      notify?: CdShellNotify;
      progress?: CdShellProgress;
    };
  }
}
```

//////////////////////////////////////////////
You have suggested for a line in UiSystemLoader.activate():
const descriptorFromCache = this.getSystemById(id);
to be replaced with:
if (!id) {
const auto = this.detectUiSystem();
id = auto.id;
}
It has not been mentioned what happens to the variable descriptorFromCache which is fundamental in the method.

```ts
public async activate(id: string): Promise<void> {
    diag_css("[UiSystemLoaderService.activate] START", { id });
    const descriptorFromCache = this.getSystemById(id);
    console.log(
      "[UiSystemLoaderService.activate] descriptorFromCache:",
      descriptorFromCache
    );

    // If not in cache, we still accept descriptor from fetchAvailableSystems fallback
    const descriptor = descriptorFromCache || {
      id,
      cssUrl: `/assets/ui-systems/${id}/${id}.min.css`,
      jsUrl: `/assets/ui-systems/${id}/${id}.min.js`,
    };

    console.log(
      "[UiSystemLoaderService.activate] Using descriptor:",
      descriptor
    );

    this.activeSystem = descriptor as UiSystemDescriptor;

    // remove old assets belonging to any ui-system
    document
      .querySelectorAll("link[data-cd-uisystem], script[data-cd-uisystem]")
      .forEach((el) => el.remove());
    diag_css("[UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS", {});

    // resolve fallback paths already present on descriptor
    const cssPath =
      (descriptor as any).cssUrl || `/assets/ui-systems/${id}/${id}.min.css`;
    const jsPath =
      (descriptor as any).jsUrl || `/assets/ui-systems/${id}/${id}.min.js`;

    diag_css("[UiSystemLoaderService.activate] RESOLVED PATHS", {
      cssPath,
      jsPath,
    });

    try {
      await this.loadCSS(cssPath, id);
      diag_css("[UiSystemLoaderService.activate] CSS LOADED", { cssPath });
    } catch (err) {
      diag_css("[UiSystemLoaderService.activate] CSS LOAD FAILED", {
        cssPath,
        err,
      });
    }

    // load script but don't necessarily block entire bootstrap if JS fails
    try {
      await this.loadScript(jsPath, id);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOADED", { jsPath });
    } catch (err) {
      console.warn("[UiSystemLoaderService.activate] script load failed", err);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOAD FAILED", {
        jsPath,
        err,
      });
    }

    diag_css("[UiSystemLoaderService.activate] COMPLETE", { activeSystem: id });
  }
```

/////////////////////////////////////////////////

When set to 'default', the visuals are as expected.
But when set to 'dark', everything seem fine but the text on the texbox lable and typed text on the textbox is dark on dark background.
Otherwise the button seem like a bootstrap button with white text.
I have shared the logs and browser inspector for elements for button, label and textbox

```log
[UiSystemAdapterRegistry] register: bootstrap-502
Object {  }
index-XvUemhhx.js:48:10750
[UiSystemAdapterRegistry] register: bootstrap-538
Object {  }
index-XvUemhhx.js:48:10750
[UiSystemAdapterRegistry] register: material-design
Object {  }
index-XvUemhhx.js:48:10750
[UiSystemAdapterRegistry] register: plain
Object {  }
index-XvUemhhx.js:48:10750
start 1 index-XvUemhhx.js:48:28634
[SHELL] [DEBUG] [Main] init(): starting index-XvUemhhx.js:48:1132
[SHELL] [DEBUG] [Main] Running in browser → skipping ensureInitialized() index-XvUemhhx.js:48:1132
[ModuleService][constructor]: starting index-XvUemhhx.js:48:3580
[ModuleService] Running under Vite (browser). index-XvUemhhx.js:48:3653
[SHELL] [DEBUG] starting bootstrapShell() index-XvUemhhx.js:48:1132
[SHELL] [DEBUG] [Main] init(): completed index-XvUemhhx.js:48:1132
[SysCacheService] 01: Starting Eager Load (Singleton) index-XvUemhhx.js:48:9102
[ConfigService] loaded config:
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…} }
index-XvUemhhx.js:48:21077
[UiSystemLoaderService.fetchAvailableSystems] uiConfig:
Object { defaultUiSystemId: "bootstrap-538", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/public/assets/ui-systems/" }
index-XvUemhhx.js:48:15927
[SysCacheService] uiSystemsData:
Array(3) [ {…}, {…}, {…} ]
index-XvUemhhx.js:48:9317
[UiThemeLoaderService][fetchAvailableThemes] start
Object { defaultUiSystemId: "bootstrap-538", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/public/assets/ui-systems/" }
index-XvUemhhx.js:48:22074
[SysCacheService] uiThemesData:
Object { themes: (2) […], variants: (3) […], descriptors: (2) […], uiConfig: {…} }
index-XvUemhhx.js:48:9425
[SysCacheService] Normalized Systems:
Array(3) [ {…}, {…}, {…} ]
index-XvUemhhx.js:48:9650
[SysCacheService] Eager Load complete. Systems: 3, Themes: 2 index-XvUemhhx.js:48:10009
[Main][run] uiConfig:
Object { defaultUiSystemId: "bootstrap-538", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/public/assets/ui-systems/" }
index-XvUemhhx.js:48:25427
[CSS-DIAG] [MAIN.applyStartupUiSettings] start
Object { systemId: "bootstrap-538", themeId: "dark" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.activate] START
Object { id: "bootstrap-538" }
index-XvUemhhx.js:48:10613
[UiSystemLoaderService.activate] descriptorFromCache:
Object { id: "bootstrap-538", name: "Bootstrap 5.3.8", cssUrl: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", jsUrl: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js", displayName: "Bootstrap 5.3.8", themesAvailable: (1) […], themeActive: {…} }
index-XvUemhhx.js:48:16714
[UiSystemLoaderService.activate] Using descriptor:
Object { id: "bootstrap-538", name: "Bootstrap 5.3.8", cssUrl: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", jsUrl: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js", displayName: "Bootstrap 5.3.8", themesAvailable: (1) […], themeActive: {…} }
index-XvUemhhx.js:48:16893
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS
Object {  }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS
Object { cssPath: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", jsPath: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js", bridgeCssPath: "/assets/ui-systems/bootstrap-538/bridge.css", adapterJsPath: "/assets/ui-systems/bootstrap-538/bootstrap-538.bridge.adapter.js" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST
Object { path: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", id: "bootstrap-538" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED
Object { path: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", id: "bootstrap-538", resolved: "https://localhost:5173/assets/ui-systems/bootstrap-538/bootstrap.min.css", order: (2) […] }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOADED
Object { cssPath: "/assets/ui-systems/bootstrap-538/bootstrap.min.css" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST
Object { path: "/assets/ui-systems/bootstrap-538/bridge.css", id: "bootstrap-538-bridge" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED
Object { path: "/assets/ui-systems/bootstrap-538/bridge.css", id: "bootstrap-538-bridge", resolved: "https://localhost:5173/assets/ui-systems/bootstrap-538/bridge.css", order: (3) […] }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED
Object { bridgeCssPath: "/assets/ui-systems/bootstrap-538/bridge.css" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOADED
Object { jsPath: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js" }
index-XvUemhhx.js:48:10613
Loading failed for the <script> with source “https://localhost:5173/assets/ui-systems/bootstrap-538/bootstrap-538.bridge.adapter.js”. localhost:5173:1:1
[UiSystemLoaderService.activate] Bridge adapter JS not found for bootstrap-538 (optional) index-XvUemhhx.js:48:18304
[CSS-DIAG] [UiSystemLoaderService.activate] ADAPTER JS LOAD FAILED
Object { adapterJsPath: "/assets/ui-systems/bootstrap-538/bootstrap-538.bridge.adapter.js", err: error }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.activate] COMPLETE
Object { activeSystem: "bootstrap-538" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [MAIN.applyStartupUiSettings] ui-system activated
Object { systemId: "bootstrap-538" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST
Object { path: "/themes/common/base.css", id: "shell-base" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED
Object { path: "/themes/common/base.css", id: "shell-base", resolved: "https://localhost:5173/themes/common/base.css", order: (4) […] }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST
Object { path: "/assets/css/index.css", id: "shell-index" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED
Object { path: "/assets/css/index.css", id: "shell-index", resolved: "https://localhost:5173/assets/css/index.css", order: (5) […] }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [MAIN.applyStartupUiSettings] shell CSS loaded
Object {  }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] start
Object { themeId: "dark" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] loaded
Object { themeId: "dark", cssPath: "/themes/dark/theme.css" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [MAIN.applyStartupUiSettings] theme css injected
Object { themeId: "dark" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [UiSystemLoaderService.applyTheme] start
Object { systemId: "bootstrap-538", themeId: "dark" }
index-XvUemhhx.js:48:10613
[UiSystemLoaderService.applyTheme] adapter received:
Object {  }
index-XvUemhhx.js:48:18662
[UiSystemLoaderService][applyTheme] descriptors:
Array [ {…}, {…} ]
index-XvUemhhx.js:48:18861
[UiSystemLoaderService][applyTheme] descriptors:
Object { name: "Dark Theme", id: "dark", logo: "/themes/default/logo.png", css: "/themes/dark/theme.css", mode: "dark", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-XvUemhhx.js:48:18955
[Bootstrap538Adapter][applyTheme] start index-XvUemhhx.js:48:11961
[Bootstrap538Adapter][applyTheme] themeDescriptorOrId:
Object { name: "Dark Theme", id: "dark", logo: "/themes/default/logo.png", css: "/themes/dark/theme.css", mode: "dark", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-XvUemhhx.js:48:12016
[Bootstrap538Adapter] applied bs-theme: dark index-XvUemhhx.js:48:12302
[CSS-DIAG] [UiSystemLoaderService.applyTheme] done
Object { systemId: "bootstrap-538", themeId: "dark" }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [MAIN.applyStartupUiSettings] system applyTheme complete
Object {  }
index-XvUemhhx.js:48:10613
[CSS-DIAG] [MAIN.applyStartupUiSettings] done
Object {  }
index-XvUemhhx.js:48:10613
ThemeService::loadThemeConfig(default) index-XvUemhhx.js:48:1597
[ModuleService][constructor]: starting index-XvUemhhx.js:48:3580
[ModuleService] Running under Vite (browser). index-XvUemhhx.js:48:3653
[Preload] Loading dev-sync index-XvUemhhx.js:48:5824
ModuleService::loadModule()/01: index-XvUemhhx.js:48:6458
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-XvUemhhx.js:48:6622
[ModuleService] 1 index-XvUemhhx.js:48:6682
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-XvUemhhx.js:48:6959
[ModuleService][loadModule] moduleInfo:
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-XvUemhhx.js:48:7118
[ModuleService][loadModule] moduleInfo.controllers:
Array [ {…} ]
index-XvUemhhx.js:48:7177
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-XvUemhhx.js:48:7329
[ModuleService] Loaded 'dev-sync' (Vite mode) at 22/11/2025, 03:35:50 index-XvUemhhx.js:48:7417
[Preload] Controller component 'IdeAgentService' not found in module dev-sync. index-XvUemhhx.js:48:6120
[Preload] Completed IdeAgentService index-XvUemhhx.js:48:6219
[Preload] Loading dev-sync index-XvUemhhx.js:48:5824
ModuleService::loadModule()/01: index-XvUemhhx.js:48:6458
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-XvUemhhx.js:48:6622
[ModuleService] 1 index-XvUemhhx.js:48:6682
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-XvUemhhx.js:48:6959
[ModuleService][loadModule] moduleInfo:
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-XvUemhhx.js:48:7118
[ModuleService][loadModule] moduleInfo.controllers:
Array [ {…} ]
index-XvUemhhx.js:48:7177
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-XvUemhhx.js:48:7329
[ModuleService] Loaded 'dev-sync' (Vite mode) at 22/11/2025, 03:35:50 index-XvUemhhx.js:48:7417
[Preload] Controller component 'IdeAgentClientService' not found in module dev-sync. index-XvUemhhx.js:48:6120
[Preload] Completed IdeAgentClientService index-XvUemhhx.js:48:6219
ModuleService::loadModule()/01: index-XvUemhhx.js:48:6458
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-user/view/index.js index-XvUemhhx.js:48:6622
[ModuleService] 1 index-XvUemhhx.js:48:6682
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-user/view/index.js index-XvUemhhx.js:48:6959
[ModuleService][loadModule] moduleInfo:
Object { ctx: "sys", isDefault: true, moduleId: "cd-user", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (2) […], menu: (1) […] }
index-XvUemhhx.js:48:7118
[ModuleService][loadModule] moduleInfo.controllers:
Array [ {…}, {…} ]
index-XvUemhhx.js:48:7177
[ModuleService] Loaded 'cd-user' (Vite mode) at 22/11/2025, 03:35:50 index-XvUemhhx.js:48:7417
ModuleService::loadModule()/01: index-XvUemhhx.js:48:6458
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-admin/view/index.js index-XvUemhhx.js:48:6622
[ModuleService] 1 index-XvUemhhx.js:48:6682
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-admin/view/index.js index-XvUemhhx.js:48:6959
[ModuleService][loadModule] moduleInfo:
Object { ctx: "sys", moduleId: "cd-admin", moduleName: "cd-admin", moduleGuid: "aaaa-bbbb-cccc-dddd", controllers: (1) […], menu: (1) […], isDefault: false }
index-XvUemhhx.js:48:7118
[ModuleService][loadModule] moduleInfo.controllers:
Array [ {…} ]
index-XvUemhhx.js:48:7177
[ModuleService] Loaded module metadata passively: cd-admin. Setup skipped. index-XvUemhhx.js:48:7329
[ModuleService] Loaded 'cd-admin' (Vite mode) at 22/11/2025, 03:35:50 index-XvUemhhx.js:48:7417
[ControllerService][findControllerInfoByRoute] controllerName: sign-in index-XvUemhhx.js:48:8419
[ControllerService][findControllerInfoByRoute] mod: tractated index-XvUemhhx.js:48:8499
[ControllerService][findControllerInfoByRoute] controllerName: sign-up index-XvUemhhx.js:48:8419
[ControllerService][findControllerInfoByRoute] mod: trancated index-XvUemhhx.js:48:8499
Starting renderMenuWithSystem() index-XvUemhhx.js:31:3291
renderMenuWithSystem()/01 index-XvUemhhx.js:31:3340
MenuService::renderPlainMenu()/menu:
        trancated
      index-XvUemhhx.js:31:3952
renderMenuWithSystem()/adapter: {"instance":null} index-XvUemhhx.js:31:3562
renderMenuWithSystem()/03 index-XvUemhhx.js:31:3750
renderMenuWithSystem()/04 index-XvUemhhx.js:31:3837
MenuService::loadResource()/start... index-XvUemhhx.js:31:5799
[MenuService][loadResource] options:
Object { item: {…} }
index-XvUemhhx.js:31:5851
[ControllerCacheService][getInstance] start... index-XvUemhhx.js:22:6771
MenuService::loadResource()/02: Retrieving controller via cache service index-XvUemhhx.js:31:6317
[ControllerCacheService][getOrInitializeController] start... index-XvUemhhx.js:22:6919
[ControllerCacheService] Creating new instance for: sys/cd-user/sign-in index-XvUemhhx.js:22:7103
CdFormGroup::_constructor()/01 cd-directive-binder.service-DGbLY5eG.js:1:46
CdDirectiveBinderService::constructor()/start cd-directive-binder.service-DGbLY5eG.js:1:1416
[ControllerCacheService] Cached instance for sys/cd-user/sign-in index-XvUemhhx.js:22:7762
[MenuService] Waiting for controller services to initialize... attempt 1 index-XvUemhhx.js:31:6640
trancated
[MenuService] Waiting for controller services to initialize... attempt 10 index-XvUemhhx.js:31:6640
MenuService::loadResource()/03: Injecting template into DOM index-XvUemhhx.js:31:6783
MenuService::loadResource()/04: Executing __activate() index-XvUemhhx.js:31:7038
[ctlSignIn][__activate] 01 index-BTrBEFaa.js:28:584
[CdDirectiveBinderService][bindToDom] start cd-directive-binder.service-DGbLY5eG.js:1:1735
[Binder] Fired event: cd:form:bound cd-directive-binder.service-DGbLY5eG.js:1:3255
MenuService::loadResource()/end index-XvUemhhx.js:31:7283
[SHELL] [DEBUG] bootstrapShell(): run() complete index-XvUemhhx.js:48:1132
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1069:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: https://localhost:5173/assets/ui-systems/bootstrap-538/bootstrap.min.css
Source Map URL: bootstrap.min.css.map
```

// form button

```css
element {
}
[type="button"]:not(:disabled),
[type="reset"]:not(:disabled),
[type="submit"]:not(:disabled),
button:not(:disabled) {
  cursor: pointer;
}
[type="button"],
[type="reset"],
[type="submit"],
button {
  -webkit-appearance: button;
}
button,
button[cdButton],
button.cd-button,
.cd-button {
  display: inline-block;
  font-weight: 400;
  color: var(--bs-btn-color, #fff);
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid var(--bs-btn-border-color, transparent);
  padding: var(--bs-btn-padding-y, 0.375rem) var(--bs-btn-padding-x, 0.75rem);
  font-size: var(--bs-btn-font-size, var(--bs-body-font-size, 1rem));
  line-height: var(--bs-btn-line-height, 1.2);
  border-radius: var(--bs-btn-border-radius, 0.375rem);
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  background-color: var(--bs-btn-bg, var(--bs-primary, #0d6efd));
  color: var(--bs-btn-color, #fff);
  cursor: pointer;
}
button,
select {
  text-transform: none;
}
button,
input,
optgroup,
select,
textarea {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
button {
  border-radius: 0;
}
*,
::after,
::before {
  box-sizing: border-box;
}
```

// form label

```css
element {
}
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bs-body-color);
}
label {
  display: inline-block;
}
*,
::after,
::before {
  box-sizing: border-box;
}
#cd-main-content,
#cd-layout,
body,
html {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
  color: var(--bs-body-color, inherit);
}
```

// textbox

```css
element {
}
:root[data-bs-theme="dark"] input[cdFormControl],
:root[data-bs-theme="dark"] textarea[cdFormControl],
:root[data-bs-theme="dark"] select[cdFormControl] {
  color: var(--bs-body-color);
  background-color: var(--bs-form-control-bg);
  border-color: var(--bs-border-color);
}
.cd-form-field input.cd-valid {
  border-color: var(--cd-color-valid);
  box-shadow: 0 0 4px var(--cd-color-valid);
}
input.cd-valid,
input.cd-valid[cdFormControl],
textarea.cd-valid,
select.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}
.cd-form-field input {
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-border-radius);
  padding: 0.6rem;
  transition:
    border-color var(--cd-transition),
    box-shadow var(--cd-transition);
}
input[cdFormControl],
textarea[cdFormControl],
select[cdFormControl],
.cd-input,
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  display: block;
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  background-color: var(--bs-form-control-bg, #fff);
  background-clip: padding-box;
  border: 1px solid var(--bs-border-color, #ced4da);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}
button,
input,
optgroup,
select,
textarea {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
*,
::after,
::before {
  box-sizing: border-box;
}
#cd-main-content,
#cd-layout,
body,
html {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
  color: var(--bs-body-color, inherit);
}
```

//////////////////////////////////////////////////
Now the text contrast for default and dark mode are as per expected.
The only peculiar observation is that the button, even in default mode is not blue.
I have shared the browser display of css for both default and dark modes.
Default mode:
Button

```css
element {
}
[type="button"]:not(:disabled),
[type="reset"]:not(:disabled),
[type="submit"]:not(:disabled),
button:not(:disabled) {
  cursor: pointer;
}
[type="button"],
[type="reset"],
[type="submit"],
button {
  -webkit-appearance: button;
}
button,
select {
  text-transform: none;
}
button,
input,
optgroup,
select,
textarea {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
button {
  border-radius: 0;
}
*,
::after,
::before {
  box-sizing: border-box;
}
```

Dark mode

```css
element {
}
[type="button"]:not(:disabled),
[type="reset"]:not(:disabled),
[type="submit"]:not(:disabled),
button:not(:disabled) {
  cursor: pointer;
}
[type="button"],
[type="reset"],
[type="submit"],
button {
  -webkit-appearance: button;
}
button,
select {
  text-transform: none;
}
button,
input,
optgroup,
select,
textarea {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
button {
  border-radius: 0;
}
*,
::after,
::before {
  box-sizing: border-box;
}
```

//////////////////////////////////////

Question: Which default style should CD buttons adopt under Bootstrap?
Answer: Use whatever developer sets in CD Form JSON metadata (public/assets/ui-systems/<ui-system>/descriptor.json)
The interface is UiSystemDescriptor.
You can determine if there is a slot for it, if now we can update UiSystemDescriptor to accomodate this assignment.
Note the all such data should first be read by SystemCache then becomes available for application runtime.

```ts
export interface UiSystemDescriptor {
  id: string; // e.g. 'bootstrap', 'material', 'tailwind'
  name?: string;
  version?: string;
  cssUrl?: string | null;
  jsUrl?: string | null;
  tokenMap?: Record<string, string>; // global tokens (colors, spacing names)
  conceptMappings?: Record<string, UiSystemMapping>;
  renderRules?: Record<
    string,
    (domNode: UiDomDescriptor, props: any) => string
  >; // optional
  metadata?: Record<string, any>; // licensing, provider, aiHints
  // Add missing properties to match the second declaration
  description?: string;
  components?: UiComponentDescriptor[];
  containers?: UiContainerDescriptor[];
  // theme?: UiThemeDescriptor;
  /** * An array listing all available theme options for this UI system.
   * Used to populate the Admin Settings dropdown.
   */
  themesAvailable?: UiThemeDescriptor[]; // NEW PROPERTY (Array of choices)

  /** * The currently active theme descriptor for this UI System.
   * Represents the theme that is *currently loaded* at runtime.
   */
  themeActive?: UiThemeDescriptor; // NEW PROPERTY (The current selection)
  scripts?: string[];
  stylesheets?: string[];
  author?: string;
  license?: string;
  repository?: string;
  extensions?: Record<string, any>;
}
```

// current setting

```json
{
  "id": "bootstrap-538",
  "name": "Bootstrap 5",
  "version": "5.3.8",
  "description": "Bootstrap 5.3.8 UI System with full support for data-bs-theme light/dark switching.",
  "author": "Bootstrap Authors",
  "license": "MIT",
  "assetPath": "/assets/ui-systems/bootstrap-538",
  "cssUrl": "bootstrap.min.css",
  "jsUrl": "bootstrap.bundle.min.js",
  "stylesheets": ["bootstrap.min.css"],
  "scripts": ["bootstrap.bundle.min.js"],
  "conceptMappings": {
    "button": {
      "class": "btn btn-primary"
    },
    "card": {
      "class": "card"
    },
    "input": {
      "class": "form-control"
    },
    "formGroup": {
      "class": "mb-3"
    }
  },
  "directiveMap": {
    "cd-tooltip": "data-bs-toggle=\"tooltip\""
  },
  "themesAvailable": [
    {
      "id": "default",
      "name": "Default",
      "displayName": "Default Theme",
      "css": "/themes/default/theme.css",
      "mode": "light"
    },
    {
      "id": "dark",
      "name": "Dark Mode",
      "displayName": "Dark Theme",
      "css": "/themes/dark/theme.css",
      "mode": "dark"
    }
  ],
  "themeActive": null,
  "metadata": {
    "supportsDarkMode": true,
    "supportsBootstrapThemeSwitch": true
  },
  "extensions": {
    "adapter": "Bootstrap5Adapter",
    "versionTag": "bootstrap-538"
  }
}
```

//////////////////////////////////////
Go ahead. Below are some references in their current state

```ts
export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>();
  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

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

  /**
   * Eagerly loads:
   * - uiConfig
   * - uiSystems (normalized)
   * - themes (light weight list)
   * - formVariants
   * - themeDescriptors (full theme.json objects)
   */
  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }
    if (this.cache.size > 0) return; // already loaded

    console.log("[SysCacheService] 01: Starting Eager Load (Singleton)");

    const shellConfig = await this.configService.loadConfig();
    const uiConfig = shellConfig.uiConfig;
    this.cache.set("uiConfig", uiConfig);

    // fetch systems (normalized)
    const uiSystemsData =
      await this._uiSystemLoader.fetchAvailableSystems(uiConfig);
    console.log("[SysCacheService] uiSystemsData:", uiSystemsData);

    // fetch themes (this method will return a { themes, variants, descriptors } shape)
    const uiThemesData =
      await this._uiThemeLoader.fetchAvailableThemes(uiConfig);
    console.log("[SysCacheService] uiThemesData:", uiThemesData);

    // Normalize systems to minimal descriptor for client usage
    const normalizedSystems = uiSystemsData.map((sys: any) => ({
      id: sys.id,
      name: sys.name,
      cssUrl: sys.cssUrl,
      jsUrl: sys.jsUrl,
      displayName: sys.displayName || sys.name,
      themesAvailable: sys.themesAvailable || [],
      themeActive: sys.themeActive || null,
    }));

    console.log("[SysCacheService] Normalized Systems:", normalizedSystems);

    // uiThemesData SHOULD provide:
    // { themes: [{id,name}], variants: [{id,name}], descriptors: [full theme.json objects] }
    const themes = (uiThemesData.themes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
    }));
    const variants = (uiThemesData.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
    }));
    const descriptors = uiThemesData.descriptors || [];

    this.cache.set("uiSystems", normalizedSystems);
    this.cache.set("themes", themes);
    this.cache.set("formVariants", variants);
    this.cache.set("themeDescriptors", descriptors);
    this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

    console.log(
      `[SysCacheService] Eager Load complete. Systems: ${normalizedSystems.length}, Themes: ${themes.length}`
    );
  }

  public getUiSystems(): any[] {
    return this.cache.get("uiSystems") || [];
  }

  public getThemes(): any[] {
    return this.cache.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.cache.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.cache.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.cache.get("uiConfigNormalized") || {};
  }

  public get(key: string): any {
    return this.cache.get(key);
  }

  public get uiSystemLoader(): UiSystemLoaderService {
    return this._uiSystemLoader;
  }

  public get uiThemeLoader(): UiThemeLoaderService {
    return this._uiThemeLoader;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) await this.loadAndCacheAll();
  }
}
```

```ts
export class UiSystemLoaderService {
  public async activate(id: string): Promise<void> {
    diag_css("[UiSystemLoaderService.activate] START", { id });

    // ---------------------------------------------------------
    // 1. Auto-detect UI-System if not explicitly provided
    // ---------------------------------------------------------
    if (!id) {
      const auto = this.detectUiSystem?.();
      if (auto?.id) {
        id = auto.id;
        console.log(
          "[UiSystemLoaderService.activate] Auto-detected UI-System:",
          id
        );
      }
    }

    // ---------------------------------------------------------
    // 2. Resolve descriptor (cache → fallback descriptor)
    // ---------------------------------------------------------
    const descriptorFromCache = this.getSystemById(id);
    console.log(
      "[UiSystemLoaderService.activate] descriptorFromCache:",
      descriptorFromCache
    );

    const descriptor: UiSystemDescriptor = descriptorFromCache || {
      id,
      cssUrl: `/assets/ui-systems/${id}/${id}.min.css`,
      jsUrl: `/assets/ui-systems/${id}/${id}.min.js`,
    };

    console.log(
      "[UiSystemLoaderService.activate] Using descriptor:",
      descriptor
    );
    this.activeSystem = descriptor;

    // ---------------------------------------------------------
    // 3. Remove old CSS / JS belonging to UI-Systems
    // ---------------------------------------------------------
    document
      .querySelectorAll("link[data-cd-uisystem], script[data-cd-uisystem]")
      .forEach((el) => el.remove());

    diag_css("[UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS", {});

    // ---------------------------------------------------------
    // 4. Resolve paths
    // ---------------------------------------------------------
    const cssPath =
      (descriptor as any).cssUrl || `/assets/ui-systems/${id}/${id}.min.css`;

    const jsPath =
      (descriptor as any).jsUrl || `/assets/ui-systems/${id}/${id}.min.js`;

    const bridgeCssPath = `/assets/ui-systems/${id}/bridge.css`;
    const adapterJsPath = `/assets/ui-systems/${id}/${id}.bridge.adapter.js`;

    diag_css("[UiSystemLoaderService.activate] RESOLVED PATHS", {
      cssPath,
      jsPath,
      bridgeCssPath,
      adapterJsPath,
    });

    // ---------------------------------------------------------
    // 5. Load main CSS (required)
    // ---------------------------------------------------------
    try {
      await this.loadCSS(cssPath, id);
      diag_css("[UiSystemLoaderService.activate] CSS LOADED", { cssPath });
    } catch (err) {
      diag_css("[UiSystemLoaderService.activate] CSS LOAD FAILED", {
        cssPath,
        err,
      });
    }

    // ---------------------------------------------------------
    // 6. Load bridge.css (optional, non-blocking)
    // ---------------------------------------------------------
    try {
      await this.loadCSS(bridgeCssPath, `${id}-bridge`);
      diag_css("[UiSystemLoaderService.activate] BRIDGE CSS LOADED", {
        bridgeCssPath,
      });
    } catch (err) {
      console.warn(
        `[UiSystemLoaderService.activate] bridge.css not found for ${id} (optional)`
      );
      diag_css("[UiSystemLoaderService.activate] BRIDGE CSS LOAD FAILED", {
        bridgeCssPath,
        err,
      });
    }

    // ---------------------------------------------------------
    // 7. Load system JS (optional)
    // ---------------------------------------------------------
    try {
      await this.loadScript(jsPath, id);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOADED", { jsPath });
    } catch (err) {
      console.warn("[UiSystemLoaderService.activate] script load failed", err);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOAD FAILED", {
        jsPath,
        err,
      });
    }

    // ---------------------------------------------------------
    // 8. Load adapter JS (optional)
    // ---------------------------------------------------------
    try {
      await this.loadScript(adapterJsPath, `${id}-bridge-adapter`);
      diag_css("[UiSystemLoaderService.activate] BRIDGE ADAPTER LOADED", {
        adapterJsPath,
      });
    } catch (err) {
      console.warn(
        `[UiSystemLoaderService.activate] Bridge adapter JS not found for ${id} (optional)`
      );
      diag_css("[UiSystemLoaderService.activate] ADAPTER JS LOAD FAILED", {
        adapterJsPath,
        err,
      });
    }

    // ---------------------------------------------------------
    // 9. Done
    // ---------------------------------------------------------
    diag_css("[UiSystemLoaderService.activate] COMPLETE", {
      activeSystem: id,
    });
  }
}
```

global.d.ts

```ts
export {};

declare global {
  interface CdShellNotify {
    success(msg: string): void;
    error(msg: string): void;
    info?(msg: string): void;
    warn?(msg: string): void;
  }

  interface CdShellProgress {
    start(label?: string): void;
    done(): void;
    set?(percent: number): void;
  }

  interface Window {
    /**
     * Runtime-injected UI system identifiers
     */
    CD_ACTIVE_UISYSTEM?: string; // 👈 supports legacy/global constant
    CdShellActiveUiSystem?: string; // 👈 supports camelCase variant

    /**
     * Existing cdShell API surface
     */
    cdShell?: {
      logger?: {
        debug?: (...args: any[]) => void;
        warn?: (...args: any[]) => void;
        error?: (...args: any[]) => void;
      };
      lifecycle?: {
        onViewLoaded?: (item?: any, cdToken?: string) => void;
      };
      notify?: CdShellNotify;
      progress?: CdShellProgress;
    };
  }
}
```

///////////////////////////////

Sorry, I forgot to update you.
Based on your proposal for the adaptors in ui-adaptor-port, I modified structures to fit corpdesk conventions.
You proposal was to have them just fill up the ui-adaptor-port directory.
The corpdesk-rfc-0001 requires the directory have only 3 directories: controllers, models and services.
So I put them in services directory.
The rfc also requres them to be either a controller, model or service and whichever the case, the name ends with the category name.
So I have them as below and the class name also follow suit.

```sh
emp-12@emp-12 ~/cd-shell (main)> tree src/CdShell/app/ui-adaptor-port/
src/CdShell/app/ui-adaptor-port/
├── controllers
├── models
├── services
│   ├── bootstrap-502-adapter.service.ts
│   ├── bootstrap-538-adapter.service.ts
│   ├── material-design-adapter.service.ts
│   └── plain-adapter.service.ts
└── view
    └── index.js
```

Example:

```ts
import {
  IUiSystemAdapter,
  UiSystemDescriptor,
} from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";

/**
 * Bootstrap538Adapter — supports Bootstrap 5.3.8 with official dark-mode variables
 * Dark mode works natively using the <html data-bs-theme="dark">
 */
export class Bootstrap538AdapterService implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    // No-op: CSS/JS already injected by UiSystemLoaderService
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    console.log("[Bootstrap538Adapter][applyTheme] start");
    console.log(
      "[Bootstrap538Adapter][applyTheme] themeDescriptorOrId:",
      themeDescriptorOrId
    );
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      // Bootstrap 5.3.x controls dark mode via:
      // <html data-bs-theme="dark">
      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap538Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap538Adapter] applyTheme error", err);
    }
  }
}

// Plugin self-registers
UiSystemAdapterRegistry.register(
  "bootstrap-538",
  new Bootstrap538AdapterService()
);
```

//////////////////////////////////////

There is a line in UiSystemLoaderService.activate(),
It reads:
const adapter = UiSystemAdapterRegistry.get
? UiSystemAdapterRegistry.get(id)
: UiSystemAdapterRegistry.getAdapter?.(id);

Below is the implementation of UiSystemAdapterRegistry.
We do not have getAdapter()?
What fix do you suggest?

```ts
export class UiSystemAdapterRegistry {
  private static registry = new Map<string, IUiSystemAdapter>();

  static register(id: string, adapter: IUiSystemAdapter) {
    console.log("[UiSystemAdapterRegistry] register:", id, adapter);
    this.registry.set(id, adapter);
  }

  static get(id: string): IUiSystemAdapter | null {
    return this.registry.get(id) || null;
  }

  static list(): string[] {
    return Array.from(this.registry.keys());
  }
}
```

/////////////////////////////////////////////////////

You have suggested use of UiConceptMapping in Bootstrap538AdapterService file.
Can you give your assumed definition of the same so I can include it in the file where it is expected.

////////////////////////////////

Use the definition below to create a simple example that can serve as default theme.

```ts
export interface UiThemeDescriptor {
  /** * Primary identifier used for selection (e.g., 'dark', 'light', 'bootstrap-compact').
   * This is used as the <option value> in the dropdown.
   */
  id: string;

  /** * Human-readable name used for display (e.g., 'Dark Mode', 'Classic').
   * This is used as the visible text in the dropdown.
   */
  name: string;

  /** * Flag indicating if this is the default theme for its parent UI System. */
  isDefault?: boolean; // NEW PROPERTY

  /** * Array of paths to CSS files specific to this theme (relative to the public/assets/ path).
   * This is the asset the UiThemeLoaderService will inject into the <head>.
   */
  stylesheets?: string[];

  /** * Array of paths to JS files specific to this theme (e.g., initialization scripts).
   */
  scripts?: string[];

  /** * Key-value pairs for CSS custom properties that should be set globally
   * (e.g., {'--primary-color': '#007bff'}).
   */
  variables?: Record<string, string>;

  /** * Metadata defining the visual and behavioral aspects of the theme.
   * Consolidates color, typography, spacing, etc., into an optional structure.
   */
  metadata?: {
    colorScheme?: Record<string, string>;
    typography?: Record<string, string>;
    spacing?: Record<string, string>;
    animations?: Record<string, string>;
    // Any other high-level theme configurations
  };

  // --- Integration Metadata (optional) ---
  author?: string;
  license?: string;
  repository?: string;

  /** * Custom system extensions for AI, telemetry, etc.
   */
  extensions?: Record<string, any>;
}
```

///////////////////////////////////////////

I am thinking we can refactor public/shell.config.json to have a place for defaultTheme.
This config would be available in SysCacheService and would be usable as fallback when default is required.
The current definition is shown below.

// proposed new setting:

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": ["default", "dark", "contrast"]
  },
  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "bootstrap-538",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/public/assets/ui-systems/"
  },
  "defaultTheme": {
    "id": "default",
    "name": "Default Theme",
    "isDefault": true,

    "stylesheets": ["/themes/default/theme.css"],

    "scripts": [],

    "variables": {
      "--primary-color": "#0d6efd",
      "--secondary-color": "#6c757d",
      "--success-color": "#198754",
      "--danger-color": "#dc3545",
      "--warning-color": "#ffc107",
      "--info-color": "#0dcaf0",
      "--light-color": "#f8f9fa",
      "--dark-color": "#212529",

      "--body-bg": "#ffffff",
      "--body-color": "#212529",
      "--border-color": "rgba(0,0,0,.125)",
      "--input-bg": "#ffffff",
      "--input-color": "#212529"
    },

    "metadata": {
      "colorScheme": {
        "background": "#ffffff",
        "surface": "#f8f9fa",
        "textPrimary": "#212529",
        "textSecondary": "#6c757d",
        "border": "rgba(0,0,0,.125)"
      },
      "typography": {
        "fontFamily": "system-ui, -apple-system, Segoe UI, Roboto",
        "fontSizeBase": "1rem",
        "headingWeight": "600",
        "bodyWeight": "400"
      },
      "spacing": {
        "padding": "1rem",
        "margin": "1rem",
        "radius": "0.375rem"
      },
      "animations": {
        "fadeDuration": "150ms",
        "transitionFast": "100ms",
        "transitionSlow": "300ms"
      }
    },

    "author": "Corpdesk",
    "license": "MIT",
    "repository": "https://corpdesk.io/ui/bootstrap-538",

    "extensions": {
      "aiHints": {
        "defaultButtonVariant": "primary",
        "defaultInputVariant": "standard",
        "preferredSpacingScale": "bootstrap"
      }
    }
  }
}
```

////////////////////////////////////
Now that we have all the coding setup and before we start debugging, we need some documentation that can be used as a guide:
The documentation should be structured in form of an rfc:

Meta data:
Title: Corpdesk RFC-0005: Runtime Caching and UI System Integration
Update Date: 22 Nov 2025
Author: Oremo Ojwang for EMP Services Ltd

The document should have the following sections among others to be determined by yourself.
Feel free to refine the wordings and any other appropriate adjustment.

- Motivation/Rationale
- Design (with diagrams)
- Implementation (with diagrams)
  - at least one of the diagrams should be a sequence diagrame of the launch process.

Key components to highlight:

- generic html intepretable by any ui-system and theme
- SysCacheService
- ui-systems
- themes
- ui-bridge
- ui-adaptor-port/adaptors
- sys/adaptor
- configurations and hot-switching of ui-systems and themes

/////////////////////////////////////////

There is an important part that I need to come out clearly in the rfc document with an example:

1. Example of scripted button
   eg:
   <button cdButton>Sign In</button>
2. Result of html in browser when ui-system is set to bootstrap-538 after it is processed through bridge and adaptor
   eg:
   <button class="btn btn-primary">Sign In</button>

//////////////////////////////////////////
Below is the implementation for Bootstrap538AdapterService.
We need to be able to tell from logs whether it is processing the flow as expected.
Use diagnostic utility and console.log to assist in observability.

// src/CdShell/app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts

```ts
import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";

type Mapping = UiConceptMapping | undefined;

export class Bootstrap538AdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  constructor() {
    // nothing heavy in constructor — lifecycle managed by activate/deactivate
  }

  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[Bootstrap538AdapterService] activate() descriptor:`,
      descriptor?.id
    );
    this.descriptor = descriptor || null;

    // initial mapping pass
    this.mapAll();

    // Setup MutationObserver to catch dynamically injected templates (controllers)
    this.observeMutations();
  }

  async deactivate(): Promise<void> {
    console.log("[Bootstrap538AdapterService] deactivate()");
    // Remove attribute set by applyTheme
    try {
      document.documentElement.removeAttribute("data-bs-theme");
    } catch (err) {
      /* ignore */
    }

    // disconnect observer
    if (this.observer) {
      try {
        this.observer.disconnect();
      } catch (err) {
        /* ignore */
      }
      this.observer = null;
    }

    // clear descriptor
    this.descriptor = null;
    // WeakSet will GC naturally; reinitialize for safety
    this.appliedSet = new WeakSet<HTMLElement>();
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    console.log(
      "[Bootstrap538AdapterService][applyTheme] start",
      themeDescriptorOrId
    );
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;
      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );
      console.log("[Bootstrap538AdapterService] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap538AdapterService] applyTheme error", err);
    }
  }

  // ---------- Mapping helpers ----------
  private getMapping(concept: string): Mapping {
    return (
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined
    );
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping || !el) return;
    // Idempotent: skip if already applied (we track by marking element in WeakSet)
    if (this.appliedSet.has(el)) {
      // still allow attribute updates if needed but avoid re-adding classes
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => {
        if (c) el.classList.add(c);
      });
    }
    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    // mark as applied
    this.appliedSet.add(el);
  }

  // Only explicit selectors (Option A)
  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;
    const selector = "button[cdButton], button.cd-button";
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((btn) => this.applyMappingToElement(btn, mapping));
  }

  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;
    const selector =
      "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]";
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => this.applyMappingToElement(el, mapping));
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;
    const selector = ".cd-form-field";
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => this.applyMappingToElement(el, mapping));
  }

  private mapOtherConcepts() {
    // map any explicit top-level keys in conceptMappings but only for nodes explicitly marked
    const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
    Object.keys(cm).forEach((concept) => {
      if (["button", "input", "formGroup"].includes(concept)) return; // handled above
      const mapping = (cm as any)[concept] as UiConceptMapping;
      if (!mapping) return;

      // Expect explicit markers: data-cd-<concept> or .cd-<concept>
      const selector = `[data-cd-${concept}], .cd-${concept}`;
      document
        .querySelectorAll<HTMLElement>(selector)
        .forEach((el) => this.applyMappingToElement(el, mapping));
    });
  }

  // runs the full explicit mapping pass
  private mapAll() {
    try {
      this.mapButtons();
      this.mapInputs();
      this.mapFormGroups();
      this.mapOtherConcepts();
    } catch (err) {
      console.warn("[Bootstrap538AdapterService] mapAll error", err);
    }
  }

  private observeMutations() {
    if (this.observer) return; // already observing

    this.observer = new MutationObserver((mutations) => {
      // we'll do a short, batched mapping on next idle
      if (typeof (window as any).requestIdleCallback === "function") {
        (window as any).requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    // observe body for subtree changes
    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (err) {
      console.warn(
        "[Bootstrap538AdapterService] observer failed to attach",
        err
      );
      this.observer = null;
    }
  }
}

// Self-register with your registry (ensure registry exposes register)
UiSystemAdapterRegistry.register(
  "bootstrap-538",
  new Bootstrap538AdapterService()
);
```

// src/CdShell/sys/utils/diagnosis.ts

```ts
export function diag_css(message: string, data: any = {}) {
  console.log(
    `%c[CSS-DIAG] ${message}`,
    "background:#222;color:#0f0;padding:2px 4px;border-radius:3px",
    data
  );
}

export function diag_sidebar() {
  const sb = document.getElementById("cd-sidebar");
  if (!sb) return;

  const style = window.getComputedStyle(sb);

  console.warn(
    "%c[SIDEBAR-DIAG] Sidebar State:",
    "background:#440;color:#fff;padding:3px"
  );

  console.log("display:", style.display);
  console.log("position:", style.position);
  console.log("width:", style.width);
  console.log("flex-direction:", style.flexDirection);
  console.log("css file winning:", sb);
}
```

//////////////////////////////////////////
There seem to be some anomaly given the visuals, browser inspector and the logs.
Below is a focus on the button behaviour and some logs.
Detail log is attached.
The button, in dark mode is showing black and gray in default mode.
B
Source:
<button cdButton>Sign In</button>

Browser inspector:
<button cdbutton="">Sign In</button>

section of the logs

```ts
[Bootstrap538Adapter] getMapping('button') = undefined index-BFPrm1r-.js:48:14022
[Bootstrap538Adapter] getMapping('input') = undefined index-BFPrm1r-.js:48:14022
[Bootstrap538Adapter] getMapping('formGroup') = undefined index-BFPrm1r-.js:48:14022
[CSS-DIAG] [Bootstrap538Adapter] mapOtherConcepts()

```

//////////////////////////////////////////
Below is the content of what is returned from UiSystemLoaderService.getFullDescriptor()
We may need to check how SysCacheService was meant to populate the conceptMappings.
From my diagnosis, SysCacheService.loadAndCacheAll() is calling UiSystemLoader.fetchAvailableSystems().
I expected ... to read from public/assets/ui-systems/bootstrap-538/descriptor.json for the details where conceptMappings is available.
This does not seem to be happening.
I have shared the related references below.

Current return from UiSystemLoaderService.getFullDescriptor().

```log
[UiSystemLoaderService.activate] descriptorFromCache:
Object { id: "bootstrap-538", name: "Bootstrap 5.3.8", version: "5.3.8", description: undefined, cssUrl: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", jsUrl: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js", assetPath: undefined, stylesheets: (1) […], scripts: (1) […], themesAvailable: (1) […], … }
​
assetPath: undefined
​
author: undefined
​
components: Array []
​
conceptMappings: Object {  }
​
containers: Array []
​
cssUrl: "/assets/ui-systems/bootstrap-538/bootstrap.min.css"
​
description: undefined
​
directiveMap: Object {  }
​
displayName: "Bootstrap 5.3.8"
​
extensions: Object {  }
​
id: "bootstrap-538"
​
jsUrl: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js"
​
license: undefined
​
metadata: Object {  }
​
name: "Bootstrap 5.3.8"
​
renderRules: Object {  }
​
repository: undefined
​
scripts: Array [ "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js" ]
​
stylesheets: Array [ "/assets/ui-systems/bootstrap-538/bootstrap.min.css" ]
​
themeActive: "default"
​
themesAvailable: Array [ {…} ]
​
tokenMap: Object {  }
​
version: "5.3.8"
​
<prototype>: Object { … }
```

// SysCacheService.loadAndCacheAll()

```ts
public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }
    if (this.cache.size > 0) return; // already loaded

    console.log("[SysCacheService] 01: Starting Eager Load");

    const shellConfig = await this.configService.loadConfig();
    const uiConfig = shellConfig.uiConfig;
    this.cache.set("uiConfig", uiConfig);

    // ---------------------------------------------
    // Fetch available systems (raw descriptors)
    // ---------------------------------------------
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      uiConfig
    );

    console.log("[SysCacheService] uiSystemsData:", uiSystemsData);

    // ---------------------------------------------
    // Normalize full descriptors
    // ---------------------------------------------
    const fullDescriptors = uiSystemsData.map((sys: any) => {
      return {
        id: sys.id,
        name: sys.name,
        version: sys.version,
        description: sys.description,

        // Assets
        cssUrl: sys.cssUrl,
        jsUrl: sys.jsUrl,
        assetPath: sys.assetPath,
        stylesheets: sys.stylesheets || [],
        scripts: sys.scripts || [],

        // Themes
        themesAvailable: sys.themesAvailable || [],
        themeActive: sys.themeActive || null,

        // Concept Mapping & directives
        conceptMappings: sys.conceptMappings || {},
        directiveMap: sys.directiveMap || {},

        // Rendering metadata
        tokenMap: sys.tokenMap || {},
        containers: sys.containers || [],
        components: sys.components || [],
        renderRules: sys.renderRules || {},

        // Metadata
        metadata: sys.metadata || {},
        extensions: sys.extensions || {},
        author: sys.author,
        license: sys.license,
        repository: sys.repository,

        displayName: sys.displayName || sys.name,
      };
    });

    // ---------------------------------------------
    // Simple list for UI (id + name only)
    // ---------------------------------------------
    const simpleSystems = fullDescriptors.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.displayName,
      themesAvailable: sys.themesAvailable,
    }));

    console.log("[SysCacheService] Normalized Systems:", simpleSystems);

    // ---------------------------------------------
    // Load theme lists & full theme.json descriptors
    // ---------------------------------------------
    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      uiConfig
    );

    const themes = (uiThemesData.themes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
    }));

    const variants = (uiThemesData.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
    }));

    const descriptors = uiThemesData.descriptors || [];

    // ---------------------------------------------
    // Store everything
    // ---------------------------------------------
    this.cache.set("uiSystems", simpleSystems);
    this.cache.set("uiSystemDescriptors", fullDescriptors);
    this.cache.set("themes", themes);
    this.cache.set("formVariants", variants);
    this.cache.set("themeDescriptors", descriptors);
    this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

    console.log(
      `[SysCacheService] Load complete. Systems: ${simpleSystems.length}, Themes: ${themes.length}`
    );
  }
```

UiSystemLoader.fetchAvailableSystems()

```ts
async fetchAvailableSystems(
    uiConfig: UiConfig
  ): Promise<UiSystemDescriptor[]> {
    // Example static registry read — adapt to your existing STATIC_UI_SYSTEM_REGISTRY
    console.log(
      "[UiSystemLoaderService.fetchAvailableSystems] uiConfig:",
      uiConfig
    );
    // Use existing STATIC_UI_SYSTEM_REGISTRY if available
    const registry =
      typeof STATIC_UI_SYSTEM_REGISTRY !== "undefined" &&
      STATIC_UI_SYSTEM_REGISTRY
        ? STATIC_UI_SYSTEM_REGISTRY
        : [
            {
              id: "bootstrap-502",
              name: "Bootstrap 5",
              cssUrl: "/assets/ui-systems/bootstrap-502/bootstrap.min.css",
              jsUrl: "/assets/ui-systems/bootstrap-502/bootstrap.min.js",
              themesAvailable: [{ id: "dark" }],
              themeActive: null,
            },
          ];
    // ensure basePath if provided by uiConfig
    return registry.map((d: any) => ({
      ...d,
      basePath: `${uiConfig.uiSystemBasePath || "/public/assets/ui-systems/"}${d.id}/`,
    }));
  }
```

// public/assets/ui-systems/bootstrap-538/descriptor.json

```json
{
  "id": "bootstrap-538",
  "name": "Bootstrap 5",
  "version": "5.3.8",
  "description": "Bootstrap 5.3.8 UI System with full support for data-bs-theme light/dark switching.",
  "author": "Bootstrap Authors",
  "license": "MIT",
  "assetPath": "/assets/ui-systems/bootstrap-538",
  "cssUrl": "bootstrap.min.css",
  "jsUrl": "bootstrap.bundle.min.js",
  "stylesheets": ["bootstrap.min.css"],
  "scripts": ["bootstrap.bundle.min.js"],
  "conceptMappings": {
    "button": {
      "class": "btn btn-primary"
    },
    "card": {
      "class": "card"
    },
    "input": {
      "class": "form-control"
    },
    "formGroup": {
      "class": "mb-3"
    }
  },
  "directiveMap": {
    "cd-tooltip": "data-bs-toggle=\"tooltip\""
  },
  "themesAvailable": [
    {
      "id": "default",
      "name": "Default",
      "displayName": "Default Theme",
      "css": "/themes/default/theme.css",
      "mode": "light"
    },
    {
      "id": "dark",
      "name": "Dark Mode",
      "displayName": "Dark Theme",
      "css": "/themes/dark/theme.css",
      "mode": "dark"
    }
  ],
  "themeActive": null,
  "metadata": {
    "supportsDarkMode": true,
    "supportsBootstrapThemeSwitch": true
  },
  "extensions": {
    "adapter": "Bootstrap5Adapter",
    "versionTag": "bootstrap-538"
  }
}
```

///////////////////////////////////////////

In the proposal you have given, you use:
const systems = uiConfig.uiSystems || [];
to get available systems.
But this source does not have the property uiSystems.
uiConfig data is fetched from public/shell.config.json.
I have shared the initial lines for the launch logs.
Notice that the systems are self registering.
We need to device how this can provide the data for 'systems' that you intended to refer.

// public/shell.config.json

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": ["default", "dark", "contrast"]
  },
  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "bootstrap-538",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/public/assets/ui-systems/"
  }
}
```

```log
[UiSystemAdapterRegistry] register: bootstrap-502
Object {  }
index-lxpZK6ES.js:48:11295
[Bootstrap538AdapterService] constructor() index-lxpZK6ES.js:48:12412
[UiSystemAdapterRegistry] register: bootstrap-538
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet [] }
index-lxpZK6ES.js:48:11295
[UiSystemAdapterRegistry] register: material-design
Object {  }
index-lxpZK6ES.js:48:11295
[UiSystemAdapterRegistry] register: plain
Object {  }
index-lxpZK6ES.js:48:11295
[Bootstrap538AdapterService] constructor() index-lxpZK6ES.js:48:12412
start 1 index-lxpZK6ES.js:48:32874
[SHELL] [DEBUG] [Main] init(): starting index-lxpZK6ES.js:48:1132
[SHELL] [DEBUG] [Main] Running in browser → skipping ensureInitialized() index-lxpZK6ES.js:48:1132
[ModuleService][constructor]: starting index-lxpZK6ES.js:48:3580
[ModuleService] Running under Vite (browser). index-lxpZK6ES.js:48:3653
[SHELL] [DEBUG] starting bootstrapShell() index-lxpZK6ES.js:48:1132
[SHELL] [DEBUG] [Main] init(): completed index-lxpZK6ES.js:48:1132
[SysCacheService] 01: Starting Eager Load
```

////////////////////////////////////////
The button is now generating the righ html
I need us to focus on the menu for a moment.
The contrast for text against the background is too low.
See attached screenshot.
Below is what is picked from the brwser

```css
element {
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 10px 15px;
  text-decoration: none;
  color: var(--menu-text-color, #333);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
a {
  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
  text-decoration: underline;
}
*,
::after,
::before {
  box-sizing: border-box;
}
[role="button"] {
  cursor: pointer;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
html,
body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body {
  font-family: var(--bs-body-font-family);
  font-size: var(--bs-body-font-size);
  font-weight: var(--bs-body-font-weight);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  text-align: var(--bs-body-text-align);
  -webkit-text-size-adjust: 100%;
}
```

/////////////////////////////////////////

Below are the relevant scripts in their current state.
Generate for me the amended version in full.
// public/assets/ui-systems/bootstrap-538/bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR BOOTSTRAP 5.3.x
   ------------------------------------------------------------
   Purpose:
   - Provide consistent Corpdesk UX variables
   - Mirror Bootstrap light/dark variables
   - Avoid overriding Bootstrap defaults
   - Fix dark-mode text visibility issues
   ============================================================ */

/* ------------------------------------------------------------
   1. ROOT: Bootstrap variable passthrough into Corpdesk vars
   ------------------------------------------------------------ */
:root {
  /* Base font + radii for Corpdesk layout */
  --cd-bridge-body-font-family: var(
    --bs-body-font-family,
    system-ui,
    sans-serif
  );
  --cd-bridge-body-font-size: var(--bs-body-font-size, 1rem);
  --cd-bridge-border-radius: var(--bs-border-radius, 0.375rem);

  /* Form border color (mapped below per theme) */
  --cd-color-border: var(--bs-border-color, #ced4da);

  /* Input text color (mapped below per theme) */
  --cd-input-text-color: var(--bs-body-color, #212529);
}

/* ------------------------------------------------------------
   2. LIGHT MODE (Bootstrap default)
   ------------------------------------------------------------ */
:root[data-bs-theme="light"] {
  /* Bootstrap light mode variables */
  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);
}

/* ------------------------------------------------------------
   3. DARK MODE (Bootstrap 5.3.x)
   ------------------------------------------------------------
   FIXES:
   - Dark-on-dark labels
   - Invisible input text
   - Invisible borders
   ------------------------------------------------------------ */
:root[data-bs-theme="dark"] {
  /* Ensure readable text */
  --cd-input-text-color: var(--bs-body-color, #f8f9fa);

  /* Ensure borders are visible */
  --cd-color-border: var(--bs-border-color, #495057);

  /* Preserve Bootstrap dark form background */
  --bs-form-control-bg: var(--bs-gray-900, #2b3035);
}

/* ------------------------------------------------------------
   4. LABELS
   ------------------------------------------------------------ */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* ------------------------------------------------------------
   5. INPUTS (Corpdesk form fields)
   ------------------------------------------------------------ */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: var(--bs-form-control-bg, #fff);
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

/* ------------------------------------------------------------
   6. VALID STATE (Green glow)
   ------------------------------------------------------------ */
.cd-form-field input.cd-valid,
.cd-form-field select.cd-valid,
.cd-form-field textarea.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}

/* ------------------------------------------------------------
   7. INVALID STATE (Red glow)
   ------------------------------------------------------------ */
.cd-form-field input.cd-invalid,
.cd-form-field select.cd-invalid,
.cd-form-field textarea.cd-invalid {
  border-color: var(--bs-danger, #dc3545) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb, 220, 53, 69), 0.15);
}

/* ------------------------------------------------------------
   8. BUTTONS (inherit Bootstrap)
   ------------------------------------------------------------ */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
}
```

// public/themes/dark/theme.css

```css
/* ============================================================
   DARK THEME VARIABLES (Scoped to Bootstrap Dark Mode Flag)
   ============================================================ */

/* This selector ensures these variables ONLY override the light defaults 
   when the Bootstrap adapter sets <html data-bs-theme="dark">. 
   This is the final fix for the variable conflict. */
html[data-bs-theme="dark"] {
  --cd-color-bg: #121212;
  --cd-color-surface: #1e1e1e;
  --cd-color-text: #e6e6e6;

  --cd-color-primary: #0d6efd;

  --cd-color-hint: #aaaaaa;
  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;

  --cd-color-border: #333333;
  --cd-color-hover: #2a2a2a;
}
```

// public/themes/default/theme.css

```css
:root {
  --cd-color-bg: #ffffff;
  --cd-color-surface: #f8f8f8;
  --cd-color-text: #000000;

  --cd-color-primary: #007bff;
  --cd-color-hint: #666;
  --cd-color-valid: #28a745;
  --cd-color-invalid: #dc3545;

  --cd-color-border: #cccccc;
  --cd-color-hover: #f0f0f0;
}
```

////////////////////////////////////////////////////
We now have a good contrast of text against background.
But there is one of the states for the top most menu item.
It could be on-select: The background becomes white with whitish text in the foreground.
First this background needs to be toned a little because the contrast is now very harsh for 'dark' mode.
The text colour should also be dark enough to contrast well with the adjusted background.
I have also shared the screenshot.

```css
element {
}
#cd-sidebar a {
  color: var(--cd-menu-text);
}
.metismenu li.mm-active > a {
  background-color: var(--menu-active-bg, #e6e6e6);
  color: var(--menu-active-color, #000);
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 10px 15px;
  text-decoration: none;
  color: var(--menu-text-color, #333);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
a {
  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
  text-decoration: underline;
}
*,
::after,
::before {
  box-sizing: border-box;
}
[role="button"] {
  cursor: pointer;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
#cd-sidebar {
  color: var(--cd-menu-text);
}
html,
body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body {
  font-family: var(--bs-body-font-family);
  font-size: var(--bs-body-font-size);
  font-weight: var(--bs-body-font-weight);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  text-align: var(--bs-body-text-align);
  -webkit-text-size-adjust: 100%;
}
```

//////////////////////////////////////////

Check the screen shot attached.
When colapsed, there is an extra arrow '>' in front of the menu lablel. But there is also a correct one at the extreme right.
Can you detect how it comes to be and how to eliminate it.
I have attched corpdesk-rfc-0005 for reference on how the whole dyanmic UI system is working for reference.

// public/themes/common/menu-neutral.css

```css
cd-menu-root,
.cd-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cd-menu-item {
  margin: 0;
  padding: 0;
  /* 💡 NEW FIX: Ensure LI elements have no marker */
  list-style: none;
}

.cd-menu-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  padding: 8px 12px;
}

.cd-menu-label {
  margin-left: 8px;
}

/* Neutralize unstyled FA pseudo-content before the font loads */
.fa::before {
  content: "" !important;
}
```

// public/assets/ui-systems/bootstrap-538/bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR BOOTSTRAP 5.3.x
   ------------------------------------------------------------
   Purpose:
   - Provide consistent Corpdesk UX variables
   - Mirror Bootstrap light/dark variables
   - Avoid overriding Bootstrap defaults
   - Fix dark-mode text visibility issues
   - Normalize sidebar/menu appearance
   ============================================================ */

/* ------------------------------------------------------------
   1. ROOT: Base variables (light-mode defaults)
   ------------------------------------------------------------ */
:root {
  /* Typography */
  --cd-bridge-body-font-family: var(
    --bs-body-font-family,
    system-ui,
    sans-serif
  );
  --cd-bridge-body-font-size: var(--bs-body-font-size, 1rem);
  --cd-bridge-border-radius: var(--bs-border-radius, 0.375rem);

  /* Form colors */
  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  /* Sidebar defaults (light) */
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Active menu state (light) */
  --cd-menu-active-bg: #e6e6e6;
  --cd-menu-active-text: #000;

  /* Hover */
  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   2. LIGHT MODE
   ------------------------------------------------------------ */
:root[data-bs-theme="light"] {
  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Slight contrast boost for light active state */
  --cd-menu-active-bg: #e2e2e2;
  --cd-menu-active-text: #000;

  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   3. DARK MODE (Bootstrap 5.3.x)
   ------------------------------------------------------------ */
:root[data-bs-theme="dark"] {
  /* Input + labels */
  --cd-input-text-color: var(--bs-body-color, #e6e6e6);
  --cd-color-border: var(--bs-border-color, #495057);

  /* Sidebar dark surface */
  --cd-menu-bg: #1e1e1e;
  --cd-menu-text: #dcdcdc;

  /* Active (selected) menu */
  --cd-menu-active-bg: #2f3640; /* dark grey-blue neutral */
  --cd-menu-active-text: #ffffff;

  /* Hover */
  --cd-menu-hover-bg: rgba(255, 255, 255, 0.07);

  /* Form background */
  --bs-form-control-bg: var(--bs-gray-900, #2b3035);
}

/* ------------------------------------------------------------
   4. LABELS
   ------------------------------------------------------------ */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* ------------------------------------------------------------
   5. INPUTS
   ------------------------------------------------------------ */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: var(--bs-form-control-bg, #fff);
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

/* ------------------------------------------------------------
   6. VALID STATE
   ------------------------------------------------------------ */
.cd-form-field input.cd-valid,
.cd-form-field select.cd-valid,
.cd-form-field textarea.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}

/* ------------------------------------------------------------
   7. INVALID STATE
   ------------------------------------------------------------ */
.cd-form-field input.cd-invalid,
.cd-form-field select.cd-invalid,
.cd-form-field textarea.cd-invalid {
  border-color: var(--bs-danger, #dc3545) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb, 220, 53, 69), 0.15);
}

/* ------------------------------------------------------------
   8. BUTTONS (inherit Bootstrap)
   ------------------------------------------------------------ */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
}

/* ------------------------------------------------------------
   9. SIDEBAR + MENU
   ------------------------------------------------------------ */
#cd-sidebar {
  background-color: var(--cd-menu-bg);
  color: var(--cd-menu-text);
}

#cd-sidebar a {
  color: var(--cd-menu-text);
  text-decoration: none;
  display: block;
  padding: 10px 15px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Hover state */
#cd-sidebar a:hover {
  background-color: var(--cd-menu-hover-bg);
  color: var(--cd-menu-active-text);
}

/* Active menu item */
.metismenu li.mm-active > a,
.metismenu li.mm-active > a:hover,
.metismenu li.mm-active > a:focus {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}
```

```sh
emp-12@emp-12 ~/cd-shell (main)> tree public/assets/
public/assets/
├── css
│   ├── font-awesome-6.5.0
│   │   └── all.min.css
│   └── index.css
├── fonts
├── images
└── ui-systems
    ├── bootstrap-502
    │   ├── bootstrap.min.css
    │   ├── bootstrap.min.js
    │   └── descriptor.json
    ├── bootstrap-538
    │   ├── bootstrap.bundle.min.js
    │   ├── bootstrap.min.css
    │   ├── bridge.css
    │   └── descriptor.json
    └── material-design
        ├── descriptor.json
        ├── material-components-web.min.css
        └── material-components-web.min.js
```

////////////////////////////////////////////
I have been restricted to send any more images until after 9hrs.
So I will limit my communication to text.
Below are some reference in their current state.

Browser inspector/styles

```css
element {
}
#cd-sidebar a {
  color: var(--cd-menu-text);
  text-decoration: none;
  display: block;
  padding: 10px 15px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 10px 15px;
  text-decoration: none;
  color: var(--menu-text-color, #333);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
a {
  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
  text-decoration: underline;
}
*,
::after,
::before {
  box-sizing: border-box;
}
[role="button"] {
  cursor: pointer;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
#cd-sidebar {
  color: var(--cd-menu-text);
}
html,
body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body {
  font-family: var(--bs-body-font-family);
  font-size: var(--bs-body-font-size);
  font-weight: var(--bs-body-font-weight);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  text-align: var(--bs-body-text-align);
  -webkit-text-size-adjust: 100%;
}
```

Html at the browser for the menu

```html
<aside id="cd-sidebar">
  <ul class="metismenu" id="menu">
    <li
      id="menu-item-menu-item-cd-user"
      class=""
      data-id="menu-item-cd-user"
      data-type="route"
      data-route="sys/cd-user"
      tabindex="0"
      role="button"
    >
      <a
        href="#"
        class="cd-menu-link has-arrow"
        data-id="menu-item-cd-user"
        aria-expanded="false"
        ><span class="cd-menu-label">cd-user</span
        ><i class="menu-arrow fa-solid fa-chevron-right"></i
      ></a>
      <ul class="mm-collapse">
        <li
          id="menu-item-menu-item-cd-user-sign-in"
          class=""
          data-id="menu-item-cd-user-sign-in"
          data-type="route"
          data-route="sys/cd-user/sign-in"
          tabindex="0"
          role="button"
        >
          <a
            href="/sys/cd-user/sign-in"
            class="cd-menu-link"
            data-id="menu-item-cd-user-sign-in"
            ><span class="cd-menu-label">sign-in</span></a
          >
        </li>

        <li
          id="menu-item-menu-item-cd-user-sign-up"
          class=""
          data-id="menu-item-cd-user-sign-up"
          data-type="route"
          data-route="sys/cd-user/sign-up"
          tabindex="0"
          role="button"
        >
          <a
            href="/sys/cd-user/sign-up"
            class="cd-menu-link"
            data-id="menu-item-cd-user-sign-up"
            ><span class="cd-menu-label">sign-up</span></a
          >
        </li>
      </ul>
    </li>

    <li
      id="menu-item-menu-item-cd-admin"
      class=""
      data-id="menu-item-cd-admin"
      data-type="route"
      data-route="sys/cd-admin"
      tabindex="0"
      role="button"
    >
      <a
        href="#"
        class="cd-menu-link has-arrow"
        data-id="menu-item-cd-admin"
        aria-expanded="false"
        ><span class="cd-menu-label">cd-admin</span
        ><i class="menu-arrow fa-solid fa-chevron-right"></i
      ></a>
      <ul class="mm-collapse">
        <li
          id="menu-item-menu-item-cd-admin-settings"
          class=""
          data-id="menu-item-cd-admin-settings"
          data-type="route"
          data-route="sys/cd-admin/settings"
          tabindex="0"
          role="button"
        >
          <a
            href="/sys/cd-admin/settings"
            class="cd-menu-link"
            data-id="menu-item-cd-admin-settings"
            ><span class="cd-menu-label">settings</span></a
          >
        </li>
      </ul>
    </li>
  </ul>
</aside>
```

MenuService.renderMenuHtml()

```ts
export class MenuService {
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
}
```

// public/themes/common/menu-neutral.css

```css
cd-menu-root,
.cd-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cd-menu-item {
  margin: 0;
  padding: 0;
  /* 💡 NEW FIX: Ensure LI elements have no marker */
  list-style: none;
}

.cd-menu-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  padding: 8px 12px;
}

.cd-menu-label {
  margin-left: 8px;
}

/* Neutralize unstyled FA pseudo-content before the font loads */
.fa::before {
  content: "" !important;
}
```

// public/assets/ui-systems/bootstrap-538/bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR BOOTSTRAP 5.3.x
   ------------------------------------------------------------
   Purpose:
   - Provide consistent Corpdesk UX variables
   - Mirror Bootstrap light/dark variables
   - Avoid overriding Bootstrap defaults
   - Fix dark-mode text visibility issues
   - Normalize sidebar/menu appearance
   ============================================================ */

/* ------------------------------------------------------------
   1. ROOT: Base variables (light-mode defaults)
   ------------------------------------------------------------ */
:root {
  /* Typography */
  --cd-bridge-body-font-family: var(
    --bs-body-font-family,
    system-ui,
    sans-serif
  );
  --cd-bridge-body-font-size: var(--bs-body-font-size, 1rem);
  --cd-bridge-border-radius: var(--bs-border-radius, 0.375rem);

  /* Form colors */
  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  /* Sidebar defaults (light) */
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Active menu state (light) */
  --cd-menu-active-bg: #e6e6e6;
  --cd-menu-active-text: #000;

  /* Hover */
  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   2. LIGHT MODE
   ------------------------------------------------------------ */
:root[data-bs-theme="light"] {
  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Slight contrast boost for light active state */
  --cd-menu-active-bg: #e2e2e2;
  --cd-menu-active-text: #000;

  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   3. DARK MODE (Bootstrap 5.3.x)
   ------------------------------------------------------------ */
:root[data-bs-theme="dark"] {
  /* Input + labels */
  --cd-input-text-color: var(--bs-body-color, #e6e6e6);
  --cd-color-border: var(--bs-border-color, #495057);

  /* Sidebar dark surface */
  --cd-menu-bg: #1e1e1e;
  --cd-menu-text: #dcdcdc;

  /* Active (selected) menu */
  --cd-menu-active-bg: #2f3640; /* dark grey-blue neutral */
  --cd-menu-active-text: #ffffff;

  /* Hover */
  --cd-menu-hover-bg: rgba(255, 255, 255, 0.07);

  /* Form background */
  --bs-form-control-bg: var(--bs-gray-900, #2b3035);
}

/* ------------------------------------------------------------
   4. LABELS
   ------------------------------------------------------------ */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* ------------------------------------------------------------
   5. INPUTS
   ------------------------------------------------------------ */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: var(--bs-form-control-bg, #fff);
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

/* ------------------------------------------------------------
   6. VALID STATE
   ------------------------------------------------------------ */
.cd-form-field input.cd-valid,
.cd-form-field select.cd-valid,
.cd-form-field textarea.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}

/* ------------------------------------------------------------
   7. INVALID STATE
   ------------------------------------------------------------ */
.cd-form-field input.cd-invalid,
.cd-form-field select.cd-invalid,
.cd-form-field textarea.cd-invalid {
  border-color: var(--bs-danger, #dc3545) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb, 220, 53, 69), 0.15);
}

/* ------------------------------------------------------------
   8. BUTTONS (inherit Bootstrap)
   ------------------------------------------------------------ */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
}

/* ------------------------------------------------------------
   9. SIDEBAR + MENU
   ------------------------------------------------------------ */
#cd-sidebar {
  background-color: var(--cd-menu-bg);
  color: var(--cd-menu-text);
}

#cd-sidebar a {
  color: var(--cd-menu-text);
  text-decoration: none;
  display: block;
  padding: 10px 15px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Hover state */
#cd-sidebar a:hover {
  background-color: var(--cd-menu-hover-bg);
  color: var(--cd-menu-active-text);
}

/* Active menu item */
.metismenu li.mm-active > a,
.metismenu li.mm-active > a:hover,
.metismenu li.mm-active > a:focus {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}
```

/////////////////////////////////////////////

Below are the result of running the script in the console:
It actually pointed out to the actual culprits.
Can you use the information to specify how the next task is run?

```log
[PSEUDO-DETECT] Pseudo elements found debugger eval code:17:11
before "" debugger eval code:20:13
<i class="menu-arrow fa-solid fa-chevron-right">
debugger eval code:21:13
outerHTML snippet: <i class="menu-arrow fa-solid fa-chevron-right"></i> debugger eval code:22:13
before "" debugger eval code:20:13
<i class="menu-arrow fa-solid fa-chevron-right">
debugger eval code:21:13
outerHTML snippet: <i class="menu-arrow fa-solid fa-chevron-right"></i> debugger eval code:22:13
Array [ {…}, {…} ]
​
0: Object { type: "before", content: '"\uf054"', outer: '<i class="menu-arrow fa-solid fa-chevron-right"></i>', … }
​
1: Object { type: "before", content: '"\uf054"', outer: '<i class="menu-arrow fa-solid fa-chevron-right"></i>', … }
​
length: 2
```

/////////////////////////////////////////////
I have highlighted a menu item in the browser and shared the html and css from the inspector.
You should be able to detects the low contrast. From there you can try and

```html
<li
  id="menu-item-menu-item-cd-user"
  class=""
  data-id="menu-item-cd-user"
  data-type="route"
  data-route="sys/cd-user"
  tabindex="0"
  role="button"
>
  <a
    href="#"
    class="cd-menu-link has-arrow mm-collapsed"
    data-id="menu-item-cd-user"
    aria-expanded="false"
    ><span class="cd-menu-label">cd-user</span
    ><i class="menu-arrow fa-solid fa-chevron-right"></i
  ></a>
  <ul class="mm-collapse" style="">
    <li
      id="menu-item-menu-item-cd-user-sign-in"
      class=""
      data-id="menu-item-cd-user-sign-in"
      data-type="route"
      data-route="sys/cd-user/sign-in"
      tabindex="0"
      role="button"
    >
      <a
        href="/sys/cd-user/sign-in"
        class="cd-menu-link"
        data-id="menu-item-cd-user-sign-in"
        ><span class="cd-menu-label">sign-in</span></a
      >
    </li>

    <li
      id="menu-item-menu-item-cd-user-sign-up"
      class=""
      data-id="menu-item-cd-user-sign-up"
      data-type="route"
      data-route="sys/cd-user/sign-up"
      tabindex="0"
      role="button"
    >
      <a
        href="/sys/cd-user/sign-up"
        class="cd-menu-link"
        data-id="menu-item-cd-user-sign-up"
        ><span class="cd-menu-label">sign-up</span></a
      >
    </li>
  </ul>
</li>
```

// css for menu item

```css
element {
}
.metismenu li {
  position: relative;
}
[role="button"] {
  cursor: pointer;
}
*,
::after,
::before {
  box-sizing: border-box;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
#cd-sidebar {
  color: var(--cd-menu-text);
}
html,
body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body {
  font-family: var(--bs-body-font-family);
  font-size: var(--bs-body-font-size);
  font-weight: var(--bs-body-font-weight);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  text-align: var(--bs-body-text-align);
  -webkit-text-size-adjust: 100%;
}
element {
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
  --cd-background-color: white;
  --cd-text-color: black;
  --cd-primary-color: #007bff;
  --theme-color: #007bff;
}
```

// css for the label(span) that contains the text.

```css
lement {
}
*,
::after,
::before {
  box-sizing: border-box;
}
.metismenu a {
  color: var(--menu-text-color, #333);
  font-weight: 500;
}
.cd-menu-link {
  color: inherit;
}
a {
  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
}
[role="button"] {
  cursor: pointer;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
#cd-sidebar {
  color: var(--cd-menu-text);
}
```

// bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR BOOTSTRAP 5.3.x
   ============================================================ */

/* ------------------------------------------------------------
   1. ROOT VARIABLES (Light Mode Defaults)
   ------------------------------------------------------------ */
:root {
  --cd-bridge-body-font-family: var(
    --bs-body-font-family,
    system-ui,
    sans-serif
  );
  --cd-bridge-body-font-size: var(--bs-body-font-size, 1rem);
  --cd-bridge-border-radius: var(--bs-border-radius, 0.375rem);

  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  /* Sidebar defaults (light mode) */
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Active (selected) row – light */
  --cd-menu-active-bg: #e6e6e6;
  --cd-menu-active-text: #000;

  /* Hover (light) */
  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   2. LIGHT MODE
   ------------------------------------------------------------ */
:root[data-bs-theme="light"] {
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  --cd-menu-active-bg: #e2e2e2;
  --cd-menu-active-text: #000;

  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   3. DARK MODE  (Option A – Neutral Grey)
   ------------------------------------------------------------ */
:root[data-bs-theme="dark"] {
  --cd-input-text-color: var(--bs-body-color, #e6e6e6);
  --cd-color-border: var(--bs-border-color, #495057);

  /* Sidebar surface + text */
  --cd-menu-bg: #1e1e1e;
  --cd-menu-text: #dcdcdc;

  /* Active row — neutral dark */
  --cd-menu-active-bg: #2f3640;
  --cd-menu-active-text: #ffffff;

  /* Hover (dark) */
  --cd-menu-hover-bg: rgba(255, 255, 255, 0.07);

  /* Bootstrap form background */
  --bs-form-control-bg: var(--bs-gray-900, #2b3035);
}

/* ------------------------------------------------------------
   4. FORM LABELS
   ------------------------------------------------------------ */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* ------------------------------------------------------------
   5. INPUTS
   ------------------------------------------------------------ */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: var(--bs-form-control-bg, #fff);
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

/* ------------------------------------------------------------
   6. VALID / INVALID STATES
   ------------------------------------------------------------ */
.cd-form-field input.cd-valid,
.cd-form-field select.cd-valid,
.cd-form-field textarea.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}

.cd-form-field input.cd-invalid,
.cd-form-field select.cd-invalid,
.cd-form-field textarea.cd-invalid {
  border-color: var(--bs-danger, #dc3545) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb, 220, 53, 69), 0.15);
}

/* ------------------------------------------------------------
   7. BUTTONS
   ------------------------------------------------------------ */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
}

/* ------------------------------------------------------------
   8. SIDEBAR / MENU BASE
   ------------------------------------------------------------ */
#cd-sidebar {
  background-color: var(--cd-menu-bg);
  color: var(--cd-menu-text);
}

/* Each clickable row — full width */
.cd-menu-entry {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 15px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Main label side */
.cd-menu-link {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

/* Right-side arrow */
.cd-menu-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-left: 8px;
  padding-right: 8px;
  font-size: 0.8rem;
}

/* Hover */
.cd-menu-entry:hover {
  background-color: var(--cd-menu-hover-bg);
  color: var(--cd-menu-active-text);
}

/* Active row */
.metismenu li.mm-active > .cd-menu-entry,
.metismenu li.mm-active > .cd-menu-entry:hover {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

/* IMPORTANT: Hide only MetisMenu's auto-generated pseudo arrow */
.metismenu .has-arrow::before {
  display: none !important;
  content: none !important;
}
```

////////////////////////////////////////
Take into account this css file too
// public/themes/common/menu-neutral.css

```css
cd-menu-root,
.cd-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cd-menu-item {
  margin: 0;
  padding: 0;
  /* 💡 NEW FIX: Ensure LI elements have no marker */
  list-style: none;
}

.cd-menu-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  padding: 8px 12px;
}

.cd-menu-label {
  margin-left: 8px;
}

/* Neutralize unstyled FA pseudo-content before the font loads */
.fa::before {
  content: "" !important;
}
```

//////////////////////////

Great. That worked. Now the next emerging issue is on-hover and on-select has a white background with whitish text.
Below are the html and css from the inspector when the effect is active.

```html
<a
  href="#"
  class="cd-menu-link has-arrow"
  data-id="menu-item-cd-user"
  aria-expanded="true"
  ><span class="cd-menu-label">cd-user</span
  ><i class="menu-arrow fa-solid fa-chevron-right"></i
></a>
```

```css
element {
}
#cd-sidebar a.cd-menu-link {
  color: var(--cd-menu-text) !important;
}
.metismenu li.mm-active > a {
  background-color: var(--menu-active-bg, #e6e6e6);
  color: var(--menu-active-color, #000);
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 10px 15px;
  text-decoration: none;
  color: var(--menu-text-color, #333);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.cd-menu-link {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
a {
  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
  text-decoration: underline;
}
*,
::after,
::before {
  box-sizing: border-box;
}
[role="button"] {
  cursor: pointer;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
#cd-sidebar {
  color: var(--cd-menu-text);
}
html,
body {
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
}
body {
  font-family: var(--bs-body-font-family);
  font-size: var(--bs-body-font-size);
  font-weight: var(--bs-body-font-weight);
  line-height: var(--bs-body-line-height);
  color: var(--bs-body-color);
  text-align: var(--bs-body-text-align);
  -webkit-text-size-adjust: 100%;
}
```

///////////////////////////////////////////////

That worked very well.
We now move to header:
This being a PWA, we introduced some burger early in development.
The burger was supposed to be used when the size of the screen is approaching mobile phone.
The menu is meant to hide for a mobile size screen but can be displayed by clicking the burger icon.
At the moment it is visible throughout and does not respond to click.
We need to invistigate and correct the behaviour.
The codes that were to control it are found in the Main.run() in the section "STEP 8: Setup burger menu"
Let me know if you need more files to assist in the investigation.

Html from inspector

```html
<header id="cd-header">
  <button id="cd-burger">☰</button>
  <img id="cd-logo" alt="Logo" src="/themes/default/logo.png" />
  <span id="cd-app-name">Corpdesk Shell</span>
</header>
```

```ts
export class Main {
  async run() {
    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");

    // ----------------------------
    // STEP 0: Load shell config
    // ----------------------------
    const shellConfig: ShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    // ----------------------------
    // STEP 1: Core service instantiation
    // ----------------------------

    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);

    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    // ----------------------------
    // STEP 2: Load all cached metadata (uiConfig, uiSystems, themes)
    // ----------------------------
    await this.svSysCache.loadAndCacheAll();

    const uiConfig = this.svSysCache.get("uiConfig") as UiConfig;
    console.log("[Main][run] uiConfig:", uiConfig);

    // ----------------------------
    // STEP 3: Apply UI-system + Theme pipeline
    // ----------------------------
    await this.applyStartupUiSettings();

    // ----------------------------
    // STEP 3B: Shell layout CSS (base.css + index.css)
    // NOTE: Must load AFTER ui-system but BEFORE modules + menu
    // ----------------------------
    // try {
    //   await this.svUiSystemLoader.loadCSS(
    //     "/themes/common/base.css",
    //     "shell-base"
    //   );
    //   await this.svUiSystemLoader.loadCSS(
    //     "/assets/css/index.css",
    //     "shell-index"
    //   );
    // } catch (err) {
    //   console.warn("[Main] failed to load shell CSS", err);
    // }

    // ----------------------------
    // STEP 4: Theme config (logo + title)
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById(
      "cd-logo"
    ) as HTMLImageElement | null;
    if (logoEl && themeConfig.logo) {
      logoEl.src = themeConfig.logo;
    }

    if (themeConfig.colors?.primary) {
      document.documentElement.style.setProperty(
        "--theme-color",
        themeConfig.colors.primary
      );
    }

    // ----------------------------
    // STEP 5: Prepare menu using your existing logic
    // ----------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }
          if (item.children) item.children = recursive(item.children);
          return item;
        });
      };
      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);

    // ----------------------------
    // STEP 6: Render sidebar with the active UI-system adapter
    // ----------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;

      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");

      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    // ----------------------------
    // STEP 7: Auto-load default controller
    // ----------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );

      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    // ----------------------------
    // STEP 8: Setup burger menu (unchanged)
    // ----------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });
      overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });
    }

    this.logger.debug("bootstrapShell(): run() complete");
  }
}
```

// index.html source

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Corpdesk Shell</title>

    <!-- Vendor-only static dependencies -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />

    <!-- 🧩 All system and theme CSS are dynamically injected by UiSystemLoaderService & UiThemeLoaderService -->
  </head>

  <body>
    <header id="cd-header">
      <button id="cd-burger">&#9776;</button>
      <img id="cd-logo" alt="Logo" />
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar"></aside>
      <main id="cd-main-content"></main>
    </div>

    <script type="module" src="/src/app.ts"></script>
  </body>
</html>
```

//////////////////////////////////////////

Console test results:

```log
document.querySelector("#cd-sidebar").classList.add("open");
undefined
getComputedStyle(document.querySelector("#cd-sidebar")).left
getComputedStyle(document.querySelector("#cd-sidebar")).transform
"none"
```

css Reference files:

// public/themes/common/base.css

```css
/* ============================================================
   CORPDESK BASE THEME TOKENS
   These are intentionally minimal so UI systems remain in control.
   Themes override only these variables.
   ============================================================ */

:root {
  --cd-color-bg: #ffffff;
  --cd-color-surface: #f5f5f5;
  --cd-color-text: #000000;
  --cd-color-primary: #0055ff;

  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;
  --cd-color-hint: #999;

  --cd-color-border: #cccccc;
  --cd-color-hover: rgba(0, 0, 0, 0.05);

  --cd-border-radius: 4px;
  --cd-transition: 0.2s ease;

  --cd-font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --cd-font-size: 14px;

  /* Shell layout metrics */
  --cd-header-height: 60px;
  --cd-sidebar-width: 260px;
}

/* ============================================================
   GLOBAL DEFAULTS (Safe — does not break Bootstrap)
   ============================================================ */

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--cd-font-family);
  font-size: var(--cd-font-size);
  /* Global colors controlled by Bootstrap theme */
}

/* ============================================================
   SHELL LAYOUT (Isolated from UI systems)
   ============================================================ */

/* HEADER (fixed-height bar) */
#cd-header {
  height: var(--cd-header-height);
  background: var(--cd-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

/* LAYOUT WRAPPER */
#cd-layout {
  display: flex;
  height: calc(100vh - var(--cd-header-height));
  overflow: hidden;
  width: 100%;
  position: relative;
}

/* SIDEBAR */
#cd-sidebar {
  width: var(--cd-sidebar-width);
  flex-shrink: 0;
  background: var(--cd-color-surface);
  border-right: 1px solid var(--cd-color-border);
  overflow-y: auto;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* OVERLAY (mobile) */
#cd-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: none;
}

#cd-overlay.visible {
  display: block;
}

/* MAIN CONTENT */
#cd-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  /* background controlled by Bootstrap or global theme variables */
  min-width: 0; /* Fixes flex children overflow */
}

/* ============================================================
   FORM ELEMENTS (Non-destructive, Bootstrap-safe)
   ============================================================ */

.cd-form-field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  /* Background/color controlled by Bootstrap theme */
}

.cd-form-field input {
  /* Background/color controlled by Bootstrap theme */
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-border-radius);
  padding: 0.6rem;
  transition:
    border-color var(--cd-transition),
    box-shadow var(--cd-transition);
}

/* Validation */
.cd-form-field input.cd-valid {
  border-color: var(--cd-color-valid);
  box-shadow: 0 0 4px var(--cd-color-valid);
}

.cd-form-field input.cd-invalid {
  border-color: var(--cd-color-invalid);
  box-shadow: 0 0 4px var(--cd-color-invalid);
}

/* Feedback */
.error-message,
.cd-hint {
  font-size: 0.85rem;
  margin-top: 4px;
  color: var(--cd-color-hint);
}

.cd-form-field input.cd-invalid + .error-message,
.cd-form-field input.cd-invalid + .cd-hint {
  color: var(--cd-color-invalid);
}

/* Focus */
.cd-form-field input:focus {
  border-color: var(--cd-color-primary);
  box-shadow: 0 0 5px var(--cd-color-primary);
  outline: none;
}
```

// public/assets/css/index.css

```css
:root {
  --cd-primary-color: #1976d2;
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
}

/* Global reset (safe) */
html,
body {
  /* Global theme controlled by Bootstrap */
}

/* ---------------------------------------
   HEADER (cosmetic overrides only)
---------------------------------------- */
#cd-header {
  /* Removed !important */
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--cd-primary-color);
  color: #ffffff;
}

/* LOGO */
#cd-logo {
  height: 40px;
  margin-right: 12px;
  display: block;
}

/* ---------------------------------------
   Ensure sidebar honors theme vars
---------------------------------------- */
#cd-sidebar {
  /* Removed !important */
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
}

/* Sidebar menu items */
.cd-menu-item {
  /* Removed !important */
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
}

.cd-menu-item:hover {
  /* Removed !important */
  background-color: var(--cd-color-hover);
}

/* OPTIONAL: arbitrary utility classes */
.cd-flex {
  display: flex;
}

.cd-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

// public/assets/ui-systems/bootstrap-538/bridge.css

```css
/* ============================================================
   CORPDESK BRIDGE FOR BOOTSTRAP 5.3.x
   ============================================================ */

/* ------------------------------------------------------------
   1. ROOT VARIABLES (Light Mode Defaults)
   ------------------------------------------------------------ */
:root {
  --cd-bridge-body-font-family: var(
    --bs-body-font-family,
    system-ui,
    sans-serif
  );
  --cd-bridge-body-font-size: var(--bs-body-font-size, 1rem);
  --cd-bridge-border-radius: var(--bs-border-radius, 0.375rem);

  --cd-color-border: var(--bs-border-color, #ced4da);
  --cd-input-text-color: var(--bs-body-color, #212529);

  /* Sidebar defaults (light mode) */
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  /* Active (selected) row – light */
  --cd-menu-active-bg: #e6e6e6;
  --cd-menu-active-text: #000;

  /* Hover (light) */
  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   2. LIGHT MODE
   ------------------------------------------------------------ */
:root[data-bs-theme="light"] {
  --cd-menu-bg: var(--bs-light-bg-subtle, #f8f9fa);
  --cd-menu-text: var(--bs-body-color, #212529);

  --cd-menu-active-bg: #e2e2e2;
  --cd-menu-active-text: #000;

  --cd-menu-hover-bg: rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------
   3. DARK MODE  (Option A – Neutral Grey)
   ------------------------------------------------------------ */
:root[data-bs-theme="dark"] {
  --cd-input-text-color: var(--bs-body-color, #e6e6e6);
  --cd-color-border: var(--bs-border-color, #495057);

  /* Sidebar surface + text */
  --cd-menu-bg: #1e1e1e;
  --cd-menu-text: #dcdcdc;

  /* Active row — neutral dark */
  --cd-menu-active-bg: #2f3640;
  --cd-menu-active-text: #ffffff;

  /* Hover (dark) */
  --cd-menu-hover-bg: rgba(255, 255, 255, 0.07);

  /* Bootstrap form background */
  --bs-form-control-bg: var(--bs-gray-900, #2b3035);
}

/* ------------------------------------------------------------
   4. FORM LABELS
   ------------------------------------------------------------ */
.cd-form-field > label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cd-input-text-color);
}

/* ------------------------------------------------------------
   5. INPUTS
   ------------------------------------------------------------ */
.cd-form-field input,
.cd-form-field textarea,
.cd-form-field select {
  width: 100%;
  padding: var(--bs-form-control-padding-y, 0.375rem)
    var(--bs-form-control-padding-x, 0.75rem);
  font-size: var(--bs-body-font-size, 1rem);
  font-family: var(--cd-bridge-body-font-family);
  color: var(--cd-input-text-color);
  background-color: var(--bs-form-control-bg, #fff);
  border: 1px solid var(--cd-color-border);
  border-radius: var(--cd-bridge-border-radius);
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}

/* ------------------------------------------------------------
   6. VALID / INVALID STATES
   ------------------------------------------------------------ */
.cd-form-field input.cd-valid,
.cd-form-field select.cd-valid,
.cd-form-field textarea.cd-valid {
  border-color: var(--bs-success, #198754) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-success-rgb, 25, 135, 84), 0.15);
}

.cd-form-field input.cd-invalid,
.cd-form-field select.cd-invalid,
.cd-form-field textarea.cd-invalid {
  border-color: var(--bs-danger, #dc3545) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb, 220, 53, 69), 0.15);
}

/* ------------------------------------------------------------
   7. BUTTONS
   ------------------------------------------------------------ */
button[cdButton],
.cd-button {
  font-family: var(--cd-bridge-body-font-family);
  border-radius: var(--cd-bridge-border-radius);
}

/* ------------------------------------------------------------
   8. SIDEBAR / MENU BASE
   ------------------------------------------------------------ */
#cd-sidebar {
  background-color: var(--cd-menu-bg);
  color: var(--cd-menu-text);
}

/* ------------------------------------------------------------
   8B. FIX OVERRIDES FOR METISMENU ACTIVE + HOVER
   ------------------------------------------------------------ */
#cd-sidebar .metismenu a:hover {
  background-color: var(--cd-menu-hover-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

#cd-sidebar .metismenu li.mm-active > a {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

/* ------------------------------------------------------------
   🔧 FIXED TEXT CONTRAST FOR ALL MENU LINKS
   ------------------------------------------------------------ */
#cd-sidebar a.cd-menu-link {
  color: var(--cd-menu-text) !important;
}

/* Each clickable row — full width */
.cd-menu-entry {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 15px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Main label side */
.cd-menu-link {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

/* Right-side arrow */
.cd-menu-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-left: 8px;
  padding-right: 8px;
  font-size: 0.8rem;
}

/* Hover */
.cd-menu-entry:hover {
  background-color: var(--cd-menu-hover-bg);
  color: var(--cd-menu-active-text);
}

/* Active row */
.metismenu li.mm-active > .cd-menu-entry,
.metismenu li.mm-active > .cd-menu-entry:hover {
  background-color: var(--cd-menu-active-bg) !important;
  color: var(--cd-menu-active-text) !important;
}

/* IMPORTANT: Hide only MetisMenu's auto-generated pseudo arrow */
.metismenu .has-arrow::before {
  display: none !important;
  content: none !important;
}
```

/////////////////////////////////////////////////

index.css is where we have @media (max-width: 768px).
Your recomendation is suggesting we modify this to @media (max-width: 900px) before we update the content inside?

// index.css

```css
:root {
  --cd-primary-color: #1976d2;
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
  --cd-background-color: #ffffff;
  --cd-text-color: #000000;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--cd-background-color);
  color: var(--cd-text-color);
}

#cd-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--cd-primary-color);
}

#cd-logo {
  height: 40px;
  margin-right: 10px;
}

/***************************************************/
/* Layout container below header */
#cd-layout {
  display: flex;
  height: calc(100vh - 60px); /* adjust if your header is taller */
}

/* Sidebar styles */
/* #cd-sidebar {
  width: 250px;
  background-color: var(--cd-secondary-color);
  overflow-y: auto;
  padding: 10px;
} */

/* Content area styles */
#cd-main-content {
  flex: 1;
  padding: 20px;
  background-color: var(--cd-background-color);
  overflow-y: auto;
}

/* Optional: fix the header height */
#cd-header {
  height: 60px;
}

/************************************************/
/* Hide burger by default (visible on small screens) */
#cd-burger {
  display: none;
  font-size: 24px;
  margin-right: 15px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Sidebar base styles */
#cd-sidebar {
  width: 250px;
  background-color: var(--cd-secondary-color);
  overflow-y: auto;
  padding: 10px;
  transition: transform 0.3s ease;
}

/* Hide sidebar by default on mobile */
@media (max-width: 768px) {
  #cd-burger {
    display: block;
  }

  #cd-layout {
    position: relative;
  }

  #cd-sidebar {
    position: fixed;
    top: 60px; /* below header */
    left: 0;
    height: calc(100vh - 60px);
    transform: translateX(-100%);
    z-index: 1000;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  }

  #cd-sidebar.open {
    transform: translateX(0);
  }

  #cd-overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }

  #cd-overlay.hidden {
    display: none;
  }
}
```

/////////////////////////////////////////////////////////

The burger is still showing the burger in desktop mode.
When adjusted to mobile size, it is not switching/responsive to mobile mode.
What could we be missing?
How is 'open' class supposed to be applied to the html?

html from the browser

```html
<header id="cd-header">
  <button id="cd-burger">☰</button>
  <img id="cd-logo" alt="Logo" src="/themes/default/logo.png" />
  <span id="cd-app-name">Corpdesk Shell</span>
</header>
```

```css
:root {
  --cd-primary-color: #1976d2;
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;

  --cd-background-color: #ffffff;
  --cd-text-color: #000000;
}

/* ---------------------------------------------
   GLOBAL
---------------------------------------------- */
body {
  margin: 0;
  padding: 0;
  background-color: var(--cd-background-color);
  color: var(--cd-text-color);
}

/* ---------------------------------------------
   HEADER
---------------------------------------------- */
#cd-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  height: 60px;
  background-color: var(--cd-primary-color);
  color: #ffffff;
}

#cd-logo {
  height: 40px;
  margin-right: 10px;
}

/* ---------------------------------------------
   MAIN LAYOUT WRAPPER
---------------------------------------------- */
#cd-layout {
  display: flex;
  height: calc(100vh - 60px); /* below header */
}

/* ---------------------------------------------
   CONTENT AREA
---------------------------------------------- */
#cd-main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ---------------------------------------------
   SIDEBAR (desktop mode)
---------------------------------------------- */
#cd-sidebar {
  width: var(--cd-sidebar-width, 250px);
  background-color: var(--cd-secondary-color);
  overflow-y: auto;
  padding: 10px;
  transition: left 0.3s ease;
  position: relative; /* desktop default */
}

/* ---------------------------------------------
   BURGER BUTTON (hidden by default)
---------------------------------------------- */
#cd-burger {
  display: none;
  font-size: 24px;
  margin-right: 15px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* ---------------------------------------------
   RESPONSIVE: MOBILE & TABLET VIEW
   Activate burger mode at <= 900px
---------------------------------------------- */
@media (max-width: 900px) {
  /* Show burger */
  #cd-burger {
    display: block;
  }

  /* Hide logo next to burger */
  #cd-logo {
    display: none;
  }

  /* Make layout relative so sidebar can overlay */
  #cd-layout {
    position: relative;
  }

  /* Sidebar becomes sliding drawer */
  #cd-sidebar {
    position: fixed;
    top: 60px;
    left: calc(-1 * var(--cd-sidebar-width, 250px));
    height: calc(100vh - 60px);
    z-index: 1000;
    background-color: var(--cd-secondary-color);
    overflow-y: auto;
    transition: left 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  }

  /* Sidebar open state (triggered by Main.ts) */
  #cd-sidebar.open {
    left: 0;
  }

  /* Overlay */
  #cd-overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }

  /* Hidden overlay when sidebar closed */
  #cd-overlay.hidden {
    display: none;
  }
}
```

///////////////////////////////////////////////////////////

I have implemented the changes but there is no change yet.  
I propose you revise the Main.run() you had done to include debug infromation.

Note that apart from the console.log, we can use diagnosis.ts to reuse the available facilities or create any needful facility.
We need to debug the codes we have and tell exactly why they are not doing what is exapected.

// src/CdShell/sys/utils/diagnosis.ts

```ts
export function diag_css(message: string, data: any = {}) {
  console.log(
    `%c[CSS-DIAG] ${message}`,
    "background:#222;color:#0f0;padding:2px 4px;border-radius:3px",
    data
  );
}

export function diag_sidebar() {
  const sb = document.getElementById("cd-sidebar");
  if (!sb) return;

  const style = window.getComputedStyle(sb);

  console.warn(
    "%c[SIDEBAR-DIAG] Sidebar State:",
    "background:#440;color:#fff;padding:3px"
  );

  console.log("display:", style.display);
  console.log("position:", style.position);
  console.log("width:", style.width);
  console.log("flex-direction:", style.flexDirection);
  console.log("css file winning:", sb);
}
```

////////////////////////////////////////////

For some reason, I did not apply the recommended index.css fully.  
I have done so and the page is now responsive as required.
When running in default theme, everything seem ok.
But it has also broken the dark mode.
From my analysis, the net effect is that the dark mode is now using the background for default in the main section, #cd-main-content(white) and menu section #cd-sidebar (light gray)

index.css

```css
:root {
  --cd-primary-color: #1976d2;
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;

  --cd-background-color: #ffffff;
  --cd-text-color: #000000;
}

/* ---------------------------------------------
   GLOBAL
---------------------------------------------- */
body {
  margin: 0;
  padding: 0;
  background-color: var(--cd-background-color);
  color: var(--cd-text-color);
}

/* ---------------------------------------------
   HEADER
---------------------------------------------- */
#cd-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  height: 60px;
  background-color: var(--cd-primary-color);
  color: #ffffff;
}

#cd-logo {
  height: 40px;
  margin-right: 10px;
}

/* ---------------------------------------------
   MAIN LAYOUT WRAPPER
---------------------------------------------- */
#cd-layout {
  display: flex;
  height: calc(100vh - 60px); /* below header */
}

/* ---------------------------------------------
   CONTENT AREA
---------------------------------------------- */
#cd-main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ---------------------------------------------
   SIDEBAR (desktop mode)
---------------------------------------------- */
#cd-sidebar {
  width: var(--cd-sidebar-width, 250px);
  background-color: var(--cd-secondary-color);
  overflow-y: auto;
  padding: 10px;
  transition: left 0.3s ease;
  position: relative; /* desktop default */
}

/* ---------------------------------------------
   BURGER BUTTON (hidden by default)
---------------------------------------------- */
#cd-burger {
  display: none;
  font-size: 24px;
  margin-right: 15px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* ---------------------------------------------
   RESPONSIVE: MOBILE & TABLET VIEW
   Activate burger mode at <= 900px
---------------------------------------------- */
@media (max-width: 900px) {
  /* Show burger */
  #cd-burger {
    display: block;
  }

  /* Hide logo next to burger */
  #cd-logo {
    display: none;
  }

  /* Make layout relative so sidebar can overlay */
  #cd-layout {
    position: relative;
  }

  /* Sidebar becomes sliding drawer */
  #cd-sidebar {
    position: fixed;
    top: 60px;
    left: calc(-1 * var(--cd-sidebar-width, 250px));
    height: calc(100vh - 60px);
    z-index: 1000;
    background-color: var(--cd-secondary-color);
    overflow-y: auto;
    transition: left 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  }

  /* Sidebar open state (triggered by Main.ts) */
  #cd-sidebar.open {
    left: 0;
  }

  /* Overlay */
  #cd-overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }

  /* Hidden overlay when sidebar closed */
  #cd-overlay.hidden {
    display: none;
  }
}
```

//////////////////////////////////////////////
Below is the html and css from the browser inspector when a menu item is selected and in focus.
```html
<li
  id="menu-item-menu-item-cd-user"
  class=""
  data-id="menu-item-cd-user"
  data-type="route"
  data-route="sys/cd-user"
  tabindex="0"
  role="button"
>
  <a
    href="#"
    class="cd-menu-link has-arrow mm-collapsed"
    data-id="menu-item-cd-user"
    aria-expanded="false"
    ><span class="cd-menu-label">cd-user</span
    ><i class="menu-arrow fa-solid fa-chevron-right"></i
  ></a>
  <ul class="mm-collapse" style="">
    <li
      id="menu-item-menu-item-cd-user-sign-in"
      class=""
      data-id="menu-item-cd-user-sign-in"
      data-type="route"
      data-route="sys/cd-user/sign-in"
      tabindex="0"
      role="button"
    >
      <a
        href="/sys/cd-user/sign-in"
        class="cd-menu-link"
        data-id="menu-item-cd-user-sign-in"
        ><span class="cd-menu-label">sign-in</span></a
      >
    </li>
  </ul>
</li>
```

```css
element {
}
#cd-sidebar a.cd-menu-link {
  color: var(--cd-menu-text) !important;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu .has-arrow {
  position: relative;
}
.metismenu a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 10px 15px;
  text-decoration: none;
  color: var(--menu-text-color, #333);
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.cd-menu-link {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
a {
  color: rgba(var(--bs-link-color-rgb),var(--bs-link-opacity,1));
  text-decoration: underline;
}
*, ::after, ::before {
  box-sizing: border-box;
}
[role="button"] {
  cursor: pointer;
}
.metismenu {
  list-style: none;
}
#cd-sidebar {
  color: var(--cd-color-text);
}
#cd-sidebar {
  color: var(--cd-menu-text);
}
```

//////////////////////////////////////////////////
The rogue on-blur is now gone.
Now in a previous post you had this:

If you want, I can also:
- introduce a smooth sliding animation for the burger
- add a modern “X” animation when sidebar is open
- give you unified spacing between header/logo/burger

Let me know how we can work on this.

////////////////////////////////////////
I will go with option A:
Option A — “Generate the full combined final version”.
I have shared the current relevant codes.
If you need any particular one let me know.

index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Corpdesk Shell</title>

    <!-- Vendor-only static dependencies -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />

    <!-- 🧩 All system and theme CSS are dynamically injected by UiSystemLoaderService & UiThemeLoaderService -->
  </head>

  <body>
    <header id="cd-header">
      <button id="cd-burger">&#9776;</button>
      <img id="cd-logo" alt="Logo" />
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar"></aside>
      <main id="cd-main-content"></main>
    </div>

    <script type="module" src="/src/app.ts"></script>
  </body>
</html>

```
index.css
```css
/* ---------------------------------------------
   GLOBAL RESET (NO COLOR OVERRIDES)
---------------------------------------------- */
body {
  margin: 0;
  padding: 0;
  background-color: var(--cd-color-bg);
  color: var(--cd-color-text);
}

/* ---------------------------------------------
   HEADER
---------------------------------------------- */
#cd-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  height: 60px;
  background-color: var(--cd-color-primary, var(--cd-primary-color));
  color: #ffffff;
}

#cd-logo {
  height: 40px;
  margin-right: 10px;
}

/* ---------------------------------------------
   MAIN LAYOUT WRAPPER
---------------------------------------------- */
#cd-layout {
  display: flex;
  height: calc(100vh - 60px);
}

/* ---------------------------------------------
   CONTENT AREA
---------------------------------------------- */
#cd-main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--cd-color-bg);
  color: var(--cd-color-text);
}

/* ---------------------------------------------
   SIDEBAR
---------------------------------------------- */
#cd-sidebar {
  width: var(--cd-sidebar-width, 250px);
  background-color: var(--cd-color-surface);
  color: var(--cd-color-text);
  overflow-y: auto;
  padding: 10px;
  transition: left 0.3s ease;
  position: relative; /* desktop default */
}

/* ---------------------------------------------
   BURGER BUTTON
---------------------------------------------- */
#cd-burger {
  display: none;
  font-size: 24px;
  margin-right: 15px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
}

/* ---------------------------------------------
   RESPONSIVE: MOBILE & TABLET VIEW
---------------------------------------------- */
@media (max-width: 900px) {

  #cd-burger {
    display: block;
  }

  #cd-logo {
    display: none;
  }

  #cd-layout {
    position: relative;
  }

  #cd-sidebar {
    position: fixed !important;
    top: 60px;
    left: calc(-1 * var(--cd-sidebar-width, 250px));
    height: calc(100vh - 60px);
    z-index: 1000;
    background-color: var(--cd-color-surface);
    overflow-y: auto;
    transition: left 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  }

  #cd-sidebar.open {
    left: 0 !important;
  }

  #cd-overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }

  #cd-overlay.hidden {
    display: none;
  }
}

/* ----------------------------------------------
   FIX: Remove Bootstrap focus highlight on menu items
----------------------------------------------- */
#cd-sidebar li:focus,
#cd-sidebar li:focus-within,
#cd-sidebar a:focus,
#cd-sidebar a:focus-within {
  background-color: inherit !important;
  outline: none !important;
  box-shadow: none !important;
}

```
Main.run()
```ts
async run() {
    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");

    diag_css("Main.run() started");

    // ----------------------------
    // STEP 0: Load shell config
    // ----------------------------
    const shellConfig: ShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    // ----------------------------
    // STEP 1: Core service instantiation
    // ----------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    // ----------------------------
    // STEP 2: Load all cached metadata
    // ----------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    // ----------------------------
    // STEP 3: Apply UI-system + Theme pipeline
    // ----------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    // ----------------------------
    // STEP 4: Theme config (logo + title)
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById(
      "cd-logo"
    ) as HTMLImageElement | null;
    if (logoEl && themeConfig.logo) {
      logoEl.src = themeConfig.logo;
    }

    // ----------------------------
    // STEP 5: Prepare menu
    // ----------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }
          if (item.children) item.children = recursive(item.children);
          return item;
        });
      };
      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    // ----------------------------
    // STEP 6: Render sidebar
    // ----------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    // ----------------------------
    // STEP 7: Auto-load default controller
    // ----------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );

      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    // ----------------------------
    // STEP 8: DIAGNOSTIC BURGER SYSTEM
    // ----------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    diag_css("Burger system setup attempt", {
      burgerFound: !!burger,
      sidebarFound: !!sidebar,
      overlayFound: !!overlay,
    });

    if (!burger || !sidebar || !overlay) {
      diag_css("❌ Missing one or more required DOM nodes!", {
        burger,
        sidebar,
        overlay,
      });
    }

    const mediaCheck = () => window.matchMedia("(max-width: 900px)").matches;

    diag_css("Initial media query evaluation", {
      mobileMode: mediaCheck(),
    });

    const applyMobileState = () => {
      const isMobile = mediaCheck();
      diag_css("applyMobileState()", { isMobile });

      if (!isMobile) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        diag_sidebar();
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        diag_css("Burger clicked — toggling sidebar");

        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");

        diag_sidebar();
        diag_css("Overlay state", {
          classList: overlay.classList.toString(),
        });
      });

      overlay.addEventListener("click", () => {
        diag_css("Overlay clicked — closing sidebar");

        sidebar.classList.remove("open");
        overlay.classList.add("hidden");

        diag_sidebar();
      });

      window.addEventListener("resize", () => {
        diag_css("Window resized");
        applyMobileState();
      });

      applyMobileState();
    }

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }
```

//////////////////////////////////////////

Assist me to do a professional milestone that I can copy past to git interface for vscode.

Milestone (26 Nov 2025)
- POC with bootstrap
- Switch between dark and default mode.
- stabilize css for: 
  - themes
  - menu
  - header
  - reponsiveness

Next Milestone:
- switch ui-system between bootstrap and material-design
- Switch between dark and default mode.

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


------------------------------------

- test setting of default theme via shell.config.json
- STATIC_UI_SYSTEM_REGISTRY to merge with shell.config.json so that configs are not hard coded
- test changing of theme during runtime
- How to install/uninstall/upgrade ui-system, theme, form variants

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

PWA Technologies and Documentation:

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

- development of corpdesk-rfc-0005 for lifecycle of controller using **activate(), **deactivate() and ControllerCacheService
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

  - Each theme to have set of thematic colours

Milestone (26 Nov 2025)
- POC with bootstrap
- Switch between dark and default mode.
- stabilize css for: 
  - themes
  - menu
  - header
  - reponsiveness

Next Milestone:
- switch ui-system between bootstrap and material-design
- Switch between dark and default mode.

////////////////////////////////

---

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

- Assigining thematic colours to sections:
    - header background
    - header vector pattern
    - navigation background
    - body background
  - Themes to be designed in a way that they can be packaged and commercialized

  

///////////////////////////////////////

## In Progress



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
