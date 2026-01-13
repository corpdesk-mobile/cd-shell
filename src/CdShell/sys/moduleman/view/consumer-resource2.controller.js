// src/CdShell/sys/moduleman/view/consumer-resource2.controller.js
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
    console.log("[ctlConsumerResource] resolvedShellConfig:", this.resolvedShellConfig);
  },

  async __activate() {
    console.log("[ctlConsumerResource][__activate]");
    if (this.binder?.bindToDom) await this.binder.bindToDom();
  },

  async __afterInit() {
    console.log("[ctlConsumerResource][__afterInit]");

    const cfg = this.resolvedShellConfig;
    console.log("[ctlConsumerResource] resolvedShellConfig:", cfg);
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
      <div class="cd-panel-header">
        <h2><i class="bi bi-gear-wide-connected"></i> Tenant Shell Administration</h2>
        <p class="text-muted">Manage corporate branding, UI enforcement policies, and user permissions.</p>
      </div>

      <form id="consumerShellConfigForm" class="cd-form">
        
        <cd-tabs id="shellConfigTabs" active-tab="tab-identity">
          
          <cd-tab id="tab-identity" icon="fingerprint" label="Identity">
            <div class="cd-section-box mt-3">
              <div class="cd-form-field">
                <label>Application Display Name</label>
                <input type="text" name="appName" cdFormControl placeholder="e.g. CorpDesk Enterprise" />
              </div>
              <div class="cd-form-field">
                <label>Application Description</label>
                <textarea name="appDescription" cdFormControl rows="2"></textarea>
              </div>
              <div class="cd-form-field mt-4">
                  <label class="fw-bold">Corporate Logo</label>
                  <p class="text-muted small">Update your organization's visual identity. Supported: PNG, JPG (Max 2MB).</p>
                  
                  <gvp-uploader 
                    name="tenantLogo" 
                    cdFormControl 
                    accept=".png,.jpg,.jpeg"
                    max-size="2048"
                    data-current-preview="${this.form?.controls?.tenantLogo?.value || 'http://localhost:5173/themes/default/logo.png'}">
                  </gvp-uploader>
                </div>
            </div>
          </cd-tab>

          <cd-tab id="tab-environment" icon="cpu" label="Environment">
            <div class="cd-section-box mt-3">
              <div class="cd-form-field">
                <label>Default Startup Module</label>
                <input type="text" name="defaultModulePath" cdFormControl placeholder="sys/dashboard" />
              </div>
              
              <div class="cd-grid col-2">
                <div class="cd-form-field">
                  <label>Log Verbosity</label>
                  <select name="logLevel" cdFormControl>
                    <option value="debug">Debug (Development)</option>
                    <option value="info">Info (Standard)</option>
                    <option value="warn">Warn (Production)</option>
                    <option value="error">Error (Critical Only)</option>
                  </select>
                </div>
                <div class="cd-form-field">
                  <label>Splash Duration (ms)</label>
                  <input type="number" name="splashMinDuration" cdFormControl />
                </div>
              </div>

              <div class="cd-form-field checkbox-group">
                <label>
                  <input type="checkbox" name="splashEnabled" cdFormControl />
                  Enable Animated Boot Sequence (Splash)
                </label>
              </div>
            </div>
          </cd-tab>

          <cd-tab id="tab-governance" icon="shield-lock" label="UI Governance">
            <div class="cd-section-box mt-3">
              <h5>Default Visual Experience</h5>
              <div class="cd-grid col-3">
                <div class="cd-form-field">
                  <label>System Adaptor</label>
                  <select name="defaultUiSystemId" cdFormControl>
                    <option value="bootstrap-538">Bootstrap 5</option>
                    <option value="material">Material Design</option>
                  </select>
                </div>
                <div class="cd-form-field">
                  <label>Corporate Theme</label>
                  <select name="defaultThemeId" cdFormControl>
                    <option value="default">Light (Default)</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
                <div class="cd-form-field">
                  <label>Form Style</label>
                  <select name="defaultFormVariant" cdFormControl>
                    <option value="standard">Standard</option>
                    <option value="outlined">Outlined</option>
                    <option value="filled">Filled</option>
                  </select>
                </div>
              </div>

              <h5 class="mt-4 text-danger">Enforced Policies (Locks)</h5>
              <div class="cd-policy-grid">
                <div class="cd-form-field">
                  <label><input type="checkbox" name="lockUiSystem" cdFormControl /> Lock UI Framework</label>
                </div>
                <div class="cd-form-field">
                  <label><input type="checkbox" name="lockTheme" cdFormControl /> Lock Corporate Theme</label>
                </div>
              </div>
            </div>
          </cd-tab>

          <cd-tab id="tab-personalization" icon="person-gear" label="Personalization">
            <div class="cd-section-box mt-3">
              <div class="cd-form-field">
                <label class="cd-switch">
                  <input type="checkbox" name="userPersonalizationAllowed" cdFormControl />
                  <span class="cd-slider"></span>
                  Allow Users to customize their own Theme/UI
                </label>
                <p class="text-small text-muted">If disabled, the "User Preferences" menu will be hidden for all non-admin users.</p>
              </div>
            </div>
          </cd-tab>

        </cd-tabs>

        <div class="cd-action-bar mt-4">
          <button cdButton class="btn-save" (click)="onSave()">
            <i class="bi bi-cloud-check"></i> Commit Tenant Configuration
          </button>
        </div>
        
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
