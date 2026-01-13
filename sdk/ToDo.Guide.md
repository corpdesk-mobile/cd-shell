//////////////////////////////////////////////
We will be working based on src/CdShell/sys/moduleman/view/consumer-resource2.controller.js
Note that it has been serialized as [2].
When you look at the menu settings in the index page, you will see that it is possible to test various designs and serialize them without loosing any (at experimental level)
consumer-resource2 takes the approach of using tabs to organize controlls for managing IConsumerShellConfig.
Notes:

- we are currently experimenting with hard coded menus. But from the documentation, you will see that menu is filtered from the backend
- Only privileged user will be able to load this menu item.
- We will be focussed on developing the ui based on the interface IConsumerShellConfig and its affiliated parents.
- Note that while we will be focussing on consumer-resource2.controller.js, its output will be processed via an adptor mechanism.
  Whichever ui-system is thrown to the system, it will be able to process based on the availablity and capacity of the adaptors.
  At the start, I just need us to brain storm around the subject before we proceed with the development.
  I will be interested in knowing how you understand the system apparent design and goals, then your ideas on how best this work can be achieved.

```ts
// src/CdShell/sys/moduleman/view/consumer-resource2.controller.js
// ------------------------------------------------------------
// consumer-resource.controller.js
// ------------------------------------------------------------

import { ConfigService } from "../../moduleman/services/config.service";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";

import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export const ctlConsumerResource2 = {
  form: null,
  binder: null,
  svConfig: null,
  sysCache: null,

  resolvedShellConfig: null,

  // ----------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------

  async __init() {
    console.log("[ctlConsumerResource][__init]");

    this.svConfig = new ConfigService();
    this.sysCache = SysCacheService.getInstance(this.svConfig);

    this.form = new CdFormGroup({
      appName: new CdFormControl("", [
        CdValidators.required("App name is required"),
      ]),

      logLevel: new CdFormControl("info"),

      splashEnabled: new CdFormControl(false),
      splashPath: new CdFormControl(""),
      splashMinDuration: new CdFormControl(1000),
    });

    this.binder = new CdDirectiveBinderService(
      this.form,
      "#consumerShellConfigForm",
      this
    );
  },

  async __setup() {
    console.log("[ctlConsumerResource][__setup]");
    await this.sysCache.ensureReady();

    // resolved view (system → consumer → user)
    this.resolvedShellConfig = this.sysCache.get("shellConfig") || {};
  },

  async __activate() {
    console.log("[ctlConsumerResource][__activate]");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlConsumerResource][__afterInit]");

    const cfg = this.resolvedShellConfig;
    if (!cfg) return;

    this.form.controls.appName.setValue(cfg.appName || "");
    this.form.controls.logLevel.setValue(cfg.logLevel || "info");

    this.form.controls.splashEnabled.setValue(cfg.splash?.enabled ?? false);
    this.form.controls.splashPath.setValue(cfg.splash?.path || "");
    this.form.controls.splashMinDuration.setValue(
      cfg.splash?.minDuration ?? 1000
    );

    if (this.binder?.refreshView) this.binder.refreshView();
  },

  __deactivate() {
    console.log("[ctlConsumerResource][__deactivate]");
    if (this.binder?.unbindAllDomEvents) this.binder.unbindAllDomEvents();
  },

  // ----------------------------------------------------------
  // Template
  // ----------------------------------------------------------

  __template() {
    return `
      <div class="cd-panel">
        <h2>Consumer Shell Configuration</h2>

        <form id="consumerShellConfigForm" class="cd-form">
          
          <cd-tabs id="shellConfigTabs" active-tab="tab-identity">
            
            <cd-tab id="tab-identity" icon="fingerprint" label="Identity">
              <div class="mt-3">
                <div class="cd-form-field">
                  <label>Application Name</label>
                  <input type="text" name="appName" cdFormControl />
                </div>

                <div class="cd-form-field">
                  <label>Log Level</label>
                  <select name="logLevel" cdFormControl>
                    <option value="debug">debug</option>
                    <option value="info">info</option>
                    <option value="warn">warn</option>
                    <option value="error">error</option>
                  </select>
                </div>
              </div>
            </cd-tab>

            <cd-tab id="tab-startup" icon="rocket_launch" label="Startup">
              <div class="mt-3">
                <div class="cd-form-field">
                  <label>
                    <input type="checkbox" name="splashEnabled" cdFormControl />
                    Enable Splash Screen
                  </label>
                </div>

                <div class="cd-form-field">
                  <label>Splash Asset Path</label>
                  <input type="text" name="splashPath" cdFormControl />
                </div>

                <div class="cd-form-field">
                  <label>Minimum Duration (ms)</label>
                  <input type="number" name="splashMinDuration" cdFormControl />
                </div>
              </div>
            </cd-tab>

          </cd-tabs>

          <div class="mt-4">
            <button cdButton (click)="onSave()">Save Configuration</button>
          </div>
          
        </form>
      </div>
    `;
  },

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  async onSave() {
    console.log("[ctlConsumerResource][onSave]");

    const v = this.form.value;

    const patch = {
      appName: v.appName,
      logLevel: v.logLevel,
      splash: {
        enabled: v.splashEnabled,
        path: v.splashPath,
        minDuration: Number(v.splashMinDuration),
      },
      source: "consumer",
    };

    await this.svConfig.updateConsumerShellConfig(patch);

    console.log("[ctlConsumerResource] consumer shellConfig updated", patch);
  },
};
```

```js
// src/CdShell/sys/moduleman/view/index.js

// ------------------------------------------------------------
// index.js
// ------------------------------------------------------------
import { ctlConsumerResource } from "./consumer-resource.controller.js";
import { ctlConsumerResource2 } from "./consumer-resource2.controller.js";

export const consumerResourceModule = {
  ctx: "sys",

  moduleId: "moduleman-consumer-resource",
  moduleName: "consumer-resource",
  moduleGuid: "consr-0001-0000-0000",

  controllers: [
    {
      name: "consumer-resource",
      instance: ctlConsumerResource,
      template: ctlConsumerResource.__template(),
      default: false,
    },
    {
      name: "consumer-resource2",
      instance: ctlConsumerResource2,
      template: ctlConsumerResource2.__template(),
      default: false,
    },
  ],

  menu: [
    {
      label: "consumer",
      route: "sys/consumer",
      children: [
        {
          label: "consumer-resource",
          itemType: "route",
          route: "sys/moduleman/consumer-resource",
          template: ctlConsumerResource.__template(),
        },
        {
          label: "consumer-resource2",
          itemType: "route",
          route: "sys/moduleman/consumer-resource2",
          template: ctlConsumerResource2.__template(),
        },
      ],
    },
  ],
};

export const module = consumerResourceModule;
```

```ts
export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Whether users under this consumer are allowed
   * to personalize their UI system, theme, formVariant.
   */
  userPersonalizationAllowed?: boolean;

  /**
   * Default UI settings for this consumer (tenant).
   * These override system defaults, but user settings
   * may override these IF personalization is allowed.
   */
  defaultUiSystemId?: string;
  defaultThemeId?: string;
  defaultFormVariant?: string;

  /**
   * Consumer-level enforced UI policies
   * (e.g., lock UI system or theme).
   */
  enforcedPolicies?: {
    lockUiSystem?: boolean;
    lockTheme?: boolean;
    lockFormVariant?: boolean;
  };
}
```

```ts
export interface IShellConfig {
  appName: string;
  fallbackTitle?: string;
  appVersion?: string;
  appDescription?: string;

  themeConfig?: ThemeShellConfig;

  /** The default module loaded on startup */
  defaultModulePath?: string;

  /** debug | info | warn | error */
  logLevel?: string;

  /** UI system preferences */
  uiConfig?: UiShellConfig;

  /**
   * NEW:
   * Marks configs originating from system, consumer, or user level.
   */
  source?: "system" | "consumer" | "user";
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
```

///////////////////////////////////////////////

Now that we are on the same page on the GVP, we can shift focus to the POC where we need to develop a ui for a consumer/tenant admin to manage ui configuration.
Notes:

- the implementation is already in a working state in terms of displaying the tabs whether the system is activated for bootstrap-538 or material-design, and dark or default theme.
- the current objective is to now use the tabs to organize user workflow in the most intuitive but confined to interface design.
- while the focus will be in the html development and given that the implementation of GVP is still in progress, once in a while we will be looking at how to enhance the GVP implementation based on practical needs that arises.

In the consumer-resource2.controller.js, we have ctlConsumerResource2.\_\_template().
This is where our work will be focussed.

First give me your design suggestion based on

```js
// src/CdShell/sys/moduleman/view/consumer-resource2.controller.js
// ------------------------------------------------------------
// consumer-resource.controller.js
// ------------------------------------------------------------

import { ConfigService } from "../../moduleman/services/config.service";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";

import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export const ctlConsumerResource2 = {
  form: null,
  binder: null,
  svConfig: null,
  sysCache: null,

  resolvedShellConfig: null,

  // ----------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------

  async __init() {
    console.log("[ctlConsumerResource][__init]");

    this.svConfig = new ConfigService();
    this.sysCache = SysCacheService.getInstance(this.svConfig);

    this.form = new CdFormGroup({
      appName: new CdFormControl("", [
        CdValidators.required("App name is required"),
      ]),

      logLevel: new CdFormControl("info"),

      splashEnabled: new CdFormControl(false),
      splashPath: new CdFormControl(""),
      splashMinDuration: new CdFormControl(1000),
    });

    this.binder = new CdDirectiveBinderService(
      this.form,
      "#consumerShellConfigForm",
      this
    );
  },

  async __setup() {
    console.log("[ctlConsumerResource][__setup]");
    await this.sysCache.ensureReady();

    // resolved view (system → consumer → user)
    this.resolvedShellConfig = this.sysCache.get("shellConfig") || {};
  },

  async __activate() {
    console.log("[ctlConsumerResource][__activate]");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlConsumerResource][__afterInit]");

    const cfg = this.resolvedShellConfig;
    if (!cfg) return;

    this.form.controls.appName.setValue(cfg.appName || "");
    this.form.controls.logLevel.setValue(cfg.logLevel || "info");

    this.form.controls.splashEnabled.setValue(cfg.splash?.enabled ?? false);
    this.form.controls.splashPath.setValue(cfg.splash?.path || "");
    this.form.controls.splashMinDuration.setValue(
      cfg.splash?.minDuration ?? 1000
    );

    if (this.binder?.refreshView) this.binder.refreshView();
  },

  __deactivate() {
    console.log("[ctlConsumerResource][__deactivate]");
    if (this.binder?.unbindAllDomEvents) this.binder.unbindAllDomEvents();
  },

  // ----------------------------------------------------------
  // Template
  // ----------------------------------------------------------

  __template() {
    return `
      <div class="cd-panel">
        <h2>Consumer Shell Configuration</h2>

        <form id="consumerShellConfigForm" class="cd-form">
          
          <cd-tabs id="shellConfigTabs" active-tab="tab-identity">
            
            <cd-tab id="tab-identity" icon="fingerprint" label="Identity">
              <div class="mt-3">
                <div class="cd-form-field">
                  <label>Application Name</label>
                  <input type="text" name="appName" cdFormControl />
                </div>

                <div class="cd-form-field">
                  <label>Log Level</label>
                  <select name="logLevel" cdFormControl>
                    <option value="debug">debug</option>
                    <option value="info">info</option>
                    <option value="warn">warn</option>
                    <option value="error">error</option>
                  </select>
                </div>
              </div>
            </cd-tab>

            <cd-tab id="tab-startup" icon="rocket_launch" label="Startup">
              <div class="mt-3">
                <div class="cd-form-field">
                  <label>
                    <input type="checkbox" name="splashEnabled" cdFormControl />
                    Enable Splash Screen
                  </label>
                </div>

                <div class="cd-form-field">
                  <label>Splash Asset Path</label>
                  <input type="text" name="splashPath" cdFormControl />
                </div>

                <div class="cd-form-field">
                  <label>Minimum Duration (ms)</label>
                  <input type="number" name="splashMinDuration" cdFormControl />
                </div>
              </div>
            </cd-tab>

          </cd-tabs>

          <div class="mt-4">
            <button cdButton (click)="onSave()">Save Configuration</button>
          </div>
          
        </form>
      </div>
    `;
  },

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  async onSave() {
    console.log("[ctlConsumerResource][onSave]");

    const v = this.form.value;

    const patch = {
      appName: v.appName,
      logLevel: v.logLevel,
      splash: {
        enabled: v.splashEnabled,
        path: v.splashPath,
        minDuration: Number(v.splashMinDuration),
      },
      source: "consumer",
    };

    await this.svConfig.updateConsumerShellConfig(patch);

    console.log("[ctlConsumerResource] consumer shellConfig updated", patch);
  },
};
```

```ts
export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Whether users under this consumer are allowed
   * to personalize their UI system, theme, formVariant.
   */
  userPersonalizationAllowed?: boolean;

  /**
   * Default UI settings for this consumer (tenant).
   * These override system defaults, but user settings
   * may override these IF personalization is allowed.
   */
  defaultUiSystemId?: string;
  defaultThemeId?: string;
  defaultFormVariant?: string;

  /**
   * Consumer-level enforced UI policies
   * (e.g., lock UI system or theme).
   */
  enforcedPolicies?: {
    lockUiSystem?: boolean;
    lockTheme?: boolean;
    lockFormVariant?: boolean;
  };
}
```

```ts
export interface IShellConfig {
  appName: string;
  fallbackTitle?: string;
  appVersion?: string;
  appDescription?: string;

  themeConfig?: ThemeShellConfig;

  /** The default module loaded on startup */
  defaultModulePath?: string;

  /** debug | info | warn | error */
  logLevel?: string;

  /** UI system preferences */
  uiConfig?: UiShellConfig;

  /**
   * NEW:
   * Marks configs originating from system, consumer, or user level.
   */
  source?: "system" | "consumer" | "user";
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
```

////////////////////////////////////////////////

Starting with identity, one of the important settings will be the logo.
We will do the POC with the following considerations:

- that this is a multi-tenant system.
- and this will mean that the system has a way of managing consumer/tenant identifieable directories.
- given that setting logo will not be just simple setting of text but an actuall upload of an image
- uploading of logo must have constraints about file type, file size and image propotions
- we had not worked on upload control that is compliant to GVP.
- we will be using Bootstrap538AdapterService as the first test adaptor (working current codes are shared below including BaseUiAdapter )
- design note. The template is inspired by Angular designs. In this case, apart from controls, we need to be able to package multiple classes working together in a callable component that can be bound to an element in the template. In this case, the end result should be callable in the pattern <gvp-uploader [custom-attributes]>
- on the least, the scripts should call standard upload components for bootstrap (when system is activated for bootstrap-538)
  After this work, we should be able to implement for material-design and be able to switch ui-system and the system renders with the same base codes.

Note:
The current logo is set at http://localhost:5173/themes/default/logo.png

