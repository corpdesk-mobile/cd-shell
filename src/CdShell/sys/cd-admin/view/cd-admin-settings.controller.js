// import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control.js";
// import { CdFormControl } from "../../cd-guig/controllers/cd-form.control.js";
// import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller.js";
// import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service.js";
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export const ctlCdAdminSettings = {
  form: null,
  binder: null,

  /**
   * Initializes the controller — constructs the form and binder.
   */
  __init() {
    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [
        CdValidators.required("UI System selection is required"),
      ]),
      theme: new CdFormControl("", [
        CdValidators.required("Theme selection is required"),
      ]),
    });

    // Initialize binder — form selector must match template form ID
    this.binder = new CdDirectiveBinderService(this.form, "#settingsForm");
  },

  /**
   * HTML template for the view.
   */
  __template() {
    return `
      <form id="settingsForm" class="cd-form">
        <div class="cd-form-field">
          <label for="uiSystem">UI System</label>
          <select id="uiSystem" name="uiSystem" cdFormControl>
            <option value="">-- Select UI System --</option>
            <option value="bootstrap-5">Bootstrap 5</option>
            <option value="material-design">Material Design</option>
          </select>
          <div class="error-message" data-error-for="uiSystem"></div>
        </div>

        <div class="cd-form-field">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" cdFormControl>
            <option value="">-- Select Theme --</option>
            <option value="default">Default</option>
            <option value="dark">Dark</option>
          </select>
          <div class="error-message" data-error-for="theme"></div>
        </div>

        <button type="submit">Apply Settings</button>
      </form>
    `;
  },

  /**
   * Runs after template is rendered to DOM.
   */
  __setup() {
    if (!this.form) this.__init();

    const form = document.querySelector("#settingsForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.applySettings();
      });
    }
  },

  /**
   * Handles settings application
   */
  async applySettings() {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      alert("Please select both UI System and Theme.");
      return;
    }

    const selections = this.form.value;
    console.log("Selected Configuration:", selections);
    alert(`Selected UI: ${selections.uiSystem}, Theme: ${selections.theme}`);
  },
};
