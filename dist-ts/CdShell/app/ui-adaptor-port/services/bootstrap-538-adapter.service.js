import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { diag_css } from "../../../sys/utils/diagnosis";
export class Bootstrap538AdapterService {
    constructor() {
        this.descriptor = null;
        this.observer = null;
        this.appliedSet = new WeakSet();
        console.log("%c[Bootstrap538AdapterService] constructor()", "color:#6cf");
    }
    // ---------------------------------------------------------------------------
    // ACTIVATION
    // ---------------------------------------------------------------------------
    async activate(descriptor) {
        diag_css("[Bootstrap538Adapter] activate() START", { id: descriptor?.id });
        this.descriptor = descriptor || null;
        if (!descriptor?.conceptMappings) {
            console.warn("%c[Bootstrap538Adapter] descriptor.conceptMappings missing!", "color:orange");
        }
        else {
            console.log("%c[Bootstrap538Adapter] Loaded conceptMappings:", "color:#0ff", descriptor.conceptMappings);
        }
        // Initial mapping
        diag_css("[Bootstrap538Adapter] Initial mapAll() pass");
        this.mapAll();
        // Start observing DOM changes
        this.observeMutations();
        diag_css("[Bootstrap538Adapter] activate() COMPLETE", {
            active: descriptor?.id,
        });
    }
    // ---------------------------------------------------------------------------
    // DEACTIVATION
    // ---------------------------------------------------------------------------
    async deactivate() {
        diag_css("[Bootstrap538Adapter] deactivate() START");
        try {
            document.documentElement.removeAttribute("data-bs-theme");
            console.log("[Bootstrap538Adapter] removed data-bs-theme");
        }
        catch { }
        if (this.observer) {
            try {
                this.observer.disconnect();
                console.log("[Bootstrap538Adapter] MutationObserver disconnected");
            }
            catch { }
            this.observer = null;
        }
        this.descriptor = null;
        this.appliedSet = new WeakSet();
        diag_css("[Bootstrap538Adapter] deactivate() COMPLETE");
    }
    // ---------------------------------------------------------------------------
    // THEME APPLICATION
    // ---------------------------------------------------------------------------
    async applyTheme(themeDescriptorOrId) {
        diag_css("[Bootstrap538Adapter] applyTheme()", { themeDescriptorOrId });
        try {
            if (!themeDescriptorOrId) {
                console.warn("[Bootstrap538Adapter] applyTheme ignored (null theme)");
                return;
            }
            let mode;
            if (typeof themeDescriptorOrId === "string") {
                mode = themeDescriptorOrId === "dark" ? "dark" : "light";
            }
            else if (typeof themeDescriptorOrId === "object") {
                mode =
                    themeDescriptorOrId.mode ||
                        (themeDescriptorOrId.id === "dark" ? "dark" : "light");
            }
            document.documentElement.setAttribute("data-bs-theme", mode === "dark" ? "dark" : "light");
            diag_css("[Bootstrap538Adapter] applied Bootstrap theme", { mode });
        }
        catch (err) {
            console.warn("[Bootstrap538Adapter] applyTheme error", err);
        }
    }
    // ---------------------------------------------------------------------------
    // CONCEPT MAPPING
    // ---------------------------------------------------------------------------
    getMapping(concept) {
        console.log('[Bootstrap538Adapter] getMapping() this.descriptor:', this.descriptor);
        const mapping = (this.descriptor &&
            this.descriptor.conceptMappings &&
            this.descriptor.conceptMappings[concept]) ||
            undefined;
        console.log(`%c[Bootstrap538Adapter] getMapping('${concept}') =`, "color:#9f9", mapping);
        return mapping;
    }
    applyMappingToElement(el, mapping) {
        if (!mapping)
            return;
        if (this.appliedSet.has(el)) {
            // Already mapped but update attributes if any
            if (mapping.attrs) {
                Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
            }
            return;
        }
        console.log("%c[Bootstrap538Adapter] Applying mapping to element:", "color:#7ff;", { tag: el.tagName, mapping });
        if (mapping.class) {
            mapping.class.split(/\s+/).forEach((c) => {
                if (c)
                    el.classList.add(c);
            });
        }
        if (mapping.attrs) {
            Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
        }
        this.appliedSet.add(el);
    }
    // ---------------------------------------------------------------------------
    // SPECIFIC MAPPING PASSES
    // ---------------------------------------------------------------------------
    mapButtons() {
        const mapping = this.getMapping("button");
        if (!mapping)
            return;
        const selector = "button[cdButton], button.cd-button";
        const nodes = document.querySelectorAll(selector);
        diag_css("[Bootstrap538Adapter] mapButtons()", { count: nodes.length });
        nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
    }
    mapInputs() {
        const mapping = this.getMapping("input");
        if (!mapping)
            return;
        const selector = "input[cdFormControl], textarea[cdFormControl], select[cdFormControl]";
        const nodes = document.querySelectorAll(selector);
        diag_css("[Bootstrap538Adapter] mapInputs()", { count: nodes.length });
        nodes.forEach((el) => this.applyMappingToElement(el, mapping));
    }
    mapFormGroups() {
        const mapping = this.getMapping("formGroup");
        if (!mapping)
            return;
        const selector = ".cd-form-field";
        const nodes = document.querySelectorAll(selector);
        diag_css("[Bootstrap538Adapter] mapFormGroups()", { count: nodes.length });
        nodes.forEach((el) => this.applyMappingToElement(el, mapping));
    }
    mapOtherConcepts() {
        const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
        const concepts = Object.keys(cm).filter((c) => !["button", "input", "formGroup"].includes(c));
        diag_css("[Bootstrap538Adapter] mapOtherConcepts()", { concepts });
        concepts.forEach((concept) => {
            const mapping = cm[concept];
            const selector = `[data-cd-${concept}], .cd-${concept}`;
            const nodes = document.querySelectorAll(selector);
            nodes.forEach((el) => this.applyMappingToElement(el, mapping));
        });
    }
    // master mapping pass
    mapAll() {
        console.log("%c[Bootstrap538Adapter] mapAll() — START", "background:#444;color:#aaf;padding:2px");
        try {
            this.mapButtons();
            this.mapInputs();
            this.mapFormGroups();
            this.mapOtherConcepts();
        }
        catch (err) {
            console.warn("[Bootstrap538Adapter] mapAll error", err);
        }
        console.log("%c[Bootstrap538Adapter] mapAll() — END", "background:#444;color:#aaf;padding:2px");
    }
    // ---------------------------------------------------------------------------
    // DOM OBSERVER
    // ---------------------------------------------------------------------------
    observeMutations() {
        if (this.observer)
            return;
        diag_css("[Bootstrap538Adapter] MutationObserver ATTACH");
        this.observer = new MutationObserver((mutations) => {
            console.log("%c[Bootstrap538Adapter] Mutation detected → scheduling mapAll()", "color:#ffa;");
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
                attributes: false,
            });
        }
        catch (err) {
            console.warn("[Bootstrap538Adapter] observer failed to attach", err);
            this.observer = null;
        }
    }
}
// Self-register
UiSystemAdapterRegistry.register("bootstrap-538", new Bootstrap538AdapterService());