```ts
import {
  CdUiContainerType,
  CdUiControlType,
  CdUiLayoutDescriptor,
  CdUiLayoutType,
  IUiSystemAdapter,
  UiAdapterCapabilities,
  UiAdapterMeta,
  UiAdapterStatus,
} from "../models/ui-system-adaptor.model";
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-theme-descriptor.model";
import { LoggerService } from "../../../utils/logger.service";
import {
  UI_ADAPTER_LIFECYCLE_ORDER,
  UiAdapterLifecycle,
  UiAdapterPhase,
} from "../models/ui-system-introspector.model";

export abstract class BaseUiAdapter implements IUiSystemAdapter {
  protected logger = new LoggerService({
    context: this.constructor.name,
  });

  protected descriptor: UiSystemDescriptor | null = null;

  abstract readonly adapterId: string;

  protected meta!: UiAdapterMeta;
  protected abstract readonly capabilities: UiAdapterCapabilities;

  /** ------------------------------------------------------------------
   * Adapter lifecycle (NEW architecture)
   * ------------------------------------------------------------------ */
  protected lifecycle: UiAdapterLifecycle = UiAdapterLifecycle.CREATED;

  /** ------------------------------------------------------------------
   * Shell lifecycle phase (legacy + runtime coordination)
   * ------------------------------------------------------------------ */
  protected shellPhase: UiAdapterPhase = UiAdapterPhase.INIT;

  /* ==================================================================
   * Lifecycle enforcement
   * ================================================================== */

  protected assertLifecycle(
    required: UiAdapterLifecycle,
    action?: string
  ): void {
    if (this.lifecycle !== required) {
      const msg =
        `Lifecycle violation | required=${required} | current=${this.lifecycle}` +
        (action ? ` | action=${action}` : "");

      this.log("error", "lifecycle:violation", msg);

      throw new Error(`[UiAdapterLifecycleError] ${msg}`);
    }
  }

  protected transitionTo(next: UiAdapterLifecycle): void {
    const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
    const nextIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(next);

    if (nextIndex === -1) {
      throw new Error(`Unknown lifecycle state: ${next}`);
    }

    // No backward or duplicate transitions
    if (nextIndex <= currentIndex) {
      this.log(
        "debug",
        "lifecycle:transition:skip",
        `Lifecycle unchanged (${this.lifecycle} → ${next})`
      );
      return;
    }

    const previous = this.lifecycle;
    this.lifecycle = next;

    this.log(
      "debug",
      "lifecycle:transition",
      `Lifecycle transition: ${previous} → ${next}`
    );
  }

  protected assertAtLeastLifecycle(
    minimum: UiAdapterLifecycle,
    action: string
  ): void {
    if (this.lifecycle < minimum) {
      const msg = `Lifecycle violation | required>=${minimum} | current=${this.lifecycle} | action=${action}`;
      this.log("error", "lifecycle:violation", msg);
      throw new Error(msg);
    }
  }

  protected markInitialized(): void {
    this.transitionTo(UiAdapterLifecycle.INITIALIZED);
  }

  protected markActivated(): void {
    this.transitionTo(UiAdapterLifecycle.ACTIVATED);
  }

  /* ==================================================================
   * Phase management (shell-level, non-fatal)
   * ================================================================== */

  protected setPhase(phase: UiAdapterPhase, reason?: string): void {
    if (this.shellPhase === phase) return;

    const previous = this.shellPhase;
    this.shellPhase = phase;

    this.log("info", "phase:change", `Phase changed ${previous} → ${phase}`, {
      reason,
    });
  }

  protected isPhaseAtLeast(phase: UiAdapterPhase): boolean {
    const order = [
      UiAdapterPhase.INIT,
      UiAdapterPhase.SHELL_READY,
      UiAdapterPhase.MENU_READY,
      UiAdapterPhase.CONTROLLER_READY,
      UiAdapterPhase.DOM_STABLE,
    ];
    return order.indexOf(this.shellPhase) >= order.indexOf(phase);
  }

  protected requirePhase(phase: UiAdapterPhase, action: string): boolean {
    if (!this.isPhaseAtLeast(phase)) {
      this.log(
        "debug",
        "phase:skip",
        `Skipped '${action}' — phase '${this.shellPhase}' < '${phase}'`
      );
      return false;
    }
    return true;
  }

  public onShellPhase(phase: UiAdapterPhase): void {
    this.shellPhase = phase;
    this.logger.debug(`[UI-ADAPTER:${this.adapterId}] shell phase → ${phase}`);
  }

  /* ==================================================================
   * Meta
   * ================================================================== */

  public setMeta(meta: UiAdapterMeta): void {
    this.meta = meta;
  }

  public getMeta(): UiAdapterMeta | null {
    return this.meta ?? null;
  }

  public get id(): string {
    return this.meta?.id;
  }

  public get version(): string {
    return this.meta?.version;
  }

  public get status() {
    return this.meta?.status;
  }

  /* ==================================================================
   * Public lifecycle (ENFORCED ENTRY POINTS)
   * ================================================================== */

  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.CREATED, "activate");

    this.descriptor = descriptor ?? null;

    this.log("info", "activate:start", "Adapter activation started");

    this.markInitialized();

    if (this.meta.status !== UiAdapterStatus.ACTIVE) {
      this.log(
        "warn",
        "adapter:status",
        `Adapter status = ${this.meta.status}`
      );
    }

    this.beforeActivate(descriptor);
    await this.onActivate(descriptor);
    this.afterActivate(descriptor);

    this.markActivated();

    this.log("info", "activate:end", "Adapter activation completed");
  }

  async deactivate(): Promise<void> {
    this.log("info", "deactivate:start", "Adapter deactivation started");

    this.beforeDeactivate();
    await this.onDeactivate();
    this.afterDeactivate();

    this.descriptor = null;

    this.log("info", "deactivate:end", "Adapter deactivation completed");
  }

  async applyTheme(theme: UiThemeDescriptor): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "applyTheme");

    if (!theme) {
      this.log("debug", "theme:skip", "No theme descriptor provided");
      return;
    }

    this.log(
      "info",
      "theme:apply:start",
      `Applying theme '${theme.id ?? theme.name ?? "unknown"}'`
    );

    this.beforeApplyTheme(theme);
    this.onApplyTheme(theme);
    this.afterApplyTheme(theme);

    this.transitionTo(UiAdapterLifecycle.THEMED);

    this.log("info", "theme:apply:end", `Theme '${theme.id}' applied`);
  }

  /* ==================================================================
   * Hooks (override as needed)
   * ================================================================== */

  protected beforeActivate(_descriptor: UiSystemDescriptor): void {}
  protected abstract onActivate(descriptor: UiSystemDescriptor): Promise<void>;
  protected afterActivate(_descriptor: UiSystemDescriptor): void {}

  protected beforeDeactivate(): void {}
  protected async onDeactivate(): Promise<void> {}
  protected afterDeactivate(): void {}

  protected beforeApplyTheme(_theme: UiThemeDescriptor): void {}
  protected abstract onApplyTheme(theme: UiThemeDescriptor): void;
  protected afterApplyTheme(_theme: UiThemeDescriptor): void {}

  /* ==================================================================
   * DOM stability signaling
   * ================================================================== */

  public markDomStable(reason?: string): void {
    this.setPhase(UiAdapterPhase.DOM_STABLE, reason);
  }

  /* ==================================================================
   * Layout helpers
   * ================================================================== */

  protected mapLayoutByDescriptor(
    descriptor: CdUiLayoutDescriptor,
    parent: HTMLElement | Document
  ): void {
    if (!this.supportsLayout(descriptor.layoutType)) return;
    this.mapLayout(descriptor, parent);
  }

  protected mapLayout(
    _descriptor: CdUiLayoutDescriptor,
    _parent: HTMLElement | Document
  ): void {
    /* intentionally empty */
  }

  /* ==================================================================
   * Capability guards
   * ================================================================== */

  public getCapabilities(): Readonly<UiAdapterCapabilities> {
    return this.capabilities;
  }

  protected supportsLayout(type: CdUiLayoutType): boolean {
    const supported = this.capabilities.layouts?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:layout",
        `Layout '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  protected supportsContainer(type: CdUiContainerType): boolean {
    const supported = this.capabilities.containers?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:container",
        `Container '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  protected supportsControl(type: CdUiControlType): boolean {
    const supported = this.capabilities.controls?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:control",
        `Control '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  /* ==================================================================
   * Logging helpers
   * ================================================================== */

  protected log(
    level: "debug" | "info" | "warn" | "error",
    code: string,
    message: string,
    meta?: any
  ) {
    const prefix = `[UI-ADAPTER:${this.meta?.id ?? "unknown"}] ${code}`;

    switch (level) {
      case "debug":
        this.logger.debug(prefix, message, meta);
        break;
      case "info":
        this.logger.info(prefix, message, meta);
        break;
      case "warn":
        this.logger.warn(prefix, message, meta);
        break;
      case "error":
        this.logger.error(prefix, message, meta);
        break;
    }
  }

  protected logLegacy(phase: string, message: string, data?: unknown): void {
    this.log("warn", `legacy:${phase}`, message, data);
  }

  protected logDeprecated(
    phase: string,
    message: string,
    data?: unknown
  ): void {
    this.log("warn", `deprecated:${phase}`, message, data);
  }

  /* ------------------------------------------------------------------
   * DOM-stable signaling (NEW, optional)
   * ------------------------------------------------------------------ */

  protected createTabsSkeleton(tabsId: string): {
    nav: HTMLUListElement;
    content: HTMLDivElement;
  } {
    const nav = document.createElement("ul");
    nav.setAttribute("role", "tablist");

    const content = document.createElement("div");

    return { nav, content };
  }

  protected createTabHeader(
    tabId: string,
    label: string,
    icon?: string,
    active = false
  ): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.setAttribute("role", "presentation");

    const btn = document.createElement("button");
    btn.className = `nav-link ${active ? "active" : ""}`;
    btn.id = `${tabId}-tab`;
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(active));
    btn.setAttribute("data-bs-target", `#${tabId}-pane`);

    if (icon) {
      const i = document.createElement("i");
      i.className = `bi bi-${icon} me-2`;
      btn.appendChild(i);
    }

    btn.appendChild(document.createTextNode(label));
    li.appendChild(btn);

    return li;
  }

  protected createTabPane(tabId: string, active = false): HTMLDivElement {
    const pane = document.createElement("div");
    pane.className = `tab-pane fade ${active ? "show active" : ""}`;
    pane.id = `${tabId}-pane`;
    pane.setAttribute("role", "tabpanel");
    pane.setAttribute("aria-labelledby", `${tabId}-tab`);
    return pane;
  }
}
```

```ts
// src/CdShell/app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts
import {
  CdUiAction,
  CdUiContainerDescriptor,
  CdUiContainerType,
  CdUiGridDescriptor,
  CdUiLayoutType,
  CdUiRole,
  isTabDescriptor,
  UiAdapterCapabilities,
  UiAdapterMeta,
  UiAdapterStatus,
  type CdUiControlDescriptor,
  type CdUiDescriptor,
  type UiConceptMapping,
} from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { CdUiControlType } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import {
  UiAdapterLifecycle,
  UiAdapterPhase,
} from "../../../sys/cd-guig/models/ui-system-introspector.model";
import { BaseUiAdapter } from "../../../sys/cd-guig/services/base-ui-adapter.service";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { UiThemeDescriptor } from "../../../sys/dev-descriptor/models/ui-theme-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class Bootstrap538AdapterService extends BaseUiAdapter {
  protected descriptor: UiSystemDescriptor | null = null;
  protected observer: MutationObserver | null = null;
  protected appliedSet = new WeakSet<HTMLElement>();

  readonly adapterId = "bootstrap-538";

  protected readonly capabilities: UiAdapterCapabilities = {
    layouts: [CdUiLayoutType.GRID],
    containers: [
      CdUiContainerType.TABS,
      CdUiContainerType.TAB,
      CdUiContainerType.CARD,
    ],
    controls: [
      CdUiControlType.BUTTON,
      CdUiControlType.TEXT_FIELD,
      CdUiControlType.SELECT,
      CdUiControlType.CHECKBOX,
      CdUiControlType.SWITCH,
    ],
  };

  protected readonly meta: UiAdapterMeta = {
    id: "bootstrap-538",
    version: "5.3.8",
    status: UiAdapterStatus.ACTIVE,
    vendor: "Bootstrap",
  };

  /* ======================================================================
   * ACTIVATION
   * ====================================================================== */

  protected override async onActivate(
    descriptor: UiSystemDescriptor
  ): Promise<void> {
    this.log("info", "lifecycle:activate:start", "Adapter activation started", {
      lifecycle: this.lifecycle,
    });

    if (!descriptor) {
      this.log("error", "activate:error", "Descriptor is null");
      return;
    }

    /* ------------------------------
     * INITIALIZED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.CREATED) {
      this.descriptor = descriptor;
      this.appliedSet = new WeakSet();

      this.transitionTo(UiAdapterLifecycle.INITIALIZED);
    }

    /* ------------------------------
     * ACTIVATED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.INITIALIZED) {
      this.transitionTo(
        UiAdapterLifecycle.ACTIVATED
        // "Adapter allowed to operate on DOM"
      );
    }

    /* ------------------------------
     * MAPPED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.ACTIVATED) {
      this.mapAll();
      this.transitionTo(
        UiAdapterLifecycle.MAPPED
        // "Initial deterministic mapping complete"
      );
    }

    /* ------------------------------
     * OBSERVING
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.MAPPED) {
      this.observeMutations();
      this.transitionTo(
        UiAdapterLifecycle.OBSERVING
        // "Mutation observer active"
      );
    }

    /* ------------------------------
     * Shell coordination (PHASE)
     * ------------------------------ */
    if (this.lifecycle >= UiAdapterLifecycle.OBSERVING) {
      this.setPhase(
        UiAdapterPhase.CONTROLLER_READY,
        "Bootstrap adapter controller ready"
      );

      this.markDomStable("Initial Bootstrap mapping completed");
    }

    this.log("info", "lifecycle:activate:end", "Adapter activation completed", {
      lifecycle: this.lifecycle,
    });
  }

  protected override async onDeactivate(): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "onDeactivate");

    this.log("info", "lifecycle:deactivate:start", "Deactivating adapter");

    if (this.observer) {
      try {
        this.observer.disconnect();
        this.log("debug", "observer:disconnected", "MutationObserver stopped");
      } catch {
        /* no-op */
      }
      this.observer = null;
    }

    try {
      document.documentElement.removeAttribute("data-bs-theme");
    } catch {
      /* no-op */
    }

    this.descriptor = null;
    this.appliedSet = new WeakSet();

    this.assertLifecycle(UiAdapterLifecycle.CREATED, "Adapter deactivated");

    this.log("info", "lifecycle:deactivate:complete", "Adapter deactivated");
  }

  /* ======================================================================
   * THEME APPLICATION
   * ====================================================================== */

  protected override onApplyTheme(theme: UiThemeDescriptor): void {
    /**
     * NOTE (migration):
     * Theme application currently runs post-DOM_STABLE.
     * Lifecycle enforcement will be revisited once
     * theme timing policy is finalized.
     */
    // this.assertLifecycle(UiAdapterLifecycle.OBSERVING, "applyTheme");
    if (this.lifecycle < UiAdapterLifecycle.ACTIVATED) {
      this.logger.warn(
        `[UI-ADAPTER:${this.adapterId}] applyTheme skipped – adapter not activated`,
        { lifecycle: this.lifecycle }
      );
      return;
    }

    if (!theme) {
      this.logger.warn(
        `[UI-ADAPTER:${this.adapterId}] applyTheme:skipped`,
        "No theme descriptor provided"
      );
      return;
    }

    const root = document.documentElement;

    if (theme.classPrefix) {
      Array.from(root.classList)
        .filter((cls) => cls.startsWith(theme.classPrefix))
        .forEach((cls) => root.classList.remove(cls));
    }

    Object.entries(theme.variables ?? {}).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    theme.classes?.forEach((cls) => root.classList.add(cls));

    this.transitionTo(UiAdapterLifecycle.THEMED);

    this.logger.debug(`[UI-ADAPTER:${this.adapterId}] applyTheme:done`, theme);
  }

  /* ======================================================================
   * CONCEPT MAPPING
   * ====================================================================== */

  private getMapping(concept: string): Mapping {
    return (this.descriptor?.conceptMappings as any)?.[concept];
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;

    if (this.appliedSet.has(el)) {
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => c && el.classList.add(c));
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    this.appliedSet.add(el);
  }

  private mapByConcept(concept: string, selector: string): void {
    const mapping = this.getMapping(concept);
    if (!mapping) return;

    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => this.applyMappingToElement(el, mapping));
  }

  /**
   * mapTabs()
   * Transforms <cd-tabs> into Bootstrap 5.3 nav-tabs and tab-panes.
   */
  private mapTabs() {
    this.log("info", "map:concept", "[Bootstrap538Adapter] mapTabs()");
    const tabsContainers = document.querySelectorAll<HTMLElement>("cd-tabs");

    tabsContainers.forEach((container) => {
      if (this.appliedSet.has(container)) return;

      const tabsId =
        container.id || `tabs-${Math.random().toString(36).slice(2, 7)}`;
      const activeTabId = container.getAttribute("active-tab");
      const cdTabs = Array.from(
        container.querySelectorAll<HTMLElement>("cd-tab")
      );

      const navUl = document.createElement("ul");
      navUl.className = "nav nav-tabs mb-3";
      navUl.id = `${tabsId}-nav`;
      navUl.setAttribute("role", "tablist");

      const contentDiv = document.createElement("div");
      contentDiv.className = "tab-content";
      contentDiv.id = `${tabsId}-content`;

      cdTabs.forEach((tab, index) => {
        const tabId = tab.id || `${tabsId}-t-${index}`;
        const label = tab.getAttribute("label") || "";
        const icon = tab.getAttribute("icon");
        const isActive = tabId === activeTabId || (!activeTabId && index === 0);

        const li = document.createElement("li");
        li.className = "nav-item";
        li.setAttribute("role", "presentation");

        const btn = document.createElement("button");
        btn.className = `nav-link ${isActive ? "active" : ""}`;
        btn.id = `${tabId}-tab`;
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", String(isActive));
        btn.setAttribute("data-bs-target", `#${tabId}-pane`);

        btn.addEventListener("click", (e) => {
          e.preventDefault();

          navUl.querySelectorAll(".nav-link").forEach((l) => {
            l.classList.remove("active");
            l.setAttribute("aria-selected", "false");
          });

          btn.classList.add("active");
          btn.setAttribute("aria-selected", "true");

          contentDiv
            .querySelectorAll(".tab-pane")
            .forEach((p) => p.classList.remove("show", "active"));

          const targetPane = contentDiv.querySelector<HTMLElement>(
            `#${tabId}-pane`
          );
          targetPane?.classList.add("show", "active");

          container.dispatchEvent(
            new CustomEvent("cd-tab-change", {
              detail: { tabId, label },
              bubbles: true,
            })
          );
        });

        if (icon) {
          const iconEl = document.createElement("i");
          iconEl.className = `bi bi-${icon} me-2`;
          btn.appendChild(iconEl);
        }

        btn.appendChild(document.createTextNode(label));
        li.appendChild(btn);
        navUl.appendChild(li);

        const pane = document.createElement("div");
        pane.className = `tab-pane fade ${isActive ? "show active" : ""}`;
        pane.id = `${tabId}-pane`;
        pane.setAttribute("role", "tabpanel");
        pane.setAttribute("aria-labelledby", `${tabId}-tab`);
        pane.innerHTML = tab.innerHTML;

        contentDiv.appendChild(pane);
      });

      const fragment = document.createDocumentFragment();
      fragment.append(navUl, contentDiv);
      container.replaceWith(fragment);

      this.appliedSet.add(navUl);
    });
  }

  private mapOtherConcepts() {
    const cm = this.descriptor?.conceptMappings || {};
    Object.keys(cm)
      .filter((c) => !["button", "input", "formGroup"].includes(c))
      .forEach((concept) => {
        const selector = `[data-cd-${concept}], .cd-${concept}`;
        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach((el) =>
            this.applyMappingToElement(el, (cm as any)[concept])
          );
      });
  }

  private mapAll() {
    if (!this.descriptor) return;

    try {
      this.mapByConcept("button", "button[cdButton], button.cd-button");
      this.mapByConcept(
        "input",
        "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]"
      );
      this.mapByConcept("formGroup", ".cd-form-field");
      this.mapTabs();
      this.mapOtherConcepts();
    } catch (err) {
      this.log("error", "map:all:error", "Mapping failed", err);
    }
  }

  /* ======================================================================
   * DOM OBSERVER
   * ====================================================================== */

  private observeMutations() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch (err) {
      this.log("error", "observer:error", "Failed to attach observer", err);
      this.observer = null;
    }
  }
}

/* ========================================================================
 * AUTO-REGISTRATION
 * ======================================================================== */

UiSystemAdapterRegistry.register(
  "bootstrap-538",
  new Bootstrap538AdapterService()
);
```

///////////////////////////////////////////
Do for me the complete \_\_template() where uploader control is added to what is already there.

///////////////////////////////
To integrate the method you had proposed, mapUploader(), we have to add this.mapUploader() to mapAll().
This was the legacy approach we had earlier.
The architecure was then reviewd so that the following can be achieved:

- development of BaseUiAdaptor so most logics can be achored in one place
- avoiding use of methods that are just dedicated to a given adaptor and replicating the same in another adaptor.
  For this, generic methods like
  We later introduced mapUploader(), which was meant to mapByConcept() and mapOtherConcepts were introduced.
- avoiding use of strings like 'button', 'list' etc but instead rely on the concept of descriptors.
  The concept of descriptors in corpdesk is a logical way of defining software related entities in a specified hierachical structure.
  For this, we have the following:
  - In Bootstrap538AdapterService.Bootstrap538AdapterService, you note that controls are identified with established structures.
  - Bootstrap538AdapterService.descriptor: UiSystemDescriptor

We therefore need to revisit the proposed mapUploader().
The new approach may require use of mapByConcept(),



```ts
// src/CdShell/app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts
type Mapping = UiConceptMapping | undefined;

export class Bootstrap538AdapterService extends BaseUiAdapter {
  protected descriptor: UiSystemDescriptor | null = null;
  protected observer: MutationObserver | null = null;
  protected appliedSet = new WeakSet<HTMLElement>();

  readonly adapterId = "bootstrap-538";

  protected readonly capabilities: UiAdapterCapabilities = {
    layouts: [CdUiLayoutType.GRID],
    containers: [
      CdUiContainerType.TABS,
      CdUiContainerType.TAB,
      CdUiContainerType.CARD,
    ],
    controls: [
      CdUiControlType.BUTTON,
      CdUiControlType.TEXT_FIELD,
      CdUiControlType.SELECT,
      CdUiControlType.CHECKBOX,
      CdUiControlType.SWITCH,
    ],
  };

  protected readonly meta: UiAdapterMeta = {
    id: "bootstrap-538",
    version: "5.3.8",
    status: UiAdapterStatus.ACTIVE,
    vendor: "Bootstrap",
  };

  /* ======================================================================
   * ACTIVATION
   * ====================================================================== */

  protected override async onActivate(
    descriptor: UiSystemDescriptor
  ): Promise<void> {
    this.log("info", "lifecycle:activate:start", "Adapter activation started", {
      lifecycle: this.lifecycle,
    });

    if (!descriptor) {
      this.log("error", "activate:error", "Descriptor is null");
      return;
    }

    /* ------------------------------
     * INITIALIZED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.CREATED) {
      this.descriptor = descriptor;
      this.appliedSet = new WeakSet();

      this.transitionTo(UiAdapterLifecycle.INITIALIZED);
    }

    /* ------------------------------
     * ACTIVATED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.INITIALIZED) {
      this.transitionTo(
        UiAdapterLifecycle.ACTIVATED
        // "Adapter allowed to operate on DOM"
      );
    }

    /* ------------------------------
     * MAPPED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.ACTIVATED) {
      this.mapAll();
      this.transitionTo(
        UiAdapterLifecycle.MAPPED
        // "Initial deterministic mapping complete"
      );
    }

    /* ------------------------------
     * OBSERVING
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.MAPPED) {
      this.observeMutations();
      this.transitionTo(
        UiAdapterLifecycle.OBSERVING
        // "Mutation observer active"
      );
    }

    /* ------------------------------
     * Shell coordination (PHASE)
     * ------------------------------ */
    if (this.lifecycle >= UiAdapterLifecycle.OBSERVING) {
      this.setPhase(
        UiAdapterPhase.CONTROLLER_READY,
        "Bootstrap adapter controller ready"
      );

      this.markDomStable("Initial Bootstrap mapping completed");
    }

    this.log("info", "lifecycle:activate:end", "Adapter activation completed", {
      lifecycle: this.lifecycle,
    });
  }

