import{C as i,S as r}from"./index-CcKvdLKe.js";import{C as c,a as s,b as u,c as m}from"./cd-directive-binder.service-DGbLY5eG.js";const l={form:null,binder:null,svConfig:null,sysCache:null,resolvedShellConfig:null,async __init(){console.log("[ctlConsumerResource][__init]"),this.svConfig=new i,this.sysCache=r.getInstance(this.svConfig),this.form=new c({appName:new s("",[u.required("App name is required")]),logLevel:new s("info"),splashEnabled:new s(!1),splashPath:new s(""),splashMinDuration:new s(1e3)}),this.binder=new m(this.form,"#consumerShellConfigForm",this)},async __setup(){console.log("[ctlConsumerResource][__setup]"),await this.sysCache.ensureReady(),this.resolvedShellConfig=this.sysCache.get("shellConfig")||{}},async __activate(){var e;console.log("[ctlConsumerResource][__activate]"),(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()},async __afterInit(){var o,n,t,a;console.log("[ctlConsumerResource][__afterInit]");const e=this.resolvedShellConfig;e&&(this.form.controls.appName.setValue(e.appName||""),this.form.controls.logLevel.setValue(e.logLevel||"info"),this.form.controls.splashEnabled.setValue(((o=e.splash)==null?void 0:o.enabled)??!1),this.form.controls.splashPath.setValue(((n=e.splash)==null?void 0:n.path)||""),this.form.controls.splashMinDuration.setValue(((t=e.splash)==null?void 0:t.minDuration)??1e3),(a=this.binder)!=null&&a.refreshView&&this.binder.refreshView())},__deactivate(){var e;console.log("[ctlConsumerResource][__deactivate]"),(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},__template(){return`
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
    `},async onSave(){console.log("[ctlConsumerResource][onSave]");const e=this.form.value,o={appName:e.appName,logLevel:e.logLevel,splash:{enabled:e.splashEnabled,path:e.splashPath,minDuration:Number(e.splashMinDuration)},source:"consumer"};await this.svConfig.updateConsumerShellConfig(o),console.log("[ctlConsumerResource] consumer shellConfig updated",o)}},d={ctx:"sys",moduleId:"moduleman-consumer-resource",moduleName:"consumer-resource",moduleGuid:"consr-0001-0000-0000",controllers:[{name:"consumer-resource",instance:l,template:l.__template(),default:!1}],menu:[{label:"consumer",route:"sys/consumer",children:[{label:"consumer-resource",itemType:"route",route:"sys/moduleman/consumer-resource",template:l.__template()}]}]},f=d;export{d as consumerResourceModule,f as module};
