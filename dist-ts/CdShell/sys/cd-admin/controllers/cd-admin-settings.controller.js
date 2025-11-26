// import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
// import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
// import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
// import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";
// export class CdAdminSettingsController {
//   form: CdFormGroup;
//   binder: CdDirectiveBinderService;
//   constructor() {
//     // --- Define form structure ---
//     this.form = new CdFormGroup({
//       uiSystem: new CdFormControl("", [
//         CdValidators.required("UI System selection is required"),
//       ]),
//       theme: new CdFormControl("", [
//         CdValidators.required("Theme selection is required"),
//       ]),
//     });
//     // --- Initialize binder ---
//     this.binder = new CdDirectiveBinderService(this.form, "#settingsForm");
//   }
//   /**
//    * HTML template for this controller
//    */
//   __template(): string {
//     return `
//       <form id="settingsForm" class="cd-form">
//         <div class="cd-form-field">
//           <label for="uiSystem">UI System</label>
//           <select id="uiSystem" name="uiSystem" cdFormControl>
//             <option value="">-- Select UI System --</option>
//             <option value="bootstrap-502">Bootstrap 5</option>
//             <option value="material-design">Material Design</option>
//           </select>
//           <div class="error-message" data-error-for="uiSystem"></div>
//         </div>
//         <div class="cd-form-field">
//           <label for="theme">Theme</label>
//           <select id="theme" name="theme" cdFormControl>
//             <option value="">-- Select Theme --</option>
//             <option value="default">Default</option>
//             <option value="dark">Dark</option>
//           </select>
//           <div class="error-message" data-error-for="theme"></div>
//         </div>
//         <button type="submit">Apply Settings</button>
//       </form>
//     `;
//   }
//   /**
//    * Setup logic runs when the view is rendered
//    */
//   __setup(): void {
//     const form = document.querySelector("#settingsForm") as HTMLFormElement | null;
//     if (form) {
//       form.addEventListener("submit", (event) => {
//         event.preventDefault();
//         this.applySettings();
//       });
//     }
//   }
//   /**
//    * Handles form submission
//    */
//   async applySettings(): Promise<void> {
//     const validationResult = this.form.validateAll();
//     this.binder.applyValidationStyles(validationResult);
//     if (!this.form.valid) {
//       alert("Please select both UI System and Theme.");
//       return;
//     }
//     const selections = this.form.value;
//     console.log("Selected Configuration:", selections);
//     alert(`Selected UI: ${selections.uiSystem}, Theme: ${selections.theme}`);
//   }
// }
///////////////////////////////////////////////////////////////////////////////////////////
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { CdDirectiveBinderService } from "../../cd-guig/services/cd-directive-binder.service";
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { CdAdminService } from "../services/cd-admin.service";
export class CdAdminSettingsController {
    constructor(sysCache) {
        this.sysCache = sysCache;
        // Tracks the currently selected UI System ID locally
        this.currentUiSystemId = "";
        this.uiSystemLoader = new UiSystemLoaderService(this.sysCache);
        this.svCdAdmin = new CdAdminService(this.sysCache);
        this.uiThemeLoader = new UiThemeLoaderService(this.sysCache);
        // Define form structure
        this.form = new CdFormGroup({
            uiSystem: new CdFormControl("", [
                CdValidators.required("UI System selection is required"),
            ]),
            theme: new CdFormControl("", [
                CdValidators.required("Theme selection is required"),
            ]),
            formType: new CdFormControl("", [
                CdValidators.required("Form type is required"),
            ]),
        });
        // Initialize binder (includes our new Angular-style binding logic)
        this.binder = new CdDirectiveBinderService(this.form, "#settingsForm", this);
    }
    __template() {
        return `
      <form id="settingsForm" class="cd-form">
        <div class="cd-form-field">
          <label for="uiSystem">UI System</label>
          <select id="uiSystem" name="uiSystem" cdFormControl (change)="onUiSystemChange($event)">
            ${this.uiSystemOptionsHtml} </select>
          <div class="error-message" data-error-for="uiSystem"></div>
        </div>

        <div class="cd-form-field">
          <label for="theme">Theme</label>
          <select id="theme" name="theme" cdFormControl (change)="onThemeChange($event)">
            ${this.themeOptionsHtml} </select>
          <div class="error-message" data-error-for="theme"></div>
        </div>

        <div class="cd-form-field">
          <label for="formType">Form Variant</label>
          <select id="formType" name="formType" cdFormControl (change)="onFormVariantChange($event)">
            ${this.formVariantOptionsHtml} </select>
          <div class="error-message" data-error-for="formType"></div>
        </div>

        <button type="submit">Apply Settings</button>
      </form>
    `;
    }
    async applySettings() {
        // const configService = new ConfigService();
        const validationResult = this.form.validateAll();
        this.binder.applyValidationStyles(validationResult);
        if (!this.form.valid) {
            console.warn("Please select all required fields before applying settings.");
            return;
        }
        const selections = this.form.value;
        console.log("✅ Applied Configuration:", selections);
        await this.uiSystemLoader.activate(selections.uiSystem);
        await this.uiThemeLoader.loadThemeById(selections.theme);
        await this.uiThemeLoader.loadFormVariant(selections.formType);
    }
    async onUiSystemChange(e) {
        const value = e.target.value;
        console.log("🧩 UI System changed:", value);
    }
    async onThemeChange(e) {
        const value = e.target.value;
        console.log("🎨 Theme changed:", value);
    }
    async onFormVariantChange(e) {
        const value = e.target.value;
        console.log("🧱 Form Variant changed:", value);
    }
    // --- GETTERS for Template Interpolation ---
    get uiSystemOptionsHtml() {
        const activeSystem = this.uiSystemLoader.getActive();
        const activeSystemId = activeSystem ? activeSystem.id : "";
        return this.svCdAdmin.generateUiSystemOptions(activeSystemId);
    }
    /**
     * NEW GETTER: Generates and holds the HTML for Theme options.
     * It uses the value of the selected UI System (currentUiSystemId) to fetch themes.
     */
    get themeOptionsHtml() {
        const activeThemeId = this.uiThemeLoader.getActiveThemeId(); // Assuming this method exists
        return this.svCdAdmin.generateThemeOptions(this.currentUiSystemId, activeThemeId);
    }
    /**
       * NEW GETTER: Generates and holds the HTML for Form Variant options.
       * This method retrieves the active state using the new getter.
       */
    get formVariantOptionsHtml() {
        // CORRECTED LINE: Call the synchronous getter to read the active state
        const activeVariantId = this.uiThemeLoader.getActiveFormVariantId();
        // Pass the read state to the service for HTML generation
        // NOTE: We need to ensure the correct getter name is used here.
        // Based on previous steps, the getter should be formVariantOptionsHtml.
        // Assuming the svCdAdmin has a generateFormVariantOptions method:
        return this.svCdAdmin.generateFormVariantOptions(activeVariantId);
    }
    __setup() {
        const form = document.querySelector("#settingsForm");
        if (form) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                await this.applySettings();
            });
        }
    }
}