  protected override async onDeactivate(): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "onDeactivate");

    this.log("info", "lifecycle:deactivate:start", "Deactivating adapter");

    if (this.observer) {
      try {
        this.observer.disconnect();
        this.log("debug", "observer:disconnected", "MutationObserver stopped");
      } catch {
        /* no-op */
      }
      this.observer = null;
    }

    try {
      document.documentElement.removeAttribute("data-bs-theme");
    } catch {
      /* no-op */
    }

    this.descriptor = null;
    this.appliedSet = new WeakSet();

    this.assertLifecycle(UiAdapterLifecycle.CREATED, "Adapter deactivated");

    this.log("info", "lifecycle:deactivate:complete", "Adapter deactivated");
  }

  /* ======================================================================
   * THEME APPLICATION
   * ====================================================================== */

  protected override onApplyTheme(theme: UiThemeDescriptor): void {
    /**
     * NOTE (migration):
     * Theme application currently runs post-DOM_STABLE.
     * Lifecycle enforcement will be revisited once
     * theme timing policy is finalized.
     */
    // this.assertLifecycle(UiAdapterLifecycle.OBSERVING, "applyTheme");
    if (this.lifecycle < UiAdapterLifecycle.ACTIVATED) {
      this.logger.warn(
        `[UI-ADAPTER:${this.adapterId}] applyTheme skipped – adapter not activated`,
        { lifecycle: this.lifecycle }
      );
      return;
    }

    if (!theme) {
      this.logger.warn(
        `[UI-ADAPTER:${this.adapterId}] applyTheme:skipped`,
        "No theme descriptor provided"
      );
      return;
    }

    const root = document.documentElement;

    if (theme.classPrefix) {
      Array.from(root.classList)
        .filter((cls) => cls.startsWith(theme.classPrefix))
        .forEach((cls) => root.classList.remove(cls));
    }

    Object.entries(theme.variables ?? {}).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    theme.classes?.forEach((cls) => root.classList.add(cls));

    this.transitionTo(UiAdapterLifecycle.THEMED);

    this.logger.debug(`[UI-ADAPTER:${this.adapterId}] applyTheme:done`, theme);
  }

  /* ======================================================================
   * CONCEPT MAPPING
   * ====================================================================== */

  private getMapping(concept: string): Mapping {
    return (this.descriptor?.conceptMappings as any)?.[concept];
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {

    if (!mapping) return;

    if (this.appliedSet.has(el)) {
      if (mapping.attrs) {
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      }
      return;
    }

    if (mapping.class) {
      mapping.class.split(/\s+/).forEach((c) => c && el.classList.add(c));
    }

    if (mapping.attrs) {
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }

    this.appliedSet.add(el);
  }

  private mapByConcept(concept: string, selector: string): void {
    this.logger.debug("[Bootstrap538Adapter.mapByConcept()] concept:)", concept);
    const mapping = this.getMapping(concept);
    if (!mapping) return;

    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => this.applyMappingToElement(el, mapping));
  }

  /**
   * mapTabs()
   * Transforms <cd-tabs> into Bootstrap 5.3 nav-tabs and tab-panes.
   * Sample tab:
   * <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="#">Active</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Link</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Link</a>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
      </li>
    </ul>
   */
  private mapTabs() {
    this.log("info", "map:concept", "[Bootstrap538Adapter] mapTabs()");
    const tabsContainers = document.querySelectorAll<HTMLElement>("cd-tabs");

    tabsContainers.forEach((container) => {
      if (this.appliedSet.has(container)) return;

      const tabsId =
        container.id || `tabs-${Math.random().toString(36).slice(2, 7)}`;
      const activeTabId = container.getAttribute("active-tab");
      const cdTabs = Array.from(
        container.querySelectorAll<HTMLElement>("cd-tab")
      );

      const navUl = document.createElement("ul");
      navUl.className = "nav nav-tabs mb-3";
      navUl.id = `${tabsId}-nav`;
      navUl.setAttribute("role", "tablist");

      const contentDiv = document.createElement("div");
      contentDiv.className = "tab-content";
      contentDiv.id = `${tabsId}-content`;

      cdTabs.forEach((tab, index) => {
        const tabId = tab.id || `${tabsId}-t-${index}`;
        const label = tab.getAttribute("label") || "";
        const icon = tab.getAttribute("icon");
        const isActive = tabId === activeTabId || (!activeTabId && index === 0);

        const li = document.createElement("li");
        li.className = "nav-item";
        li.setAttribute("role", "presentation");

        const btn = document.createElement("button");
        btn.className = `nav-link ${isActive ? "active" : ""}`;
        btn.id = `${tabId}-tab`;
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", String(isActive));
        btn.setAttribute("data-bs-target", `#${tabId}-pane`);

        btn.addEventListener("click", (e) => {
          e.preventDefault();

          navUl.querySelectorAll(".nav-link").forEach((l) => {
            l.classList.remove("active");
            l.setAttribute("aria-selected", "false");
          });

          btn.classList.add("active");
          btn.setAttribute("aria-selected", "true");

          contentDiv
            .querySelectorAll(".tab-pane")
            .forEach((p) => p.classList.remove("show", "active"));

          const targetPane = contentDiv.querySelector<HTMLElement>(
            `#${tabId}-pane`
          );
          targetPane?.classList.add("show", "active");

          container.dispatchEvent(
            new CustomEvent("cd-tab-change", {
              detail: { tabId, label },
              bubbles: true,
            })
          );
        });

        if (icon) {
          const iconEl = document.createElement("i");
          iconEl.className = `bi bi-${icon} me-2`;
          btn.appendChild(iconEl);
        }

        btn.appendChild(document.createTextNode(label));
        li.appendChild(btn);
        navUl.appendChild(li);

        const pane = document.createElement("div");
        pane.className = `tab-pane fade ${isActive ? "show active" : ""}`;
        pane.id = `${tabId}-pane`;
        pane.setAttribute("role", "tabpanel");
        pane.setAttribute("aria-labelledby", `${tabId}-tab`);
        pane.innerHTML = tab.innerHTML;

        contentDiv.appendChild(pane);
      });

      const fragment = document.createDocumentFragment();
      fragment.append(navUl, contentDiv);
      container.replaceWith(fragment);

      this.appliedSet.add(navUl);
    });
  }

  private mapUploader() {
    const uploaders = document.querySelectorAll<HTMLElement>("gvp-uploader");

    uploaders.forEach((el) => {
      if (this.appliedSet.has(el)) return;

      const currentUrl = el.getAttribute("data-current-preview");
      const name = el.getAttribute("name");

      // Build Bootstrap 5 structure
      const wrapper = document.createElement("div");
      wrapper.className =
        "d-flex align-items-center gap-3 p-3 border rounded bg-light";

      // 1. Preview Image
      const img = document.createElement("img");
      img.src = currentUrl || "";
      img.className = "img-thumbnail";
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.objectFit = "contain";

      // 2. File Input
      const input = document.createElement("input");
      input.type = "file";
      input.name = name || "";
      input.className = "form-control";
      input.accept = el.getAttribute("accept") || "";

      // 3. Logic: Update preview on change
      input.addEventListener("change", (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => (img.src = e.target?.result as string);
          reader.readAsDataURL(file);

          // Signal the Binder that the value changed
          el.dispatchEvent(
            new CustomEvent("cd-value-change", { detail: file })
          );
        }
      });

      wrapper.append(img, input);
      el.innerHTML = "";
      el.appendChild(wrapper);

      this.appliedSet.add(el);
    });
  }

  private mapOtherConcepts() {
    const cm = this.descriptor?.conceptMappings || {};
    Object.keys(cm)
      .filter((c) => !["button", "input", "formGroup"].includes(c))
      .forEach((concept) => {
        const selector = `[data-cd-${concept}], .cd-${concept}`;
        document
          .querySelectorAll<HTMLElement>(selector)
          .forEach((el) =>
            this.applyMappingToElement(el, (cm as any)[concept])
          );
      });
  }

  private mapAll() {
    if (!this.descriptor) return;

    try {
      this.mapUploader();
      this.mapByConcept("button", "button[cdButton], button.cd-button");
      this.mapByConcept(
        "input",
        "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]"
      );
      this.mapByConcept("formGroup", ".cd-form-field");
      this.mapUploader();
      this.mapOtherConcepts();
    } catch (err) {
      this.log("error", "map:all:error", "Mapping failed", err);
    }
  }

  /* ======================================================================
   * DOM OBSERVER
   * ====================================================================== */

  private observeMutations() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 16);
      }
    });

    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch (err) {
      this.log("error", "observer:error", "Failed to attach observer", err);
      this.observer = null;
    }
  }
}

/* ========================================================================
 * AUTO-REGISTRATION
 * ======================================================================== */

UiSystemAdapterRegistry.register(
  "bootstrap-538",
  new Bootstrap538AdapterService()
);

```
Some relevant interfaces.
```ts
export type UiSystemId =
  | "bootstrap-538"
  | "bootstrap-502"
  | "tailwind"
  | "material-mui"
  | "material-design"
  | "custom";

/**
 * 2. Harmonized DEFAULT_SYSTEM
 * Ensure no trailing commas or hidden characters are present.
 */
export const DEFAULT_SYSTEM: UiSystemDescriptor = {
  id: "bootstrap-538",
  version: "5.3.8",
  themeActive: "light",
};

/**
 * Defines the high-level role of a descriptor
 */
export enum CdUiRole {
  LAYOUT = "layout",
  CONTAINER = "container",
  CONTROL = "control",
  COMPOSITE = "composite",
}

export enum CdUiLayoutType {
  GRID = "grid",
  FLEX = "flex",
  STACK = "stack",
  MASONRY = "masonry",
}

export type CdUiResponsiveMap = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
};

export interface CdUiLayoutDescriptor extends CdUiDescriptor {
  role: CdUiRole.LAYOUT;
  layoutType: CdUiLayoutType;
  responsive?: CdUiResponsiveMap;
}

export interface CdUiGridDescriptor extends CdUiLayoutDescriptor {
  layoutType: CdUiLayoutType.GRID;

  columns?: number; // semantic intent
  gap?: string | number;
}

export interface CdUiGridDescriptor extends CdUiLayoutDescriptor {
  layoutType: CdUiLayoutType.GRID;

  columns?: number; // total columns (default = 12)
  span?: number; // how many columns THIS child spans

  responsive?: Partial<Record<"sm" | "md" | "lg" | "xl" | "xxl", number>>;
}

/** * Strict catalog of structural containers
 */
export enum CdUiContainerType {
  TABS = "tabs",
  TAB = "tab",
  CARD = "card",
  ACCORDION = "accordion",
  SECTION = "section",
  DIALOG = "dialog",
}

/** * Strict catalog of atomic controls
 */
export enum CdUiControlType {
  BUTTON = "button",
  TEXT_FIELD = "textField",
  CHECKBOX = "checkbox",
  SELECT = "select",
  SWITCH = "switch",
}

export interface CdUiDescriptor {
  id: string;
  role: CdUiRole; // Use Enum
  children?: CdUiDescriptor[];
}

export interface CdUiContainerDescriptor extends CdUiDescriptor {
  role: CdUiRole.CONTAINER;
  containerType: CdUiContainerType; // Use Enum
  label?: string;
  icon?: string;
}

export interface CdUiControlDescriptor extends CdUiDescriptor {
  role: CdUiRole.CONTROL;
  controlType: CdUiControlType; // Use Enum
  value?: any;
  placeholder?: string;
}

export interface CdUiAction {
  type: "navigate" | "submit" | "call_fx" | "toggle_target";
  target?: string; // e.g., a route or a component ID
  params?: Record<string, any>;
}

export interface CdUiControlDescriptor extends CdUiDescriptor {
  role: CdUiRole.CONTROL;
  controlType: CdUiControlType;
  action?: CdUiAction; // The semantic intent of the interaction
}

export function isContainerDescriptor(
  d: CdUiDescriptor
): d is CdUiContainerDescriptor {
  return d.role === CdUiRole.CONTAINER;
}

export function isTabDescriptor(
  d: CdUiDescriptor
): d is CdUiContainerDescriptor {
  return (
    d.role === CdUiRole.CONTAINER &&
    (d as CdUiContainerDescriptor).containerType === CdUiContainerType.TAB
  );
}

export enum UiAdapterCapability {
  LAYOUT = "layout",
  CONTAINER = "container",
  CONTROL = "control",
}

export interface UiAdapterCapabilities {
  layouts?: CdUiLayoutType[];
  containers?: CdUiContainerType[];
  controls?: CdUiControlType[];
}

export interface UiDescriptorValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export enum UiAdapterStatus {
  ACTIVE = "ACTIVE",
  MARKED_FOR_DEPRECATION = "MARKED_FOR_DEPRECATION",
  LEGACY = "LEGACY",
}

export interface UiAdapterMeta {
  id: string; // "bootstrap-538"
  name?: string; // "Bootstrap 5 Adapter"
  version?: string; // "5.3.8"
  status?: "ACTIVE" | "MARKED_FOR_DEPRECATION";
  vendor?: string; // "Bootstrap"
}

export function isUiAdapterConstructor(
  value: unknown
): value is new () => BaseUiAdapter {
  return (
    typeof value === "function" && value.prototype instanceof BaseUiAdapter
  );
}
```

```ts

export abstract class BaseUiAdapter implements IUiSystemAdapter {
  protected logger = new LoggerService({
    context: this.constructor.name,
  });

  protected descriptor: UiSystemDescriptor | null = null;

  abstract readonly adapterId: string;

  protected meta!: UiAdapterMeta;
  protected abstract readonly capabilities: UiAdapterCapabilities;

  /** ------------------------------------------------------------------
   * Adapter lifecycle (NEW architecture)
   * ------------------------------------------------------------------ */
  protected lifecycle: UiAdapterLifecycle = UiAdapterLifecycle.CREATED;

  /** ------------------------------------------------------------------
   * Shell lifecycle phase (legacy + runtime coordination)
   * ------------------------------------------------------------------ */
  protected shellPhase: UiAdapterPhase = UiAdapterPhase.INIT;

  /* ==================================================================
   * Lifecycle enforcement
   * ================================================================== */

  protected assertLifecycle(
    required: UiAdapterLifecycle,
    action?: string
  ): void {
    if (this.lifecycle !== required) {
      const msg =
        `Lifecycle violation | required=${required} | current=${this.lifecycle}` +
        (action ? ` | action=${action}` : "");

      this.log("error", "lifecycle:violation", msg);

      throw new Error(`[UiAdapterLifecycleError] ${msg}`);
    }
  }

  protected transitionTo(next: UiAdapterLifecycle): void {
    const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
    const nextIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(next);

    if (nextIndex === -1) {
      throw new Error(`Unknown lifecycle state: ${next}`);
    }

    // No backward or duplicate transitions
    if (nextIndex <= currentIndex) {
      this.log(
        "debug",
        "lifecycle:transition:skip",
        `Lifecycle unchanged (${this.lifecycle} → ${next})`
      );
      return;
    }

    const previous = this.lifecycle;
    this.lifecycle = next;

    this.log(
      "debug",
      "lifecycle:transition",
      `Lifecycle transition: ${previous} → ${next}`
    );
  }

  protected assertAtLeastLifecycle(
  minimum: UiAdapterLifecycle,
  action: string
): void {
  if (this.lifecycle < minimum) {
    const msg = `Lifecycle violation | required>=${minimum} | current=${this.lifecycle} | action=${action}`;
    this.log("error", "lifecycle:violation", msg);
    throw new Error(msg);
  }
}

  protected markInitialized(): void {
    this.transitionTo(UiAdapterLifecycle.INITIALIZED);
  }

  protected markActivated(): void {
    this.transitionTo(UiAdapterLifecycle.ACTIVATED);
  }

  /* ==================================================================
   * Phase management (shell-level, non-fatal)
   * ================================================================== */

  protected setPhase(phase: UiAdapterPhase, reason?: string): void {
    if (this.shellPhase === phase) return;

    const previous = this.shellPhase;
    this.shellPhase = phase;

    this.log("info", "phase:change", `Phase changed ${previous} → ${phase}`, {
      reason,
    });
  }

  protected isPhaseAtLeast(phase: UiAdapterPhase): boolean {
    const order = [
      UiAdapterPhase.INIT,
      UiAdapterPhase.SHELL_READY,
      UiAdapterPhase.MENU_READY,
      UiAdapterPhase.CONTROLLER_READY,
      UiAdapterPhase.DOM_STABLE,
    ];
    return order.indexOf(this.shellPhase) >= order.indexOf(phase);
  }

  protected requirePhase(phase: UiAdapterPhase, action: string): boolean {
    if (!this.isPhaseAtLeast(phase)) {
      this.log(
        "debug",
        "phase:skip",
        `Skipped '${action}' — phase '${this.shellPhase}' < '${phase}'`
      );
      return false;
    }
    return true;
  }

  public onShellPhase(phase: UiAdapterPhase): void {
    this.shellPhase = phase;
    this.logger.debug(`[UI-ADAPTER:${this.adapterId}] shell phase → ${phase}`);
  }

  /* ==================================================================
   * Meta
   * ================================================================== */

  public setMeta(meta: UiAdapterMeta): void {
    this.meta = meta;
  }

  public getMeta(): UiAdapterMeta | null {
    return this.meta ?? null;
  }

  public get id(): string {
    return this.meta?.id;
  }

  public get version(): string {
    return this.meta?.version;
  }

  public get status() {
    return this.meta?.status;
  }

  /* ==================================================================
   * Public lifecycle (ENFORCED ENTRY POINTS)
   * ================================================================== */

  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.CREATED, "activate");

    this.descriptor = descriptor ?? null;

    this.log("info", "activate:start", "Adapter activation started");

    this.markInitialized();

    if (this.meta.status !== UiAdapterStatus.ACTIVE) {
      this.log(
        "warn",
        "adapter:status",
        `Adapter status = ${this.meta.status}`
      );
    }

    this.beforeActivate(descriptor);
    await this.onActivate(descriptor);
    this.afterActivate(descriptor);

    this.markActivated();

    this.log("info", "activate:end", "Adapter activation completed");
  }

  async deactivate(): Promise<void> {
    this.log("info", "deactivate:start", "Adapter deactivation started");

    this.beforeDeactivate();
    await this.onDeactivate();
    this.afterDeactivate();

    this.descriptor = null;

    this.log("info", "deactivate:end", "Adapter deactivation completed");
  }

  async applyTheme(theme: UiThemeDescriptor): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "applyTheme");

    if (!theme) {
      this.log("debug", "theme:skip", "No theme descriptor provided");
      return;
    }

    this.log(
      "info",
      "theme:apply:start",
      `Applying theme '${theme.id ?? theme.name ?? "unknown"}'`
    );

    this.beforeApplyTheme(theme);
    this.onApplyTheme(theme);
    this.afterApplyTheme(theme);

    this.transitionTo(UiAdapterLifecycle.THEMED);

    this.log("info", "theme:apply:end", `Theme '${theme.id}' applied`);
  }

  /* ==================================================================
   * Hooks (override as needed)
   * ================================================================== */

  protected beforeActivate(_descriptor: UiSystemDescriptor): void {}
  protected abstract onActivate(descriptor: UiSystemDescriptor): Promise<void>;
  protected afterActivate(_descriptor: UiSystemDescriptor): void {}

  protected beforeDeactivate(): void {}
  protected async onDeactivate(): Promise<void> {}
  protected afterDeactivate(): void {}

  protected beforeApplyTheme(_theme: UiThemeDescriptor): void {}
  protected abstract onApplyTheme(theme: UiThemeDescriptor): void;
  protected afterApplyTheme(_theme: UiThemeDescriptor): void {}

  /* ==================================================================
   * DOM stability signaling
   * ================================================================== */

  public markDomStable(reason?: string): void {
    this.setPhase(UiAdapterPhase.DOM_STABLE, reason);
  }

  /* ==================================================================
   * Layout helpers
   * ================================================================== */

  protected mapLayoutByDescriptor(
    descriptor: CdUiLayoutDescriptor,
    parent: HTMLElement | Document
  ): void {
    if (!this.supportsLayout(descriptor.layoutType)) return;
    this.mapLayout(descriptor, parent);
  }

  protected mapLayout(
    _descriptor: CdUiLayoutDescriptor,
    _parent: HTMLElement | Document
  ): void {
    /* intentionally empty */
  }

  /* ==================================================================
   * Capability guards
   * ================================================================== */

  public getCapabilities(): Readonly<UiAdapterCapabilities> {
    return this.capabilities;
  }

  protected supportsLayout(type: CdUiLayoutType): boolean {
    const supported = this.capabilities.layouts?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:layout",
        `Layout '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  protected supportsContainer(type: CdUiContainerType): boolean {
    const supported = this.capabilities.containers?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:container",
        `Container '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  protected supportsControl(type: CdUiControlType): boolean {
    const supported = this.capabilities.controls?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:control",
        `Control '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  /* ==================================================================
   * Logging helpers
   * ================================================================== */

  protected log(
    level: "debug" | "info" | "warn" | "error",
    code: string,
    message: string,
    meta?: any
  ) {
    const prefix = `[UI-ADAPTER:${this.meta?.id ?? "unknown"}] ${code}`;

    switch (level) {
      case "debug":
        this.logger.debug(prefix, message, meta);
        break;
      case "info":
        this.logger.info(prefix, message, meta);
        break;
      case "warn":
        this.logger.warn(prefix, message, meta);
        break;
      case "error":
        this.logger.error(prefix, message, meta);
        break;
    }
  }

  protected logLegacy(phase: string, message: string, data?: unknown): void {
    this.log("warn", `legacy:${phase}`, message, data);
  }

  protected logDeprecated(
    phase: string,
    message: string,
    data?: unknown
  ): void {
    this.log("warn", `deprecated:${phase}`, message, data);
  }

  /* ------------------------------------------------------------------
   * DOM-stable signaling (NEW, optional)
   * ------------------------------------------------------------------ */

  protected createTabsSkeleton(tabsId: string): {
    nav: HTMLUListElement;
    content: HTMLDivElement;
  } {
    const nav = document.createElement("ul");
    nav.setAttribute("role", "tablist");

    const content = document.createElement("div");

    return { nav, content };
  }

  protected createTabHeader(
    tabId: string,
    label: string,
    icon?: string,
    active = false
  ): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.setAttribute("role", "presentation");

    const btn = document.createElement("button");
    btn.className = `nav-link ${active ? "active" : ""}`;
    btn.id = `${tabId}-tab`;
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(active));
    btn.setAttribute("data-bs-target", `#${tabId}-pane`);

    if (icon) {
      const i = document.createElement("i");
      i.className = `bi bi-${icon} me-2`;
      btn.appendChild(i);
    }

    btn.appendChild(document.createTextNode(label));
    li.appendChild(btn);

    return li;
  }

  protected createTabPane(tabId: string, active = false): HTMLDivElement {
    const pane = document.createElement("div");
    pane.className = `tab-pane fade ${active ? "show active" : ""}`;
    pane.id = `${tabId}-pane`;
    pane.setAttribute("role", "tabpanel");
    pane.setAttribute("aria-labelledby", `${tabId}-tab`);
    return pane;
  }
}

