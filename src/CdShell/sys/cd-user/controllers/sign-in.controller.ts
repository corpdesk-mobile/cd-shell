// import { config } from "process";
import config from "../../../../config";
import { BaseService, ICdResponse } from "../../base";
import { CdShellController } from "../../base/cd-shell.controller";
import { ConsumerModel } from "../../moduleman/models/consumer.model";
import { UserModel } from "../models/user.model";

export class SignInController extends CdShellController {
  workspacePath = config.viteWorkspacePath;
  private b = new BaseService();

  template(): string {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <label for="username">Username</label>
        <input id="username" type="text" cd-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" cd-model="password" required />

        <button type="submit" class="cd-button">Sign In x</button>
      </form>
    `;
  }

  setup(): void {
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { username, password } = this.processFormData();
      const data = {
        user: { userName: username, password } as UserModel,
        consumer: {
          consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
        } as ConsumerModel,
      };
      this.auth(data);
    });
  }

  processFormData(): { username: string; password: string } {
    const username =
      (document.querySelector('[cd-model="username"]') as HTMLInputElement)
        ?.value || "";
    const password =
      (document.querySelector('[cd-model="password"]') as HTMLInputElement)
        ?.value || "";
    return { username, password };
  }

  async auth(data: {
    user: UserModel;
    consumer: ConsumerModel;
  }): Promise<void> {
    console.log('starting SignInController:auth()')
    console.log('SignInController:auth()/data:', data)
    window.cdShell?.progress?.start("Signing in...");
    try {
      const request = this.b.buildBaseRequest(
        { ctx: "Sys", name: "User" },
        { name: "User" },
        "Login",
        { data: data.user, consumer: data.consumer },
        null
      );

      const result = (await this.b.handleRequest(request)) as ICdResponse;
      if (result.app_state.success) {
        window.cdShell?.notify?.success("Login successful");
        window.cdShell?.progress?.done();
        // Proceed to dashboard or main shell load
      } else {
        window.cdShell?.notify?.error(
          result.app_state.info.app_msg || "Login failed"
        );
      }
    } catch (e: any) {
      window.cdShell?.notify?.error(e.message || "Unexpected error");
    } finally {
      window.cdShell?.progress?.done();
    }
  }
}
