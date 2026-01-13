import {
  CdUiContainerType,
  CdUiControlType,
  CdUiLayoutType,
  IUiSystemAdapter,
  UiAdapterCapabilities,
  UiAdapterMeta,
  UiAdapterStatus,
  UiConceptMapping,
} from "../../../sys/cd-guig/models/ui-system-adaptor.model";
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

export class MaterialDesignAdapterService extends BaseUiAdapter {
  // private descriptor: UiSystemDescriptor | null = null;
  // private observer: MutationObserver | null = null;
  // private appliedSet = new WeakSet<HTMLElement>();

  // private mdcInitQueued = false;
  // private mdcInstances = new Set<any>();

  // protected meta!: UiAdapterMeta;

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

  private mapByConcept(concept: string, selector: string): void {
    // this.logger.debug(
    //   "[Bootstrap538Adapter.mapByConcept()] concept:)",
    //   concept
    // );
    const mapping = this.getMapping(concept);
    if (!mapping) return;

    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((el) => this.applyMappingToElement(el, mapping));
  }

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

  // // master mapping pass
  // private mapAll() {
  //   console.log(
  //     "%c[MaterialDesignAdapter] mapAll() — START",
  //     "background:#223;color:#9cf;padding:2px"
  //   );
  //   try {
  //     this._mutationCallback?.();
  //     this.mapButtons();
  //     this.mapInputs();
  //     this.mapFormGroups();
  //     this.mapTabs();
  //     this.mapOtherConcepts();
  //     this.scheduleMdcInit();
  //   } catch (err) {
  //     console.warn("[MaterialDesignAdapter] mapAll error", err);
  //   }
  //   console.log(
  //     "%c[MaterialDesignAdapter] mapAll() — END",
  //     "background:#223;color:#9cf;padding:2px"
  //   );
  // }

