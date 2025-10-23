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

// import { IdeAgentService } from "../../dev-sync/services/ide-agent.service";
// import config from "../../../../config";

// export const ctlSignIn = {
//   username: "",
//   password: "",

//   __template() {
//     return `
//       <form id="signInForm" class="cd-sign-in">
//         <h1 class="cd-heading">Sign In</h1>

//         <label>Username</label>
//         <input cd-model="username" placeholder="Username" />

//         <label>Password</label>
//         <input cd-model="password" type="password" placeholder="Password" />

//         <button type="submit">Sign In</button>
//       </form>
//     `;
//   },

//   __setup() {
//     console.info("[cd-user] Initializing IdeAgentService (runtime)...");

//     try {
//       // const endpoint = config.cdSio.endpoint;
//       this.svIdeAgent = new IdeAgentService();


//       // Listen for messages from IDE
//       this.svIdeAgent.initialize(() => {
//         // this.onDevSyncMessage(payload);
//       });

//       console.log("[cd-user] svIdeAgent initialized successfully");
//     } catch (err) {
//       console.error("[cd-user] Failed to initialize svIdeAgent:", err);
//     }

//     // Attach form listener
//     const form = document.getElementById("signInForm");
//     if (!form) {
//       console.warn("[cd-user] signInForm not found");
//       return;
//     }

//     form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       this.auth();
//     });

//     console.log("[cd-user] Controller setup complete");
//   },

//   auth() {
//     console.log("Auth triggered with:", this.username, this.password);

//     // Prepare payload for IDE (chat partner)
//     const payload = {
//       source: { appId: this.devSync.appId },
//       target: "ide-agent",
//       action: "AUTH_ATTEMPT",
//       data: {
//         username: this.username,
//         password: this.password,
//         timestamp: new Date().toISOString(),
//       },
//     };

//     this.devSync.emitPayload(payload);
//     alert(`Hello, ${this.username}!`);
//   },

//   onDevSyncMessage(payload) {
//     const { source, action, data } = payload;

//     // Avoid acting on own messages
//     if (source.appId === this.devSync.appId) return;

//     switch (action) {
//       case "AUTH_RESULT":
//         console.log("[cd-user] Auth result received:", data);
//         alert(data.message);
//         break;

//       case "UPDATE_CONTROLLER":
//         console.log("[cd-user] Controller update payload:", data);
//         this.applyControllerUpdate(data);
//         break;

//       default:
//         console.log("[cd-user] Unknown DevSync action:", action);
//     }
//   },

//   applyControllerUpdate(updateData) {
//     console.log("[cd-user] Applying runtime update:", updateData);
//     // In future, handle live controller patching here
//   },
// };

//////////////////////////////////////////////////////////////////

import { IdeAgentService } from "../../dev-sync/services/ide-agent.service";
import config from "../../../../config";

import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";


export const ctlSignIn = {
  form: null,
  binder: null,

  /**
   * Initializes the controller — constructs the form and binder.
   */
  __init() {
    this.form = new CdFormGroup({
      userName: new CdFormControl("", [
        CdValidators.required("Username is required"),
      ]),
      password: new CdFormControl("", [
        CdValidators.required("Password is required"),
        CdValidators.minLength(4, "Password must be at least 4 characters"),
      ]),
    });

    // Initialize binder — form selector must match template form ID
    this.binder = new CdDirectiveBinderService(this.form, "#signInForm");
  },

  /**
   * HTML template for the view.
   */
  __template() {
    return `
      <form id="signInForm" class="cd-form">
        <div class="cd-form-field">
          <label for="userName">Username</label>
          <input
            id="userName"
            name="userName"
            cdFormControl
            placeholder="Enter username"
          />
          <div class="error-message" data-error-for="userName"></div>
        </div>

        <div class="cd-form-field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            cdFormControl
            placeholder="Enter password"
          />
          <div class="error-message" data-error-for="password"></div>
        </div>

        <button type="submit">Sign In</button>
      </form>
    `;
  },

  /**
   * Runs after template is rendered to DOM.
   */
  __setup() {
    // Initialize form and binder if not already
    if (!this.form) this.__init();

    const form = document.querySelector("#signInForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.auth();
      });
    }
  },

  /**
   * Authentication handler.
   */
  async auth() {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      alert("Please correct the highlighted errors.");
      return;
    }

    const user = this.form.value;
    console.log("Authenticating:", user);
    alert(`Welcome, ${user.userName}!`);
  },
};