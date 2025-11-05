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

  __init() {
    console.log("[ctlCdAdminSettings][__init] start...");
    const sysCache = SysCacheService.getInstance();

    // Access cached loaders safely
    this.uiSystemLoader = sysCache.uiSystemLoader ?? null;
    this.uiThemeLoader = sysCache.uiThemeLoader ?? null;

    this.svCdAdmin = new CdAdminService(sysCache);

    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [CdValidators.required("Select UI System")]),
      theme: new CdFormControl("", [CdValidators.required("Select Theme")]),
      formType: new CdFormControl("", [CdValidators.required("Select Form Type")]),
    });

    this.binder = new CdDirectiveBinderService(this.form, "#settingsForm", this);
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

        <button type="submit">Apply Settings</button>
      </form>
    `;
  },

  // ------------------------
  // FIXED GETTERS
  // ------------------------
  get uiSystemOptionsHtml() {
    console.log("[ctlCdAdminSettings][uiSystemOptionsHtml] start...");
    const sysCache = SysCacheService.getInstance();
    const uiSystems = sysCache.getUiSystems();
    console.log("[ctlCdAdminSettings][uiSystemOptionsHtml] uiSystems:", inspect(uiSystems, { depth: 2 }));

    if (!uiSystems.length) return `<option value="">-- No Systems Found --</option>`;

    const options = uiSystems
      .map((sys) => `<option value="${sys.id}">${sys.displayName ?? sys.name}</option>`)
      .join("");

    return `<option value="">-- Select UI System --</option>${options}`;
  },

  get themeOptionsHtml() {
    console.log("[ctlCdAdminSettings][themeOptionsHtml] start...");
    const sysCache = SysCacheService.getInstance();
    const themesObj = sysCache.getThemes();
    console.log("[ctlCdAdminSettings][themeOptionsHtml] themes:", inspect(themesObj, { depth: 2 }));

    const themes = Array.isArray(themesObj) ? themesObj : themesObj?.themes || [];

    if (!themes.length) return `<option value="">-- No Themes Available --</option>`;

    const options = themes
      .map((t) => `<option value="${t.id}">${t.displayName ?? t.name}</option>`)
      .join("");

    return `<option value="">-- Select Theme --</option>${options}`;
  },

  get formVariantOptionsHtml() {
    console.log("[ctlCdAdminSettings][formVariantOptionsHtml] start...");
    const sysCache = SysCacheService.getInstance();
    const variants = sysCache.getFormVariants();
    console.log("[ctlCdAdminSettings][formVariantOptionsHtml] variants:", inspect(variants, { depth: 2 }));

    if (!variants.length) return `<option value="">-- No Variants --</option>`;

    const options = variants
      .map((v) => `<option value="${v.id}">${v.displayName ?? v.name}</option>`)
      .join("");

    return `<option value="">-- Select Variant --</option>${options}`;
  },

  async __setup() {
    console.log("[ctlCdAdminSettings][__setup] start...");
    const sysCache = SysCacheService.getInstance();
    await sysCache.ensureReady();
  },

  async __activate() {
    console.log("[ctlCdAdminSettings][__activate] start...");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlCdAdminSettings][__afterInit] start...");
    const formControls = this.form.controls;
    const sysCache = SysCacheService.getInstance();

    const systems = sysCache.getUiSystems();
    const themesObj = sysCache.getThemes();
    const themes = Array.isArray(themesObj) ? themesObj : themesObj?.themes || [];
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
    console.log("🧩 UI System changed:", e.target.value);
    this.currentUiSystemId = e.target.value;
  },

  async onThemeChange(e) {
    console.log("🎨 Theme changed:", e.target.value);
  },

  async onFormVariantChange(e) {
    console.log("🧱 Form Variant changed:", e.target.value);
  },
};
