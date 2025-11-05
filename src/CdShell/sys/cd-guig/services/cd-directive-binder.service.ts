import { CdFormGroup } from "../controllers/cd-form-group.control";

export class CdDirectiveBinderService {
  // private form: CdFormGroup;
  // private formElement: HTMLFormElement;
  // private controllerInstance: any; // 👈 NEW: Store the controller instance

  private form: CdFormGroup;
  private formElement: HTMLFormElement; // Will be set later in bindToDom()
  private controllerInstance: any;
  private formSelector: string; // 💡 Store the selector here

  // 💡 NEW: Array to store references for listener removal
  private eventListeners: {
    element: HTMLElement;
    event: string;
    handler: (e: Event) => void;
  }[] = [];

  // constructor(
  //   form: CdFormGroup,
  //   formSelector: string,
  //   controllerInstance: any
  // ) {
  //   this.form = form;
  //   this.controllerInstance = controllerInstance; // 👈 Store the instance
  //   this.formElement = document.querySelector(formSelector) as HTMLFormElement;

  //   if (!this.formElement) {
  //     console.warn(`Form element not found: ${formSelector}`);
  //     return;
  //   }

  //   this.initializeBindings();
  // }

  // constructor(
  //   form: CdFormGroup,
  //   formSelector: string,
  //   controllerInstance: any
  // ) {
  //   console.log("CdDirectiveBinderService::constructor()/start");
  //   this.form = form;
  //   this.controllerInstance = controllerInstance;
  //   // NOTE: We only query the DOM once here to set formElement,
  //   // but the actual binding happens in bindToDom().
  //   this.formElement = document.querySelector(formSelector) as HTMLFormElement;

  //   if (!this.formElement) {
  //     console.warn(`Form element not found: ${formSelector}`);
  //     // Return, but allow the controller to exist in memory
  //   }

  //   // 🛑 REMOVE: The call to initializeBindings() is now managed externally by the controller's __activate()
  //   // requestAnimationFrame(() => {
  //   //   this.initializeBindings();
  //   // });
  // }

  constructor(
    form: CdFormGroup,
    formSelector: string,
    controllerInstance: any
  ) {
    console.log(
      "CdDirectiveBinderService::constructor()/start - DOM lookups deferred."
    );
    this.form = form;
    this.controllerInstance = controllerInstance;
    this.formSelector = formSelector; // Store the selector for later use in bindToDom()

    // 🛑 All DOM querying logic is removed from the constructor.
  }

