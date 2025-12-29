## Reference: 0044-cd-api-client-notes.md

Hi Chase. We have achieved the following:
- mitigate FOUC (Flash Of Unformatted Content)
- add envConfig: EnvConfig to shell config
- set configurable splash screen feature
---
- mitigate FOUC (Flash Of Unformatted Content)
- add envConfig: EnvConfig to shell config
- confirm if splashscreen is running
- confirm the system can fetch and use config from backend
- implement new subscribable SysCacheService
  - test subscibers (phase 1)
- modify backend config via api call
  - review updateUserProfile then used similar principle for updating consumerProfile

The next task in the save subject is:
- develop gui for controlling config from front end

The gui will be in the context of consumer control panel.
Consumer is housed in the moduleman module.
Moduleman is the core module for corpdesk system.
So consumer is not a module but a controller.
Illustration 1 is the moduleman model directory file which give an indication of moduleman functions.
Notice the consumer associated files.
Consumer Resources handles corpdesk resources belonging to a given consumer.
I am proposing that where as initially we had cd-admin (see Illustration 2) as the initial POC for admin controly, now we can develop a moduleman module with a consumer-resource controller to house the consumer-resource control panel. This is where we will control configuration in consumer.consumerProfile.shellConfig.
Having laid that picture, we need to focus on the structure of IShellConfig interface.
The gui, we are to develop need to be able to control all the items featured in IShellConfig.
As details as IShellConfig is, we must strive to make it as intutitive as possible.
The graphics should also be able to map visually to the structure.
Using controlls such as tabs, or accordian or combination of both, we keep the visuals simple to navigate.
Can we brain storm around this topic?


Illustration 1:
```sh
emp-12@emp-12 ~/cd-shell (main)> tree src/CdShell/sys/moduleman/models/
src/CdShell/sys/moduleman/models/
├── acl.model.ts
├── acl-module-member-view.model.ts
├── acl-module-view.model.ts
├── acluserview.model.ts
├── cd_obj.json
├── cd-obj.model.ts
├── cd-obj-type.model.ts
├── company.model.ts
├── company-type.model.ts
├── company-view.model.ts
├── config.model.ts
├── consumer.model.ts
├── consumer-resource.model.ts
├── consumer-resource-type.model.ts
├── consumer-resource-view.model.ts
├── consumer-type.model.ts
├── controller.model.ts
├── doc.model.ts
├── doc-type.model.ts
├── jwt.model.ts
├── menu.model.ts
├── menu-view.model.ts
├── module.model.ts
├── module-view.model.ts
└── sys-cache.model.ts
```

Illustration 2:
```sh
emp-12@emp-12 ~/cd-shell (main)> tree src/CdShell/sys/cd-admin/
src/CdShell/sys/cd-admin/
├── controllers
│   └── cd-admin-settings.controller.ts
├── models
│   └── cd-admin.model.ts
├── services
│   └── cd-admin.service.ts
└── view
    ├── cd-admin-settings.controller.js
    ├── index.d.ts
    └── index.js
```

