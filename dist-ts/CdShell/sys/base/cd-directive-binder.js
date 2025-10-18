// src/CdShell/core/directives/cd-directive-binder.js
export class CdDirectiveBinder {
    constructor(controller) {
        this.controller = controller;
    }
    bind(rootElement = document) {
        if (!rootElement)
            return;
        // --- cd-click ---
        rootElement.querySelectorAll("[cd-click]").forEach((el) => {
            const methodName = el.getAttribute("cd-click");
            const method = this.controller[methodName];
            if (typeof method === "function") {
                el.addEventListener("click", method.bind(this.controller));
            }
        });
        // --- cd-model ---
        rootElement.querySelectorAll("[cd-model]").forEach((el) => {
            const modelKey = el.getAttribute("cd-model");
            // Initialize input value from controller (if exists)
            if (this.controller[modelKey] !== undefined && el instanceof HTMLInputElement) {
                el.value = this.controller[modelKey];
            }
            // Update controller value on input change
            el.addEventListener("input", (e) => {
                this.controller[modelKey] = e.target.value;
            });
        });
    }
    unbind(rootElement = document) {
        // optional cleanup: we can later add teardown logic if needed
    }
}
