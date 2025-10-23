// src/CdShell/core/directives/cd-directive-binder.js
// export class CdDirectiveBinder {
//   controller;
//   constructor(controller: any) {
//     this.controller = controller;
//   }
export class CdDirectiveBinderService {
    constructor(form, formSelector) {
        this.form = form;
        this.formElement = document.querySelector(formSelector);
        if (!this.formElement) {
            console.warn(`Form element not found: ${formSelector}`);
            return;
        }
        this.initializeBindings();
    }
    initializeBindings() {
        Object.entries(this.form.controls).forEach(([key, control]) => {
            const input = this.formElement.querySelector(`[name="${key}"]`);
            if (!input)
                return;
            // Initial value sync
            input.value = control.value ?? "";
            // Listen for changes
            input.addEventListener("input", (e) => {
                const target = e.target;
                control.setValue(target.value);
                this.applyValidationStyles({ [key]: control.error });
            });
            input.addEventListener("blur", () => {
                control.markAsTouched();
                this.applyValidationStyles({ [key]: control.error });
            });
        });
    }
    validateAll() {
        const result = this.form.validateAll();
        this.applyValidationStyles(result);
    }
    applyValidationStyles(result) {
        for (const [key, error] of Object.entries(result)) {
            const input = this.formElement.querySelector(`[name="${key}"]`);
            const errorDiv = this.formElement.querySelector(`[data-error-for="${key}"]`);
            if (!input)
                continue;
            input.classList.remove("cd-valid", "cd-invalid");
            if (error) {
                input.classList.add("cd-invalid");
                if (errorDiv)
                    errorDiv.textContent = error;
            }
            else {
                input.classList.add("cd-valid");
                if (errorDiv)
                    errorDiv.textContent = "";
            }
        }
    }
}
