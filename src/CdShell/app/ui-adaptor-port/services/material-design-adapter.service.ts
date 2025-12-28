// src/CdShell/app/ui-adaptor-port/services/material-design-adapter.service.ts
// Full MaterialDesignAdapterService — Model-A (UMD) implementation
import type { UiConceptMapping } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import type { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";
import { diag_css } from "../../../sys/utils/diagnosis";

type Mapping = UiConceptMapping | undefined;

export class MaterialDesignAdapterService implements IUiSystemAdapter {
  private descriptor: UiSystemDescriptor | null = null;
  private observer: MutationObserver | null = null;
  private appliedSet = new WeakSet<HTMLElement>();

  private mdcInitQueued = false;
  private mdcInstances = new Set<any>();

  constructor() {
    console.log("%c[MaterialDesignAdapter] constructor()", "color:#8cf");
  }

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