```

///////////////////////////////////////////


That worked. We now need to an equivalent update for material design adaptor.
Below is a working adaptor for mateiral-design except for integration of upload control.

```ts
type Mapping = UiConceptMapping | undefined;

export class MaterialDesignAdapterService extends BaseUiAdapter {

  protected descriptor: UiSystemDescriptor | null = null;
  protected observer: MutationObserver | null = null;
  protected appliedSet = new WeakSet<HTMLElement>();

  private mdcInitQueued = false;
  private mdcInstances = new Set<any>();

  readonly adapterId = "material-design";

  protected readonly capabilities: UiAdapterCapabilities = {
    layouts: [CdUiLayoutType.GRID],
    containers: [
      CdUiContainerType.TABS,
      CdUiContainerType.TAB,
      CdUiContainerType.CARD,
    ],
    controls: [
      CdUiControlType.BUTTON,
      CdUiControlType.TEXT_FIELD,
      CdUiControlType.SELECT,
    ],
  };

  protected readonly meta: UiAdapterMeta = {
    id: "material-design",
    version: "mdc",
    status: UiAdapterStatus.ACTIVE,
    vendor: "Material Design",
  };

  // constructor() {
  //   console.log("%c[MaterialDesignAdapter] constructor()", "color:#8cf");
  // }

  /* ======================================================================
   * ACTIVATION
   * ====================================================================== */

  protected override async onActivate(
    descriptor: UiSystemDescriptor
  ): Promise<void> {
    this.log(
      "info",
      "lifecycle:activate:start",
      "Material adapter activating",
      {
        lifecycle: this.lifecycle,
      }
    );

    if (!descriptor) {
      this.log("error", "activate:error", "Descriptor is null");
      return;
    }

    /* ------------------------------
     * INITIALIZED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.CREATED) {
      this.descriptor = descriptor;
      this.appliedSet = new WeakSet();
      this.transitionTo(UiAdapterLifecycle.INITIALIZED);
    }

    /* ------------------------------
     * ACTIVATED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.INITIALIZED) {
      this.transitionTo(UiAdapterLifecycle.ACTIVATED);
    }

    /* ------------------------------
     * MAPPED
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.ACTIVATED) {
      this.mapAll();
      this.transitionTo(UiAdapterLifecycle.MAPPED);
    }

    /* ------------------------------
     * OBSERVING
     * ------------------------------ */
    if (this.lifecycle === UiAdapterLifecycle.MAPPED) {
      this.observeMutations();
      this.transitionTo(UiAdapterLifecycle.OBSERVING);
    }

    /* ------------------------------
     * Shell coordination
     * ------------------------------ */
    if (this.lifecycle >= UiAdapterLifecycle.OBSERVING) {
      this.setPhase(
        UiAdapterPhase.CONTROLLER_READY,
        "Material adapter controller ready"
      );
      this.markDomStable("Initial Material mapping completed");
    }

    this.log("info", "lifecycle:activate:end", "Material adapter activated", {
      lifecycle: this.lifecycle,
    });
  }

  protected override async onDeactivate(): Promise<void> {
    this.log(
      "info",
      "lifecycle:deactivate:start",
      "Material adapter deactivating"
    );

    if (this.observer) {
      try {
        this.observer.disconnect();
      } catch {}
      this.observer = null;
    }

    try {
      document.documentElement.removeAttribute("data-md-theme");
    } catch {}

    try {
      this.mdcInstances.forEach((inst) => inst.destroy?.());
      this.mdcInstances.clear();
    } catch {}

    this.descriptor = null;
    this.appliedSet = new WeakSet();

    this.transitionTo(UiAdapterLifecycle.CREATED);

    this.log(
      "info",
      "lifecycle:deactivate:end",
      "Material adapter deactivated"
    );
  }

  /* ======================================================================
   * THEME
   * ====================================================================== */

  protected override onApplyTheme(theme: UiThemeDescriptor): void {
    // Migration-safe: do not hard-fail lifecycle yet
    if (this.lifecycle < UiAdapterLifecycle.ACTIVATED) {
      this.logger.warn(
        `[UI-ADAPTER:${this.adapterId}] applyTheme skipped – adapter not activated`,
        { lifecycle: this.lifecycle }
      );
      return;
    }

    if (!theme) return;

    const mode = theme.mode || (theme.id === "dark" ? "dark" : "light");

    document.documentElement.setAttribute(
      "data-md-theme",
      mode === "dark" ? "dark" : "light"
    );

    this.transitionTo(UiAdapterLifecycle.THEMED);

    this.logger.debug(`[UI-ADAPTER:${this.adapterId}] applyTheme:done`, {
      mode,
    });
  }

  // public setMeta(meta: UiAdapterMeta): void {
  //   this.meta = meta;
  // }

  // ---------------------------------------------------------------------------
  // Activation / Deactivation
  // ---------------------------------------------------------------------------
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    diag_css("[MaterialDesignAdapter] activate() START", {
      id: descriptor?.id,
    });
    this.descriptor = descriptor || null;

    if (!descriptor?.conceptMappings) {
      console.warn(
        "[MaterialDesignAdapter] descriptor.conceptMappings missing!"
      );
    } else {
      console.log(
        "%c[MaterialDesignAdapter] Loaded conceptMappings:",
        "color:#0ff",
        descriptor.conceptMappings
      );
    }

    // initial mapping
    this.mapAll();

    // observe DOM for new fields
    this.observeMutations();

    diag_css("[MaterialDesignAdapter] activate() COMPLETE", {
      active: descriptor?.id,
    });
  }

  async deactivate(): Promise<void> {
    diag_css("[MaterialDesignAdapter] deactivate() START");
    try {
      document.documentElement.removeAttribute("data-md-theme");
    } catch {}
    if (this.observer) {
      try {
        this.observer.disconnect();
      } catch {}
      this.observer = null;
    }
    this.descriptor = null;
    this.appliedSet = new WeakSet();
    // destroy MDC instances if any (best-effort)
    try {
      this.mdcInstances.forEach((inst: any) => {
        try {
          inst.destroy?.();
        } catch {}
      });
      this.mdcInstances.clear();
    } catch {}
    diag_css("[MaterialDesignAdapter] deactivate() COMPLETE");
  }

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------
  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    diag_css("[MaterialDesignAdapter] applyTheme()", { themeDescriptorOrId });
    try {
      if (!themeDescriptorOrId) {
        console.warn("[MaterialDesignAdapter] applyTheme ignored (null theme)");
        return;
      }
      let mode: string | undefined;
      if (typeof themeDescriptorOrId === "string")
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      else if (typeof themeDescriptorOrId === "object")
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      document.documentElement.setAttribute(
        "data-md-theme",
        mode === "dark" ? "dark" : "light"
      );
      diag_css("[MaterialDesignAdapter] applied Material theme", { mode });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] applyTheme error", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Concept mapping helpers
  // ---------------------------------------------------------------------------
  private getMapping(concept: string): Mapping {
    const mapping =
      (this.descriptor &&
        this.descriptor.conceptMappings &&
        (this.descriptor.conceptMappings as any)[concept]) ||
      undefined;
    console.log(
      `%c[MaterialDesignAdapter] getMapping('${concept}') =`,
      "color:#9f9",
      mapping
    );
    return mapping;
  }

  private applyMappingToElement(el: HTMLElement, mapping?: Mapping) {
    if (!mapping) return;
    if (this.appliedSet.has(el)) {
      if (mapping.attrs)
        Object.entries(mapping.attrs).forEach(([k, v]) =>
          el.setAttribute(k, v)
        );
      return;
    }

    console.log(
      "%c[MaterialDesignAdapter] Applying mapping to element:",
      "color:#7ff;",
      { tag: el.tagName, mapping }
    );
    if (mapping.class)
      mapping.class.split(/\s+/).forEach((c) => c && el.classList.add(c));
    if (mapping.attrs)
      Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    this.appliedSet.add(el);
  }

  private prepareMdcDom(field: HTMLElement): HTMLElement | null {
    if (!field) return null;
    if (field.dataset.mdTransformed === "1") {
      const existing = field.querySelector<HTMLElement>(
        ".mdc-text-field, .cd-md-select-wrapper, .cd-md-text-field, .mdc-select"
      );
      return existing || null;
    }

    // find control and label
    const control = field.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");
    const labelEl = field.querySelector<HTMLLabelElement>("label");

    if (!control) {
      console.warn(
        "[prepareMdcDom] no input/textarea/select inside field — skipping",
        { field }
      );
      return null;
    }

    const labelText = (
      labelEl?.textContent?.trim() ||
      control.getAttribute("placeholder") ||
      control.name ||
      ""
    ).trim();

    // remove placeholder (floating label used instead)
    try {
      if ("placeholder" in control) control.placeholder = "";
    } catch {}

    // ensure id on native control
    if (!control.id)
      control.id = `mdc-${Math.random().toString(36).slice(2, 8)}`;

    const tag = (control.tagName || "").toUpperCase();

    // --------------- INPUT / TEXTAREA ----------------
    if (tag === "INPUT" || tag === "TEXTAREA") {
      const wrapper = document.createElement("label");
      wrapper.className =
        "mdc-text-field mdc-text-field--filled cd-md-text-field";

      const ripple = document.createElement("span");
      ripple.className = "mdc-text-field__ripple";

      const floatingLabel = document.createElement("span");
      floatingLabel.className = "mdc-floating-label";
      floatingLabel.setAttribute("for", control.id);
      floatingLabel.textContent = labelText || "";

      control.classList.add("mdc-text-field__input");

      const lineRipple = document.createElement("span");
      lineRipple.className = "mdc-line-ripple";

      wrapper.appendChild(ripple);
      wrapper.appendChild(floatingLabel);
      wrapper.appendChild(control);
      wrapper.appendChild(lineRipple);

      try {
        field.replaceWith(wrapper);
        wrapper.dataset.mdTransformed = "1";
      } catch (err) {
        console.warn("[prepareMdcDom] replaceWith failed (input)", err, {
          field,
          wrapper,
        });
        return null;
      }

      return wrapper;
    }

    // --------------- SELECT (Model-A: MDC Select structure) ----------------
    else if (tag === "SELECT") {
      const nativeSelect = control as HTMLSelectElement;

      // --- NEW: remove default placeholder option ("") to avoid double text conflict ---
      let placeholderText = "";
      if (
        nativeSelect.options.length > 0 &&
        nativeSelect.options[0].value === ""
      ) {
        placeholderText = nativeSelect.options[0].text || "";
        nativeSelect.remove(0);
      }

      // Build root wrapper with MDC-select class
      const wrapper = document.createElement("div");
      wrapper.className = "mdc-select mdc-select--filled cd-md-select-wrapper";
      wrapper.setAttribute("role", "listbox");

      // Hide native select
      nativeSelect.style.display = "none";
      nativeSelect.classList.remove("mdc-text-field__input");
      wrapper.appendChild(nativeSelect);

      // Anchor (trigger)
      const anchor = document.createElement("div");
      anchor.className = "mdc-select__anchor";
      anchor.setAttribute("role", "button");
      anchor.setAttribute("aria-haspopup", "listbox");
      anchor.setAttribute("aria-expanded", "false");
      anchor.setAttribute(
        "aria-labelledby",
        `${control.id}-label ${control.id}-selected-text`
      );
      anchor.tabIndex = 0;

      // ripple
      const ripple = document.createElement("span");
      ripple.className = "mdc-select__ripple";
      anchor.appendChild(ripple);

      // floating label (acts as the true placeholder)
      const floatingLabel = document.createElement("span");
      floatingLabel.className = "mdc-floating-label";
      floatingLabel.id = `${control.id}-label`;
      floatingLabel.textContent = labelText || placeholderText;
      anchor.appendChild(floatingLabel);

      // selected text (EMPTY because user has not selected anything yet)
      const selectedContainer = document.createElement("span");
      selectedContainer.className = "mdc-select__selected-text-container";
      const selectedText = document.createElement("span");
      selectedText.className = "mdc-select__selected-text";
      selectedText.id = `${control.id}-selected-text`;
      selectedText.textContent = ""; // <-- NEW: always empty initially
      selectedContainer.appendChild(selectedText);
      anchor.appendChild(selectedContainer);

      // dropdown icon
      const dropdownIcon = document.createElement("span");
      dropdownIcon.className = "mdc-select__dropdown-icon";
      dropdownIcon.innerHTML = `
      <svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5" focusable="false">
        <polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon>
        <polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon>
      </svg>`;
      anchor.appendChild(dropdownIcon);

      // line ripple
      const lineRipple = document.createElement("span");
      lineRipple.className = "mdc-line-ripple";
      anchor.appendChild(lineRipple);

      wrapper.appendChild(anchor);

      // menu surface
      const menu = document.createElement("div");
      menu.className =
        "mdc-select__menu mdc-menu mdc-menu-surface cd-md-select-menu";
      menu.setAttribute("role", "presentation");
      menu.setAttribute("aria-hidden", "true");

      const list = document.createElement("ul");
      list.className = "mdc-list";
      list.setAttribute("role", "listbox");
      list.setAttribute("tabindex", "-1");

      // Populate options AFTER removing placeholder
      Array.from(nativeSelect.options).forEach((opt, idx) => {
        const li = document.createElement("li");
        li.className = "mdc-list-item";
        li.setAttribute("role", "option");
        li.setAttribute("data-value", opt.value);
        li.setAttribute("data-index", String(idx));
        li.tabIndex = -1;

        const rippleSpan = document.createElement("span");
        rippleSpan.className = "mdc-list-item__ripple";

        const textSpan = document.createElement("span");
        textSpan.className = "mdc-list-item__text";
        textSpan.textContent = opt.text;

        li.appendChild(rippleSpan);
        li.appendChild(textSpan);

        list.appendChild(li);
      });

      menu.appendChild(list);
      wrapper.appendChild(menu);

      try {
        field.replaceWith(wrapper);
        wrapper.dataset.mdTransformed = "1";
      } catch (err) {
        console.warn("[prepareMdcDom] replaceWith failed (select)", err, {
          field,
          wrapper,
        });
        return null;
      }

      // store references
      (wrapper as any).__cd_native_select = nativeSelect;
      (wrapper as any).__cd_anchor = anchor;
      (wrapper as any).__cd_selected_text = selectedText;
      (wrapper as any).__cd_menu_el = menu;

      return wrapper;
    } else {
      console.warn("[prepareMdcDom] unknown control tag — skipping", {
        tag,
        field,
      });
      return null;
    }
  }

  // CSS fallback handlers for focus/blur if MDC not available (text fields)
  private attachCssFallback(wrapper: HTMLElement) {
    try {
      const inputEl = wrapper.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");
      if (!inputEl) return;

      // If a native value exists keep label floated
      if (
        (inputEl as HTMLInputElement).value &&
        (inputEl as HTMLInputElement).value.length > 0
      ) {
        wrapper.classList.add("mdc-text-field--focused");
      }

      if (!(inputEl as any).__cd_md_handlers_attached) {
        inputEl.addEventListener("focus", () =>
          wrapper.classList.add("mdc-text-field--focused")
        );
        inputEl.addEventListener("blur", () => {
          if (
            !(inputEl as HTMLInputElement).value ||
            (inputEl as HTMLInputElement).value.length === 0
          ) {
            wrapper.classList.remove("mdc-text-field--focused");
          }
        });
        (inputEl as any).__cd_md_handlers_attached = true;
      }
    } catch (err) {
      console.warn("[attachCssFallback] error", err);
    }
  }

  // ---------------------------------------------------------------------------
  // MDC initialization (UMD)
  // - Uses window.mdc.* families (textField, menu)
  // ---------------------------------------------------------------------------
  private initMdcTextField(wrapper: HTMLElement) {
    if (!wrapper) return;
    try {
      const mdcGlobal = (window as any).mdc;
      // ensure it's a text-field wrapper (label.mdc-text-field)
      if (!wrapper.classList.contains("mdc-text-field")) return;

      // avoid double-init
      if ((wrapper as any).__cd_mdc_initialized) return;

      if (
        !mdcGlobal ||
        !mdcGlobal.textField ||
        !mdcGlobal.textField.MDCTextField
      ) {
        // MDC textfield not present — attach css fallback handlers
        this.attachCssFallback(wrapper);
        return;
      }

      // Guard: ensure control has .value & validity (MDCTextField expects native input)
      const native = wrapper.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(".mdc-text-field__input");
      if (!native) {
        this.attachCssFallback(wrapper);
        return;
      }

      // Some MDC versions access native.validity — ensure element supports it
      const isStandardInput =
        typeof (native as HTMLInputElement).validity !== "undefined";
      if (!isStandardInput) {
        // don't attempt MDCTextField init if native doesn't support validity
        this.attachCssFallback(wrapper);
        return;
      }

      try {
        const inst = new mdcGlobal.textField.MDCTextField(wrapper);
        this.mdcInstances.add(inst);
        (wrapper as any).__cd_mdc_initialized = true;
        console.debug("[MaterialDesignAdapter] MDCTextField constructed", {
          wrapper,
          inst,
        });
      } catch (err) {
        console.warn(
          "[MaterialDesignAdapter] MDCTextField construction failed — falling back to CSS handlers",
          err
        );
        (wrapper as any).__cd_mdc_initialized = false;
        this.attachCssFallback(wrapper);
      }
    } catch (err) {
      console.error("[MaterialDesignAdapter] initMdcTextField fatal", err);
      this.attachCssFallback(wrapper);
    }
  }

  private initMdcSelect(wrapper: HTMLElement) {
    if (!wrapper) return;
    try {
      if ((wrapper as any).__cd_select_initialized) return;

      const mdcGlobal = (window as any).mdc;
      const nativeSelect = (wrapper as any)
        .__cd_native_select as HTMLSelectElement;
      const anchor = (wrapper as any).__cd_anchor as HTMLElement;
      const selectedText = (wrapper as any).__cd_selected_text as HTMLElement;
      const menuEl = (wrapper as any).__cd_menu_el as HTMLElement;

      if (!nativeSelect || !anchor || !menuEl) {
        this.initMdcSelectFallback(wrapper);
        (wrapper as any).__cd_select_initialized = true;
        return;
      }

      // Clean initial selected text (no default pre-selected UI text)
      selectedText.textContent = "";

      // preferred MDCSelect
      if (mdcGlobal && mdcGlobal.select && mdcGlobal.select.MDCSelect) {
        try {
          const selectInst = new mdcGlobal.select.MDCSelect(wrapper);
          this.mdcInstances.add(selectInst);
          (wrapper as any).__cd_mdc_select_inst = selectInst;

          // ensure no default is selected
          if (
            selectInst.selectedIndex === 0 &&
            nativeSelect.selectedIndex > -1
          ) {
            selectInst.selectedIndex = -1;
          }

          selectInst.listen("MDCSelect:change", () => {
            try {
              const idx = selectInst.selectedIndex;

              nativeSelect.selectedIndex = idx;

              const ev = new Event("change", { bubbles: true });
              nativeSelect.dispatchEvent(ev);

              selectedText.textContent =
                selectInst.selectedText ||
                nativeSelect.options[idx]?.text ||
                "";
            } catch (err) {
              console.warn(
                "[MaterialDesignAdapter] MDCSelect change error",
                err
              );
            }
          });

          nativeSelect.addEventListener("change", () => {
            const idx = nativeSelect.selectedIndex;
            selectedText.textContent = nativeSelect.options[idx]?.text || "";
          });

          (wrapper as any).__cd_select_initialized = true;
          return;
        } catch (err) {
          console.warn("[MaterialDesignAdapter] MDCSelect init failed", err);
        }
      }

      // fallback: MDCMenu
      if (mdcGlobal && mdcGlobal.menu && mdcGlobal.menu.MDCMenu) {
        try {
          const menuInst = new mdcGlobal.menu.MDCMenu(menuEl);
          (menuEl as any).__cd_mdc_menu_inst = menuInst;
          this.mdcInstances.add(menuInst);

          anchor.addEventListener("click", () => {
            menuInst.open = !menuInst.open;
          });

          menuEl.querySelectorAll(".mdc-list-item").forEach((li) => {
            li.addEventListener("click", () => {
              const idx = Number(li.getAttribute("data-index"));
              nativeSelect.selectedIndex = idx;

              const ev = new Event("change", { bubbles: true });
              nativeSelect.dispatchEvent(ev);

              selectedText.textContent = nativeSelect.options[idx]?.text || "";
              menuInst.open = false;
            });
          });

          (wrapper as any).__cd_select_initialized = true;
          return;
        } catch (err) {
          console.warn("[MaterialDesignAdapter] MDCMenu fallback failed", err);
        }
      }

      // last fallback
      this.initMdcSelectFallback(wrapper);
      (wrapper as any).__cd_select_initialized = true;
    } catch (err) {
      console.warn("[MaterialDesignAdapter] initMdcSelect fatal", err);
      this.initMdcSelectFallback(wrapper);
      (wrapper as any).__cd_select_initialized = true;
    }
  }

  // Plain JS fallback for select/menu behaviour (when MDC not loaded)
  private initMdcSelectFallback(wrapper: HTMLElement) {
    try {
      if ((wrapper as any).__cd_select_fallback_attached) return;
      const menuEl = (wrapper as any).__cd_menu_el as HTMLElement;
      const trigger = (wrapper as any).__cd_trigger as HTMLButtonElement;
      const nativeSelect = (wrapper as any)
        .__cd_native_select as HTMLSelectElement;
      const triggerLabel = (wrapper as any).__cd_trigger_label as HTMLElement;
      if (!menuEl || !trigger || !nativeSelect) return;

      let open = false;
      const openMenu = () => {
        menuEl.style.display = "block";
        trigger.setAttribute("aria-expanded", "true");
        open = true;
      };
      const closeMenu = () => {
        menuEl.style.display = "none";
        trigger.setAttribute("aria-expanded", "false");
        open = false;
      };
      menuEl.style.display = "none";
      // toggle
      trigger.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (open) closeMenu();
        else openMenu();
      });
      // click outside closes
      document.addEventListener("click", (ev) => {
        if (!wrapper.contains(ev.target as Node)) closeMenu();
      });
      // sync native select -> trigger label
      nativeSelect.addEventListener("change", () => {
        const selOpt = nativeSelect.options[nativeSelect.selectedIndex];
        triggerLabel.textContent = selOpt ? selOpt.text : "";
      });

      (wrapper as any).__cd_select_fallback_attached = true;
      console.debug("[MaterialDesignAdapter] JS fallback select/menu attached");
    } catch (err) {
      console.warn("[MaterialDesignAdapter] initMdcSelectFallback error", err);
    }
  }

  private scheduleMdcInit() {
    if (this.mdcInitQueued) return;
    this.mdcInitQueued = true;
    setTimeout(() => {
      this.mdcInitQueued = false;
      // initialize all wrappers in page
      document
        .querySelectorAll<HTMLElement>(
          ".cd-md-text-field, .cd-md-select-wrapper, .mdc-select"
        )
        .forEach((el) => {
          // text fields
          if (el.classList.contains("mdc-text-field")) {
            if (!(el as any).__cd_mdc_initialized) this.initMdcTextField(el);
          } else if (
            el.classList.contains("cd-md-select-wrapper") ||
            el.classList.contains("mdc-select")
          ) {
            if (!(el as any).__cd_select_initialized) this.initMdcSelect(el);
          }
        });
    }, 40);
  }

  // ---------------------------------------------------------------------------
  // Mapping passes
  // ---------------------------------------------------------------------------
  private mapButtons() {
    const mapping = this.getMapping("button");
    if (!mapping) return;
    const selector = "button[cdButton], button.cd-button";
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    diag_css("[MaterialDesignAdapter] mapButtons()", { count: nodes.length });
    nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
  }

  /**
   * mapInputs()
   * - Finds `.cd-form-field` containers
   * - Transforms them into MDC wrappers (label.mdc-text-field) or Model-A select wrappers
   * - Initializes MDC (or applies CSS/JS fallback)
   */
  private mapInputs() {
    const mapping = this.getMapping("input");
    if (!mapping) return;

    const formFieldNodes = Array.from(
      document.querySelectorAll<HTMLElement>(".cd-form-field")
    );
    diag_css("[MaterialDesignAdapter] mapInputs()", {
      candidates: formFieldNodes.length,
    });

    formFieldNodes.forEach((field, idx) => {
      try {
        console.debug(`[MaterialDesignAdapter] mapInputs: FIELD #${idx}`, {
          field,
        });

        // Transform DOM
        const wrapper = this.prepareMdcDom(field);

        if (!wrapper) {
          console.debug(
            "[MaterialDesignAdapter] mapInputs: prepareMdcDom returned null (skipping)"
          );
          return;
        }

        // Apply mapping.attrs (if any) — apply to wrapper to allow descriptor overrides
        if (mapping.attrs)
          Object.entries(mapping.attrs).forEach(([k, v]) =>
            wrapper.setAttribute(k, v as string)
          );

        // Mark as applied
        this.appliedSet.add(wrapper);

        // Initialize appropriate MDC bits depending on wrapper type
        if (wrapper.classList.contains("mdc-text-field")) {
          this.initMdcTextField(wrapper);
        } else if (wrapper.classList.contains("cd-md-select-wrapper")) {
          this.initMdcSelect(wrapper);
        }

        // schedule a global init pass to catch any wrappers that might have been missed
        this.scheduleMdcInit();

        console.debug(
          "[MaterialDesignAdapter] mapInputs: transformed wrapper ",
          { wrapper }
        );
      } catch (err) {
        console.warn("[MaterialDesignAdapter] mapInputs error", err);
      }
    });
  }

  // Inside material-design-adapter.service.ts

  private mapTabs() {
    const tabsContainers = document.querySelectorAll<HTMLElement>("cd-tabs");

    tabsContainers.forEach((container) => {
      if (this.appliedSet.has(container)) return;

      const activeTabId = container.getAttribute("active-tab");
      const cdTabs = Array.from(
        container.querySelectorAll<HTMLElement>("cd-tab")
      );
      const tabsId =
        container.id || `tabs-${Math.random().toString(36).slice(2, 5)}`;

      // 1. Build the MDC M2 Shell
      const tabBar = document.createElement("div");
      tabBar.className = "mdc-tab-bar";
      tabBar.setAttribute("role", "tablist");

      const scroller = document.createElement("div");
      scroller.className = "mdc-tab-scroller";

      const scrollArea = document.createElement("div");
      scrollArea.className = "mdc-tab-scroller__scroll-area";

      const scrollContent = document.createElement("div");
      scrollContent.className = "mdc-tab-scroller__scroll-content";

      const contentWrapper = document.createElement("div");
      contentWrapper.className = "cd-md-tabs-content mt-3";

      // 2. Process child <cd-tab> elements
      cdTabs.forEach((tab, index) => {
        const tabId = tab.id || `${tabsId}-t-${index}`;
        const label = tab.getAttribute("label") || "Tab";
        const isActive =
          tab.id === activeTabId || (!activeTabId && index === 0);

        // Create the Button (Force type="button" to prevent SPA reloads)
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `mdc-tab ${isActive ? "mdc-tab--active" : ""}`;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.id = `${tabId}-btn`;

        // Inner structure for MDC effects
        btn.innerHTML = `
        <span class="mdc-tab__content">
          <span class="mdc-tab__text-label">${label}</span>
        </span>
        <span class="mdc-tab-indicator ${isActive ? "mdc-tab-indicator--active" : ""}">
          <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
        </span>
        <span class="mdc-tab__ripple"></span>
      `;

        // Create the Content Pane
        const pane = document.createElement("div");
        pane.id = `${tabId}-pane`;
        pane.style.display = isActive ? "block" : "none";
        pane.innerHTML = tab.innerHTML;
        contentWrapper.appendChild(pane);

        // 3. SPA-Friendly Click Handler
        btn.addEventListener("click", (e) => {
          e.preventDefault(); // Safety check

          // Deactivate all buttons in this bar
          scrollContent.querySelectorAll(".mdc-tab").forEach((b) => {
            b.classList.remove("mdc-tab--active");
            b.querySelector(".mdc-tab-indicator")?.classList.remove(
              "mdc-tab-indicator--active"
            );
          });

          // Activate clicked button
          btn.classList.add("mdc-tab--active");
          btn
            .querySelector(".mdc-tab-indicator")
            ?.classList.add("mdc-tab-indicator--active");

          // Toggle Panes
          Array.from(contentWrapper.children).forEach(
            (p: any) => (p.style.display = "none")
          );
          pane.style.display = "block";

          console.log(`[MaterialAdapter] Switched to tab: ${label}`);
        });

        scrollContent.appendChild(btn);
      });

      // Final Assembly
      scrollArea.appendChild(scrollContent);
      scroller.appendChild(scrollArea);
      tabBar.appendChild(scroller);

      const fragment = document.createDocumentFragment();
      fragment.appendChild(tabBar);
      fragment.appendChild(contentWrapper);

      container.replaceWith(fragment);
      this.appliedSet.add(tabBar as any);
    });
  }

  private mapFormGroups() {
    const mapping = this.getMapping("formGroup");
    if (!mapping) return;
    const selector = ".cd-form-field";
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    diag_css("[MaterialDesignAdapter] mapFormGroups()", {
      count: nodes.length,
    });
    nodes.forEach((el) => {
      this.applyMappingToElement(el, mapping);
      try {
        this.prepareMdcDom(el);
      } catch {}
    });
  }

  private mapOtherConcepts() {
    const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
    const concepts = Object.keys(cm).filter(
      (c) => !["button", "input", "formGroup"].includes(c)
    );
    diag_css("[MaterialDesignAdapter] mapOtherConcepts()", { concepts });
    concepts.forEach((concept) => {
      const mapping = (cm as any)[concept];
      const selector = `[data-cd-${concept}], .cd-${concept}`;
      const nodes = document.querySelectorAll<HTMLElement>(selector);
      nodes.forEach((el) => {
        this.applyMappingToElement(el, mapping);
        try {
          this.prepareMdcDom(el);
        } catch {}
      });
    });
  }

  private _mutationCallback?: () => void;

  onMutation(cb: () => void) {
    this._mutationCallback = cb;
  }

  // master mapping pass
  private mapAll() {
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — START",
      "background:#223;color:#9cf;padding:2px"
    );
    try {
      this._mutationCallback?.();
      this.mapButtons();
      this.mapInputs();
      this.mapFormGroups();
      this.mapTabs();
      this.mapOtherConcepts();
      this.scheduleMdcInit();
    } catch (err) {
      console.warn("[MaterialDesignAdapter] mapAll error", err);
    }
    console.log(
      "%c[MaterialDesignAdapter] mapAll() — END",
      "background:#223;color:#9cf;padding:2px"
    );
  }

  // ---------------------------------------------------------------------------
  // DOM observer
  // ---------------------------------------------------------------------------
  private observeMutations() {
    if (this.observer) return;
    this._mutationCallback?.();
    diag_css("[MaterialDesignAdapter] MutationObserver ATTACH");
    this.observer = new MutationObserver((mutations) => {
      // lightweight debounce: schedule mapAll on idle
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => this.mapAll());
      } else {
        setTimeout(() => this.mapAll(), 24);
      }
    });
    try {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (err) {
      console.warn("[MaterialDesignAdapter] observer failed to attach", err);
      this.observer = null;
    }
  }
}

