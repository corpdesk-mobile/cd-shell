// export const ctlSignIn = {
//   template() {
//     return `
//     <div class="cd-sign-in">
//       <h1 class="cd-heading">Sign In</h1>
//       <input id="username" type="text" placeholder="Username" class="cd-input" />
//       <input id="password" type="password" placeholder="Password" class="cd-input" />
//       <button id="btn-alert" class="cd-button">Click for Alert</button>
//       <button id="btn-shell-api" class="cd-button">Click Shell API</button>
//     </div>
//   `;
//   },
//   // Called after template is loaded into the DOM
//   setup() {
//     const alertBtn = document.getElementById('btn-alert');
//     const apiBtn = document.getElementById('btn-shell-api');

//     if (alertBtn) {
//       alertBtn.addEventListener('click', function () {
//         alert("Hello from cd-user!");
//       });
//     }

//     if (apiBtn) {
//       apiBtn.addEventListener('click', () => {
//         console.log("Button clicked, calling shell API...");
//         console.log("setup()/01:");
//         const usernameInput = document.getElementById("username");
//         const passwordInput = document.getElementById("password");

//         const username = usernameInput ? usernameInput.value : "";
//         console.log("setup() username:", username);
//         const password = passwordInput ? passwordInput.value : "";
//         console.log("setup() password:", password);

//         const authData = { username, password };
//         console.log("setup() authData:", authData);
//         console.log("setup()/02:");
//         // Call the controller's auth method
//         if (typeof this.auth === 'function') {
//           console.log("setup()/03:");
//           this.auth(authData);
//         } else {
//           console.log("setup()/04:");
//           console.warn("auth() method is not defined on controller.");
//         }
//       });
//     }
//   },
//   // Method to handle authentication logic
//   auth(authData) {
//     console.log("auth() called with:", authData);
//     window.cdShell?.logger?.debug?.("[cd-user] auth() called with:", authData);
//     // You can later call shell API to process login
//   }

// };

export const ctlSignIn = {
  __template() {
    return `<form id="signInForm" class="cd-sign-in">
                  <h1 class="cd-heading">Sign In</h1>

                  <label for="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    cd-model="username"
                    placeholder="Enter username"
                    class="cd-input"
                    required
                  />

                  <label for="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    cd-model="password"
                    placeholder="Enter password"
                    class="cd-input"
                    required
                  />

                  <button type="submit" class="cd-button">Sign In</button>
                </form>
                `;
  },

  __setup() {
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = this.__processFormData?.();
      this.auth?.(data);
    });
  },

  __processFormData() {
    const username =
      document.querySelector('[cd-model="username"]').value || "";
    const password =
      document.querySelector('[cd-model="password"]').value || "";
    return { username, password };
  },

  auth(data) {
    console.log("[cd-user] Auth called with", data);
    window.cdShell?.logger?.debug?.("[cd-user] Auth called with", data);
  },
};
