const e={username:"",password:"",__template(){return`
      <form class="cd-sign-in">
        <h1 class="cd-heading">Dev-Sync</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `},__setup(){console.log("[cd-user] Controller setup complete")},auth(){console.log("Auth triggered with:",this.username,this.password),alert(`Hello, ${this.username}!`)}},t={ctx:"sys",moduleId:"cd-push",moduleName:"Auto-Generated Module",moduleGuid:"auto-guid",controllers:[{name:"sign-in",instance:e,template:e.__template(),default:!0}],menu:[]},s=t;export{t as cdpushModule,s as module};
