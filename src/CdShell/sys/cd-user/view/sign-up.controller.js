export const ctlSignUp = {
  username: "",
  password: "",

  __template() {
    return `
      <form class="cd-sign-up">
        <h1 class="cd-heading">Signup</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Signup</button>
      </form>
    `;
  },

  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Signup triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};