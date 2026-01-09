import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { diag_css } from "../../../sys/utils/diagnosis";
export class BulmaAdapterService {
    constructor() {
        this.descriptor = null;
        this.observer = null;
        this.appliedSet = new WeakSet();
        console.log("%c[BulmaAdapterService] constructor()", "color:#6cf");
    }
    setMeta(meta) {
        this.meta = meta;
    }
    async activate(descriptor) {
        diag_css("[BulmaAdapter] activate()", { id: descriptor.id });
        this.descriptor = descriptor || null;
        this.mapAll();
        this.observeMutations();
        diag_css("[BulmaAdapter] activate() COMPLETE");
    }
    async deactivate() {
        diag_css("[BulmaAdapter] deactivate()");
        document.documentElement.removeAttribute("data-bulma-theme");
        if (this.observer)
            this.observer.disconnect();
        this.observer = null;
        this.descriptor = null;
        this.appliedSet = new WeakSet();
    }
    async applyTheme(theme) {
        const mode = typeof theme === "string"
            ? theme
            : theme?.mode || (theme?.id === "dark" ? "dark" : "light");
        document.documentElement.setAttribute("data-bulma-theme", mode === "dark" ? "dark" : "light");
        diag_css("[BulmaAdapter] Theme applied", { mode });
    }
    getMapping(concept) {
        return ((this.descriptor &&
            this.descriptor.conceptMappings &&
            this.descriptor.conceptMappings[concept]) ||
            undefined);
    }
    applyMappingToElement(el, mapping) {
        if (!mapping)
            return;
        if (this.appliedSet.has(el))
            return;
        if (mapping.class) {
            mapping.class.split(/\s+/).forEach((c) => c && el.classList.add(c));
        }
        if (mapping.attrs) {
            Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
        }
        this.appliedSet.add(el);
    }
    mapButtons() {
        const mapping = this.getMapping("button");
        if (!mapping)
            return;
        const nodes = document.querySelectorAll("button[cdButton], button.cd-button");
        nodes.forEach((n) => this.applyMappingToElement(n, mapping));
    }
    mapInputs() {
        const mapping = this.getMapping("input");
        if (!mapping)
            return;
        const nodes = document.querySelectorAll("input[cdFormControl], textarea[cdFormControl], select[cdFormControl]");
        nodes.forEach((n) => this.applyMappingToElement(n, mapping));
    }
    mapFormGroups() {
        const mapping = this.getMapping("formGroup");
        if (!mapping)
            return;
        const nodes = document.querySelectorAll(".cd-form-field");
        nodes.forEach((n) => this.applyMappingToElement(n, mapping));
    }
    mapOtherConcepts() {
        const cm = this.descriptor?.conceptMappings || {};
        const concepts = Object.keys(cm).filter((c) => !["button", "input", "formGroup"].includes(c));
        concepts.forEach((concept) => {
            const mapping = cm[concept];
            const nodes = document.querySelectorAll(`[data-cd-${concept}], .cd-${concept}`);
            nodes.forEach((n) => this.applyMappingToElement(n, mapping));
        });
    }
    mapAll() {
        this.mapButtons();
        this.mapInputs();
        this.mapFormGroups();
        this.mapOtherConcepts();
    }
    observeMutations() {
        if (this.observer)
            return;
        this.observer = new MutationObserver(() => {
            if ("requestIdleCallback" in window)
                requestIdleCallback(() => this.mapAll());
            else
                setTimeout(() => this.mapAll(), 16);
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
}
UiSystemAdapterRegistry.register("bulma", new BulmaAdapterService());
