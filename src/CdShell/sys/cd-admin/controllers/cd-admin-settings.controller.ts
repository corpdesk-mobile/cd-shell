import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";

export class CdAdminSettingsController {
  form: CdFormGroup;
  binder: CdDirectiveBinderService;

  constructor() {
    // --- Define form structure ---
    this.form = new CdFormGroup({
      uiSystem: new CdFormControl("", [
        CdValidators.required("UI System selection is required"),
      ]),
      theme: new CdFormControl("", [
        CdValidators.required("Theme selection is required"),
      ]),
    });

    // --- Initialize binder ---
    this.binder = new CdDirectiveBinderService(this.form, "#settingsForm");
  }

  /**
   * HTML template for this controller
   */
  __template(): string {
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
  }

  /**
   * Setup logic runs when the view is rendered
   */
  __setup(): void {
    const form = document.querySelector("#settingsForm") as HTMLFormElement | null;
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.applySettings();
      });
    }
  }

  /**
   * Handles form submission
   */
  async applySettings(): Promise<void> {
    const validationResult = this.form.validateAll();
    this.binder.applyValidationStyles(validationResult);

    if (!this.form.valid) {
      alert("Please select both UI System and Theme.");
      return;
    }

    const selections = this.form.value;
    console.log("Selected Configuration:", selections);
    alert(`Selected UI: ${selections.uiSystem}, Theme: ${selections.theme}`);
  }
}
