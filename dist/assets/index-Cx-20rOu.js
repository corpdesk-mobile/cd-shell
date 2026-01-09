import{C as r,S as c}from"./index-3HGaamVL.js";import{C as u,a as s,b as d,c as m}from"./cd-directive-binder.service-DGbLY5eG.js";const a={form:null,binder:null,svConfig:null,sysCache:null,resolvedShellConfig:null,async __init(){console.log("[ctlConsumerResource][__init]"),this.svConfig=new r,this.sysCache=c.getInstance(this.svConfig),this.form=new u({appName:new s("",[d.required("App name is required")]),logLevel:new s("info"),splashEnabled:new s(!1),splashPath:new s(""),splashMinDuration:new s(1e3)}),this.binder=new m(this.form,"#consumerShellConfigForm",this)},async __setup(){console.log("[ctlConsumerResource][__setup]"),await this.sysCache.ensureReady(),this.resolvedShellConfig=this.sysCache.get("shellConfig")||{}},async __activate(){var e;console.log("[ctlConsumerResource][__activate]"),(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()},async __afterInit(){var o,l,n,t;console.log("[ctlConsumerResource][__afterInit]");const e=this.resolvedShellConfig;e&&(this.form.controls.appName.setValue(e.appName||""),this.form.controls.logLevel.setValue(e.logLevel||"info"),this.form.controls.splashEnabled.setValue(((o=e.splash)==null?void 0:o.enabled)??!1),this.form.controls.splashPath.setValue(((l=e.splash)==null?void 0:l.path)||""),this.form.controls.splashMinDuration.setValue(((n=e.splash)==null?void 0:n.minDuration)??1e3),(t=this.binder)!=null&&t.refreshView&&this.binder.refreshView())},__deactivate(){var e;console.log("[ctlConsumerResource][__deactivate]"),(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},__template(){return`
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
    `},async onSave(){console.log("[ctlConsumerResource][onSave]");const e=this.form.value,o={appName:e.appName,logLevel:e.logLevel,splash:{enabled:e.splashEnabled,path:e.splashPath,minDuration:Number(e.splashMinDuration)},source:"consumer"};await this.svConfig.updateConsumerShellConfig(o),console.log("[ctlConsumerResource] consumer shellConfig updated",o)}},i={form:null,binder:null,svConfig:null,sysCache:null,resolvedShellConfig:null,async __init(){console.log("[ctlConsumerResource][__init]"),this.svConfig=new r,this.sysCache=c.getInstance(this.svConfig),this.form=new u({appName:new s("",[d.required("App name is required")]),logLevel:new s("info"),splashEnabled:new s(!1),splashPath:new s(""),splashMinDuration:new s(1e3)}),this.binder=new m(this.form,"#consumerShellConfigForm",this)},async __setup(){console.log("[ctlConsumerResource][__setup]"),await this.sysCache.ensureReady(),this.resolvedShellConfig=this.sysCache.get("shellConfig")||{}},async __activate(){var e;console.log("[ctlConsumerResource][__activate]"),(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()},async __afterInit(){var o,l,n,t;console.log("[ctlConsumerResource][__afterInit]");const e=this.resolvedShellConfig;e&&(this.form.controls.appName.setValue(e.appName||""),this.form.controls.logLevel.setValue(e.logLevel||"info"),this.form.controls.splashEnabled.setValue(((o=e.splash)==null?void 0:o.enabled)??!1),this.form.controls.splashPath.setValue(((l=e.splash)==null?void 0:l.path)||""),this.form.controls.splashMinDuration.setValue(((n=e.splash)==null?void 0:n.minDuration)??1e3),(t=this.binder)!=null&&t.refreshView&&this.binder.refreshView())},__deactivate(){var e;console.log("[ctlConsumerResource][__deactivate]"),(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},__template(){return`
      <div class="cd-panel">
        <h2>Consumer Shell Configuration</h2>

        <form id="consumerShellConfigForm" class="cd-form">
          
          <cd-tabs id="shellConfigTabs" active-tab="tab-identity">
            
            <cd-tab id="tab-identity" icon="fingerprint" label="Identity">
              <div class="mt-3">
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
              </div>
            </cd-tab>

            <cd-tab id="tab-startup" icon="rocket_launch" label="Startup">
              <div class="mt-3">
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
              </div>
            </cd-tab>

          </cd-tabs>

          <div class="mt-4">
            <button cdButton (click)="onSave()">Save Configuration</button>
          </div>
          
        </form>
      </div>
    `},async onSave(){console.log("[ctlConsumerResource][onSave]");const e=this.form.value,o={appName:e.appName,logLevel:e.logLevel,splash:{enabled:e.splashEnabled,path:e.splashPath,minDuration:Number(e.splashMinDuration)},source:"consumer"};await this.svConfig.updateConsumerShellConfig(o),console.log("[ctlConsumerResource] consumer shellConfig updated",o)}},h={ctx:"sys",moduleId:"moduleman-consumer-resource",moduleName:"consumer-resource",moduleGuid:"consr-0001-0000-0000",controllers:[{name:"consumer-resource",instance:a,template:a.__template(),default:!1},{name:"consumer-resource2",instance:i,template:i.__template(),default:!1}],menu:[{label:"consumer",route:"sys/consumer",children:[{label:"consumer-resource",itemType:"route",route:"sys/moduleman/consumer-resource",template:a.__template()},{label:"consumer-resource2",itemType:"route",route:"sys/moduleman/consumer-resource2",template:i.__template()}]}]},v=h;export{h as consumerResourceModule,v as module};