Illustration 3:
```js
import { ConfigService } from "../../moduleman/services/config.service";
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
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
  svConfig: null,

  __init() {
    console.log("[ctlCdAdminSettings][__init] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const svUiSystemLoader = UiSystemLoaderService.getInstance(sysCache);
    const svUiThemeLoader = UiThemeLoaderService.getInstance(sysCache);
    sysCache.setLoaders(svUiSystemLoader, svUiThemeLoader);

    // Access cached loaders safely
    this.uiSystemLoader = sysCache.uiSystemLoader ?? null;
    this.uiThemeLoader = sysCache.uiThemeLoader ?? null;

    this.svCdAdmin = new CdAdminService(sysCache);

    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [
        CdValidators.required("Select UI System"),
      ]),
      theme: new CdFormControl("", [CdValidators.required("Select Theme")]),
      formType: new CdFormControl("", [
        CdValidators.required("Select Form Type"),
      ]),
    });

    this.binder = new CdDirectiveBinderService(
      this.form,
      "#settingsForm",
      this
    );
  },

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

        <button cdButton>Apply Settings</button>
      </form>
    `;
  },

  get uiSystemOptionsHtml() {
    console.log("[ctlCdAdminSettings][uiSystemOptionsHtml] start...");

    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const svUiSystemLoader = UiSystemLoaderService.getInstance(sysCache);
    const svUiThemeLoader = UiThemeLoaderService.getInstance(sysCache);
    sysCache.setLoaders(svUiSystemLoader, svUiThemeLoader);

    // ✔ Runtime-aware full descriptor list
    const uiSystems = sysCache.get("uiSystems") || [];
    // const uiSystems = sysCache.getUiSystems() || [];

    console.log(
      "[ctlCdAdminSettings][uiSystemOptionsHtml] uiSystemsRaw:",
      inspect(uiSystems, { depth: 2 })
    );

    if (!uiSystems.length) {
      return `<option value="">-- No UI Systems Found --</option>`;
    }

    const options = uiSystems
      .map((sys) => {
        const label =
          sys.id || sys.name || sys.displayName || "Unnamed UI System";

        return `<option value="${sys.id}">${label}</option>`;
      })
      .join("");

    return `<option value="">-- Select UI System --</option>${options}`;
  },

  get themeOptionsHtml() {
    console.log("[ctlCdAdminSettings][themeOptionsHtml] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const themesObj = sysCache.getThemes();
    console.log(
      "[ctlCdAdminSettings][themeOptionsHtml] themes:",
      inspect(themesObj, { depth: 2 })
    );

    const themes = Array.isArray(themesObj)
      ? themesObj
      : themesObj?.themes || [];

    if (!themes.length)
      return `<option value="">-- No Themes Available --</option>`;

    const options = themes
      .map((t) => `<option value="${t.id}">${t.displayName ?? t.name}</option>`)
      .join("");

    return `<option value="">-- Select Theme --</option>${options}`;
  },

  get formVariantOptionsHtml() {
    console.log("[ctlCdAdminSettings][formVariantOptionsHtml] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const variants = sysCache.getFormVariants();
    console.log(
      "[ctlCdAdminSettings][formVariantOptionsHtml] variants:",
      inspect(variants, { depth: 2 })
    );

    if (!variants.length) return `<option value="">-- No Variants --</option>`;

    const options = variants
      .map((v) => `<option value="${v.id}">${v.displayName ?? v.name}</option>`)
      .join("");

    return `<option value="">-- Select Variant --</option>${options}`;
  },

  async __setup() {
    console.log("[ctlCdAdminSettings][__setup] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    await sysCache.ensureReady();
  },

  async __activate() {
    console.log("[ctlCdAdminSettings][__activate] start...");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlCdAdminSettings][__afterInit] start...");
    const formControls = this.form.controls;
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);

    const systems = sysCache.getUiSystems();
    const themesObj = sysCache.getThemes();
    const themes = Array.isArray(themesObj)
      ? themesObj
      : themesObj?.themes || [];
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

  async onUiSystemChange(e) {
    try {
      const newSystemId = (e && e.target && e.target.value) || e;
      if (!newSystemId) {
        console.warn("[ctlCdAdminSettings.onUiSystemChange] empty selection");
        return;
      }

      console.log("🧩 UI System change requested:", newSystemId);

      // instantiate services (match how other controllers do it)
      const cfgSvc = new ConfigService();
      const sysCache = SysCacheService.getInstance(cfgSvc);
      const uiSystemLoader = UiSystemLoaderService.getInstance(sysCache);
      const uiThemeLoader = UiThemeLoaderService.getInstance(sysCache);

      // 1) Activate (loads CSS/JS, bridge.css, adapter.activate())
      await uiSystemLoader.activate(newSystemId);
      console.log("[ctlCdAdminSettings] ui-system activated:", newSystemId);

      // 2) Determine theme for this system (prefer system-default or 'default')
      const activeDesc =
        uiSystemLoader.getSystemById(newSystemId) || uiSystemLoader.getActive();
      let themeId = null;
      if (
        activeDesc &&
        activeDesc.themesAvailable &&
        activeDesc.themesAvailable.length > 0
      ) {
        const defaultT = activeDesc.themesAvailable.find(
          (t) => t.default || t.id === "default" || t.name === "Default"
        );
        themeId = defaultT
          ? defaultT.id || defaultT.name
          : activeDesc.themesAvailable[0].id;
      }
      if (!themeId) themeId = "default";

      // 3) Apply theme via UiSystemLoaderService (which calls adapter.applyTheme)
      try {
        await uiSystemLoader.applyTheme(newSystemId, themeId);
        console.log("[ctlCdAdminSettings] theme applied:", themeId);
      } catch (err) {
        console.warn("[ctlCdAdminSettings] applyTheme failed, continuing", err);
      }

      // 4) Persist selection to shell config (so next launch uses it)
      try {
        const cfg = await cfgSvc.loadConfig();
        cfg.uiConfig = cfg.uiConfig || {};
        cfg.uiConfig.defaultUiSystemId = newSystemId;
        cfg.uiConfig.defaultThemeId = themeId;
        await cfgSvc.saveConfig(cfg);
        console.log("[ctlCdAdminSettings] persisted uiConfig", {
          newSystemId,
          themeId,
        });
      } catch (err) {
        console.warn("[ctlCdAdminSettings] failed to persist config", err);
      }

      // 5) Broadcast event so other modules can re-bind/recompute if needed
      try {
        const ev = new CustomEvent("cd:ui-system:changed", {
          detail: { systemId: newSystemId, themeId },
          bubbles: true,
        });
        document.dispatchEvent(ev);
        console.log("[ctlCdAdminSettings] dispatched cd:ui-system:changed");
      } catch (err) {
        console.warn("[ctlCdAdminSettings] event dispatch failed", err);
      }

      // 6) Re-run directive binder if needed (safe no-op if not present)
      try {
        if (
          window.CdDirectiveBinderService &&
          typeof window.CdDirectiveBinderService.bindToDom === "function"
        ) {
          window.CdDirectiveBinderService.bindToDom(document.body);
          console.log(
            "[ctlCdAdminSettings] CdDirectiveBinderService.bindToDom triggered"
          );
        } else if (
          window.CdDirectiveBinderServiceInstance &&
          typeof window.CdDirectiveBinderServiceInstance.bindToDom ===
            "function"
        ) {
          window.CdDirectiveBinderServiceInstance.bindToDom(document.body);
        }
      } catch (err) {
        console.warn("[ctlCdAdminSettings] binder re-run failed", err);
      }

      // 7) UI feedback (optional): show a toast/alert to user
      // showToast("UI system switched — some visuals may update", "success");
    } catch (err) {
      console.error(
        "[ctlCdAdminSettings.onUiSystemChange] uncaught error",
        err
      );
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
Illustraton 4:
```js

import { ctlCdAdminSettings } from "./cd-admin-settings.controller.js";

/**
 * 🧩 Corpdesk Admin Module View Index
 * -----------------------------------
 * This module definition now fully supports the Corpdesk UUD lifecycle.
 *
 * ✨ Key Fix:
 * - Templates are no longer pre-evaluated at import time.
 * - Each `template` is a function bound at runtime (via MenuService.loadResource()).
 * - Prevents getters from executing before __init() / __setup().
 */

export const cdAdminModule = {
  ctx: "sys",
  moduleId: "cd-admin",
  moduleName: "cd-admin",
  moduleGuid: "aaaa-bbbb-cccc-dddd",

  /**
   * Controllers
   * Each controller entry contains the instance and a lazy-loaded template.
   */
  controllers: [
    {
      name: "settings",
      instance: ctlCdAdminSettings,

      /**
       * 🕓 Template is now a function — executed at runtime using the controller context.
       * This ensures getters (like uiSystemOptionsHtml, themeOptionsHtml, etc.) run correctly.
       */
      template: function () {
        if (typeof this.__template === "function") {
          return this.__template();
        } else {
          console.warn("[cdAdminModule] Missing __template() on controller:", this);
          return "<div>Template not available.</div>";
        }
      },
      default: false,
    },
  ],

  /**
   * Menu definition for the module.
   * Each route item now references a runtime template function as well.
   */
  menu: [
    {
      label: "cd-admin",
      route: "sys/cd-admin",
      children: [
        {
          label: "settings",
          itemType: "route",
          route: "sys/cd-admin/settings",

          // 🟢 Lazy template resolution — called at runtime by MenuService
          template: function () {
            if (typeof this.__template === "function") {
              return this.__template();
            } else {
              console.warn("[Menu][cd-admin/settings] Missing __template()");
              return "<div>Template missing for cd-admin/settings.</div>";
            }
          },
        },
      ],
    },
  ],
};

/**
 * 🔄 Exported alias for module loaders
 */
export const module = cdAdminModule;

```

Illustration 5:
```ts

// -------------------------------------------------------------
// UI CONFIG — harmonized with your shellconfig.json
// -------------------------------------------------------------
export interface IShellConfig {
  appName: string;
  fallbackTitle?: string;
  appVersion?: string;
  appDescription?: string;

  themeConfig?: ThemeShellConfig;

  /** The default module loaded on startup */
  defaultModulePath?: string;

  /** debug | info | warn | error */
  logLevel?: LogLevel;

  /** UI system preferences */
  uiConfig?: UiShellConfig;

  /**
   * NEW:
   * Marks configs originating from system, consumer, or user level.
   */
  source?: "system" | "consumer" | "user";

  splash: {
    enabled: boolean;
    path: string;
    minDuration: number;
  };

  envConfig?: EnvConfig;
}

// -------------------------------------------------------------
// THEME CONFIG (existing)
// -------------------------------------------------------------

export interface ThemeConfig {
  currentThemePath: string;
  accessibleThemes: string[];
}

export interface ThemeShellConfig {
  /** Path to the currently active theme */
  currentThemePath: string;

  /** List of themes available for selection */
  accessibleThemes: string[];

  /** If true, the end-user may select themes at runtime */
  allowUserSelection?: boolean;

  /** Default theme id, e.g. “dark”, “default”, “contrast” */
  defaultThemeId?: string;

  /**
   * Optional UI-system mapping for advanced UI-system adaptation pipelines.
   * Backward compatible.
   */
  uiSystem?: {
    base: "bootstrap" | "material" | "antd" | "tailwind" | "corpdesk";
    overrideCss?: boolean;
    componentMap?: Record<string, string>;
  };

  /**
   * NEW (Tenant Policy)
   * Tenant may restrict user theme choices.
   */
  lockedThemes?: string[];

  /**
   * NEW (User Personalization)
   * If false, user personalization is disabled even if allowUserSelection = true.
   */
  personalizationEnabled?: boolean;
}

// -------------------------------------------------------------
// UI CONFIG — harmonized with your shellconfig.json
// -------------------------------------------------------------
export interface UiShellConfig {
  /** e.g. "material-design", "bootstrap-538" */
  defaultUiSystemId: string;

  /** e.g. "dark" */
  defaultThemeId: string;

  /** e.g. "standard", "filled", "outlined" */
  defaultFormVariant: string;

  /** Base directory for UI system descriptors */
  uiSystemBasePath: string;

  /**
   * NEW: tenant locks — restrict which UI systems users may choose.
   */
  lockedUiSystems?: string[];

  /**
   * NEW: user-level personalization control.
   */
  allowUserSelection?: boolean;

  /**
   * NEW: admin-only overrides
   */
  adminOverrideAllowed?: boolean;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

```
---

I have tested what we have so far and it is working. I am visualizing a developer for client to this api. There need to be a documentation on how to communicate with the backend.
Note that the query: IQuery and jsonUpdate: JSDPInstruction[] are not limited to specific to given module but are generic.
The general solution is:
Modifying json fields of any model.
Both IQuery and JSDP are protocols that can be implemented in any system and any language.

```json
{
  "ctx": "Sys",
  "m": "Moduleman",
  "c": "Consumer",
  "a": "UpdateConsumerProfile",
  "dat": {
    "f_vals": [
      {
        "query": {
          "update": null,
          "where": {
            "consumerId": 33
          }
        },
        "jsonUpdate": [
          {
            "path": [
              "shellConfig",
              "uiConfig",
              "defaultThemeId"
            ],
            "value": "dark",
            "action": "update"
          },
           {
            "path": [
              "shellConfig",
              "uiConfig",
              "defaultUiSystemId"
            ],
            "value": "bootstrap-538",
            "action": "update"
          }
        ]
      }
    ],
    "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
  },
  "args": {}
}
```

