import { ConfigService } from "../../moduleman/services/config.service";
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
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
  svConfig: null,

  __init() {
    console.log("[ctlCdAdminSettings][__init] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const svUiSystemLoader = UiSystemLoaderService.getInstance(sysCache);
    const svUiThemeLoader = UiThemeLoaderService.getInstance(sysCache);
    sysCache.setLoaders(svUiSystemLoader, svUiThemeLoader);

    // Access cached loaders safely
    this.uiSystemLoader = sysCache.uiSystemLoader ?? null;
    this.uiThemeLoader = sysCache.uiThemeLoader ?? null;

    this.svCdAdmin = new CdAdminService(sysCache);

    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [
        CdValidators.required("Select UI System"),
      ]),
      theme: new CdFormControl("", [CdValidators.required("Select Theme")]),
      formType: new CdFormControl("", [
        CdValidators.required("Select Form Type"),
      ]),
    });

    this.binder = new CdDirectiveBinderService(
      this.form,
      "#settingsForm",
      this
    );
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

        <button cdButton>Apply Settings</button>
      </form>
    `;
  },

  get uiSystemOptionsHtml() {
    console.log("[ctlCdAdminSettings][uiSystemOptionsHtml] start...");

    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const svUiSystemLoader = UiSystemLoaderService.getInstance(sysCache);
    const svUiThemeLoader = UiThemeLoaderService.getInstance(sysCache);
    sysCache.setLoaders(svUiSystemLoader, svUiThemeLoader);

    // ✔ Runtime-aware full descriptor list
    const uiSystems = sysCache.get("uiSystems") || [];
    // const uiSystems = sysCache.getUiSystems() || [];

    console.log(
      "[ctlCdAdminSettings][uiSystemOptionsHtml] uiSystemsRaw:",
      inspect(uiSystems, { depth: 2 })
    );

    if (!uiSystems.length) {
      return `<option value="">-- No UI Systems Found --</option>`;
    }

    const options = uiSystems
      .map((sys) => {
        const label =
          sys.id || sys.name || sys.displayName || "Unnamed UI System";

        return `<option value="${sys.id}">${label}</option>`;
      })
      .join("");

    return `<option value="">-- Select UI System --</option>${options}`;
  },

  get themeOptionsHtml() {
    console.log("[ctlCdAdminSettings][themeOptionsHtml] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const themesObj = sysCache.getThemes();
    console.log(
      "[ctlCdAdminSettings][themeOptionsHtml] themes:",
      inspect(themesObj, { depth: 2 })
    );

    const themes = Array.isArray(themesObj)
      ? themesObj
      : themesObj?.themes || [];

    if (!themes.length)
      return `<option value="">-- No Themes Available --</option>`;

    const options = themes
      .map((t) => `<option value="${t.id}">${t.displayName ?? t.name}</option>`)
      .join("");

    return `<option value="">-- Select Theme --</option>${options}`;
  },

  get formVariantOptionsHtml() {
    console.log("[ctlCdAdminSettings][formVariantOptionsHtml] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    const variants = sysCache.getFormVariants();
    console.log(
      "[ctlCdAdminSettings][formVariantOptionsHtml] variants:",
      inspect(variants, { depth: 2 })
    );

    if (!variants.length) return `<option value="">-- No Variants --</option>`;

    const options = variants
      .map((v) => `<option value="${v.id}">${v.displayName ?? v.name}</option>`)
      .join("");

    return `<option value="">-- Select Variant --</option>${options}`;
  },

  async __setup() {
    console.log("[ctlCdAdminSettings][__setup] start...");
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);
    await sysCache.ensureReady();
  },

  async __activate() {
    console.log("[ctlCdAdminSettings][__activate] start...");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlCdAdminSettings][__afterInit] start...");
    const formControls = this.form.controls;
    this.svConfig = new ConfigService();
    const sysCache = SysCacheService.getInstance(this.svConfig);

    const systems = sysCache.getUiSystems();
    const themesObj = sysCache.getThemes();
    const themes = Array.isArray(themesObj)
      ? themesObj
      : themesObj?.themes || [];
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
    try {
      const newSystemId = (e && e.target && e.target.value) || e;
      if (!newSystemId) {
        console.warn("[ctlCdAdminSettings.onUiSystemChange] empty selection");
        return;
      }

      console.log("🧩 UI System change requested:", newSystemId);

      // instantiate services (match how other controllers do it)
      const cfgSvc = new ConfigService();
      const sysCache = SysCacheService.getInstance(cfgSvc);
      const uiSystemLoader = UiSystemLoaderService.getInstance(sysCache);
      const uiThemeLoader = UiThemeLoaderService.getInstance(sysCache);

      // 1) Activate (loads CSS/JS, bridge.css, adapter.activate())
      await uiSystemLoader.activate(newSystemId);
      console.log("[ctlCdAdminSettings] ui-system activated:", newSystemId);

      // 2) Determine theme for this system (prefer system-default or 'default')
      const activeDesc =
        uiSystemLoader.getSystemById(newSystemId) || uiSystemLoader.getActive();
      let themeId = null;
      if (
        activeDesc &&
        activeDesc.themesAvailable &&
        activeDesc.themesAvailable.length > 0
      ) {
        const defaultT = activeDesc.themesAvailable.find(
          (t) => t.default || t.id === "default" || t.name === "Default"
        );
        themeId = defaultT
          ? defaultT.id || defaultT.name
          : activeDesc.themesAvailable[0].id;
      }
      if (!themeId) themeId = "default";

      // 3) Apply theme via UiSystemLoaderService (which calls adapter.applyTheme)
      try {
        await uiSystemLoader.applyTheme(newSystemId, themeId);
        console.log("[ctlCdAdminSettings] theme applied:", themeId);
      } catch (err) {
        console.warn("[ctlCdAdminSettings] applyTheme failed, continuing", err);
      }

      // 4) Persist selection to shell config (so next launch uses it)
      try {
        const cfg = await cfgSvc.loadConfig();
        cfg.uiConfig = cfg.uiConfig || {};
        cfg.uiConfig.defaultUiSystemId = newSystemId;
        cfg.uiConfig.defaultThemeId = themeId;
        await cfgSvc.saveConfig(cfg);
        console.log("[ctlCdAdminSettings] persisted uiConfig", {
          newSystemId,
          themeId,
        });
      } catch (err) {
        console.warn("[ctlCdAdminSettings] failed to persist config", err);
      }

      // 5) Broadcast event so other modules can re-bind/recompute if needed
      try {
        const ev = new CustomEvent("cd:ui-system:changed", {
          detail: { systemId: newSystemId, themeId },
          bubbles: true,
        });
        document.dispatchEvent(ev);
        console.log("[ctlCdAdminSettings] dispatched cd:ui-system:changed");
      } catch (err) {
        console.warn("[ctlCdAdminSettings] event dispatch failed", err);
      }

      // 6) Re-run directive binder if needed (safe no-op if not present)
      try {
        if (
          window.CdDirectiveBinderService &&
          typeof window.CdDirectiveBinderService.bindToDom === "function"
        ) {
          window.CdDirectiveBinderService.bindToDom(document.body);
          console.log(
            "[ctlCdAdminSettings] CdDirectiveBinderService.bindToDom triggered"
          );
        } else if (
          window.CdDirectiveBinderServiceInstance &&
          typeof window.CdDirectiveBinderServiceInstance.bindToDom ===
            "function"
        ) {
          window.CdDirectiveBinderServiceInstance.bindToDom(document.body);
        }
      } catch (err) {
        console.warn("[ctlCdAdminSettings] binder re-run failed", err);
      }

      // 7) UI feedback (optional): show a toast/alert to user
      // showToast("UI system switched — some visuals may update", "success");
    } catch (err) {
      console.error(
        "[ctlCdAdminSettings.onUiSystemChange] uncaught error",
        err
      );
    }
  },

  async onThemeChange(e) {
    console.log("🎨 Theme changed:", e.target.value);
  },

  async onFormVariantChange(e) {
    console.log("🧱 Form Variant changed:", e.target.value);
  },
};
