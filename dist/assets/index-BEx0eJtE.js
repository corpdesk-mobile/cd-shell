import{C as o,a,b as s,c as n}from"./cd-directive-binder.service-DGbLY5eG.js";const t={form:null,binder:null,__init(){this.form=new o({userName:new a("",[s.required("Username is required")]),password:new a("",[s.required("Password is required"),s.minLength(4,"Password must be at least 4 characters")])}),this.binder=new n(this.form,"#signInForm",this)},__template(){return`
      <form id="signInForm" class="cd-form">
        <div class="cd-form-field">
          <label for="userName">Username</label>
          <input
            id="userName"
            name="userName"
            cdFormControl
            placeholder="Enter username"
          />
          <div class="error-message" data-error-for="userName"></div>
        </div>

        <div class="cd-form-field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            cdFormControl
            placeholder="Enter password"
          />
          <div class="error-message" data-error-for="password"></div>
        </div>

        <button cdButton>Sign In</button>
      </form>
    `},__setup(){this.form||this.__init();const e=document.querySelector("#signInForm");e&&e.addEventListener("submit",r=>{r.preventDefault(),this.auth()})},async auth(){const e=this.form.validateAll();if(this.binder.applyValidationStyles(e),!this.form.valid){alert("Please correct the highlighted errors.");return}const r=this.form.value;console.log("Authenticating:",r),alert(`Welcome, ${r.userName}!`)},__deactivate(){var e;console.log("[ctlSignIn][__deactivate] 01"),(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},async __activate(){var e;console.log("[ctlSignIn][__activate] 01"),(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()}},i={username:"",password:"",binder:null,__init(){this.form=new CdFormGroup({userName:new CdFormControl("",[CdValidators.required("Username is required")]),password:new CdFormControl("",[CdValidators.required("Password is required"),CdValidators.minLength(4,"Password must be at least 4 characters")])}),this.binder=new CdDirectiveBinderService(this.form,"#signUpForm",this)},__template(){return`
      <form id="signUpForm" class="cd-sign-up">
        <h1 class="cd-heading">Signup</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Signup</button>
      </form>
    `},__setup(){console.log("[cd-user] Controller setup complete")},auth(){console.log("Signup triggered with:",this.username,this.password),alert(`Hello, ${this.username}!`)},__deactivate(){var e;(e=this.binder)!=null&&e.unbindAllDomEvents&&this.binder.unbindAllDomEvents()},async __activate(){var e;(e=this.binder)!=null&&e.bindToDom&&await this.binder.bindToDom()}},d={ctx:"sys",isDefault:!0,moduleId:"cd-user",moduleName:"Auto-Generated Module",moduleGuid:"auto-guid",controllers:[{name:"sign-in",instance:t,template:t.__template(),default:!0},{name:"sign-up",instance:i,template:i.__template(),default:!1}],menu:[{label:"cd-user",route:"sys/cd-user",children:[{label:"sign-in",itemType:"route",route:"sys/cd-user/sign-in",template:t.__template()},{label:"sign-up",itemType:"route",route:"sys/cd-user/sign-up",template:i.__template()}]}]},u=d;export{d as cdUserModule,u as module};
