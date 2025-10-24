import{C as a,a as o,b as s,c as l}from"./cd-directive-binder.service-Ct7e55LB.js";const t={form:null,binder:null,__init(){this.form=new a({userName:new o("",[s.required("Username is required")]),password:new o("",[s.required("Password is required"),s.minLength(4,"Password must be at least 4 characters")])}),this.binder=new l(this.form,"#signInForm")},__template(){return`
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

        <button type="submit">Sign In</button>
      </form>
    `},__setup(){this.form||this.__init();const e=document.querySelector("#signInForm");e&&e.addEventListener("submit",r=>{r.preventDefault(),this.auth()})},async auth(){const e=this.form.validateAll();if(this.binder.applyValidationStyles(e),!this.form.valid){alert("Please correct the highlighted errors.");return}const r=this.form.value;console.log("Authenticating:",r),alert(`Welcome, ${r.userName}!`)}},i={username:"",password:"",__template(){return`
      <form class="cd-sign-up">
        <h1 class="cd-heading">Signup</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Signup</button>
      </form>
    `},__setup(){console.log("[cd-user] Controller setup complete")},auth(){console.log("Signup triggered with:",this.username,this.password),alert(`Hello, ${this.username}!`)}},n={ctx:"sys",moduleId:"cd-user",moduleName:"Auto-Generated Module",moduleGuid:"auto-guid",controller:t,template:t.__template(),menu:[{label:"user",route:"sys/cd-user",children:[{label:"sign-in",route:"sys/cd-user/sign-in",template:t.__template()},{label:"sign-up",route:"sys/cd-user/sign-up",template:i.__template()}]}]},u=n;export{n as cdUserModule,u as module};