// Self-register with the adapter registry
UiSystemAdapterRegistry.register(
  "material-design",
  new MaterialDesignAdapterService()
);

```

/////////////////////////////////////////
Below are the logs when the menu item, "consumer-consumer-resource2" is clicked.
I have also shared the codes for consumer-resource2.controller.js.
On the line:
this.resolvedShellConfig = this.sysCache.get("shellConfig") || {};
we are trying to get the data that is used to fill the contents of the interface.
We initially need to just confirm the data is available before we start coding for it.
The page is loading and rendering as expected. But the expected data seem elusive.
Check the logs and see if you can be able to tell what is working so far and what is not.  

```log
Menu clicked → ID: menu-item-consumer-consumer-resource2, Label: consumer-resource2 index-BVWrIoRi.js:31:12270
MenuService:onMenuClick()/item: { label: 'consumer-resource2',
  itemType: 'route',
  route: 'sys/moduleman/consumer-resource2',
  template: [Function],
  controller: 
   { form: null,
     binder: null,
     svConfig: null,
     sysCache: null,
     resolvedShellConfig: null,
     __init: [Function: __init],
     __setup: [Function: __setup],
     __activate: [Function: __activate],
     __afterInit: [Function: __afterInit],
     __deactivate: [Function: __deactivate],
     __template: [Function: __template],
     onSave: [Function: onSave] },
  moduleId: 'moduleman-consumer-resource',
  menuId: 'menu-item-consumer-consumer-resource2' } index-BVWrIoRi.js:31:12337
[MenuService] Loading route content for 'consumer-resource2' index-BVWrIoRi.js:31:12574
MenuService::loadResource()/start... index-BVWrIoRi.js:31:13302
[MenuService][loadResource] options: 
Object { cdToken: undefined, item: {…} }
index-BVWrIoRi.js:31:13354
[ControllerCacheService][getInstance] start... index-BVWrIoRi.js:22:6771
MenuService::loadResource()/01: Executing __deactivate() on active controller index-BVWrIoRi.js:31:13683
[ctlSignIn][__deactivate] 01 index-BEx0eJtE.js:28:436
[Binder] Unbinding 4 listeners cd-directive-binder.service-DGbLY5eG.js:1:2830
[Binder] Fired event: cd:form:unbound cd-directive-binder.service-DGbLY5eG.js:1:3255
MenuService::loadResource()/02: Retrieving controller via cache service index-BVWrIoRi.js:31:13820
[ControllerCacheService][getOrInitializeController] start... index-BVWrIoRi.js:22:6919
[ControllerCacheService] Creating new instance for: sys/moduleman/consumer-resource2 index-BVWrIoRi.js:22:7103
[ctlConsumerResource][__init] index-Bnr4zB_U.js:49:463
CdFormGroup::_constructor()/01 cd-directive-binder.service-DGbLY5eG.js:1:46
CdDirectiveBinderService::constructor()/start cd-directive-binder.service-DGbLY5eG.js:1:1416
[Binder] UI-System set to: bootstrap-538 (via window.CD_ACTIVE_UISYSTEM) cd-directive-binder.service-DGbLY5eG.js:1:1622
[ctlConsumerResource][__setup] index-Bnr4zB_U.js:49:820
[SHELL] [DEBUG] [SysCacheService.loadAndCacheAll()] start index-BVWrIoRi.js:48:1853
[ControllerCacheService] Initialization failed for 'sys/moduleman/consumer-resource2'. Error: SysCacheService: loaders must be set before load.
    loadAndCacheAll http://localhost:5173/assets/index-BVWrIoRi.js:48
    ensureReady http://localhost:5173/assets/index-BVWrIoRi.js:48
    __setup http://localhost:5173/assets/index-Bnr4zB_U.js:49
    getOrInitializeController http://localhost:5173/assets/index-BVWrIoRi.js:22
    loadResource http://localhost:5173/assets/index-BVWrIoRi.js:31
    onMenuClick http://localhost:5173/assets/index-BVWrIoRi.js:31
    attachClickHandlers http://localhost:5173/assets/index-BVWrIoRi.js:31
index-BVWrIoRi.js:22:7661
[ControllerCacheService] Cached instance for sys/moduleman/consumer-resource2 index-BVWrIoRi.js:22:7762
[MenuService] Waiting for controller services to initialize... attempt 1 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 2 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 3 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 4 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 5 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 6 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 7 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 8 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 9 index-BVWrIoRi.js:31:14143
[MenuService] Waiting for controller services to initialize... attempt 10 index-BVWrIoRi.js:31:14143
MenuService::loadResource()/03: Injecting template into DOM index-BVWrIoRi.js:31:14286
MenuService::loadResource()/04: Executing __activate() index-BVWrIoRi.js:31:14541
[ctlConsumerResource][__activate] index-Bnr4zB_U.js:49:1071
[CdDirectiveBinderService][bindToDom] start cd-directive-binder.service-DGbLY5eG.js:1:1735
[Binder] Fired event: cd:form:bound cd-directive-binder.service-DGbLY5eG.js:1:3255
MenuService::loadResource()/05: Executing __afterInit() index-BVWrIoRi.js:31:14668
[ctlConsumerResource][__afterInit] index-Bnr4zB_U.js:49:1219
[ctlConsumerResource] resolvedShellConfig: null index-Bnr4zB_U.js:49:1302
MenuService::loadResource()/end index-BVWrIoRi.js:31:14786
[MI] [INFO] [UI-ADAPTER:bootstrap-538] map:concept [Bootstrap538Adapter] mapTabs() undefined index-BVWrIoRi.js:48:1894
[MI] [INFO] [UI-ADAPTER:bootstrap-538] map:concept [Bootstrap538Adapter] mapTabs() undefined 46967 index-BVWrIoRi.js:48:1894
```

```js
// src/CdShell/sys/moduleman/view/consumer-resource2.controller.js
export const ctlConsumerResource2 = {
  form: null,
  binder: null,
  svConfig: null,
  sysCache: null,

  resolvedShellConfig: null,

  // ----------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------

  async __init() {
    console.log("[ctlConsumerResource][__init]");

    this.svConfig = new ConfigService();
    this.sysCache = SysCacheService.getInstance(this.svConfig);

    this.form = new CdFormGroup({
      appName: new CdFormControl("", [
        CdValidators.required("App name is required"),
      ]),

      logLevel: new CdFormControl("info"),

      splashEnabled: new CdFormControl(false),
      splashPath: new CdFormControl(""),
      splashMinDuration: new CdFormControl(1000),
    });

    this.binder = new CdDirectiveBinderService(
      this.form,
      "#consumerShellConfigForm",
      this
    );
  },

  async __setup() {
    console.log("[ctlConsumerResource][__setup]");
    await this.sysCache.ensureReady();

    // resolved view (system → consumer → user)
    this.resolvedShellConfig = this.sysCache.get("shellConfig") || {};
    console.log("[ctlConsumerResource] resolvedShellConfig:", this.resolvedShellConfig);
  },

  async __activate() {
    console.log("[ctlConsumerResource][__activate]");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlConsumerResource][__afterInit]");

    const cfg = this.resolvedShellConfig;
    console.log("[ctlConsumerResource] resolvedShellConfig:", cfg);
    if (!cfg) return;

    this.form.controls.appName.setValue(cfg.appName || "");
    this.form.controls.logLevel.setValue(cfg.logLevel || "info");

    this.form.controls.splashEnabled.setValue(cfg.splash?.enabled ?? false);
    this.form.controls.splashPath.setValue(cfg.splash?.path || "");
    this.form.controls.splashMinDuration.setValue(
      cfg.splash?.minDuration ?? 1000
    );

    if (this.binder?.refreshView) this.binder.refreshView();
  },

  __deactivate() {
    console.log("[ctlConsumerResource][__deactivate]");
    if (this.binder?.unbindAllDomEvents) this.binder.unbindAllDomEvents();
  },

  // ----------------------------------------------------------
  // Template
  // ----------------------------------------------------------

  __template() {
  return `
    <div class="cd-panel">
      <div class="cd-panel-header">
        <h2><i class="bi bi-gear-wide-connected"></i> Tenant Shell Administration</h2>
        <p class="text-muted">Manage corporate branding, UI enforcement policies, and user permissions.</p>
      </div>

      <form id="consumerShellConfigForm" class="cd-form">
        
        <cd-tabs id="shellConfigTabs" active-tab="tab-identity">
          
          <cd-tab id="tab-identity" icon="fingerprint" label="Identity">
            <div class="cd-section-box mt-3">
              <div class="cd-form-field">
                <label>Application Display Name</label>
                <input type="text" name="appName" cdFormControl placeholder="e.g. CorpDesk Enterprise" />
              </div>
              <div class="cd-form-field">
                <label>Application Description</label>
                <textarea name="appDescription" cdFormControl rows="2"></textarea>
              </div>
              <div class="cd-form-field mt-4">
                  <label class="fw-bold">Corporate Logo</label>
                  <p class="text-muted small">Update your organization's visual identity. Supported: PNG, JPG (Max 2MB).</p>
                  
                  <gvp-uploader 
                    name="tenantLogo" 
                    cdFormControl 
                    accept=".png,.jpg,.jpeg"
                    max-size="2048"
                    data-current-preview="${this.form?.controls?.tenantLogo?.value || 'http://localhost:5173/themes/default/logo.png'}">
                  </gvp-uploader>
                </div>
            </div>
          </cd-tab>

          <cd-tab id="tab-environment" icon="cpu" label="Environment">
            <div class="cd-section-box mt-3">
              <div class="cd-form-field">
                <label>Default Startup Module</label>
                <input type="text" name="defaultModulePath" cdFormControl placeholder="sys/dashboard" />
              </div>
              
              <div class="cd-grid col-2">
                <div class="cd-form-field">
                  <label>Log Verbosity</label>
                  <select name="logLevel" cdFormControl>
                    <option value="debug">Debug (Development)</option>
                    <option value="info">Info (Standard)</option>
                    <option value="warn">Warn (Production)</option>
                    <option value="error">Error (Critical Only)</option>
                  </select>
                </div>
                <div class="cd-form-field">
                  <label>Splash Duration (ms)</label>
                  <input type="number" name="splashMinDuration" cdFormControl />
                </div>
              </div>

              <div class="cd-form-field checkbox-group">
                <label>
                  <input type="checkbox" name="splashEnabled" cdFormControl />
                  Enable Animated Boot Sequence (Splash)
                </label>
              </div>
            </div>
          </cd-tab>

          <cd-tab id="tab-governance" icon="shield-lock" label="UI Governance">
            <div class="cd-section-box mt-3">
              <h5>Default Visual Experience</h5>
              <div class="cd-grid col-3">
                <div class="cd-form-field">
                  <label>System Adaptor</label>
                  <select name="defaultUiSystemId" cdFormControl>
                    <option value="bootstrap-538">Bootstrap 5</option>
                    <option value="material">Material Design</option>
                  </select>
                </div>
                <div class="cd-form-field">
                  <label>Corporate Theme</label>
                  <select name="defaultThemeId" cdFormControl>
                    <option value="default">Light (Default)</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
                <div class="cd-form-field">
                  <label>Form Style</label>
                  <select name="defaultFormVariant" cdFormControl>
                    <option value="standard">Standard</option>
                    <option value="outlined">Outlined</option>
                    <option value="filled">Filled</option>
                  </select>
                </div>
              </div>

              <h5 class="mt-4 text-danger">Enforced Policies (Locks)</h5>
              <div class="cd-policy-grid">
                <div class="cd-form-field">
                  <label><input type="checkbox" name="lockUiSystem" cdFormControl /> Lock UI Framework</label>
                </div>
                <div class="cd-form-field">
                  <label><input type="checkbox" name="lockTheme" cdFormControl /> Lock Corporate Theme</label>
                </div>
              </div>
            </div>
          </cd-tab>

          <cd-tab id="tab-personalization" icon="person-gear" label="Personalization">
            <div class="cd-section-box mt-3">
              <div class="cd-form-field">
                <label class="cd-switch">
                  <input type="checkbox" name="userPersonalizationAllowed" cdFormControl />
                  <span class="cd-slider"></span>
                  Allow Users to customize their own Theme/UI
                </label>
                <p class="text-small text-muted">If disabled, the "User Preferences" menu will be hidden for all non-admin users.</p>
              </div>
            </div>
          </cd-tab>

        </cd-tabs>

        <div class="cd-action-bar mt-4">
          <button cdButton class="btn-save" (click)="onSave()">
            <i class="bi bi-cloud-check"></i> Commit Tenant Configuration
          </button>
        </div>
        
      </form>
    </div>
  `;
},

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  async onSave() {
    console.log("[ctlConsumerResource][onSave]");

    const v = this.form.value;

    const patch = {
      appName: v.appName,
      logLevel: v.logLevel,
      splash: {
        enabled: v.splashEnabled,
        path: v.splashPath,
        minDuration: Number(v.splashMinDuration),
      },
      source: "consumer",
    };

    await this.svConfig.updateConsumerShellConfig(patch);

    console.log("[ctlConsumerResource] consumer shellConfig updated", patch);
  },
};

