import{C as l,a as o,b as s,c as r}from"./cd-directive-binder.service-Ct7e55LB.js";const i={form:null,binder:null,__init(){this.form=new l({uiSystem:new o("",[s.required("UI System selection is required")]),theme:new o("",[s.required("Theme selection is required")])}),this.binder=new r(this.form,"#settingsForm")},__template(){return`
      <form id="settingsForm" class="cd-form">
        <div class="cd-form-field">
          <label for="uiSystem">UI System</label>
          <select id="uiSystem" name="uiSystem" cdFormControl>
            <option value="">-- Select UI System --</option>
            <option value="bootstrap-5">Bootstrap 5</option>
            <option value="material-design">Material Design</option>
          </select>
          <div class="error-message" data-error-for="uiSystem"></div>
        </div>

        <div class="cd-form-field">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" cdFormControl>
            <option value="">-- Select Theme --</option>
            <option value="default">Default</option>
            <option value="dark">Dark</option>
          </select>
          <div class="error-message" data-error-for="theme"></div>
        </div>

        <button type="submit">Apply Settings</button>
      </form>
    `},__setup(){this.form||this.__init();const t=document.querySelector("#settingsForm");t&&t.addEventListener("submit",e=>{e.preventDefault(),this.applySettings()})},async applySettings(){const t=this.form.validateAll();if(this.binder.applyValidationStyles(t),!this.form.valid){alert("Please select both UI System and Theme.");return}const e=this.form.value;console.log("Selected Configuration:",e),alert(`Selected UI: ${e.uiSystem}, Theme: ${e.theme}`)}},a={ctx:"sys",moduleId:"cd-admin",moduleName:"cd-admin",moduleGuid:"aaaa-bbbb-cccc-dddd",controller:i,template:i.__template(),menu:[{label:"admin",route:"sys/cd-admin",children:[{label:"settings",route:"sys/cd-admin/settings",template:i.__template()}]}]},d=a;export{a as cdAdminModule,d as module};
