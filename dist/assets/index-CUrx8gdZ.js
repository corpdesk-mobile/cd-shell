import"./dayjs.min-C2T4sop3.js";import"./index-pgZg770A.js";const e={username:"",password:"",__template(){return`
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `},__setup(){console.log("[cd-user] Controller setup complete")},auth(){console.log("Auth triggered with:",this.username,this.password),alert(`Hello, ${this.username}!`)}};CdLog;const o={ctx:"sys",moduleId:"cd-comm",moduleName:"Auto-Generated Module",moduleGuid:"auto-guid",controller:e,template:e.__template(),menu:[]},s=o;export{o as cdcommModule,s as module};