```

//////////////////////////////////////

Some clarification: The data from the back end had been successful when the application was launching(also during login, when specific data for given user is fetched and cached). It is then saved in the SysCacheService (which maintains the data during operations).
So when we clicked the menu item "consumer-resource2", the config data was expected to be available via SysCacheService.
I have shared the implementation of SysCacheService.

```ts
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";
import {
  // CacheKey,
  CacheListener,
  CacheMeta,
  SysCacheMap,
} from "../models/sys-cache.model";
import { LoggerService } from "../../../utils/logger.service";

export class SysCacheService {
  private logger = new LoggerService();
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map<string, Set<CacheListener<any>>>();

  private versionCounter = 0;

  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

  // ------------------------------------------------------------------
  // SINGLETON
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // CORE CACHE API (NEW)
  // ------------------------------------------------------------------
  // Legacy + typed set
  public set<T>(key: string, value: T, source?: CacheMeta["source"]): void;

  public set<K extends keyof SysCacheMap>(
    key: K,
    value: SysCacheMap[K],
    source?: CacheMeta["source"]
  ): void;

  // Implementation
  public set(
    key: string,
    value: any,
    source: CacheMeta["source"] = "runtime"
  ): void {
    const meta: CacheMeta = {
      source,
      version: ++this.versionCounter,
      timestamp: Date.now(),
    };

    this.cache.set(key, { value, meta });
    this.notify(key, value, meta);
  }

  public get(key: string): any | undefined;
  public get<K extends keyof SysCacheMap>(key: K): SysCacheMap[K] | undefined;

  public get(key: string): any | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }

  public getMeta(key: string): CacheMeta | undefined {
    const entry = this.cache.get(key);
    return entry?.meta;
  }

  public subscribe<T>(
    key: string,
    listener: CacheListener<T>,
    emitImmediately = true
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Late subscriber → immediate sync
    if (emitImmediately && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      listener(entry.value, entry.meta);
    }

    // Unsubscribe
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify<T>(key, value: T, meta: CacheMeta): void {
    this.listeners.get(key)?.forEach((listener) => listener(value, meta));
  }

  // ------------------------------------------------------------------
  // EXISTING LOAD PIPELINE (UNCHANGED BEHAVIOR)
  // ------------------------------------------------------------------
  public async loadAndCacheAll(): Promise<void> {
    this.logger.debug("[SysCacheService.loadAndCacheAll()] start");
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    // 🔑 PHASE-2 AWARE CONFIG RESOLUTION
    const shellConfig =
      this.get("shellConfig") ?? (await this.configService.loadConfig());

    const uiConfig = shellConfig.uiConfig || {};

    // Ensure canonical cache presence
    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", uiConfig, "static");

    // -------------------------------------------------
    // UI SYSTEMS (authoritative descriptors)
    // -------------------------------------------------
    const uiSystemsData =
      await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    this.cacheUiSystems(uiSystemsData, "static");

    // -------------------------------------------------
    // UI THEMES
    // -------------------------------------------------
    const uiThemesData =
      await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig, "static");

    console.log("[SysCacheService] Load complete");
  }

  // ------------------------------------------------------------------
  // BACKWARD-COMPAT GETTERS (NO BREAKING CHANGES)
  // ------------------------------------------------------------------
  public getUiSystems(): any[] {
    return this.get("uiSystems") || [];
  }

  public getThemes(): any[] {
    return this.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.get("uiConfigNormalized") || {};
  }

  public getEnvConfig(): any {
    return this.get("envConfig") || {};
  }

  public getConsumerGuid(): string | undefined {
    const env = this.getEnvConfig();
    return env?.consumerGuid || env?.clientContext?.consumerToken;
  }

  public getApiEndpoint(): string | undefined {
    return this.getEnvConfig()?.apiEndpoint;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) {
      await this.loadAndCacheAll();
    }
  }

  /**
   * Normalizes UI system descriptors to legacy-compatible shape
   * Required by UiSystemLoaderService.activate()
   */
  private normalizeUiSystemDescriptors(rawSystems: any[]): {
    simple: any[];
    full: any[];
  } {
    this.logger.debug("[SysCacheService.normalizeUiSystemDescriptors()] start");
    const fullDescriptors = rawSystems.map((sys: any) => ({
      id: sys.id,
      name: sys.name,
      version: sys.version,
      description: sys.description,

      cssUrl: sys.cssUrl,
      jsUrl: sys.jsUrl,
      assetPath: sys.assetPath,

      stylesheets: sys.stylesheets || [],
      scripts: sys.scripts || [],

      themesAvailable: sys.themesAvailable || [],
      themeActive: sys.themeActive || null,

      conceptMappings: sys.conceptMappings || {},
      directiveMap: sys.directiveMap || {},
      tokenMap: sys.tokenMap || {},

      containers: sys.containers || [],
      components: sys.components || [],
      renderRules: sys.renderRules || {},

      metadata: sys.metadata || {},
      extensions: sys.extensions || {},

      author: sys.author,
      license: sys.license,
      repository: sys.repository,

      displayName: sys.displayName || sys.name,
    }));

    const simpleSystems = fullDescriptors.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.displayName,
      themesAvailable: sys.themesAvailable,
    }));

    return {
      simple: simpleSystems,
      full: fullDescriptors,
    };
  }

  private cacheUiSystems(
    rawSystems: any[],
    source: CacheMeta["source"] = "static"
  ): void {
    this.logger.debug("[SysCacheService.cacheUiSystems()] start");
    const { simple, full } = this.normalizeUiSystemDescriptors(rawSystems);

    // 🔁 Legacy compatibility
    this.set("uiSystems", simple, source);
    this.set("uiSystemDescriptors", full, source);

    // 🔮 Optional future-facing unified key
    this.set("uiSystemsNormalized", { simple, full }, source);

    console.log("[SysCacheService] UI systems cached", {
      simpleCount: simple.length,
      fullCount: full.length,
      source,
    });
  }

  public hasConsumerContext(): boolean {
    return !!this.get("shellConfig:meta")?.hasConsumerProfile;
  }

  // ------------------------------------------------------------------
  // PHASE-2 RESOLUTION (CONSUMER / USER OVERRIDES)
  // ------------------------------------------------------------------
  public applyResolvedShellConfig(
    resolvedShellConfig: any,
    source: CacheMeta["source"] = "resolved"
  ): void {
    this.logger.debug("[SysCacheService.applyResolvedShellConfig()] start");
    this.logger.debug(
      "[SysCacheService.applyResolvedShellConfig()] resolvedShellConfig:",
      resolvedShellConfig
    );

    if (!resolvedShellConfig) return;

    const uiConfig = resolvedShellConfig.uiConfig || {};
    const envConfig = resolvedShellConfig.envConfig || {};

    // Override canonical keys
    this.set("shellConfig", resolvedShellConfig, source);
    this.set("uiConfig", uiConfig, source);
    this.set("envConfig", envConfig, source);

    // Optional normalized alias (used by loaders)
    this.set("uiConfigNormalized", uiConfig, source);

    // Metadata flag (used by hasConsumerContext)
    this.set(
      "shellConfig:meta",
      {
        hasConsumerProfile: true,
        appliedAt: Date.now(),
      },
      source
    );

    console.log("[SysCacheService] Resolved shell config applied", {
      defaultUiSystemId: uiConfig.defaultUiSystemId,
      defaultThemeId: uiConfig.defaultThemeId,
      source,
    });
  }

  public getUiSystemById(systemId: string): any | undefined {
    const systems = this.get("uiSystemDescriptors") || [];
    return systems.find((s: any) => s.id === systemId);
  }

  public getThemeById(themeId: string): any | undefined {
    const themes = this.get("themeDescriptors") || [];
    return themes.find((t: any) => t.id === themeId);
  }

  public resolveTheme(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getThemeById(input);
    return input;
  }

  public resolveUiSystem(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getUiSystemById(input);
    return input;
  }
}

```

///////////////////////////////////////////

Before you show me, let me share the Main.run() and its logs during the lauch so you can advise along what has been implemented and how it can be improved.

Main.run():
```ts
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
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

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
    const fx = await this.svUser.loginAnonUser(
      baseShellConfig.envConfig.clientContext.consumerToken
    );

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
    // STEP 1.5: Discover & register UI adapters (CRITICAL)
    //---------------------------------------
    this.logger.debug("[Main] Discovering UI system adapters");

    UiSystemAdapterDiscoveryService.discoverAndRegister();

    const adapters = UiSystemAdapterRegistry.list();
    this.logger.debug("[Main] UI adapters registered", adapters);

    if (!adapters.length) {
      throw new Error(
        "[BOOT] No UI adapters discovered. Check discovery paths."
      );
    }

    //---------------------------------------
    // STEP 2: Load STATIC cache (CRITICAL)
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded (static)");

    //---------------------------------------
    // PHASE 2: Promote ACL-resolved shell config
    //---------------------------------------
    this.resolvedShellConfig = await this.svConfig.promoteResolvedShellConfig(
      this.svSysCache,
      this.consumerProfile,
      this.userProfile
    );

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

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.svMenu.structMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.svUiSystemLoader.renderSidebar(
      this.svMenu,
      preparedMenu,
      shellConfig
    );

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.svController.loadDefaultController(
      this.svMenu,
      preparedMenu,
      defaultModule
    );

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
```

```log
[MI] [INFO] [UI-ADAPTER:bootstrap-538] map:concept [Bootstrap538Adapter] mapTabs() undefined 2 index-BVWrIoRi.js:48:1894
[MI] [INFO] [UI-ADAPTER:bootstrap-538] map:concept [Bootstrap538Adapter] mapTabs() undefined index-BVWrIoRi.js:48:1894
Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content. node.js:409:1
GET
http://localhost:5173/favicon.ico
[HTTP/1.1 404 Not Found 971ms]

