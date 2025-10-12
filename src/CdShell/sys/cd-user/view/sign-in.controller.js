import { IdePushClientService } from "../../cd-push/services/ide-push-client.service.js";
import config from "../../../../config";

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
    // -----------------------------------
    // 1️⃣ Initialize POC socket client
    // -----------------------------------
    console.info("Initializing IDE push client (POC)...");
    try {
      const apiUrl = config.cdSio.endpoint; // cd-api test endpoint
      const workspacePath = config.viteWorkspacePath; // replace with real path
      this.idePushClient = new IdePushClientService(apiUrl, workspacePath);
      console.log("IdePushClientService initialized");
    } catch (e) {
      console.error("Failed to initialize IdePushClientService:", e.message);
    }

    // -----------------------------------
    // 2️⃣ Attach form listener
    // -----------------------------------
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { username, password } = this.processFormData();
      const data = {
        user: { userName: username, password },
        consumer: {
          consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
        },
      };
      this.auth(data);
    });
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};