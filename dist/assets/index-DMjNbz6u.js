const e={username:"",password:"",__template(){return`
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `},__setup(){console.log("[cd-user] Controller setup complete")},auth(){console.log("Auth triggered with:",this.username,this.password),alert(`Hello, ${this.username}!`)}},t={ctx:"sys",moduleId:"cd-push",moduleName:"Auto-Generated Module",moduleGuid:"auto-guid",controller:e,template:e.__template(),menu:[]},l=t;export{t as cdpushModule,l as module};
