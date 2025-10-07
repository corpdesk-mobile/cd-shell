export const ctlSignIn = {
  __template() {
    return `<form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <label for="username">Username</label>
        <input id="username" type="text" cd-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" cd-model="password" required />

        <button type="submit" class="cd-button">Sign In</button>
      </form>
                `;
  },

  //   __setup() {
  //     const form = document.getElementById("signInForm");
  //     if (!form) return;

  //     form.addEventListener("submit", (e) => {
  //       e.preventDefault();
  //       const data = this.__processFormData?.();
  //       this.auth?.(data);
  //     });
  //   },
  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  __processFormData() {
    const username =
      document.querySelector('[cd-model="username"]').value || "";
    const password =
      document.querySelector('[cd-model="password"]').value || "";
    return { username, password };
  },

  //   auth(data) {
  //     console.log("[cd-user] Auth called with", data);
  //     window.cdShell?.logger?.debug?.("[cd-user] Auth called with", data);
  //   },
  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};
