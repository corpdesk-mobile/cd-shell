// import { IdePushClientService } from "../../cd-push/services/ide-push-client.service.js";
// import config from "../../../../config";

// export const ctlSignIn = {
//   username: "",
//   password: "",

//   __template() {
//     return `
//       <form class="cd-sign-in">
//         <h1 class="cd-heading">Sign In</h1>

//         <label>Username</label>
//         <input cd-model="username" placeholder="Username" />

//         <label>Password</label>
//         <input cd-model="password" type="password" placeholder="Password" />

//         <button type="button" cd-click="auth">Sign In</button>
//       </form>
//     `;
//   },

//   __setup() {
//     // -----------------------------------
//     // 1️⃣ Initialize POC socket client
//     // -----------------------------------
//     console.info("Initializing IDE push client (POC)...");
//     try {
//       const apiUrl = config.cdSio.endpoint; // cd-api test endpoint
//       const workspacePath = config.viteWorkspacePath; // replace with real path
//       this.idePushClient = new IdePushClientService(apiUrl, workspacePath);
//       console.log("IdePushClientService initialized");
//     } catch (e) {
//       console.error("Failed to initialize IdePushClientService:", e.message);
//     }

//     // -----------------------------------
//     // 2️⃣ Attach form listener
//     // -----------------------------------
//     const form = document.getElementById("signInForm");
//     if (!form) return;

//     form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       const { username, password } = this.processFormData();
//       const data = {
//         user: { userName: username, password },
//         consumer: {
//           consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
//         },
//       };
//       this.auth(data);
//     });
//     console.log("[cd-user] Controller setup complete");
//   },

//   auth() {
//     console.log("Auth triggered with:", this.username, this.password);
//     alert(`Hello, ${this.username}!`);
//   },
// };
////////////////////////////////////////////////////

import { DevSyncClientService } from "../../dev-sync/services/dev-sync-client.service";
import config from "../../../../config";

export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="submit">Sign In</button>
      </form>
    `;
  },

  __setup() {
    console.info("[cd-user] Initializing DevSyncClient (runtime)...");

    try {
      // const endpoint = config.cdSio.endpoint;
      this.devSync = new DevSyncClientService();

      // Assign a unique runtime identity (browser app instance)
      this.devSync.setAppId("vite-runtime");

      // Register this controller as a chat user
      this.devSync.registerClient({
        role: "runtime",
        controller: "sign-in",
      });

      // Listen for messages from IDE
      this.devSync.onPayload((payload) => {
        this.onDevSyncMessage(payload);
      });

      console.log("[cd-user] DevSyncClient initialized successfully");
    } catch (err) {
      console.error("[cd-user] Failed to initialize DevSyncClient:", err);
    }

    // Attach form listener
    const form = document.getElementById("signInForm");
    if (!form) {
      console.warn("[cd-user] signInForm not found");
      return;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.auth();
    });

    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);

    // Prepare payload for IDE (chat partner)
    const payload = {
      source: { appId: this.devSync.appId },
      target: "ide-agent",
      action: "AUTH_ATTEMPT",
      data: {
        username: this.username,
        password: this.password,
        timestamp: new Date().toISOString(),
      },
    };

    this.devSync.emitPayload(payload);
    alert(`Hello, ${this.username}!`);
  },

  onDevSyncMessage(payload) {
    const { source, action, data } = payload;

    // Avoid acting on own messages
    if (source.appId === this.devSync.appId) return;

    switch (action) {
      case "AUTH_RESULT":
        console.log("[cd-user] Auth result received:", data);
        alert(data.message);
        break;

      case "UPDATE_CONTROLLER":
        console.log("[cd-user] Controller update payload:", data);
        this.applyControllerUpdate(data);
        break;

      default:
        console.log("[cd-user] Unknown DevSync action:", action);
    }
  },

  applyControllerUpdate(updateData) {
    console.log("[cd-user] Applying runtime update:", updateData);
    // In future, handle live controller patching here
  },
};