[UiSystemAdapterRegistry] register: bootstrap-538 
Object { logger: {…}, descriptor: null, lifecycle: "created", shellPhase: "init", observer: null, appliedSet: WeakSet [], adapterId: "bootstrap-538", capabilities: {…}, meta: {…} }
index-BVWrIoRi.js:48:13552
[BulmaAdapterService] constructor() index-BVWrIoRi.js:53:18907
[UiSystemAdapterRegistry] register: bulma 
Object { descriptor: null, observer: null, appliedSet: WeakSet [] }
index-BVWrIoRi.js:48:13552
[UiSystemAdapterRegistry] register: material-design 
Object { logger: {…}, descriptor: null, lifecycle: "created", shellPhase: "init", observer: null, appliedSet: WeakSet [], mdcInitQueued: false, mdcInstances: Set [], adapterId: "material-design", capabilities: {…}, … }
index-BVWrIoRi.js:48:13552
start 1 index-BVWrIoRi.js:65:9768
[SHELL] [DEBUG] [Main] init(): starting index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [Main] Running in browser → skipping ensureInitialized() index-BVWrIoRi.js:48:1853
[ModuleService][constructor]: starting index-BVWrIoRi.js:31:5042
[ModuleService] Running under Vite (browser). index-BVWrIoRi.js:31:5115
[ModuleService][constructor]: starting index-BVWrIoRi.js:31:5042
[ModuleService] Running under Vite (browser). index-BVWrIoRi.js:31:5115
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-BVWrIoRi.js:48:14256
[SHELL] [DEBUG] [Splash] loading 
Object { path: "/splashscreens/corpdesk-default.html", minDuration: 3400 }
index-BVWrIoRi.js:48:1853
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-BVWrIoRi.js:48:14256
[SHELL] [DEBUG] [Main] init(): completed index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] starting bootstrapShell() index-BVWrIoRi.js:48:1853
[CSS-DIAG] Main.run() started 
Object {  }
index-BVWrIoRi.js:31:3156
[SHELL] [DEBUG] [ConfigService.applyUserShellConfigWithPolicy()] start index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [ConfigService.applyUserShellConfigWithPolicy()] base: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [ConfigService.applyUserShellConfigWithPolicy()] userShell: undefined index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [ConfigService.applyUserShellConfigWithPolicy()] consumerShell: undefined index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [ConfigService] No user shell config → base config retained index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UserService.loginAnonUser] Performing anon login index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UserService.loginAnonUser] consumerGuid B0B3DA99-1859-A499-90F6-1E3F69575DCD index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UserService.login] attempting login 
Object { user: "anon", consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD" }
index-BVWrIoRi.js:48:1853
[HttpService] proc() → profile: cdApiLocal, endpoint: http://localhost:3001/api index-BVWrIoRi.js:53:8531
[HttpService] Initialized Axios instance [cdApiLocal] → http://localhost:3001/api index-BVWrIoRi.js:53:7301
[HttpService] Request Config: 
Object { method: "POST", url: "http://localhost:3001/api", data: {…} }
index-BVWrIoRi.js:53:7301
[SHELL] [DEBUG] [UserService.login] fx: 
Object { state: true, data: {…}, message: "Request succeeded" }
index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UserService.loginAnonUser] fx: 
Object { state: true, data: {…}, message: "Request succeeded" }
index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UserService.loginAnonUser] anon login success index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [Main.run] fx: 
Object { state: true, data: {…}, message: "Request succeeded" }
index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [Main] Discovering UI system adapters index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UiAdapterDiscovery] Raw Modules found: 
Object { "../../../app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts": {…}, "../../../app/ui-adaptor-port/services/bulma-adapter.service.ts": {…}, "../../../app/ui-adaptor-port/services/material-design-adapter.service.ts": {…}, "../../../app/ui-adaptor-port/services/plain-adapter.service.ts": {…} }
index-BVWrIoRi.js:48:1853
[SHELL] [ERROR] Failed to instantiate adapter 
Object { path: "../../../app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts", error: Error }
index-BVWrIoRi.js:48:1975
[BulmaAdapterService] constructor() index-BVWrIoRi.js:53:18907
[SHELL] [WARN] Adapter instance missing getMeta() 
Object { path: "../../../app/ui-adaptor-port/services/bulma-adapter.service.ts" }
index-BVWrIoRi.js:48:1934
[SHELL] [ERROR] Failed to instantiate adapter 
Object { path: "../../../app/ui-adaptor-port/services/material-design-adapter.service.ts", error: Error }
index-BVWrIoRi.js:48:1975
[SHELL] [WARN] Adapter instance missing getMeta() 
Object { path: "../../../app/ui-adaptor-port/services/plain-adapter.service.ts" }
index-BVWrIoRi.js:48:1934
[SHELL] [DEBUG] [Main] UI adapters registered 
Array(3) [ "bootstrap-538", "bulma", "material-design" ]
index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [SysCacheService.loadAndCacheAll()] start index-BVWrIoRi.js:48:1853
[SysCacheService] Eager load starting index-BVWrIoRi.js:48:4080
[PHASE][Cache] shellConfig 
Object { source: "static", version: 1 }
index-BVWrIoRi.js:65:7876
[UiSystemLoaderService] Registered UI Systems: 
Array(3) [ "bootstrap-538", "bulma", "material-design" ]
index-BVWrIoRi.js:48:23379
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-538/descriptor.json index-BVWrIoRi.js:48:23511
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bulma/descriptor.json index-BVWrIoRi.js:48:23511
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/material-design/descriptor.json index-BVWrIoRi.js:48:23511
[SHELL] [DEBUG] [SysCacheService.cacheUiSystems()] start index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [SysCacheService.normalizeUiSystemDescriptors()] start index-BVWrIoRi.js:48:1853
[SysCacheService] UI systems cached 
Object { simpleCount: 3, fullCount: 3, source: "static" }
index-BVWrIoRi.js:48:6420
[UiThemeLoaderService][fetchAvailableThemes] start 
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-BVWrIoRi.js:48:19904
[SysCacheService] Load complete index-BVWrIoRi.js:48:4685
[CSS-DIAG] Cache loaded (static) 
Object {  }
index-BVWrIoRi.js:31:3156
[SHELL] [DEBUG] [ConfigService.promoteResolvedShellConfig] start index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [ConfigService.promoteResolvedShellConfig] resolutionMode: FULL_CONTEXT index-BVWrIoRi.js:48:1853
[PHASE 2][ConfigService] Promote resolved shell config index-BVWrIoRi.js:48:18772
[SHELL] [DEBUG] [Main] Shell config promoted 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [SysCacheService.applyResolvedShellConfig()] start index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [SysCacheService.applyResolvedShellConfig()] resolvedShellConfig: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-BVWrIoRi.js:48:1853
[PHASE][Cache] shellConfig 
Object { source: "resolved", version: 14 }
index-BVWrIoRi.js:65:7876
[SysCacheService] Resolved shell config applied 
Object { defaultUiSystemId: "bootstrap-538", defaultThemeId: "dark", source: "resolved" }
index-BVWrIoRi.js:48:7066
[SHELL] [DEBUG] [UiSystemLoaderService.bootstrapUiSystemAndTheme()] start index-BVWrIoRi.js:48:1853
[SHELL] [DEBUG] [UiSystemLoaderService.applyStartupUiSettings()] start index-BVWrIoRi.js:48:1853
[CSS-DIAG] [MAIN.applyStartupUiSettings] start 
Object { systemId: "bootstrap-538", themeId: "dark" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.activate] START 
Object { id: "bootstrap-538" }
index-BVWrIoRi.js:31:3156
[SHELL] [DEBUG] [UiSystemLoaderService.getFullDescriptor()] start index-BVWrIoRi.js:48:1853
[UiSystemLoaderService.activate] descriptorFromCache: 
Object { id: "bootstrap-538", name: "Bootstrap 5", version: "5.3.8", description: "Bootstrap 5.3.8 UI System with full support for data-bs-theme light/dark switching.", cssUrl: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", jsUrl: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js", assetPath: "/assets/ui-systems/bootstrap-538", stylesheets: (1) […], scripts: (1) […], themesAvailable: (2) […], … }
index-BVWrIoRi.js:48:24616
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS 
Object {  }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS 
Object { cssPath: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", jsPath: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js", bridgeCssPath: "/assets/ui-systems/bootstrap-538/bridge.css" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", id: "bootstrap-538" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/bootstrap-538/bootstrap.min.css", id: "bootstrap-538", resolved: "http://localhost:5173/assets/ui-systems/bootstrap-538/bootstrap.min.css", order: (2) […] }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOADED 
Object { cssPath: "/assets/ui-systems/bootstrap-538/bootstrap.min.css" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/bootstrap-538/bridge.css", id: "bootstrap-538-bridge" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/bootstrap-538/bridge.css", id: "bootstrap-538-bridge", resolved: "http://localhost:5173/assets/ui-systems/bootstrap-538/bridge.css", order: (3) […] }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED 
Object { bridgeCssPath: "/assets/ui-systems/bootstrap-538/bridge.css" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOADED 
Object { jsPath: "/assets/ui-systems/bootstrap-538/bootstrap.bundle.min.js" }
index-BVWrIoRi.js:31:3156
[MI] [INFO] [UI-ADAPTER:bootstrap-538] activate:start Adapter activation started undefined index-BVWrIoRi.js:48:1894
[MI] [DEBUG] [UI-ADAPTER:bootstrap-538] lifecycle:transition Lifecycle transition: created → initialized undefined index-BVWrIoRi.js:48:1853
[MI] [INFO] [UI-ADAPTER:bootstrap-538] lifecycle:activate:start Adapter activation started 
Object { lifecycle: "initialized" }
index-BVWrIoRi.js:48:1894
[MI] [DEBUG] [UI-ADAPTER:bootstrap-538] lifecycle:transition Lifecycle transition: initialized → activated undefined index-BVWrIoRi.js:48:1853
[MI] [INFO] [UI-ADAPTER:bootstrap-538] map:concept [Bootstrap538Adapter] mapTabs() undefined index-BVWrIoRi.js:48:1894
[MI] [DEBUG] [UI-ADAPTER:bootstrap-538] lifecycle:transition Lifecycle transition: activated → mapped undefined index-BVWrIoRi.js:48:1853
[MI] [DEBUG] [UI-ADAPTER:bootstrap-538] lifecycle:transition Lifecycle transition: mapped → observing undefined index-BVWrIoRi.js:48:1853
[MI] [INFO] [UI-ADAPTER:bootstrap-538] phase:change Phase changed init → controller_ready 
Object { reason: "Bootstrap adapter controller ready" }
index-BVWrIoRi.js:48:1894
[MI] [INFO] [UI-ADAPTER:bootstrap-538] phase:change Phase changed controller_ready → dom_stable 
Object { reason: "Initial Bootstrap mapping completed" }
index-BVWrIoRi.js:48:1894
[MI] [INFO] [UI-ADAPTER:bootstrap-538] lifecycle:activate:end Adapter activation completed 
Object { lifecycle: "observing" }
index-BVWrIoRi.js:48:1894
[MI] [DEBUG] [UI-ADAPTER:bootstrap-538] lifecycle:transition:skip Lifecycle unchanged (observing → activated) undefined index-BVWrIoRi.js:48:1853
[MI] [INFO] [UI-ADAPTER:bootstrap-538] activate:end Adapter activation completed undefined index-BVWrIoRi.js:48:1894
[CSS-DIAG] [UiSystemLoaderService.activate] ADAPTER ACTIVATED 
Object { id: "bootstrap-538" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.activate] COMPLETE 
Object { activeSystem: "bootstrap-538" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [MAIN.applyStartupUiSettings] ui-system activated 
Object { systemId: "bootstrap-538" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/themes/common/base.css", id: "shell-base" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/themes/common/base.css", id: "shell-base", resolved: "http://localhost:5173/themes/common/base.css", order: (4) […] }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/css/index.css", id: "shell-index" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/css/index.css", id: "shell-index", resolved: "http://localhost:5173/assets/css/index.css", order: (5) […] }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [MAIN.applyStartupUiSettings] shell CSS loaded 
Object {  }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] start 
Object { themeId: "dark" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] loaded 
Object { themeId: "dark", cssPath: "/themes/dark/theme.css" }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] [MAIN.applyStartupUiSettings] theme assets loaded 
Object { themeId: "dark" }
index-BVWrIoRi.js:31:3156
[UITHEMENORMALIZER] [DEBUG] Theme normalized 
Object { id: "dark", source: "static", uiSystem: "bootstrap-538" }
index-BVWrIoRi.js:48:1853
[CSS-DIAG] [UiSystemLoaderService.applyTheme] start 
Object { systemId: "bootstrap-538", themeId: "dark" }
index-BVWrIoRi.js:31:3156
[UiSystemLoaderService.applyTheme] adapter received: 
Object { logger: {…}, descriptor: {…}, lifecycle: "observing", shellPhase: "dom_stable", observer: MutationObserver, appliedSet: WeakSet [], adapterId: "bootstrap-538", capabilities: {…}, meta: {…} }
index-BVWrIoRi.js:48:27068
[UiSystemLoaderService][applyTheme] descriptors: 
Array [ {…}, {…} ]
index-BVWrIoRi.js:48:27267
[UiSystemLoaderService][applyTheme] descriptors: 
Object { name: "Dark Theme", id: "dark", logo: "/themes/default/logo.png", css: "/themes/dark/theme.css", mode: "dark", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-BVWrIoRi.js:48:27361
[MI] [ERROR] [UI-ADAPTER:bootstrap-538] lifecycle:violation Lifecycle violation | required=activated | current=observing | action=applyTheme undefined index-BVWrIoRi.js:48:1975
[SHELL] [WARN] [applyStartupUiSettings] applyTheme failed Error: [UiAdapterLifecycleError] Lifecycle violation | required=activated | current=observing | action=applyTheme
    assertLifecycle http://localhost:5173/assets/index-BVWrIoRi.js:48
    applyTheme http://localhost:5173/assets/index-BVWrIoRi.js:48
    applyTheme http://localhost:5173/assets/index-BVWrIoRi.js:48
    applyStartupUiSettings http://localhost:5173/assets/index-BVWrIoRi.js:48
    bootstrapUiSystemAndTheme http://localhost:5173/assets/index-BVWrIoRi.js:48
    run http://localhost:5173/assets/index-BVWrIoRi.js:65
    async* http://localhost:5173/assets/index-BVWrIoRi.js:65
index-BVWrIoRi.js:48:1934
[CSS-DIAG] [MAIN.applyStartupUiSettings] done 
Object {  }
index-BVWrIoRi.js:31:3156
[CSS-DIAG] UI-System + Theme applied 
Object {  }
index-BVWrIoRi.js:31:3156
ThemeService::loadThemeConfig(default) index-BVWrIoRi.js:48:2318
[CSS-DIAG] ThemeConfig loaded 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", css: "/themes/default/theme.css", mode: "light", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-BVWrIoRi.js:31:3156
[ModuleService][constructor]: starting index-BVWrIoRi.js:31:5042
[ModuleService] Running under Vite (browser). index-BVWrIoRi.js:31:5115
[Preload] Loading dev-sync index-BVWrIoRi.js:31:7400
ModuleService::loadModule()/01: index-BVWrIoRi.js:31:8038
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-BVWrIoRi.js:31:8202
[ModuleService] 1 index-BVWrIoRi.js:31:8262
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-BVWrIoRi.js:31:8539
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-BVWrIoRi.js:31:8698
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-BVWrIoRi.js:31:8757
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-BVWrIoRi.js:31:8909
[ModuleService] Loaded 'dev-sync' (Vite mode) at 12/01/2026, 20:16:25 index-BVWrIoRi.js:31:8997
[Preload] Controller component 'IdeAgentService' not found in module dev-sync. index-BVWrIoRi.js:31:7696
[Preload] Completed IdeAgentService index-BVWrIoRi.js:31:7795
[Preload] Loading dev-sync index-BVWrIoRi.js:31:7400
ModuleService::loadModule()/01: index-BVWrIoRi.js:31:8038
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-BVWrIoRi.js:31:8202
[ModuleService] 1 index-BVWrIoRi.js:31:8262
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-BVWrIoRi.js:31:8539
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-BVWrIoRi.js:31:8698
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-BVWrIoRi.js:31:8757
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-BVWrIoRi.js:31:8909
[ModuleService] Loaded 'dev-sync' (Vite mode) at 12/01/2026, 20:16:25 index-BVWrIoRi.js:31:8997
[Preload] Controller component 'IdeAgentClientService' not found in module dev-sync. index-BVWrIoRi.js:31:7696
[Preload] Completed IdeAgentClientService index-BVWrIoRi.js:31:7795
ModuleService::loadModule()/01: index-BVWrIoRi.js:31:8038
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-user/view/index.js index-BVWrIoRi.js:31:8202
[ModuleService] 1 index-BVWrIoRi.js:31:8262
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-user/view/index.js index-BVWrIoRi.js:31:8539
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", isDefault: true, moduleId: "cd-user", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (2) […], menu: (1) […] }
index-BVWrIoRi.js:31:8698
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…}, {…} ]
index-BVWrIoRi.js:31:8757
[ModuleService] Loaded 'cd-user' (Vite mode) at 12/01/2026, 20:16:25 index-BVWrIoRi.js:31:8997
ModuleService::loadModule()/01: index-BVWrIoRi.js:31:8038
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-admin/view/index.js index-BVWrIoRi.js:31:8202
[ModuleService] 1 index-BVWrIoRi.js:31:8262
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-admin/view/index.js index-BVWrIoRi.js:31:8539
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-admin", moduleName: "cd-admin", moduleGuid: "aaaa-bbbb-cccc-dddd", controllers: (1) […], menu: (1) […] }
index-BVWrIoRi.js:31:8698
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-BVWrIoRi.js:31:8757
[ModuleService] Loaded module metadata passively: cd-admin. Setup skipped. index-BVWrIoRi.js:31:8909
[ModuleService] Loaded 'cd-admin' (Vite mode) at 12/01/2026, 20:16:25 index-BVWrIoRi.js:31:8997
ModuleService::loadModule()/01: index-BVWrIoRi.js:31:8038
[ModuleService] expectedPathFragment: src/CdShell/sys/moduleman/view/index.js index-BVWrIoRi.js:31:8202
[ModuleService] 1 index-BVWrIoRi.js:31:8262
[ModuleService][loadModule] pathKey: /src/CdShell/sys/moduleman/view/index.js index-BVWrIoRi.js:31:8539
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "moduleman-consumer-resource", moduleName: "consumer-resource", moduleGuid: "consr-0001-0000-0000", controllers: (2) […], menu: (1) […] }
index-BVWrIoRi.js:31:8698
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…}, {…} ]
index-BVWrIoRi.js:31:8757
[ModuleService] Loaded module metadata passively: moduleman. Setup skipped. index-BVWrIoRi.js:31:8909
[ModuleService] Loaded 'moduleman' (Vite mode) at 12/01/2026, 20:16:25 index-BVWrIoRi.js:31:8997
[CSS-DIAG] Modules Loaded 
```

///////////////////////////////////////////////
Below is the BaseUiAdapter. You can revisit the lifecycle guards.

References:
```ts
// adapter-internal lifecycle
export enum UiAdapterLifecycle {
  CREATED = "created",
  INITIALIZED = "initialized",
  ACTIVATED = "activated",
  MAPPED = "mapped",
  OBSERVING = "observing",
  THEMED = "themed",
}

export const ShellToLifecycleHint: Partial<Record<UiAdapterPhase, UiAdapterLifecycle>> = {
  [UiAdapterPhase.INIT]: UiAdapterLifecycle.CREATED,
  [UiAdapterPhase.SHELL_READY]: UiAdapterLifecycle.ACTIVATED,
  [UiAdapterPhase.DOM_STABLE]: UiAdapterLifecycle.OBSERVING,
};

export const UI_ADAPTER_LIFECYCLE_ORDER: UiAdapterLifecycle[] = [
  UiAdapterLifecycle.CREATED,
  UiAdapterLifecycle.INITIALIZED,
  UiAdapterLifecycle.ACTIVATED,
  UiAdapterLifecycle.MAPPED,
  UiAdapterLifecycle.OBSERVING,
  UiAdapterLifecycle.THEMED,
];
```

```ts
export abstract class BaseUiAdapter implements IUiSystemAdapter {
  protected logger = new LoggerService({
    context: this.constructor.name,
  });

  protected descriptor: UiSystemDescriptor | null = null;

  abstract readonly adapterId: string;

  protected meta!: UiAdapterMeta;
  protected abstract readonly capabilities: UiAdapterCapabilities;

  /** ------------------------------------------------------------------
   * Adapter lifecycle (NEW architecture)
   * ------------------------------------------------------------------ */
  protected lifecycle: UiAdapterLifecycle = UiAdapterLifecycle.CREATED;

  /** ------------------------------------------------------------------
   * Shell lifecycle phase (legacy + runtime coordination)
   * ------------------------------------------------------------------ */
  protected shellPhase: UiAdapterPhase = UiAdapterPhase.INIT;

  /* ==================================================================
   * Lifecycle enforcement
   * ================================================================== */

  protected assertLifecycle(
    required: UiAdapterLifecycle,
    action?: string
  ): void {
    if (this.lifecycle !== required) {
      const msg =
        `Lifecycle violation | required=${required} | current=${this.lifecycle}` +
        (action ? ` | action=${action}` : "");

      this.log("error", "lifecycle:violation", msg);

      throw new Error(`[UiAdapterLifecycleError] ${msg}`);
    }
  }

  protected transitionTo(next: UiAdapterLifecycle): void {
    const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
    const nextIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(next);

    if (nextIndex === -1) {
      throw new Error(`Unknown lifecycle state: ${next}`);
    }

    // No backward or duplicate transitions
    if (nextIndex <= currentIndex) {
      this.log(
        "debug",
        "lifecycle:transition:skip",
        `Lifecycle unchanged (${this.lifecycle} → ${next})`
      );
      return;
    }

    const previous = this.lifecycle;
    this.lifecycle = next;

    this.log(
      "debug",
      "lifecycle:transition",
      `Lifecycle transition: ${previous} → ${next}`
    );
  }

  protected assertAtLeastLifecycle(
  minimum: UiAdapterLifecycle,
  action: string
): void {
  if (this.lifecycle < minimum) {
    const msg = `Lifecycle violation | required>=${minimum} | current=${this.lifecycle} | action=${action}`;
    this.log("error", "lifecycle:violation", msg);
    throw new Error(msg);
  }
}

  protected markInitialized(): void {
    this.transitionTo(UiAdapterLifecycle.INITIALIZED);
  }

  protected markActivated(): void {
    this.transitionTo(UiAdapterLifecycle.ACTIVATED);
  }

  /* ==================================================================
   * Phase management (shell-level, non-fatal)
   * ================================================================== */

  protected setPhase(phase: UiAdapterPhase, reason?: string): void {
    if (this.shellPhase === phase) return;

    const previous = this.shellPhase;
    this.shellPhase = phase;

    this.log("info", "phase:change", `Phase changed ${previous} → ${phase}`, {
      reason,
    });
  }

  protected isPhaseAtLeast(phase: UiAdapterPhase): boolean {
    const order = [
      UiAdapterPhase.INIT,
      UiAdapterPhase.SHELL_READY,
      UiAdapterPhase.MENU_READY,
      UiAdapterPhase.CONTROLLER_READY,
      UiAdapterPhase.DOM_STABLE,
    ];
    return order.indexOf(this.shellPhase) >= order.indexOf(phase);
  }

  protected requirePhase(phase: UiAdapterPhase, action: string): boolean {
    if (!this.isPhaseAtLeast(phase)) {
      this.log(
        "debug",
        "phase:skip",
        `Skipped '${action}' — phase '${this.shellPhase}' < '${phase}'`
      );
      return false;
    }
    return true;
  }

  public onShellPhase(phase: UiAdapterPhase): void {
    this.shellPhase = phase;
    this.logger.debug(`[UI-ADAPTER:${this.adapterId}] shell phase → ${phase}`);
  }

  /* ==================================================================
   * Meta
   * ================================================================== */

  public setMeta(meta: UiAdapterMeta): void {
    this.meta = meta;
  }

  public getMeta(): UiAdapterMeta | null {
    return this.meta ?? null;
  }

  public get id(): string {
    return this.meta?.id;
  }

  public get version(): string {
    return this.meta?.version;
  }

  public get status() {
    return this.meta?.status;
  }

  /* ==================================================================
   * Public lifecycle (ENFORCED ENTRY POINTS)
   * ================================================================== */

  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.CREATED, "activate");

    this.descriptor = descriptor ?? null;

    this.log("info", "activate:start", "Adapter activation started");

    this.markInitialized();

    if (this.meta.status !== UiAdapterStatus.ACTIVE) {
      this.log(
        "warn",
        "adapter:status",
        `Adapter status = ${this.meta.status}`
      );
    }

    this.beforeActivate(descriptor);
    await this.onActivate(descriptor);
    this.afterActivate(descriptor);

    this.markActivated();

    this.log("info", "activate:end", "Adapter activation completed");
  }

  async deactivate(): Promise<void> {
    this.log("info", "deactivate:start", "Adapter deactivation started");

    this.beforeDeactivate();
    await this.onDeactivate();
    this.afterDeactivate();

    this.descriptor = null;

    this.log("info", "deactivate:end", "Adapter deactivation completed");
  }

  async applyTheme(theme: UiThemeDescriptor): Promise<void> {
    this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "applyTheme");

    if (!theme) {
      this.log("debug", "theme:skip", "No theme descriptor provided");
      return;
    }

    this.log(
      "info",
      "theme:apply:start",
      `Applying theme '${theme.id ?? theme.name ?? "unknown"}'`
    );

    this.beforeApplyTheme(theme);
    this.onApplyTheme(theme);
    this.afterApplyTheme(theme);

    this.transitionTo(UiAdapterLifecycle.THEMED);

    this.log("info", "theme:apply:end", `Theme '${theme.id}' applied`);
  }

  /* ==================================================================
   * Hooks (override as needed)
   * ================================================================== */

  protected beforeActivate(_descriptor: UiSystemDescriptor): void {}
  protected abstract onActivate(descriptor: UiSystemDescriptor): Promise<void>;
  protected afterActivate(_descriptor: UiSystemDescriptor): void {}

  protected beforeDeactivate(): void {}
  protected async onDeactivate(): Promise<void> {}
  protected afterDeactivate(): void {}

  protected beforeApplyTheme(_theme: UiThemeDescriptor): void {}
  protected abstract onApplyTheme(theme: UiThemeDescriptor): void;
  protected afterApplyTheme(_theme: UiThemeDescriptor): void {}

  /* ==================================================================
   * DOM stability signaling
   * ================================================================== */

  public markDomStable(reason?: string): void {
    this.setPhase(UiAdapterPhase.DOM_STABLE, reason);
  }

  /* ==================================================================
   * Layout helpers
   * ================================================================== */

  protected mapLayoutByDescriptor(
    descriptor: CdUiLayoutDescriptor,
    parent: HTMLElement | Document
  ): void {
    if (!this.supportsLayout(descriptor.layoutType)) return;
    this.mapLayout(descriptor, parent);
  }

  protected mapLayout(
    _descriptor: CdUiLayoutDescriptor,
    _parent: HTMLElement | Document
  ): void {
    /* intentionally empty */
  }

  /* ==================================================================
   * Capability guards
   * ================================================================== */

  public getCapabilities(): Readonly<UiAdapterCapabilities> {
    return this.capabilities;
  }

  protected supportsLayout(type: CdUiLayoutType): boolean {
    const supported = this.capabilities.layouts?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:layout",
        `Layout '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  protected supportsContainer(type: CdUiContainerType): boolean {
    const supported = this.capabilities.containers?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:container",
        `Container '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  protected supportsControl(type: CdUiControlType): boolean {
    const supported = this.capabilities.controls?.includes(type) ?? false;
    if (!supported) {
      this.log(
        "debug",
        "capability:control",
        `Control '${type}' not supported — skipped`
      );
    }
    return supported;
  }

  /* ==================================================================
   * Logging helpers
   * ================================================================== */

  protected log(
    level: "debug" | "info" | "warn" | "error",
    code: string,
    message: string,
    meta?: any
  ) {
    const prefix = `[UI-ADAPTER:${this.meta?.id ?? "unknown"}] ${code}`;

    switch (level) {
      case "debug":
        this.logger.debug(prefix, message, meta);
        break;
      case "info":
        this.logger.info(prefix, message, meta);
        break;
      case "warn":
        this.logger.warn(prefix, message, meta);
        break;
      case "error":
        this.logger.error(prefix, message, meta);
        break;
    }
  }

  protected logLegacy(phase: string, message: string, data?: unknown): void {
    this.log("warn", `legacy:${phase}`, message, data);
  }

  protected logDeprecated(
    phase: string,
    message: string,
    data?: unknown
  ): void {
    this.log("warn", `deprecated:${phase}`, message, data);
  }

  /* ------------------------------------------------------------------
   * DOM-stable signaling (NEW, optional)
   * ------------------------------------------------------------------ */

  protected createTabsSkeleton(tabsId: string): {
    nav: HTMLUListElement;
    content: HTMLDivElement;
  } {
    const nav = document.createElement("ul");
    nav.setAttribute("role", "tablist");

    const content = document.createElement("div");

    return { nav, content };
  }

  protected createTabHeader(
    tabId: string,
    label: string,
    icon?: string,
    active = false
  ): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.setAttribute("role", "presentation");

    const btn = document.createElement("button");
    btn.className = `nav-link ${active ? "active" : ""}`;
    btn.id = `${tabId}-tab`;
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(active));
    btn.setAttribute("data-bs-target", `#${tabId}-pane`);

    if (icon) {
      const i = document.createElement("i");
      i.className = `bi bi-${icon} me-2`;
      btn.appendChild(i);
    }

    btn.appendChild(document.createTextNode(label));
    li.appendChild(btn);

    return li;
  }

  protected createTabPane(tabId: string, active = false): HTMLDivElement {
    const pane = document.createElement("div");
    pane.className = `tab-pane fade ${active ? "show active" : ""}`;
    pane.id = `${tabId}-pane`;
    pane.setAttribute("role", "tabpanel");
    pane.setAttribute("aria-labelledby", `${tabId}-tab`);
    return pane;
  }
}

