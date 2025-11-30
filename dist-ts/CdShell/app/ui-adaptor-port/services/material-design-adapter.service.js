import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { diag_css } from "../../../sys/utils/diagnosis";
/**
 * MaterialDesignAdapterService (UMD mode)
 * - Uses window.mdc (UMD) instead of ES imports
 * - Robust DOM transformation and MDC initialization
 */
export class MaterialDesignAdapterService {
    constructor() {
        this.descriptor = null;
        this.observer = null;
        this.appliedSet = new WeakSet();
        this.mdcInitQueued = false;
        this.mdcInstances = new Set();
        console.log("%c[MaterialDesignAdapter] constructor()", "color:#8cf");
    }
    // ---------------------------------------------------------------------------
    // Activation / Deactivation
    // ---------------------------------------------------------------------------
    async activate(descriptor) {
        diag_css("[MaterialDesignAdapter] activate() START", { id: descriptor?.id });
        this.descriptor = descriptor || null;
        if (!descriptor?.conceptMappings) {
            console.warn("[MaterialDesignAdapter] descriptor.conceptMappings missing!");
        }
        else {
            console.log("%c[MaterialDesignAdapter] Loaded conceptMappings:", "color:#0ff", descriptor.conceptMappings);
        }
        // initial mapping
        this.mapAll();
        // observe DOM for new fields
        this.observeMutations();
        diag_css("[MaterialDesignAdapter] activate() COMPLETE", { active: descriptor?.id });
    }
    async deactivate() {
        diag_css("[MaterialDesignAdapter] deactivate() START");
        try {
            document.documentElement.removeAttribute("data-md-theme");
        }
        catch { }
        if (this.observer) {
            try {
                this.observer.disconnect();
            }
            catch { }
            this.observer = null;
        }
        this.descriptor = null;
        this.appliedSet = new WeakSet();
        // destroy MDC instances if any (best-effort)
        try {
            this.mdcInstances.forEach((inst) => { try {
                inst.destroy?.();
            }
            catch { } });
            this.mdcInstances.clear();
        }
        catch { }
        diag_css("[MaterialDesignAdapter] deactivate() COMPLETE");
    }
    // ---------------------------------------------------------------------------
    // Theme
    // ---------------------------------------------------------------------------
    async applyTheme(themeDescriptorOrId) {
        diag_css("[MaterialDesignAdapter] applyTheme()", { themeDescriptorOrId });
        try {
            if (!themeDescriptorOrId) {
                console.warn("[MaterialDesignAdapter] applyTheme ignored (null theme)");
                return;
            }
            let mode;
            if (typeof themeDescriptorOrId === "string")
                mode = themeDescriptorOrId === "dark" ? "dark" : "light";
            else if (typeof themeDescriptorOrId === "object")
                mode = themeDescriptorOrId.mode || (themeDescriptorOrId.id === "dark" ? "dark" : "light");
            document.documentElement.setAttribute("data-md-theme", mode === "dark" ? "dark" : "light");
            diag_css("[MaterialDesignAdapter] applied Material theme", { mode });
        }
        catch (err) {
            console.warn("[MaterialDesignAdapter] applyTheme error", err);
        }
    }
    // ---------------------------------------------------------------------------
    // Concept mapping helpers
    // ---------------------------------------------------------------------------
    getMapping(concept) {
        const mapping = (this.descriptor &&
            this.descriptor.conceptMappings &&
            this.descriptor.conceptMappings[concept]) ||
            undefined;
        console.log(`%c[MaterialDesignAdapter] getMapping('${concept}') =`, "color:#9f9", mapping);
        return mapping;
    }
    applyMappingToElement(el, mapping) {
        if (!mapping)
            return;
        if (this.appliedSet.has(el)) {
            if (mapping.attrs)
                Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
            return;
        }
        console.log("%c[MaterialDesignAdapter] Applying mapping to element:", "color:#7ff;", { tag: el.tagName, mapping });
        if (mapping.class)
            mapping.class.split(/\s+/).forEach(c => c && el.classList.add(c));
        if (mapping.attrs)
            Object.entries(mapping.attrs).forEach(([k, v]) => el.setAttribute(k, v));
        this.appliedSet.add(el);
    }
    // ---------------------------------------------------------------------------
    // DOM transform: create a *real* MDC filled text-field per MDC docs
    // Returns the new wrapper <label.mdc-text-field ...> or null on failure.
    // IMPORTANT: we replace the original .cd-form-field element entirely.
    // ---------------------------------------------------------------------------
    prepareMdcDom(field) {
        if (!field)
            return null;
        if (field.dataset.mdTransformed === "1") {
            // If previously transformed but wrapper was left in place, return it
            const existing = field.querySelector(".mdc-text-field, .cd-md-text-field");
            return existing || null;
        }
        // find native control and label
        const control = field.querySelector("input, textarea, select");
        const labelEl = field.querySelector("label");
        if (!control) {
            console.warn("[prepareMdcDom] no input/textarea/select inside field — skipping", { field });
            return null;
        }
        // label text / fallback
        const labelText = (labelEl?.textContent?.trim() || control.getAttribute("placeholder") || control.name || "").trim();
        // remove placeholder (we'll use floating label)
        try {
            if ("placeholder" in control)
                control.placeholder = "";
        }
        catch { }
        // ensure id
        if (!control.id)
            control.id = `mdc-${Math.random().toString(36).slice(2, 8)}`;
        // Create a <label> wrapper (MDC examples show label as wrapper element)
        const wrapper = document.createElement("label");
        wrapper.className = "mdc-text-field mdc-text-field--filled cd-md-text-field";
        // ripple span (MDC uses span.mdc-text-field__ripple)
        const ripple = document.createElement("span");
        ripple.className = "mdc-text-field__ripple";
        // floating label element (MDC uses span.mdc-floating-label)
        const floatingLabel = document.createElement("span");
        floatingLabel.className = "mdc-floating-label";
        // MDC examples sometimes use <label> for semantics but span is okay; we set aria via input
        floatingLabel.setAttribute("for", control.id);
        floatingLabel.textContent = labelText || "";
        // Ensure input has MDC input class
        control.classList.add("mdc-text-field__input");
        // line ripple
        const lineRipple = document.createElement("span");
        lineRipple.className = "mdc-line-ripple";
        // Build wrapper children in order recommended by MDC (ripple, label, input, line-ripple)
        // NOTE: MDC is tolerant with ordering but this matches examples.
        wrapper.appendChild(ripple);
        wrapper.appendChild(floatingLabel);
        wrapper.appendChild(control);
        wrapper.appendChild(lineRipple);
        // Replace the entire field with wrapper (important: field may be <div>. We replace it.)
        try {
            field.replaceWith(wrapper);
            // Mark transformed on the wrapper
            wrapper.dataset.mdTransformed = "1";
        }
        catch (err) {
            console.warn("[prepareMdcDom] replaceWith failed", err, { field, wrapper });
            return null;
        }
        return wrapper;
    }
    // CSS fallback handlers for focus/blur if MDC not available
    attachCssFallback(wrapper) {
        try {
            const inputEl = wrapper.querySelector("input, textarea, select");
            if (!inputEl)
                return;
            // If a value is present keep label floated
            if (inputEl.value && inputEl.value.length > 0) {
                wrapper.classList.add("mdc-text-field--focused");
            }
            if (!inputEl.__cd_md_handlers_attached) {
                inputEl.addEventListener("focus", () => wrapper.classList.add("mdc-text-field--focused"));
                inputEl.addEventListener("blur", () => {
                    if (!inputEl.value || inputEl.value.length === 0) {
                        wrapper.classList.remove("mdc-text-field--focused");
                    }
                });
                inputEl.__cd_md_handlers_attached = true;
            }
        }
        catch (err) {
            console.warn("[attachCssFallback] error", err);
        }
    }
    // ---------------------------------------------------------------------------
    // MDC initialization (UMD)
    // - Uses window.mdc.* families (textField, floatingLabel, lineRipple)
    // - Accepts a wrapper element (label.mdc-text-field)
    // ---------------------------------------------------------------------------
    initMdcTextField(wrapper) {
        if (!wrapper)
            return;
        try {
            const mdcGlobal = window.mdc;
            if (!mdcGlobal || !mdcGlobal.textField || !mdcGlobal.textField.MDCTextField) {
                // MDC not loaded; attach CSS fallback and return
                this.attachCssFallback(wrapper);
                return;
            }
            // Avoid double-init
            if (wrapper.__cd_mdc_initialized) {
                return;
            }
            // Try to construct MDCTextField
            try {
                const inst = new mdcGlobal.textField.MDCTextField(wrapper);
                // Keep a reference for cleanup
                this.mdcInstances.add(inst);
                wrapper.__cd_mdc_initialized = true;
                // MDC will manage the floating label animation — no further action required.
                // However ensure line ripple exists and is correctly recognized:
                // Some MDC versions expect mdc.textField.MDCTextField to wire everything automatically.
                // If MDC instance has logic to register ripple etc. it's already done.
                console.debug("[MaterialDesignAdapter] MDCTextField constructed", { wrapper, inst });
            }
            catch (err) {
                console.warn("[MaterialDesignAdapter] MDCTextField construction failed — falling back to CSS handlers", err);
                wrapper.__cd_mdc_initialized = false;
                this.attachCssFallback(wrapper);
            }
        }
        catch (err) {
            console.error("[MaterialDesignAdapter] initMdcTextField fatal", err);
            // safe fallback
            this.attachCssFallback(wrapper);
        }
    }
    // queue small debounce for batch-initialization
    scheduleMdcInit() {
        if (this.mdcInitQueued)
            return;
        this.mdcInitQueued = true;
        setTimeout(() => {
            this.mdcInitQueued = false;
            // find all wrappers that are not initialized and call init
            document.querySelectorAll(".cd-md-text-field").forEach((el) => {
                if (!el.__cd_mdc_initialized)
                    this.initMdcTextField(el);
            });
        }, 25);
    }
    // ---------------------------------------------------------------------------
    // Mapping passes
    // ---------------------------------------------------------------------------
    mapButtons() {
        const mapping = this.getMapping("button");
        if (!mapping)
            return;
        const selector = "button[cdButton], button.cd-button";
        const nodes = document.querySelectorAll(selector);
        diag_css("[MaterialDesignAdapter] mapButtons()", { count: nodes.length });
        nodes.forEach((btn) => this.applyMappingToElement(btn, mapping));
    }
    /**
     * mapInputs()
     * - Finds `.cd-form-field` containers
     * - Transforms them into MDC wrappers (label.mdc-text-field)
     * - Initializes MDC (or applies CSS fallback)
     *
     * Notes:
     * - Because prepareMdcDom does a replaceWith(field -> wrapper), we cannot rely on
     *   `field` being present afterwards; we read the returned wrapper.
     */
    mapInputs() {
        const mapping = this.getMapping("input");
        if (!mapping)
            return;
        const formFieldNodes = Array.from(document.querySelectorAll(".cd-form-field"));
        diag_css("[MaterialDesignAdapter] mapInputs()", { candidates: formFieldNodes.length });
        formFieldNodes.forEach((field, idx) => {
            try {
                console.debug(`[MaterialDesignAdapter] mapInputs: FIELD #${idx}`, { field });
                // Transform DOM: prepareMdcDom returns the new wrapper element if successful
                const wrapper = this.prepareMdcDom(field);
                if (!wrapper) {
                    console.debug("[MaterialDesignAdapter] mapInputs: prepareMdcDom returned null (skipping)");
                    return;
                }
                // apply mapping.attrs (if any)
                if (mapping.attrs)
                    Object.entries(mapping.attrs).forEach(([k, v]) => wrapper.setAttribute(k, v));
                // Mark as applied for conceptMapping guard
                this.appliedSet.add(wrapper);
                // Initialize MDC (UMD)
                this.initMdcTextField(wrapper);
                // schedule a global init pass to catch any wrappers that might have been missed
                this.scheduleMdcInit();
                console.debug("[MaterialDesignAdapter] mapInputs: transformed wrapper", { wrapper });
            }
            catch (err) {
                console.warn("[MaterialDesignAdapter] mapInputs error", err);
            }
        });
    }
    mapFormGroups() {
        const mapping = this.getMapping("formGroup");
        if (!mapping)
            return;
        const selector = ".cd-form-field";
        const nodes = document.querySelectorAll(selector);
        diag_css("[MaterialDesignAdapter] mapFormGroups()", { count: nodes.length });
        nodes.forEach((el) => {
            this.applyMappingToElement(el, mapping);
            // Also try transform (safe: prepareMdcDom will skip if already transformed)
            try {
                this.prepareMdcDom(el);
            }
            catch { }
        });
    }
    mapOtherConcepts() {
        const cm = (this.descriptor && this.descriptor.conceptMappings) || {};
        const concepts = Object.keys(cm).filter(c => !["button", "input", "formGroup"].includes(c));
        diag_css("[MaterialDesignAdapter] mapOtherConcepts()", { concepts });
        concepts.forEach((concept) => {
            const mapping = cm[concept];
            const selector = `[data-cd-${concept}], .cd-${concept}`;
            const nodes = document.querySelectorAll(selector);
            nodes.forEach((el) => {
                this.applyMappingToElement(el, mapping);
                try {
                    this.prepareMdcDom(el);
                }
                catch { }
            });
        });
    }
    // master mapping pass
    mapAll() {
        console.log("%c[MaterialDesignAdapter] mapAll() — START", "background:#223;color:#9cf;padding:2px");
        try {
            this.mapButtons();
            this.mapInputs();
            this.mapFormGroups();
            this.mapOtherConcepts();
            this.scheduleMdcInit();
        }
        catch (err) {
            console.warn("[MaterialDesignAdapter] mapAll error", err);
        }
        console.log("%c[MaterialDesignAdapter] mapAll() — END", "background:#223;color:#9cf;padding:2px");
    }
    // ---------------------------------------------------------------------------
    // DOM observer
    // ---------------------------------------------------------------------------
    observeMutations() {
        if (this.observer)
            return;
        diag_css("[MaterialDesignAdapter] MutationObserver ATTACH");
        this.observer = new MutationObserver((mutations) => {
            // lightweight debounce: schedule mapAll on idle
            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(() => this.mapAll());
            }
            else {
                setTimeout(() => this.mapAll(), 24);
            }
        });
        try {
            this.observer.observe(document.body, { childList: true, subtree: true, attributes: false });
        }
        catch (err) {
            console.warn("[MaterialDesignAdapter] observer failed to attach", err);
            this.observer = null;
        }
    }
}
// Self-register with the adapter registry
UiSystemAdapterRegistry.register("material-design", new MaterialDesignAdapterService());
