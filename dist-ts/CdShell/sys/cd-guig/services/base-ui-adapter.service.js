// src/CdShell/sys/cd-guig/services/base-ui-adapter.service.ts
// import {
//   CdUiContainerType,
//   CdUiControlType,
//   CdUiLayoutDescriptor,
//   CdUiLayoutType,
//   IUiSystemAdapter,
//   UiAdapterCapabilities,
//   UiAdapterMeta,
//   UiAdapterStatus,
// } from "../models/ui-system-adaptor.model";
// import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
// import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-theme-descriptor.model";
// import { LoggerService } from "../../../utils/logger.service";
// import {
//   UI_ADAPTER_LIFECYCLE_ORDER,
//   UiAdapterLifecycle,
//   UiAdapterPhase,
// } from "../models/ui-system-introspector.model";
// export abstract class BaseUiAdapter implements IUiSystemAdapter {
//   protected logger = new LoggerService({
//     context: this.constructor.name,
//   });
//   protected descriptor: UiSystemDescriptor | null = null;
//   abstract readonly adapterId: string;
//   // Must be provided by every adapter
//   // protected abstract readonly meta: UiAdapterMeta;
//   protected meta!: UiAdapterMeta;
//   protected abstract readonly capabilities: UiAdapterCapabilities;
//   /** Internal adapter lifecycle */
//   protected lifecycle: UiAdapterLifecycle = UiAdapterLifecycle.CREATED;
//   /* ------------------------------------------------------------------
//    * Phase management (NEW)
//    * ------------------------------------------------------------------ */
//   protected shellPhase: UiAdapterPhase = UiAdapterPhase.INIT;
//   protected setPhase(phase: UiAdapterPhase, reason?: string): void {
//     // const x = new Bootstrap538AdapterService();
//     if (this.shellPhase === phase) return;
//     const previous = this.shellPhase;
//     this.shellPhase = phase;
//     this.log("info", "phase:change", `Phase changed ${previous} → ${phase}`, {
//       reason,
//     });
//   }
//   protected isPhaseAtLeast(phase: UiAdapterPhase): boolean {
//     const order = [
//       UiAdapterPhase.INIT,
//       UiAdapterPhase.SHELL_READY,
//       UiAdapterPhase.MENU_READY,
//       UiAdapterPhase.CONTROLLER_READY,
//       UiAdapterPhase.DOM_STABLE,
//     ];
//     return order.indexOf(this.shellPhase) >= order.indexOf(phase);
//   }
//   protected requirePhase(phase: UiAdapterPhase, action: string): boolean {
//     if (!this.isPhaseAtLeast(phase)) {
//       this.log(
//         "debug",
//         "phase:skip",
//         `Skipped '${action}' — phase '${this.shellPhase}' < '${phase}'`
//       );
//       return false;
//     }
//     return true;
//   }
//   protected transition(next: UiAdapterLifecycle) {
//     this.logger.debug(
//       `[UI-ADAPTER:${this.adapterId}] lifecycle ${this.lifecycle} → ${next}`
//     );
//     this.lifecycle = next;
//   }
//   /** Ensures adapter is at or beyond the required lifecycle phase */
//   protected assertLifecycle(
//     required: UiAdapterLifecycle,
//     action?: string
//   ): void {
//     const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
//     const requiredIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(required);
//     if (currentIndex < requiredIndex) {
//       const message = [
//         `Lifecycle violation`,
//         `required=${required}`,
//         `current=${this.lifecycle}`,
//         action ? `action=${action}` : null,
//       ]
//         .filter(Boolean)
//         .join(" | ");
//       this.logger.error(message);
//       throw new Error(`[UiAdapterLifecycleError] ${message}`);
//     }
//   }
//   protected markInitialized() {
//     this.transitionTo(UiAdapterLifecycle.INITIALIZED);
//   }
//   protected markActivated() {
//     this.transitionTo(UiAdapterLifecycle.ACTIVATED);
//   }
//   /** Controlled lifecycle transition */
//   protected transitionTo(next: UiAdapterLifecycle): void {
//     const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
//     const nextIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(next);
//     if (nextIndex !== currentIndex + 1) {
//       this.logger.warn(
//         `Non-linear lifecycle transition: ${this.lifecycle} → ${next}`
//       );
//     }
//     this.logger.debug(`Lifecycle transition: ${this.lifecycle} → ${next}`);
//     this.lifecycle = next;
//   }
//   public onShellPhase(phase: UiAdapterPhase) {
//     this.shellPhase = phase;
//     this.logger.debug(`[UI-ADAPTER:${this.adapterId}] shell phase → ${phase}`);
//   }
//   public setMeta(meta: UiAdapterMeta): void {
//     this.meta = meta;
//   }
//   public getMeta(): UiAdapterMeta | null {
//     return this.meta ?? null;
//   }
//   // optional convenience
//   public get id(): string {
//     return this.meta?.id;
//   }
//   public get version(): string {
//     return this.meta?.version;
//   }
//   public get status() {
//     return this.meta?.status;
//   }
//   /* ------------------------------------------------------------------
//    * Public lifecycle (stable API)
//    * ------------------------------------------------------------------ */
//   async activate(descriptor: UiSystemDescriptor): Promise<void> {
//     this.descriptor = descriptor ?? null;
//     this.log("info", "activate:start", "Adapter activation started");
//     if (this.meta.status !== UiAdapterStatus.ACTIVE) {
//       this.log(
//         "warn",
//         "adapter:status",
//         `Adapter status = ${this.meta.status}`
//       );
//     }
//     this.beforeActivate(descriptor);
//     await this.onActivate(descriptor);
//     this.afterActivate(descriptor);
//     this.log("info", "activate:end", "Adapter activation completed");
//   }
//   async deactivate(): Promise<void> {
//     this.log("info", "deactivate:start", "Adapter deactivation started");
//     await this.onDeactivate();
//     this.log("info", "deactivate:end", "Adapter deactivation completed");
//     this.descriptor = null;
//   }
//   async applyTheme(theme: UiThemeDescriptor): Promise<void> {
//     this.log(
//       "info",
//       "theme:apply:start",
//       `Applying theme '${theme.id ?? theme.name ?? "unknown"}'`
//     );
//     if (!theme) {
//       this.log("debug", "theme:skip", "No theme descriptor provided");
//       return;
//     }
//     // this.log("info", "theme:apply:start", `Applying theme '${theme}'`);
//     this.beforeApplyTheme(theme);
//     this.onApplyTheme(theme);
//     this.afterApplyTheme(theme);
//     this.log("info", "theme:apply:end", `Theme '${theme}' applied`);
//   }
//   /* ------------------------------------------------------------------
//    * Lifecycle hooks (override as needed)
//    * ------------------------------------------------------------------ */
//   protected beforeActivate(_descriptor: UiSystemDescriptor): void {}
//   protected afterActivate(_descriptor: UiSystemDescriptor): void {}
//   protected abstract onActivate(descriptor: UiSystemDescriptor): Promise<void>;
//   protected beforeDeactivate(): void {}
//   protected async onDeactivate(): Promise<void> {}
//   protected afterDeactivate(): void {}
//   protected beforeApplyTheme(_theme: UiThemeDescriptor): void {}
//   protected abstract onApplyTheme(theme: UiThemeDescriptor): void;
//   protected afterApplyTheme(_theme: UiThemeDescriptor): void {}
//   /* ------------------------------------------------------------------
//    * DOM-stable signaling (NEW, optional)
//    * ------------------------------------------------------------------ */
//   /**
//    * Call this once the UI shell + controllers + directives are settled.
//    * Typically triggered by Shell / Menu / Controller services.
//    */
//   public markDomStable(reason?: string): void {
//     this.setPhase(UiAdapterPhase.DOM_STABLE, reason);
//   }
//   protected createTabsSkeleton(tabsId: string): {
//     nav: HTMLUListElement;
//     content: HTMLDivElement;
//   } {
//     const nav = document.createElement("ul");
//     nav.setAttribute("role", "tablist");
//     const content = document.createElement("div");
//     return { nav, content };
//   }
//   protected createTabHeader(
//     tabId: string,
//     label: string,
//     icon?: string,
//     active = false
//   ): HTMLLIElement {
//     const li = document.createElement("li");
//     li.className = "nav-item";
//     li.setAttribute("role", "presentation");
//     const btn = document.createElement("button");
//     btn.className = `nav-link ${active ? "active" : ""}`;
//     btn.id = `${tabId}-tab`;
//     btn.type = "button";
//     btn.setAttribute("role", "tab");
//     btn.setAttribute("aria-selected", String(active));
//     btn.setAttribute("data-bs-target", `#${tabId}-pane`);
//     if (icon) {
//       const i = document.createElement("i");
//       i.className = `bi bi-${icon} me-2`;
//       btn.appendChild(i);
//     }
//     btn.appendChild(document.createTextNode(label));
//     li.appendChild(btn);
//     return li;
//   }
//   protected createTabPane(tabId: string, active = false): HTMLDivElement {
//     const pane = document.createElement("div");
//     pane.className = `tab-pane fade ${active ? "show active" : ""}`;
//     pane.id = `${tabId}-pane`;
//     pane.setAttribute("role", "tabpanel");
//     pane.setAttribute("aria-labelledby", `${tabId}-tab`);
//     return pane;
//   }
//   protected mapLayoutByDescriptor(
//     descriptor: CdUiLayoutDescriptor,
//     parent: HTMLElement | Document
//   ): void {
//     if (!this.supportsLayout(descriptor.layoutType)) return;
//     this.mapLayout(descriptor, parent);
//   }
//   protected mapLayout(
//     descriptor: CdUiLayoutDescriptor,
//     parent: HTMLElement | Document
//   ): void {
//     /* intentionally empty */
//   }
//   /* ------------------------------------------------------------------
//    * Capability guards (centralized + traced)
//    * ------------------------------------------------------------------ */
//   public getCapabilities(): Readonly<UiAdapterCapabilities> {
//     return this.capabilities;
//   }
//   protected supportsLayout(type: CdUiLayoutType): boolean {
//     const supported = this.capabilities.layouts?.includes(type) ?? false;
//     if (!supported) {
//       this.log(
//         "debug",
//         "capability:layout",
//         `Layout '${type}' not supported — skipped`
//       );
//     }
//     return supported;
//   }
//   protected supportsContainer(type: CdUiContainerType): boolean {
//     const supported = this.capabilities.containers?.includes(type) ?? false;
//     if (!supported) {
//       this.log(
//         "debug",
//         "capability:container",
//         `Container '${type}' not supported — skipped`
//       );
//     }
//     return supported;
//   }
//   protected supportsControl(type: CdUiControlType): boolean {
//     const supported = this.capabilities.controls?.includes(type) ?? false;
//     if (!supported) {
//       this.log(
//         "debug",
//         "capability:control",
//         `Control '${type}' not supported — skipped`
//       );
//     }
//     return supported;
//   }
//   /* ------------------------------------------------------------------
//    * Logging helpers (DO NOT override)
//    * ------------------------------------------------------------------ */
//   protected log(
//     level: "debug" | "info" | "warn" | "error",
//     code: string,
//     message: string,
//     meta?: any
//   ) {
//     const prefix = `[UI-ADAPTER:${this.meta?.id ?? "unknown"}] ${code}`;
//     switch (level) {
//       case "debug":
//         this.logger.debug(prefix, message, meta);
//         break;
//       case "info":
//         this.logger.info(prefix, message, meta);
//         break;
//       case "warn":
//         this.logger.warn(prefix, message, meta);
//         break;
//       case "error":
//         this.logger.error(prefix, message, meta);
//         break;
//     }
//   }
//   /* ------------------------------------------------------------------
//    * Explicit helpers for migration clarity
//    * ------------------------------------------------------------------ */
//   protected logLegacy(phase: string, message: string, data?: unknown): void {
//     this.log("warn", `legacy:${phase}`, message, data);
//   }
//   protected logDeprecated(
//     phase: string,
//     message: string,
//     data?: unknown
//   ): void {
//     this.log("warn", `deprecated:${phase}`, message, data);
//   }
// }
import { UiAdapterStatus, } from "../models/ui-system-adaptor.model";
import { LoggerService } from "../../../utils/logger.service";
import { UI_ADAPTER_LIFECYCLE_ORDER, UiAdapterLifecycle, UiAdapterPhase, } from "../models/ui-system-introspector.model";
export class BaseUiAdapter {
    constructor() {
        this.logger = new LoggerService({
            context: this.constructor.name,
        });
        this.descriptor = null;
        /** ------------------------------------------------------------------
         * Adapter lifecycle (NEW architecture)
         * ------------------------------------------------------------------ */
        this.lifecycle = UiAdapterLifecycle.CREATED;
        /** ------------------------------------------------------------------
         * Shell lifecycle phase (legacy + runtime coordination)
         * ------------------------------------------------------------------ */
        this.shellPhase = UiAdapterPhase.INIT;
    }
    /* ==================================================================
     * Lifecycle enforcement
     * ================================================================== */
    // protected assertLifecycle(
    //   required: UiAdapterLifecycle,
    //   action?: string
    // ): void {
    //   const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
    //   const requiredIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(required);
    //   if (currentIndex < requiredIndex) {
    //     const message = [
    //       "Lifecycle violation",
    //       `required=${required}`,
    //       `current=${this.lifecycle}`,
    //       action ? `action=${action}` : null,
    //     ]
    //       .filter(Boolean)
    //       .join(" | ");
    //     this.logger.error(message);
    //     throw new Error(`[UiAdapterLifecycleError] ${message}`);
    //   }
    // }
    assertLifecycle(required, action) {
        if (this.lifecycle !== required) {
            const msg = `Lifecycle violation | required=${required} | current=${this.lifecycle}` +
                (action ? ` | action=${action}` : "");
            this.log("error", "lifecycle:violation", msg);
            throw new Error(`[UiAdapterLifecycleError] ${msg}`);
        }
    }
    // protected transitionTo(next: UiAdapterLifecycle): void {
    //   const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
    //   const nextIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(next);
    //   if (nextIndex !== currentIndex + 1) {
    //     this.logger.warn(
    //       `Non-linear lifecycle transition: ${this.lifecycle} → ${next}`
    //     );
    //   }
    //   this.logger.debug(`Lifecycle transition: ${this.lifecycle} → ${next}`);
    //   this.lifecycle = next;
    // }
    transitionTo(next) {
        const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
        const nextIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(next);
        if (nextIndex === -1) {
            throw new Error(`Unknown lifecycle state: ${next}`);
        }
        // No backward or duplicate transitions
        if (nextIndex <= currentIndex) {
            this.log("debug", "lifecycle:transition:skip", `Lifecycle unchanged (${this.lifecycle} → ${next})`);
            return;
        }
        const previous = this.lifecycle;
        this.lifecycle = next;
        this.log("debug", "lifecycle:transition", `Lifecycle transition: ${previous} → ${next}`);
    }
    assertAtLeastLifecycle(minimum, action) {
        if (this.lifecycle < minimum) {
            const msg = `Lifecycle violation | required>=${minimum} | current=${this.lifecycle} | action=${action}`;
            this.log("error", "lifecycle:violation", msg);
            throw new Error(msg);
        }
    }
    markInitialized() {
        this.transitionTo(UiAdapterLifecycle.INITIALIZED);
    }
    markActivated() {
        this.transitionTo(UiAdapterLifecycle.ACTIVATED);
    }
    /* ==================================================================
     * Phase management (shell-level, non-fatal)
     * ================================================================== */
    setPhase(phase, reason) {
        if (this.shellPhase === phase)
            return;
        const previous = this.shellPhase;
        this.shellPhase = phase;
        this.log("info", "phase:change", `Phase changed ${previous} → ${phase}`, {
            reason,
        });
    }
    isPhaseAtLeast(phase) {
        const order = [
            UiAdapterPhase.INIT,
            UiAdapterPhase.SHELL_READY,
            UiAdapterPhase.MENU_READY,
            UiAdapterPhase.CONTROLLER_READY,
            UiAdapterPhase.DOM_STABLE,
        ];
        return order.indexOf(this.shellPhase) >= order.indexOf(phase);
    }
    requirePhase(phase, action) {
        if (!this.isPhaseAtLeast(phase)) {
            this.log("debug", "phase:skip", `Skipped '${action}' — phase '${this.shellPhase}' < '${phase}'`);
            return false;
        }
        return true;
    }
    onShellPhase(phase) {
        this.shellPhase = phase;
        this.logger.debug(`[UI-ADAPTER:${this.adapterId}] shell phase → ${phase}`);
    }
    /* ==================================================================
     * Meta
     * ================================================================== */
    setMeta(meta) {
        this.meta = meta;
    }
    getMeta() {
        return this.meta ?? null;
    }
    get id() {
        return this.meta?.id;
    }
    get version() {
        return this.meta?.version;
    }
    get status() {
        return this.meta?.status;
    }
    /* ==================================================================
     * Public lifecycle (ENFORCED ENTRY POINTS)
     * ================================================================== */
    async activate(descriptor) {
        this.assertLifecycle(UiAdapterLifecycle.CREATED, "activate");
        this.descriptor = descriptor ?? null;
        this.log("info", "activate:start", "Adapter activation started");
        this.markInitialized();
        if (this.meta.status !== UiAdapterStatus.ACTIVE) {
            this.log("warn", "adapter:status", `Adapter status = ${this.meta.status}`);
        }
        this.beforeActivate(descriptor);
        await this.onActivate(descriptor);
        this.afterActivate(descriptor);
        this.markActivated();
        this.log("info", "activate:end", "Adapter activation completed");
    }
    async deactivate() {
        this.log("info", "deactivate:start", "Adapter deactivation started");
        this.beforeDeactivate();
        await this.onDeactivate();
        this.afterDeactivate();
        this.descriptor = null;
        this.log("info", "deactivate:end", "Adapter deactivation completed");
    }
    async applyTheme(theme) {
        this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "applyTheme");
        if (!theme) {
            this.log("debug", "theme:skip", "No theme descriptor provided");
            return;
        }
        this.log("info", "theme:apply:start", `Applying theme '${theme.id ?? theme.name ?? "unknown"}'`);
        this.beforeApplyTheme(theme);
        this.onApplyTheme(theme);
        this.afterApplyTheme(theme);
        this.transitionTo(UiAdapterLifecycle.THEMED);
        this.log("info", "theme:apply:end", `Theme '${theme.id}' applied`);
    }
    /* ==================================================================
     * Hooks (override as needed)
     * ================================================================== */
    beforeActivate(_descriptor) { }
    afterActivate(_descriptor) { }
    beforeDeactivate() { }
    async onDeactivate() { }
    afterDeactivate() { }
    beforeApplyTheme(_theme) { }
    afterApplyTheme(_theme) { }
    /* ==================================================================
     * DOM stability signaling
     * ================================================================== */
    markDomStable(reason) {
        this.setPhase(UiAdapterPhase.DOM_STABLE, reason);
    }
    /* ==================================================================
     * Layout helpers
     * ================================================================== */
    mapLayoutByDescriptor(descriptor, parent) {
        if (!this.supportsLayout(descriptor.layoutType))
            return;
        this.mapLayout(descriptor, parent);
    }
    mapLayout(_descriptor, _parent) {
        /* intentionally empty */
    }
    /* ==================================================================
     * Capability guards
     * ================================================================== */
    getCapabilities() {
        return this.capabilities;
    }
    supportsLayout(type) {
        const supported = this.capabilities.layouts?.includes(type) ?? false;
        if (!supported) {
            this.log("debug", "capability:layout", `Layout '${type}' not supported — skipped`);
        }
        return supported;
    }
    supportsContainer(type) {
        const supported = this.capabilities.containers?.includes(type) ?? false;
        if (!supported) {
            this.log("debug", "capability:container", `Container '${type}' not supported — skipped`);
        }
        return supported;
    }
    supportsControl(type) {
        const supported = this.capabilities.controls?.includes(type) ?? false;
        if (!supported) {
            this.log("debug", "capability:control", `Control '${type}' not supported — skipped`);
        }
        return supported;
    }
    /* ==================================================================
     * Logging helpers
     * ================================================================== */
    log(level, code, message, meta) {
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
    logLegacy(phase, message, data) {
        this.log("warn", `legacy:${phase}`, message, data);
    }
    logDeprecated(phase, message, data) {
        this.log("warn", `deprecated:${phase}`, message, data);
    }
    /* ------------------------------------------------------------------
     * DOM-stable signaling (NEW, optional)
     * ------------------------------------------------------------------ */
    createTabsSkeleton(tabsId) {
        const nav = document.createElement("ul");
        nav.setAttribute("role", "tablist");
        const content = document.createElement("div");
        return { nav, content };
    }
    createTabHeader(tabId, label, icon, active = false) {
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
    createTabPane(tabId, active = false) {
        const pane = document.createElement("div");
        pane.className = `tab-pane fade ${active ? "show active" : ""}`;
        pane.id = `${tabId}-pane`;
        pane.setAttribute("role", "tabpanel");
        pane.setAttribute("aria-labelledby", `${tabId}-tab`);
        return pane;
    }
}
