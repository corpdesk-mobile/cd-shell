// // import { config } from "process";
// import config from "../../../../config";
// import { BaseService, ICdResponse } from "../../base";
// import { CdShellController } from "../../base/cd-shell.controller";
// import { ConsumerModel } from "../../moduleman/models/consumer.model";
// import { UserModel } from "../models/user.model";
// export class SignInController extends CdShellController {
//   workspacePath = config.viteWorkspacePath;
//   private b = new BaseService();
//   template(): string {
//     return `
//       <form id="signInForm" class="cd-sign-in">
//         <h1 class="cd-heading">Sign In</h1>
//         <label for="userName">Username</label>
//         <input id="userName" type="text" cd-model="userName" required />
//         <label for="password">Password</label>
//         <input id="password" type="password" cd-model="password" required />
//         <button type="submit" class="cd-button">Sign In x</button>
//       </form>
//     `;
//   }
//   setup(): void {
//     const form = document.getElementById("signInForm");
//     if (!form) return;
//     form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       const { userName, password } = this.processFormData();
//       const data = {
//         user: { userName: userName, password } as UserModel,
//         consumer: {
//           consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
//         } as ConsumerModel,
//       };
//       this.auth(data);
//     });
//   }
//   processFormData(): { userName: string; password: string } {
//     const userName =
//       (document.querySelector('[cd-model="userName"]') as HTMLInputElement)
//         ?.value || "";
//     const password =
//       (document.querySelector('[cd-model="password"]') as HTMLInputElement)
//         ?.value || "";
//     return { userName, password };
//   }
//   async auth(data: {
//     user: UserModel;
//     consumer: ConsumerModel;
//   }): Promise<void> {
//     console.log('starting SignInController:auth()')
//     console.log('SignInController:auth()/data:', data)
//     window.cdShell?.progress?.start("Signing in...");
//     try {
//       const request = this.b.buildBaseRequest(
//         { ctx: "Sys", name: "User" },
//         { name: "User" },
//         "Login",
//         { data: data.user, consumer: data.consumer },
//         null
//       );
//       const result = (await this.b.handleRequest(request)) as ICdResponse;
//       if (result.app_state.success) {
//         window.cdShell?.notify?.success("Login successful");
//         window.cdShell?.progress?.done();
//         // Proceed to dashboard or main shell load
//       } else {
//         window.cdShell?.notify?.error(
//           result.app_state.info.app_msg || "Login failed"
//         );
//       }
//     } catch (e: any) {
//       window.cdShell?.notify?.error(e.message || "Unexpected error");
//     } finally {
//       window.cdShell?.progress?.done();
//     }
//   }
// }
////////////////////////////////////////////////////////////////////
// import { CdDirectiveBinder } from "../../base/cd-directive-binder";
// import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
// import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
// import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
// import { UserModel } from "../models/user.model";
// export class SignInController {
//   form: CdFormGroup;
//   constructor() {
//     this.form = new CdFormGroup({
//       userName: new CdFormControl("", [CdValidators.required]),
//       password: new CdFormControl("", [CdValidators.required, CdValidators.minLength(4)]),
//     });
//   }
//   __template(): string {
//     return `
//       <form id="signInForm" class="cd-sign-in">
//         <h1 class="cd-heading">Sign In</h1>
//         <label>Username</label>
//         <input cd-model="form.controls.userName" placeholder="Username" />
//         <label>Password</label>
//         <input cd-model="form.controls.password" type="password" placeholder="Password" />
//         <button type="button" cd-click="auth">Sign In</button>
//       </form>
//     `;
//   }
//   __setup(): void {
//     const binder = new CdDirectiveBinder(this);
//     binder.bind();
//     const form = document.getElementById("signInForm");
//     form?.addEventListener("submit", (e) => {
//       e.preventDefault();
//       this.auth();
//     });
//   }
//   async auth(): Promise<void> {
//     this.form.validateAll();
//     if (!this.form.valid) {
//       console.error("Form invalid:", this.form);
//       alert("Please fill in all required fields");
//       return;
//     }
//     const user = this.form.value as UserModel;
//     console.log("Authenticating with:", user);
//     // call service or proceed with logic
//   }
// }
/////////////////////////////////////////////////////////////////
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";
export class SignInController {
    constructor() {
        // --- Define form structure ---
        this.form = new CdFormGroup({
            userName: new CdFormControl("", [
                CdValidators.required("Username is required"),
            ]),
            password: new CdFormControl("", [
                CdValidators.required("Password is required"),
                CdValidators.minLength(4, "Password must be at least 4 characters"),
            ]),
        });
        // --- Initialize binder ---
        // Form selector must match <form id="signInForm"> in template
        this.binder = new CdDirectiveBinderService(this.form, "#signInForm", this);
    }
    /**
     * HTML template for this controller
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
            placeholder="Enter userName"
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
    }
    /**
     * Setup logic runs when the view is rendered
     */
    __setup() {
        // binder already initialized in constructor; ensure form event is attached
        const form = document.querySelector("#signInForm");
        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                this.auth();
            });
        }
    }
    /**
     * Form authentication logic
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
    }
}
