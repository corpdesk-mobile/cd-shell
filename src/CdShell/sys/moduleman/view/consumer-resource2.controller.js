// ------------------------------------------------------------
// consumer-resource.controller.js
// ------------------------------------------------------------

import { ConfigService } from "../../moduleman/services/config.service";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";

import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export const ctlConsumerResource2 = {
  form: null,
  binder: null,
  svConfig: null,
  sysCache: null,

  resolvedShellConfig: null,

  // ----------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------

  async __init() {
    console.log("[ctlConsumerResource][__init]");

    this.svConfig = new ConfigService();
    this.sysCache = SysCacheService.getInstance(this.svConfig);

    this.form = new CdFormGroup({
      appName: new CdFormControl("", [
        CdValidators.required("App name is required"),
      ]),

      logLevel: new CdFormControl("info"),

      splashEnabled: new CdFormControl(false),
      splashPath: new CdFormControl(""),
      splashMinDuration: new CdFormControl(1000),
    });

    this.binder = new CdDirectiveBinderService(
      this.form,
      "#consumerShellConfigForm",
      this
    );
  },

  async __setup() {
    console.log("[ctlConsumerResource][__setup]");
    await this.sysCache.ensureReady();

    // resolved view (system → consumer → user)
    this.resolvedShellConfig = this.sysCache.get("shellConfig") || {};
  },

  async __activate() {
    console.log("[ctlConsumerResource][__activate]");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlConsumerResource][__afterInit]");

    const cfg = this.resolvedShellConfig;
    if (!cfg) return;

    this.form.controls.appName.setValue(cfg.appName || "");
    this.form.controls.logLevel.setValue(cfg.logLevel || "info");

    this.form.controls.splashEnabled.setValue(cfg.splash?.enabled ?? false);
    this.form.controls.splashPath.setValue(cfg.splash?.path || "");
    this.form.controls.splashMinDuration.setValue(
      cfg.splash?.minDuration ?? 1000
    );

    if (this.binder?.refreshView) this.binder.refreshView();
  },

  __deactivate() {
    console.log("[ctlConsumerResource][__deactivate]");
    if (this.binder?.unbindAllDomEvents) this.binder.unbindAllDomEvents();
  },

  // ----------------------------------------------------------
  // Template
  // ----------------------------------------------------------

  __template() {
    return `
      <div class="cd-panel">
        <h2>Consumer Shell Configuration</h2>

        <form id="consumerShellConfigForm" class="cd-form">
          <fieldset>
            <legend>Identity</legend>

            <div class="cd-form-field">
              <label>Application Name</label>
              <input type="text" name="appName" cdFormControl />
            </div>

            <div class="cd-form-field">
              <label>Log Level</label>
              <select name="logLevel" cdFormControl>
                <option value="debug">debug</option>
                <option value="info">info</option>
                <option value="warn">warn</option>
                <option value="error">error</option>
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend>Startup (Splash)</legend>

            <div class="cd-form-field">
              <label>
                <input type="checkbox" name="splashEnabled" cdFormControl />
                Enable Splash Screen
              </label>
            </div>

            <div class="cd-form-field">
              <label>Splash Asset Path</label>
              <input type="text" name="splashPath" cdFormControl />
            </div>

            <div class="cd-form-field">
              <label>Minimum Duration (ms)</label>
              <input type="number" name="splashMinDuration" cdFormControl />
            </div>
          </fieldset>

          <button cdButton (click)="onSave()">Save Configuration</button>
        </form>
      </div>
    `;
  },

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  async onSave() {
    console.log("[ctlConsumerResource][onSave]");

    const v = this.form.value;

    const patch = {
      appName: v.appName,
      logLevel: v.logLevel,
      splash: {
        enabled: v.splashEnabled,
        path: v.splashPath,
        minDuration: Number(v.splashMinDuration),
      },
      source: "consumer",
    };

    await this.svConfig.updateConsumerShellConfig(patch);

    console.log("[ctlConsumerResource] consumer shellConfig updated", patch);
  },
};