  // 💡 NEW: Binds control listeners to the current DOM elements
  /**
   * 💡 NEW: Binds control listeners and Angular-style event listeners to the current DOM elements.
   */
  public async bindToDom(): Promise<void> {
    console.log("[CdDirectiveBinderService][bindToDom] 01");

    // 1. Find the Form Element using the stored selector
    this.formElement = document.querySelector(this.formSelector) as HTMLFormElement;
    
    if (!this.formElement) {
        console.error(`[Binder Error] Form element not found in DOM for selector: ${this.formSelector}`);
        // If the form isn't found, stop binding but don't crash.
        return; 
    }

    
    if (!this.formElement) return;

    // --- 1. Bind cdFormControl inputs (Input/Blur) ---
    Object.entries(this.form.controls).forEach(([key, control]) => {
      const input = this.formElement.querySelector(
        `[name="${key}"][cdFormControl]`
      ) as HTMLInputElement;

      if (!input) return;

      // Handler for 'input' (value change)
      const inputHandler = (e: Event) => {
        const target = e.target as HTMLInputElement;
        control.setValue(target.value);
        this.applyValidationStyles({ [key]: control.error });
      };

      // Handler for 'blur' (touched state and validation)
      const blurHandler = () => {
        control.markAsTouched();
        this.applyValidationStyles({ [key]: control.error });
      };

      input.addEventListener("input", inputHandler);
      input.addEventListener("blur", blurHandler);

      // 💡 Store references for removal
      this.eventListeners.push({
        element: input,
        event: "input",
        handler: inputHandler,
      });
      this.eventListeners.push({
        element: input,
        event: "blur",
        handler: blurHandler,
      });

      // 4. Apply current control values and validation styles
      input.value = control.value;
      this.applyValidationStyles({ [key]: control.error });
    });

    // --- 2. Bind Angular-style event bindings ((change)="method()") ---
    const elements = this.formElement.querySelectorAll("*");

    elements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const match = attr.name.match(/^\(([^)]+)\)$/); // e.g., (change)
        if (match) {
          const eventName = match[1];
          const expression = attr.value;

          // Handler for the custom event binding
          const customHandler = (e: Event) =>
            this.invokeDirectiveMethod(expression, e);

          el.addEventListener(eventName, customHandler);

          // 💡 Store reference for removal
          this.eventListeners.push({
            element: el as HTMLElement,
            event: eventName,
            handler: customHandler,
          });
        }
      });
    });
  }

  // 💡 NEW: Removes all listeners created by bindToDom()
  /**
   * 💡 NEW: Removes all listeners created by bindToDom() from the DOM and clears the tracking array.
   */
  public unbindAllDomEvents(): void {
    console.log(
      `CdDirectiveBinderService: Unbinding ${this.eventListeners.length} listeners.`
    );

    // Iterate through the stored references and remove the listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Crucial: Clear the array to prevent memory leaks in the binder itself
    this.eventListeners = [];
  }

  // private initializeBindings(): void {
  //   Object.entries(this.form.controls).forEach(([key, control]) => {
  //     const input = this.formElement.querySelector(
  //       `[name="${key}"]`
  //     ) as HTMLElement;
  //     if (!input) return;

  //     // --- Bind cdFormControl inputs ---
  //     input.addEventListener("input", (e) => {
  //       const target = e.target as HTMLInputElement;
  //       control.setValue(target.value);
  //       this.applyValidationStyles({ [key]: control.error });
  //     });

  //     input.addEventListener("blur", () => {
  //       control.markAsTouched();
  //       this.applyValidationStyles({ [key]: control.error });
  //     });
  //   });

  //   // --- ✅ NEW: Scan for Angular-style event bindings like (change)="method()" ---
  //   this.bindAngularStyleEvents();
  // }

  /**
   * Detects attributes like (change)="methodName()" and binds them automatically.
   */
  // private bindAngularStyleEvents(): void {
  //   const elements = this.formElement.querySelectorAll("*");

  //   // elements.forEach((el) => {
  //   //   Array.from(el.attributes).forEach((attr) => {
  //   //     const match = attr.name.match(/^\(([^)]+)\)$/); // e.g. (change)
  //   //     if (match) {
  //   //       const eventName = match[1];
  //   //       const expression = attr.value; // e.g. onUiSystemChange($event)
  //   //       el.addEventListener(eventName, (e) =>
  //   //         this.invokeDirectiveMethod(expression, e)
  //   //       );
  //   //     }
  //   //   });
  //   // });
  //   elements.forEach((el) => {
  //     Array.from(el.attributes).forEach((attr) => {
  //       const match = attr.name.match(/^\(([^)]+)\)$/);
  //       if (match) {
  //         const eventName = match[1];
  //         const expression = attr.value;
  //         el.addEventListener(eventName, (e) =>
  //           this.invokeDirectiveMethod(expression, e)
  //         );
  //       }
  //     });
  //   });
  // }

  // /**
  //  * Invokes a controller method referenced by directive attributes.
  //  */
  // private invokeDirectiveMethod(expression: string, event: Event): void {
  //   try {
  //     // Parse something like "onUiSystemChange($event)"
  //     const fnMatch = expression.match(/^([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
  //     if (!fnMatch) return;

  //     const fnName = fnMatch[1];
  //     const hasEventArg = fnMatch[2]?.includes("$event");

  //     // Auto-detect current controller (active window export)
  //     const controller = this.detectActiveController();

  //     if (controller && typeof controller[fnName] === "function") {
  //       controller[fnName](hasEventArg ? event : undefined);
  //     } else {
  //       console.warn(`[UUD] Method not found: ${fnName}`);
  //     }
  //   } catch (err) {
  //     console.error(
  //       `[UUD] Error invoking directive method: ${expression}`,
  //       err
  //     );
  //   }
  // }
  /**
   * Invokes a controller method referenced by directive attributes.
   */
  private invokeDirectiveMethod(expression: string, event: Event): void {
    try {
      const fnMatch = expression.match(/^([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (!fnMatch) return;

      const fnName = fnMatch[1];
      const hasEventArg = fnMatch[2]?.includes("$event");

      const controller = this.controllerInstance; // 👈 USE STORED INSTANCE

      if (controller && typeof controller[fnName] === "function") {
        // 🛑 CRITICAL FIX: Use .call() or .apply() to set the 'this' context!
        controller[fnName].call(controller, hasEventArg ? event : undefined);
      } else {
        console.warn(`[UUD] Method not found: ${fnName}`);
      }
    } catch (err) {
      console.error(
        `[UUD] Error invoking directive method: ${expression}`,
        err
      );
    }
  }

  /**
   * Detects which controller is currently active based on a naming convention.
   * (You can refine this logic later for module contexts.)
   */
  // private detectActiveController(): any {
  //   const controllers = Object.keys(window).filter((k) => k.startsWith("ctl"));
  //   if (controllers.length === 1) {
  //     return (window as any)[controllers[0]];
  //   }
  //   console.warn(`[UUD] Multiple or no controllers found.`, controllers);
  //   return null;
  // }

  validateAll(): void {
    const result = this.form.validateAll();
    this.applyValidationStyles(result);
  }

  applyValidationStyles(result: Record<string, string | null>): void {
    for (const [key, error] of Object.entries(result)) {
      const input = this.formElement.querySelector(
        `[name="${key}"]`
      ) as HTMLInputElement;
      const errorDiv = this.formElement.querySelector(
        `[data-error-for="${key}"]`
      ) as HTMLElement;

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
