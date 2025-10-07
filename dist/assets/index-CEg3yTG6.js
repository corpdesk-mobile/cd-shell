const e={__template(){return`<form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <label for="username">Username</label>
        <input id="username" type="text" cd-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" cd-model="password" required />

        <button type="submit" class="cd-button">Sign In</button>
      </form>
                `},__setup(){console.log("[cd-user] Controller setup complete")},__processFormData(){const t=document.querySelector('[cd-model="username"]').value||"",l=document.querySelector('[cd-model="password"]').value||"";return{username:t,password:l}},auth(){console.log("Auth triggered with:",this.username,this.password),alert(`Hello, ${this.username}!`)}},o={__template(){return'<div><h1>Sign Up</h1><script>console.log("SignUp Loaded")<\/script></div>'}},n={ctx:"sys",moduleId:"cd-user",moduleName:"User Management",moduleGuid:"user-guid-123",controller:e,template:e.__template(),menu:[{label:"User",route:"#",icon:{icon:"fa-solid fa-user",iconType:"fontawesome",iconSize:16,iconColor:"#1976d2"},children:[{label:"Sign In",itemType:"template",route:"#",icon:{icon:"fa-solid fa-right-to-bracket",iconType:"fontawesome",iconColor:"#444"},template:e.__template(),controller:e},{label:"Sign Up",itemType:"template",route:"#",icon:{icon:"fa-solid fa-user-plus",iconType:"fontawesome",iconColor:"#444"},template:o.__template(),controller:o}]}]},r=n;export{n as cdUserModule,r as module};
