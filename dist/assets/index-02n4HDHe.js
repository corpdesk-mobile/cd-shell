import{C as r,S as c}from"./index-D0XT-TRy.js";import{C as d,a as l,b as m,c as u}from"./cd-directive-binder.service-DGbLY5eG.js";const n={form:null,binder:null,svConfig:null,sysCache:null,resolvedShellConfig:null,async __init(){console.log("[ctlConsumerResource][__init]"),this.svConfig=new r,this.sysCache=c.getInstance(this.svConfig),this.form=new d({appName:new l("",[m.required("App name is required")]),logLevel:new l("info"),splashEnabled:new l(!1),splashPath:new l(""),splashMinDuration:new l(1e3)}),this.binder=new u(this.form,"#consumerShellConfigForm",this)},async __setup(){console.log("[ctlConsumerResource][__setup]"),await this.sysCache.ensureReady(),this.resolvedShellConfig=this.sysCache.get("shellConfig")||{}},async __activate(){var e;console.log("[ctlConsumerResource][__activate]"),(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()},async __afterInit(){var o,s,t,a;console.log("[ctlConsumerResource][__afterInit]");const e=this.resolvedShellConfig;e&&(this.form.controls.appName.setValue(e.appName||""),this.form.controls.logLevel.setValue(e.logLevel||"info"),this.form.controls.splashEnabled.setValue(((o=e.splash)==null?void 0:o.enabled)??!1),this.form.controls.splashPath.setValue(((s=e.splash)==null?void 0:s.path)||""),this.form.controls.splashMinDuration.setValue(((t=e.splash)==null?void 0:t.minDuration)??1e3),(a=this.binder)!=null&&a.refreshView&&this.binder.refreshView())},__deactivate(){var e;console.log("[ctlConsumerResource][__deactivate]"),(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},__template(){return`
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
    `},async onSave(){console.log("[ctlConsumerResource][onSave]");const e=this.form.value,o={appName:e.appName,logLevel:e.logLevel,splash:{enabled:e.splashEnabled,path:e.splashPath,minDuration:Number(e.splashMinDuration)},source:"consumer"};await this.svConfig.updateConsumerShellConfig(o),console.log("[ctlConsumerResource] consumer shellConfig updated",o)}},i={form:null,binder:null,svConfig:null,sysCache:null,resolvedShellConfig:null,async __init(){console.log("[ctlConsumerResource][__init]"),this.svConfig=new r,this.sysCache=c.getInstance(this.svConfig),this.form=new d({appName:new l("",[m.required("App name is required")]),logLevel:new l("info"),splashEnabled:new l(!1),splashPath:new l(""),splashMinDuration:new l(1e3)}),this.binder=new u(this.form,"#consumerShellConfigForm",this)},async __setup(){console.log("[ctlConsumerResource][__setup]"),await this.sysCache.ensureReady(),this.resolvedShellConfig=this.sysCache.get("shellConfig")||{},console.log("[ctlConsumerResource] resolvedShellConfig:",this.resolvedShellConfig)},async __activate(){var e;console.log("[ctlConsumerResource][__activate]"),(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()},async __afterInit(){var o,s,t,a;console.log("[ctlConsumerResource][__afterInit]");const e=this.resolvedShellConfig;console.log("[ctlConsumerResource] resolvedShellConfig:",e),e&&(this.form.controls.appName.setValue(e.appName||""),this.form.controls.logLevel.setValue(e.logLevel||"info"),this.form.controls.splashEnabled.setValue(((o=e.splash)==null?void 0:o.enabled)??!1),this.form.controls.splashPath.setValue(((s=e.splash)==null?void 0:s.path)||""),this.form.controls.splashMinDuration.setValue(((t=e.splash)==null?void 0:t.minDuration)??1e3),(a=this.binder)!=null&&a.refreshView&&this.binder.refreshView())},__deactivate(){var e;console.log("[ctlConsumerResource][__deactivate]"),(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},__template(){var e,o,s;return`
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
                    data-current-preview="${((s=(o=(e=this.form)==null?void 0:e.controls)==null?void 0:o.tenantLogo)==null?void 0:s.value)||"http://localhost:5173/themes/default/logo.png"}">
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
  `},async onSave(){console.log("[ctlConsumerResource][onSave]");const e=this.form.value,o={appName:e.appName,logLevel:e.logLevel,splash:{enabled:e.splashEnabled,path:e.splashPath,minDuration:Number(e.splashMinDuration)},source:"consumer"};await this.svConfig.updateConsumerShellConfig(o),console.log("[ctlConsumerResource] consumer shellConfig updated",o)}},p={ctx:"sys",moduleId:"moduleman-consumer-resource",moduleName:"consumer-resource",moduleGuid:"consr-0001-0000-0000",controllers:[{name:"consumer-resource",instance:n,template:n.__template(),default:!1},{name:"consumer-resource2",instance:i,template:i.__template(),default:!1}],menu:[{label:"consumer",route:"sys/consumer",children:[{label:"consumer-resource",itemType:"route",route:"sys/moduleman/consumer-resource",template:n.__template()},{label:"consumer-resource2",itemType:"route",route:"sys/moduleman/consumer-resource2",template:i.__template()}]}]},v=p;export{p as consumerResourceModule,v as module};
