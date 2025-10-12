/* eslint-disable antfu/if-newline */
/* eslint-disable style/brace-style */
// import { CdAiLogRouterService } from '../../../app/cd-ai-pwa/services/cd-ai-log-router.service.js';
import chalk from 'chalk';
import dayjs from 'dayjs';
// let chalk: any;
export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  },

  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};
export default CdLog;
