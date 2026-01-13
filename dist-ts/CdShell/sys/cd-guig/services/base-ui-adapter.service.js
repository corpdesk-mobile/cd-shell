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
    assertLifecycle(required, action) {
        if (this.lifecycle !== required) {
            const msg = `Lifecycle violation | required=${required} | current=${this.lifecycle}` +
                (action ? ` | action=${action}` : "");
            this.log("error", "lifecycle:violation", msg);
            throw new Error(`[UiAdapterLifecycleError] ${msg}`);
        }
    }
    // protected assertAtLeastLifecycle(
    //   minimum: UiAdapterLifecycle,
    //   action: string
    // ): void {
    //   if (this.lifecycle < minimum) {
    //     const msg = `Lifecycle violation | required>=${minimum} | current=${this.lifecycle} | action=${action}`;
    //     this.log("error", "lifecycle:violation", msg);
    //     throw new Error(msg);
    //   }
    // }
    /**
     * Ensures the adapter has reached at least the minimum required lifecycle state.
     * This prevents the 'Lifecycle violation' error during bootstrap when theme
     * application arrives after the observer has started.
     */
    assertAtLeastLifecycle(minimum, action) {
        const currentIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle);
        const minimumIndex = UI_ADAPTER_LIFECYCLE_ORDER.indexOf(minimum);
        if (currentIndex < minimumIndex) {
            const msg = `Lifecycle violation | required>=${minimum} | current=${this.lifecycle} | action=${action}`;
            this.log("error", "lifecycle:violation", msg);
            throw new Error(`[UiAdapterLifecycleError] ${msg}`);
        }
    }
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
    // async applyTheme(theme: UiThemeDescriptor): Promise<void> {
    //   this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "applyTheme");
    //   if (!theme) {
    //     this.log("debug", "theme:skip", "No theme descriptor provided");
    //     return;
    //   }
    //   this.log(
    //     "info",
    //     "theme:apply:start",
    //     `Applying theme '${theme.id ?? theme.name ?? "unknown"}'`
    //   );
    //   this.beforeApplyTheme(theme);
    //   this.onApplyTheme(theme);
    //   this.afterApplyTheme(theme);
    //   this.transitionTo(UiAdapterLifecycle.THEMED);
    //   this.log("info", "theme:apply:end", `Theme '${theme.id}' applied`);
    // }
    /**
     * Updated applyTheme to use the 'AtLeast' check.
     */
    async applyTheme(theme) {
        // Broadened from assertLifecycle(ACTIVATED) to allow MAPPED/OBSERVING states
        this.assertAtLeastLifecycle(UiAdapterLifecycle.ACTIVATED, "applyTheme");
        if (!theme)
            return;
        this.log("info", "theme:apply:start", `Applying theme '${theme.id}'`);
        this.beforeApplyTheme(theme);
        this.onApplyTheme(theme);
        this.afterApplyTheme(theme);
        // Note: We don't use transitionTo(THEMED) here if we are already in OBSERVING
        // to avoid trying to move "backwards" in the linear lifecycle order.
        if (UI_ADAPTER_LIFECYCLE_ORDER.indexOf(this.lifecycle) <
            UI_ADAPTER_LIFECYCLE_ORDER.indexOf(UiAdapterLifecycle.THEMED)) {
            this.transitionTo(UiAdapterLifecycle.THEMED);
        }
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
