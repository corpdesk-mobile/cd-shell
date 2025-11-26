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
    this.binder = new CdDirectiveBinderService(this.form, "#signInForm", this);
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

        <button cdButton>Sign In</button>
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

  // 💡 NEW: Deactivation Hook - Runs when user clicks *away*
  __deactivate() {
    console.log('[ctlSignIn][__deactivate] 01')
    // Stop any active animations, remove DOM-dependent listeners, etc.
    // The binder must provide a way to remove all listeners.
    if (this.binder?.unbindAllDomEvents) {
      this.binder.unbindAllDomEvents();
    }
  },

  // 💡 NEW: Activation Hook - Runs when view is *injected*
  async __activate() {
    console.log('[ctlSignIn][__activate] 01')
    // Re-establish DOM bindings and apply current form state
    if (this.binder?.bindToDom) {
      // This method must find the newly injected DOM (#settingsForm)
      // and re-attach all form control listeners (input, change, blur)
      await this.binder.bindToDom();
    }
    // Optional: Restore scroll position, run focus logic, etc.
  },
};