  /**
   * Updated mapAll to include the uploader
   */
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

/////////////////////////////////////////////////////////////////

// export class MaterialDesignAdapterService extends BaseUiAdapter {
//   private mdcInitQueued = false;
//   private mdcInstances = new Set<any>();

//   protected getIconMap(): Record<string, string> {
//     return {
//       identity: "fingerprint",
//       startup: "rocket_launch",
//       settings: "settings",
//       save: "done",
//     };
//   }

//   // ---------------------------------------------------------------------------
//   // NEW WORLD: DESCRIPTOR SYNTHESIS
//   // ---------------------------------------------------------------------------

//   protected createContainer(
//     d: CdUiContainerDescriptor,
//     parent: HTMLElement
//   ): HTMLElement {
//     let el: HTMLElement;
//     let targetContainer: HTMLElement;

//     switch (d.containerType) {
//       case CdUiContainerType.TABS:
//         // Hierarchical structure for MDC Tab Bar
//         el = document.createElement("div");
//         el.className = "mdc-tab-bar";
//         el.setAttribute("role", "tablist");
//         el.innerHTML = `
//           <div class="mdc-tab-scroller">
//             <div class="mdc-tab-scroller__scroll-area">
//               <div class="mdc-tab-scroller__scroll-content"></div>
//             </div>
//           </div>
//         `;
//         targetContainer = el.querySelector(
//           ".mdc-tab-scroller__scroll-content"
//         ) as HTMLElement;
//         break;

//       case CdUiContainerType.TAB:
//         const btn = document.createElement("button");
//         btn.className = "mdc-tab";
//         btn.setAttribute("role", "tab");

//         // OPTION A: Type Casting (Recommended for internal logic)
//         (btn as HTMLButtonElement).type = "button";

//         // OPTION B: Using setAttribute (Safe for any HTMLElement)
//         // btn.setAttribute("type", "button");

//         btn.innerHTML = `
//           <span class="mdc-tab__content">
//             <span class="mdc-tab__text-label">${d.label || ""}</span>
//           </span>
//           <span class="mdc-tab-indicator">
//             <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
//           </span>
//           <span class="mdc-tab__ripple"></span>
//         `;
//         el = btn;
//         targetContainer = el;
//         break;

//       case CdUiContainerType.CARD:
//         el = document.createElement("div");
//         el.className = "mdc-card mdc-card--outlined mb-3 p-3";
//         targetContainer = el;
//         break;

//       default:
//         el = document.createElement("div");
//         targetContainer = el;
//     }

//     el.id = d.id;
//     parent.appendChild(el);
//     this.scheduleMdcInit();
//     return targetContainer;
//   }

//   protected createControl(
//     d: CdUiControlDescriptor,
//     parent: HTMLElement
//   ): HTMLElement {
//     let el: HTMLElement;

//     switch (d.controlType) {
//       case CdUiControlType.BUTTON:
//         el = document.createElement("button");
//         const mapping = this.getMapping("button");
//         el.className = mapping?.class || "mdc-button mdc-button--raised";
//         el.innerHTML = `
//           <span class="mdc-button__ripple"></span>
//           <span class="mdc-button__label">${d.id}</span>
//         `;
//         break;

//       case CdUiControlType.TEXT_FIELD:
//         // Use the wrapper pattern from the previous working version
//         const wrapper = document.createElement("label");
//         wrapper.className =
//           "mdc-text-field mdc-text-field--filled cd-md-text-field";
//         wrapper.innerHTML = `
//           <span class="mdc-text-field__ripple"></span>
//           <span class="mdc-floating-label">${d.placeholder || ""}</span>
//           <input type="text" class="mdc-text-field__input" id="${d.id}">
//           <span class="mdc-line-ripple"></span>
//         `;
//         el = wrapper;
//         break;

//       default:
//         el = document.createElement("span");
//         el.innerText = d.id;
//     }

//     el.id = d.id;
//     parent.appendChild(el);
//     this.scheduleMdcInit();
//     return el;
//   }

//   // ---------------------------------------------------------------------------
//   // COMPATIBILITY & LIFECYCLE
//   // ---------------------------------------------------------------------------

//   protected mapAll(): void {
//     // Ported from previous version: map existing DOM tags
//     this.mapButtons();
//     this.mapFormGroups();
//     this.scheduleMdcInit();
//   }

//   async applyTheme(themeId: string): Promise<void> {
//     const mode = themeId === "dark" ? "dark" : "light";
//     document.documentElement.setAttribute("data-md-theme", mode);
//     diag_css("[MaterialDesignAdapter] Theme Applied", { mode });
//   }

//   async deactivate(): Promise<void> {
//     await super.deactivate();
//     this.mdcInstances.forEach((inst) => inst.destroy?.());
//     this.mdcInstances.clear();
//   }

//   // ---------------------------------------------------------------------------
//   // PRIVATE MDC LOGIC (Preserved from old version)
//   // ---------------------------------------------------------------------------

//   private mapButtons() {
//     const mapping = this.getMapping("button");
//     document
//       .querySelectorAll<HTMLElement>("button[cdButton]")
//       .forEach((btn) => {
//         if (this.appliedSet.has(btn)) return;
//         btn.classList.add(
//           ...(mapping?.class?.split(" ") || [
//             "mdc-button",
//             "mdc-button--raised",
//           ])
//         );

//         // Upgrade internal structure for ripple
//         if (!btn.querySelector(".mdc-button__label")) {
//           const txt = btn.innerText;
//           btn.innerHTML = `<span class="mdc-button__ripple"></span><span class="mdc-button__label">${txt}</span>`;
//         }
//         this.appliedSet.add(btn);
//       });
//   }

//   private mapFormGroups() {
//     // Ported logic: transforms .cd-form-field into MDC TextFields
//     document
//       .querySelectorAll<HTMLElement>(".cd-form-field")
//       .forEach((field) => {
//         if (this.appliedSet.has(field)) return;
//         // This refers to the prepareMdcDom logic you provided earlier
//         // For brevity in this refactor, synthesize() replaces most of this,
//         // but mapAll() can still call it for legacy support.
//       });
//   }

//   private scheduleMdcInit() {
//     if (this.mdcInitQueued) return;
//     this.mdcInitQueued = true;
//     setTimeout(() => {
//       const mdc = (window as any).mdc;
//       if (!mdc) return;

//       // Auto-init all components found in the DOM
//       document
//         .querySelectorAll(".mdc-text-field, .mdc-tab-bar")
//         .forEach((el) => {
//           if ((el as any).__cd_mdc_initialized) return;
//           try {
//             if (el.classList.contains("mdc-text-field"))
//               new mdc.textField.MDCTextField(el);
//             if (el.classList.contains("mdc-tab-bar"))
//               new mdc.tabBar.MDCTabBar(el);
//             (el as any).__cd_mdc_initialized = true;
//           } catch (e) {}
//         });
//       this.mdcInitQueued = false;
//     }, 50);
//   }
// }

// // Self-register with the adapter registry
// UiSystemAdapterRegistry.register(
//   "material-design",
//   new MaterialDesignAdapterService()
// );