```

///////////////////////////////////////////

Below is the implementation of BaseUiAdaptor.assertLifecycle().
What would be the implementation of assertAtLeastLifecycle()?
```ts
protected assertLifecycle(
    required: UiAdapterLifecycle,
    action?: string
  ): void {
    if (this.lifecycle !== required) {
      const msg =
        `Lifecycle violation | required=${required} | current=${this.lifecycle}` +
        (action ? ` | action=${action}` : "");

      this.log("error", "lifecycle:violation", msg);

      throw new Error(`[UiAdapterLifecycleError] ${msg}`);
    }
  }
```

///////////////////////////////////////////////////

Remember the new codes use descriptor driven approach so currently we dont use mapUploader(), we use mapUploaderConcept().
Below are the effective codes in material-design. You may want to review what you have just proposed on mapUploader()
```ts
/**
   * mapUploaderConcept()
   * Transforms <gvp-uploader> into a Material Design compliant uploader.
   */
  private mapUploaderConcept() {
    const concept = "uploader";
    const mapping = this.getMapping(concept);
    const nodes = document.querySelectorAll<HTMLElement>("gvp-uploader");

    nodes.forEach((el) => {
      if (this.appliedSet.has(el)) return;

      const currentUrl = el.getAttribute("data-current-preview") || "";
      const name = el.getAttribute("name") || "file-upload";

      // 1. Create Material Surface Container
      const container = document.createElement("div");

      // Use mapping from descriptor if available, else default to MDC-style box
      if (mapping?.class) {
        mapping.class.split(" ").forEach((c) => container.classList.add(c));
      } else {
        // Standard MDC-like layout: Horizontal alignment with shadow and padding
        container.className =
          "mdc-card p-2 d-flex align-items-center gap-3 bg-surface border";
      }

      // 2. Material-Style Preview (Circular or Rounded)
      const previewWrapper = document.createElement("div");
      previewWrapper.className = "mdc-avatar mdc-avatar--large border";
      previewWrapper.style.width = "64px";
      previewWrapper.style.height = "64px";
      previewWrapper.style.overflow = "hidden";
      previewWrapper.style.borderRadius = "8px"; // Material M3 standard

      const img = document.createElement("img");
      img.src = currentUrl;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      previewWrapper.appendChild(img);

      // 3. The Input Control
      const input = document.createElement("input");
      input.type = "file";
      input.name = name;
      input.className = "mdc-text-field__input"; // Hook into MDC text field styles if available
      input.style.padding = "10px";
      input.accept = el.getAttribute("accept") || "image/*";

      // 4. Handshake Logic (Reusing the GVP Event Protocol)
      input.addEventListener("change", (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => (img.src = e.target?.result as string);
          reader.readAsDataURL(file);

          // Notify CorpDesk Binder
          el.dispatchEvent(
            new CustomEvent("cd-value-change", {
              detail: { file, name: name },
              bubbles: true,
            })
          );
        }
      });

      // Assemble
      container.append(previewWrapper, input);
      el.innerHTML = "";
      el.appendChild(container);

      // Register as applied
      this.applyMappingToElement(el, mapping);
    });
  }

  private mapAll() {
    if (!this.descriptor) return;

    try {
      this.mapByConcept("button", ".mdc-button, button[cdButton]");
      this.mapByConcept(
        "input",
        ".mdc-text-field__input, input[cdFormControl]"
      );

      // Trigger the Material Uploader transformation
      this.mapUploaderConcept();

      this.mapTabs();
      this.mapOtherConcepts();

      // Material specific: Ensure MDC components are hydrated
      this.scheduleMdcInit();
    } catch (err) {
      this.log("error", "map:all:error", "Material Mapping failed", err);
    }
  }
```

/////////////////////////////////////////////////////
In the method you proposed, I am experiencing an issue.
Error: Property 'has' does not exist on type 'SysCacheService'
```ts
public async ensureReady(): Promise<void> {
    // If we have shellConfig, we are essentially "Ready" for a controller
    if (this.has("shellConfig")) {
      this.logger.debug("SysCache: Already ready (shellConfig present)");
      return;
    }

    // If we have loaders, we can try to recover
    if (this._uiSystemLoader && this._uiThemeLoader) {
      await this.loadAndCacheAll();
    } else {
      // This is where your controller currently crashes.
      // We should warn and return rather than throwing if the app is already running.
      this.logger.warn(
        "SysCache: Not ready and no loaders available to fetch data."
      );
    }
  }
```

///////////////////////////////////////////////

You can assist me to do the singleton audit.
```ts
export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  private logger = new LoggerService();

  // private splashAnimDone = false;
  // private appReady = false;

  private svUser = new UserService();
  private consumerProfile?: IConsumerProfile;
  private userProfile?: IUserProfile;

  private resolvedShellConfig?: IUserShellConfig;

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
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

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
    const fx = await this.svUser.loginAnonUser(
      baseShellConfig.envConfig.clientContext.consumerToken
    );

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
    // STEP 1.5: Discover & register UI adapters (CRITICAL)
    //---------------------------------------
    this.logger.debug("[Main] Discovering UI system adapters");

    UiSystemAdapterDiscoveryService.discoverAndRegister();

    const adapters = UiSystemAdapterRegistry.list();
    this.logger.debug("[Main] UI adapters registered", adapters);

    if (!adapters.length) {
      throw new Error(
        "[BOOT] No UI adapters discovered. Check discovery paths."
      );
    }

    //---------------------------------------
    // STEP 2: Load STATIC cache (CRITICAL)
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded (static)");

    //---------------------------------------
    // PHASE 2: Promote ACL-resolved shell config
    //---------------------------------------
    this.resolvedShellConfig = await this.svConfig.promoteResolvedShellConfig(
      this.svSysCache,
      this.consumerProfile,
      this.userProfile
    );

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

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.svMenu.structMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.svUiSystemLoader.renderSidebar(
      this.svMenu,
      preparedMenu,
      shellConfig
    );

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.svController.loadDefaultController(
      this.svMenu,
      preparedMenu,
      defaultModule
    );

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
```

```ts
export class SysCacheService {
  private logger = new LoggerService();
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map<string, Set<CacheListener<any>>>();

  private versionCounter = 0;

  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

  // ------------------------------------------------------------------
  // SINGLETON
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // CORE CACHE API (NEW)
  // ------------------------------------------------------------------
  // Legacy + typed set
  public set<T>(key: string, value: T, source?: CacheMeta["source"]): void;

  public set<K extends keyof SysCacheMap>(
    key: K,
    value: SysCacheMap[K],
    source?: CacheMeta["source"]
  ): void;

  // Implementation
  public set(
    key: string,
    value: any,
    source: CacheMeta["source"] = "runtime"
  ): void {
    const meta: CacheMeta = {
      source,
      version: ++this.versionCounter,
      timestamp: Date.now(),
    };

    this.cache.set(key, { value, meta });
    this.notify(key, value, meta);
  }

  public get(key: string): any | undefined;
  public get<K extends keyof SysCacheMap>(key: K): SysCacheMap[K] | undefined;

  public get(key: string): any | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }

  public getMeta(key: string): CacheMeta | undefined {
    const entry = this.cache.get(key);
    return entry?.meta;
  }

  public subscribe<T>(
    key: string,
    listener: CacheListener<T>,
    emitImmediately = true
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Late subscriber → immediate sync
    if (emitImmediately && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      listener(entry.value, entry.meta);
    }

    // Unsubscribe
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify<T>(key, value: T, meta: CacheMeta): void {
    this.listeners.get(key)?.forEach((listener) => listener(value, meta));
  }

  // ------------------------------------------------------------------
  // EXISTING LOAD PIPELINE (UNCHANGED BEHAVIOR)
  // ------------------------------------------------------------------
  public async loadAndCacheAll(): Promise<void> {
    this.logger.debug("[SysCacheService.loadAndCacheAll()] start");
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    // 🔑 PHASE-2 AWARE CONFIG RESOLUTION
    const shellConfig =
      this.get("shellConfig") ?? (await this.configService.loadConfig());

    const uiConfig = shellConfig.uiConfig || {};

    // Ensure canonical cache presence
    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", uiConfig, "static");

    // -------------------------------------------------
    // UI SYSTEMS (authoritative descriptors)
    // -------------------------------------------------
    const uiSystemsData =
      await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    this.cacheUiSystems(uiSystemsData, "static");

    // -------------------------------------------------
    // UI THEMES
    // -------------------------------------------------
    const uiThemesData =
      await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig, "static");

    console.log("[SysCacheService] Load complete");
  }

  // ------------------------------------------------------------------
  // BACKWARD-COMPAT GETTERS (NO BREAKING CHANGES)
  // ------------------------------------------------------------------
  public getUiSystems(): any[] {
    return this.get("uiSystems") || [];
  }

  public getThemes(): any[] {
    return this.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.get("uiConfigNormalized") || {};
  }

  public getEnvConfig(): any {
    return this.get("envConfig") || {};
  }

  public getConsumerGuid(): string | undefined {
    const env = this.getEnvConfig();
    return env?.consumerGuid || env?.clientContext?.consumerToken;
  }

  public getApiEndpoint(): string | undefined {
    return this.getEnvConfig()?.apiEndpoint;
  }

  // public async ensureReady(): Promise<void> {
  //   if (this.cache.size === 0) {
  //     await this.loadAndCacheAll();
  //   }
  // }

  // Refined ensureReady in SysCacheService.ts
  public async ensureReady(): Promise<void> {
    // Check if the config exists in the cache via the public get() method
    const existingConfig = this.get("shellConfig");

    if (existingConfig) {
      this.logger.debug("SysCache: Already ready (shellConfig present)");
      return;
    }

    // If we have loaders, we can try to recover
    if (this._uiSystemLoader && this._uiThemeLoader) {
      await this.loadAndCacheAll();
    } else {
      this.logger.warn(
        "SysCache: Not ready and no loaders available to fetch data."
      );
    }
  }

  /**
   * Normalizes UI system descriptors to legacy-compatible shape
   * Required by UiSystemLoaderService.activate()
   */
  private normalizeUiSystemDescriptors(rawSystems: any[]): {
    simple: any[];
    full: any[];
  } {
    this.logger.debug("[SysCacheService.normalizeUiSystemDescriptors()] start");
    const fullDescriptors = rawSystems.map((sys: any) => ({
      id: sys.id,
      name: sys.name,
      version: sys.version,
      description: sys.description,

      cssUrl: sys.cssUrl,
      jsUrl: sys.jsUrl,
      assetPath: sys.assetPath,

      stylesheets: sys.stylesheets || [],
      scripts: sys.scripts || [],

      themesAvailable: sys.themesAvailable || [],
      themeActive: sys.themeActive || null,

      conceptMappings: sys.conceptMappings || {},
      directiveMap: sys.directiveMap || {},
      tokenMap: sys.tokenMap || {},

      containers: sys.containers || [],
      components: sys.components || [],
      renderRules: sys.renderRules || {},

      metadata: sys.metadata || {},
      extensions: sys.extensions || {},

      author: sys.author,
      license: sys.license,
      repository: sys.repository,

      displayName: sys.displayName || sys.name,
    }));

    const simpleSystems = fullDescriptors.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.displayName,
      themesAvailable: sys.themesAvailable,
    }));

    return {
      simple: simpleSystems,
      full: fullDescriptors,
    };
  }

  private cacheUiSystems(
    rawSystems: any[],
    source: CacheMeta["source"] = "static"
  ): void {
    this.logger.debug("[SysCacheService.cacheUiSystems()] start");
    const { simple, full } = this.normalizeUiSystemDescriptors(rawSystems);

    // 🔁 Legacy compatibility
    this.set("uiSystems", simple, source);
    this.set("uiSystemDescriptors", full, source);

    // 🔮 Optional future-facing unified key
    this.set("uiSystemsNormalized", { simple, full }, source);

    console.log("[SysCacheService] UI systems cached", {
      simpleCount: simple.length,
      fullCount: full.length,
      source,
    });
  }

  public hasConsumerContext(): boolean {
    return !!this.get("shellConfig:meta")?.hasConsumerProfile;
  }

  // ------------------------------------------------------------------
  // PHASE-2 RESOLUTION (CONSUMER / USER OVERRIDES)
  // ------------------------------------------------------------------
  public applyResolvedShellConfig(
    resolvedShellConfig: any,
    source: CacheMeta["source"] = "resolved"
  ): void {
    this.logger.debug("[SysCacheService.applyResolvedShellConfig()] start");
    this.logger.debug(
      "[SysCacheService.applyResolvedShellConfig()] resolvedShellConfig:",
      resolvedShellConfig
    );

    if (!resolvedShellConfig) return;

    const uiConfig = resolvedShellConfig.uiConfig || {};
    const envConfig = resolvedShellConfig.envConfig || {};

    // Override canonical keys
    this.set("shellConfig", resolvedShellConfig, source);
    this.set("uiConfig", uiConfig, source);
    this.set("envConfig", envConfig, source);

    // Optional normalized alias (used by loaders)
    this.set("uiConfigNormalized", uiConfig, source);

    // Metadata flag (used by hasConsumerContext)
    this.set(
      "shellConfig:meta",
      {
        hasConsumerProfile: true,
        appliedAt: Date.now(),
      },
      source
    );

    console.log("[SysCacheService] Resolved shell config applied", {
      defaultUiSystemId: uiConfig.defaultUiSystemId,
      defaultThemeId: uiConfig.defaultThemeId,
      source,
    });
  }

  public getUiSystemById(systemId: string): any | undefined {
    const systems = this.get("uiSystemDescriptors") || [];
    return systems.find((s: any) => s.id === systemId);
  }

  public getThemeById(themeId: string): any | undefined {
    const themes = this.get("themeDescriptors") || [];
    return themes.find((t: any) => t.id === themeId);
  }

  public resolveTheme(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getThemeById(input);
    return input;
  }

  public resolveUiSystem(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getUiSystemById(input);
    return input;
  }
}
```

/////////////////////////////////////////////
Milestone:
- load a stable consumer-config ui in both bootstrap and material-design: DONE
- load a stable consumer-config data from back end in both bootstrap and material-design: DONE
- sync consumer-config data to sys-cache
- log sync-changes
- sync sys-cache data to backend
- log sync-changes
- undo changes as per log history

////////////////////////////////////////

 

///////////////////////////////////////////////
Add 'available ui-systems' to config data

Add 'avialable themes' to config data

///////////////////////////////////////////////

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": [
      "default",
      "dark",
      "contrast"
    ]
  },
  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "bootstrap-538",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/assets/ui-systems/"
  },
  "splash": {
    "path": "/splashscreens/corpdesk-default.html",
    "enabled": true,
    "minDuration": 3400
  },
  "envConfig": {
    "appId": "",
    "wsMode": "sio",
    "apiHost": "https://localhost",
    "sioHost": "https://localhost",
    "consumer": "ACME_CORP",
    "logLevel": "debug",
    "shellHost": "https://localhost",
    "apiOptions": {
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "production": true,
    "pushConfig": {
      "sio": {
        "enabled": true
      },
      "wss": {
        "enabled": false
      },
      "pusher": {
        "apiKey": "",
        "enabled": false,
        "options": {
          "cluster": "",
          "forceTLS": true
        }
      }
    },
    "sioOptions": {
      "path": "/socket.io",
      "secure": true,
      "transports": [
        "websocket",
        "polling"
      ]
    },
    "wsEndpoint": "wss://localhost:3000",
    "apiEndpoint": "https://localhost:3001/api",
    "clientAppId": 2,
    "defaultauth": "cd-auth",
    "initialPage": "dashboard",
    "sioEndpoint": "https://localhost:3002",
    "clientAppGuid": "ca0fe39f-92b2-484d-91ef-487d4fc462a2",
    "clientContext": {
      "entity": "ASDAP",
      "clientAppId": 2,
      "consumerToken": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
    },
    "SOCKET_IO_PORT": 3002,
    "USER_RESOURCES": "https://assets.corpdesk.com/user-resources",
    "mfManifestPath": "/assets/mf.manifest.json"
  }
}
```

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

---

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

Git update:

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

---

10th Jan Milestone:

- configuration data is orchestrated by sys-cache with layers of sources within the framework of ACL:
  1. defaule file: shell.config.json,
  2. backend consumer-profile
  3. user-profile

- adapter is not only working but is emanating from a base code for consistent and efficient propergation of new ones.

Next Milestone:

- structure ui for consumer configuration
- Set ui for user configuration
- Develop compoinent system for creating ingredients for ui development(inspired by Angular)

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

Consumer Config UI:
- load a stable consumer-config ui in both bootstrap and material-design: DONE
- load a stable consumer-config data from back end in both bootstrap and material-design: DONE
- sync consumer-config data to sys-cache
- log sync-changes
- sync sys-cache data to backend
- log sync-changes
- undo changes as per log history

- Assigining thematic colours to sections:
  - header background
  - header vector pattern
  - navigation background
  - body background
  - Themes to be designed in a way that they can be packaged and commercialized
    Design SysCacheService data sync mechanims
    - upgrade SysCacheService to 'subscibable' and 'syncable'

///////////////////////////////////////

## In Progress

////////////////////////////////////////////////////////////

Milestone:
- load a stable consumer-config data from back end in both bootstrap and material-design:

## DEMO TARGET

- two consumers/tenants users accessing front-end and seeing different ui-systems and themes
- end user chenging themes
- scrol menu to showcase different types of applications in the pwa
  - inteRact
  - cd-memo
  - eShirika
  - cd-hrm
  - cd-accts
  - [ai-assisted scientific-research]
    - self-recursive development
- demo Application consuming embeded technologies
  - blockchain
  - barcode/qr-code utility for applications
- demo Application ai capacity
  - learn user preferences
  - scientific research capacity via recursive self development
- develop module via cli then send to registry
- download and install module from registry
- Create a consumer and set ui-system/themes preferences
  - demonstrate change of ui-system
  - demo change of theme
  - demo change of variant forms and othe widgets
  - set logo
  - set theme colours
  - configure menu options
- demo integration with cli
- Demo recursive ai development
  - develop an application via chat thread
  - self development of a given application
