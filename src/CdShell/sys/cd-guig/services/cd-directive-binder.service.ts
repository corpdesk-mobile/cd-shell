// src/CdShell/core/directives/cd-directive-binder.js
// export class CdDirectiveBinder {
//   controller;
//   constructor(controller: any) {
//     this.controller = controller;
//   }

//   bind(rootElement: Document | HTMLElement = document): void {
//     if (!rootElement) return;

//     // --- cd-click ---
//     rootElement.querySelectorAll("[cd-click]").forEach((el) => {
//       const methodName = el.getAttribute("cd-click");
//       const method = this.controller[methodName];
//       if (typeof method === "function") {
//         el.addEventListener("click", method.bind(this.controller));
//       }
//     });

//     // --- cd-model ---
//     rootElement.querySelectorAll("[cd-model]").forEach((el) => {
//       const modelKey = el.getAttribute("cd-model");

//       // Initialize input value from controller (if exists)
//       if (
//         this.controller[modelKey] !== undefined &&
//         el instanceof HTMLInputElement
//       ) {
//         el.value = this.controller[modelKey];
//       }

//       // Update controller value on input change
//       el.addEventListener("input", (e) => {
//         this.controller[modelKey] = (e.target as HTMLInputElement).value;
//       });
//     });
//   }

//   /**
//    * Applies or clears validation error styles and messages on form fields.
//    * @param validationResult - Result object from CdFormGroup.validateAll()
//    */
//   applyValidationStyles(validationResult: Record<string, string | null>): void {
//     Object.entries(validationResult).forEach(([controlName, errorMessage]) => {
//       const input = document.querySelector(
//         `[cd-model="form.controls.${controlName}"]`
//       ) as HTMLElement;

//       if (!input) return;

//       // Remove old error UI
//       input.classList.remove("cd-invalid", "cd-valid");
//       const nextSibling = input.nextElementSibling;
//       if (nextSibling && nextSibling.classList.contains("cd-error-msg")) {
//         nextSibling.remove();
//       }

//       if (errorMessage) {
//         input.classList.add("cd-invalid");
//         const errorLabel = document.createElement("div");
//         errorLabel.className = "cd-error-msg";
//         errorLabel.textContent = errorMessage;
//         input.insertAdjacentElement("afterend", errorLabel);
//       } else {
//         input.classList.add("cd-valid");
//       }
//     });
//   }

//   unbind(rootElement = document) {
//     // optional cleanup: we can later add teardown logic if needed
//   }
// }

import { CdFormGroup } from "../controllers/cd-form-group.control";

export class CdDirectiveBinderService {
  private form: CdFormGroup;
  private formElement: HTMLFormElement;

  constructor(form: CdFormGroup, formSelector: string) {
    this.form = form;
    this.formElement = document.querySelector(formSelector) as HTMLFormElement;

    if (!this.formElement) {
      console.warn(`Form element not found: ${formSelector}`);
      return;
    }

    this.initializeBindings();
  }

  private initializeBindings(): void {
    Object.entries(this.form.controls).forEach(([key, control]) => {
      const input = this.formElement.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (!input) return;

      // Initial value sync
      input.value = control.value ?? "";

      // Listen for changes
      input.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        control.setValue(target.value);
        this.applyValidationStyles({ [key]: control.error });
      });

      input.addEventListener("blur", () => {
        control.markAsTouched();
        this.applyValidationStyles({ [key]: control.error });
      });
    });
  }

  validateAll(): void {
    const result = this.form.validateAll();
    this.applyValidationStyles(result);
  }

  applyValidationStyles(result: Record<string, string | null>): void {
    for (const [key, error] of Object.entries(result)) {
      const input = this.formElement.querySelector(`[name="${key}"]`) as HTMLInputElement;
      const errorDiv = this.formElement.querySelector(`[data-error-for="${key}"]`) as HTMLElement;

      if (!input) continue;

      input.classList.remove("cd-valid", "cd-invalid");
      if (error) {
        input.classList.add("cd-invalid");
        if (errorDiv) errorDiv.textContent = error;
      } else {
        input.classList.add("cd-valid");
        if (errorDiv) errorDiv.textContent = "";
      }
    }
  }
}
