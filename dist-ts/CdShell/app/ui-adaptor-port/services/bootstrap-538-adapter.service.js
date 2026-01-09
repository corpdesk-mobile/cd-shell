// src/CdShell/app/ui-adaptor-port/services/bootstrap-538-adapter.service.ts
import { CdUiContainerType, CdUiLayoutType, UiAdapterStatus, } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { CdUiControlType } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiAdapterLifecycle, UiAdapterPhase, } from "../../../sys/cd-guig/models/ui-system-introspector.model";
import { BaseUiAdapter } from "../../../sys/cd-guig/services/base-ui-adapter.service";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
export class Bootstrap538AdapterService extends BaseUiAdapter {
    constructor() {
        super(...arguments);
        this.descriptor = null;
        this.observer = null;
        this.appliedSet = new WeakSet();
        this.adapterId = "bootstrap-538";
        this.capabilities = {
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
        this.meta = {
            id: "bootstrap-538",
            version: "5.3.8",
            status: UiAdapterStatus.ACTIVE,
            vendor: "Bootstrap",
        };
    }
    /* ======================================================================
     * ACTIVATION
     * ====================================================================== */
    async onActivate(descriptor) {
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
            this.transitionTo(UiAdapterLifecycle.ACTIVATED
            // "Adapter allowed to operate on DOM"
            );
        }
        /* ------------------------------
         * MAPPED
         * ------------------------------ */
        if (this.lifecycle === UiAdapterLifecycle.ACTIVATED) {
            this.mapAll();
            this.transitionTo(UiAdapterLifecycle.MAPPED
            // "Initial deterministic mapping complete"
            );
        }
        /* ------------------------------
         * OBSERVING
         * ------------------------------ */
        if (this.lifecycle === UiAdapterLifecycle.MAPPED) {
            this.observeMutations();
            this.transitionTo(UiAdapterLifecycle.OBSERVING
            // "Mutation observer active"
            );
        }
        /* ------------------------------
         * Shell coordination (PHASE)
         * ------------------------------ */
        if (this.lifecycle >= UiAdapterLifecycle.OBSERVING) {
            this.setPhase(UiAdapterPhase.CONTROLLER_READY, "Bootstrap adapter controller ready");
            this.markDomStable("Initial Bootstrap mapping completed");
        }
        this.log("info", "lifecycle:activate:end", "Adapter activation completed", {
            lifecycle: this.lifecycle,
        });
    }
    async onDeactivate() {
        this.assertLifecycle(UiAdapterLifecycle.ACTIVATED, "onDeactivate");
        this.log("info", "lifecycle:deactivate:start", "Deactivating adapter");
        if (this.observer) {
            try {
                this.observer.disconnect();
                this.log("debug", "observer:disconnected", "MutationObserver stopped");
            }
            catch {
                /* no-op */
            }
            this.observer = null;
        }
        try {
            document.documentElement.removeAttribute("data-bs-theme");
        }
        catch {
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
    onApplyTheme(theme) {
        /**
         * NOTE (migration):
         * Theme application currently runs post-DOM_STABLE.
         * Lifecycle enforcement will be revisited once
         * theme timing policy is finalized.
         */
        // this.assertLifecycle(UiAdapterLifecycle.OBSERVING, "applyTheme");
        if (this.lifecycle < UiAdapterLifecycle.ACTIVATED) {
            this.logger.warn(`[UI-ADAPTER:${this.adapterId}] applyTheme skipped – adapter not activated`, { lifecycle: this.lifecycle });
            return;
        }
        if (!theme) {
            this.logger.warn(`[UI-ADAPTER:${this.adapterId}] applyTheme:skipped`, "No theme descriptor provided");
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
    getMapping(concept) {
        return this.descriptor?.conceptMappings?.[concept];
    }
    applyMappingToElement(el, mapping) {
        if (!mapping)
            return;
        if (this.appliedSet.has(el)) {
            if (mapping.attrs) {
                Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
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
    mapByConcept(concept, selector) {
        const mapping = this.getMapping(concept);
        if (!mapping)
            return;
        document
            .querySelectorAll(selector)
            .forEach((el) => this.applyMappingToElement(el, mapping));
    }
    /**
     * mapTabs()
     * Transforms <cd-tabs> into Bootstrap 5.3 nav-tabs and tab-panes.
     */
    mapTabs() {
        this.log("info", "map:concept", "[Bootstrap538Adapter] mapTabs()");
        const tabsContainers = document.querySelectorAll("cd-tabs");
        tabsContainers.forEach((container) => {
            if (this.appliedSet.has(container))
                return;
            const tabsId = container.id || `tabs-${Math.random().toString(36).slice(2, 7)}`;
            const activeTabId = container.getAttribute("active-tab");
            const cdTabs = Array.from(container.querySelectorAll("cd-tab"));
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
                    const targetPane = contentDiv.querySelector(`#${tabId}-pane`);
                    targetPane?.classList.add("show", "active");
                    container.dispatchEvent(new CustomEvent("cd-tab-change", {
                        detail: { tabId, label },
                        bubbles: true,
                    }));
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
    mapOtherConcepts() {
        const cm = this.descriptor?.conceptMappings || {};
        Object.keys(cm)
            .filter((c) => !["button", "input", "formGroup"].includes(c))
            .forEach((concept) => {
            const selector = `[data-cd-${concept}], .cd-${concept}`;
            document
                .querySelectorAll(selector)
                .forEach((el) => this.applyMappingToElement(el, cm[concept]));
        });
    }
    mapAll() {
        if (!this.descriptor)
            return;
        try {
            this.mapByConcept("button", "button[cdButton], button.cd-button");
            this.mapByConcept("input", "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]");
            this.mapByConcept("formGroup", ".cd-form-field");
            this.mapTabs();
            this.mapOtherConcepts();
        }
        catch (err) {
            this.log("error", "map:all:error", "Mapping failed", err);
        }
    }
    /* ======================================================================
     * DOM OBSERVER
     * ====================================================================== */
    observeMutations() {
        if (this.observer)
            return;
        this.observer = new MutationObserver(() => {
            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(() => this.mapAll());
            }
            else {
                setTimeout(() => this.mapAll(), 16);
            }
        });
        try {
            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
        catch (err) {
            this.log("error", "observer:error", "Failed to attach observer", err);
            this.observer = null;
        }
    }
}
/* ========================================================================
 * AUTO-REGISTRATION
 * ======================================================================== */
UiSystemAdapterRegistry.register("bootstrap-538", new Bootstrap538AdapterService());
