



### 🧩 1. CdFormControl.ts

Refs:
- docs/0007-cd-shell-directives.md
- docs/0021-cd-reactive-forms-implementation.md
- docs/0020-cd-shell-form-processing.md

```ts
// src/CdShell/core/forms/cd-form-control.ts
export class CdFormControl<T = any> {
  private _value: T;
  private _validators: ((value: T) => string | null)[];
  private _errors: string[];

  constructor(value: T = null, validators: ((value: T) => string | null)[] = []) {
    this._value = value;
    this._validators = validators;
    this._errors = [];
  }

  get value(): T {
    return this._value;
  }

  setValue(value: T): void {
    this._value = value;
    this.validate();
  }

  get valid(): boolean {
    return this._errors.length === 0;
  }

  get errors(): string[] {
    return this._errors;
  }

  validate(): void {
    this._errors = [];
    for (const validator of this._validators) {
      const result = validator(this._value);
      if (result) this._errors.push(result);
    }
  }

  reset(value: T = null): void {
    this._value = value;
    this._errors = [];
  }
}
```

---

### 🧩 2. CdFormGroup.ts

```ts
// src/CdShell/core/forms/cd-form-group.ts
import { CdFormControl } from "./cd-form-control";

export class CdFormGroup {
  private _controls: Record<string, CdFormControl<any>>;

  constructor(controls: Record<string, CdFormControl<any>>) {
    this._controls = controls;
  }

  get controls(): Record<string, CdFormControl<any>> {
    return this._controls;
  }

  get value(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in this._controls) {
      result[key] = this._controls[key].value;
    }
    return result;
  }

  get valid(): boolean {
    return Object.values(this._controls).every((c) => c.valid);
  }

  validateAll(): void {
    Object.values(this._controls).forEach((c) => c.validate());
  }

  reset(values: Record<string, any> = {}): void {
    for (const key in this._controls) {
      this._controls[key].reset(values[key] ?? null);
    }
  }

  setValue(values: Record<string, any>): void {
    for (const key in values) {
      if (this._controls[key]) {
        this._controls[key].setValue(values[key]);
      }
    }
  }
}
```

---

### 🧩 3. Example Validators

```ts
// src/CdShell/core/forms/cd-validators.ts
export class CdValidators {
  static required(value: any): string | null {
    return value === null || value === undefined || value === ""
      ? "This field is required"
      : null;
  }

  static minLength(length: number) {
    return (value: string) =>
      value && value.length < length
        ? `Minimum length is ${length}`
        : null;
  }

  static email(value: string): string | null {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? null
      : "Invalid email address";
  }
}
```

---

### 🧩 4. Example Integration in a Controller

```ts
// src/CdShell/sys/cd-user/controllers/sign-in.controller.ts
import { CdFormGroup } from "../../../core/forms/cd-form-group";
import { CdFormControl } from "../../../core/forms/cd-form-control";
import { CdValidators } from "../../../core/forms/cd-validators";
import { CdDirectiveBinder } from "../../../core/directives/cd-directive-binder";
import { UserModel } from "../models/user.model";

export class SignInController {
  form: CdFormGroup;

  constructor() {
    this.form = new CdFormGroup({
      username: new CdFormControl("", [CdValidators.required]),
      password: new CdFormControl("", [CdValidators.required, CdValidators.minLength(4)]),
    });
  }

  __template(): string {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="form.controls.username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="form.controls.password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  }

  __setup(): void {
    const binder = new CdDirectiveBinder(this);
    binder.bind();

    const form = document.getElementById("signInForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.auth();
    });
  }

  async auth(): Promise<void> {
    this.form.validateAll();
    if (!this.form.valid) {
      console.error("Form invalid:", this.form);
      alert("Please fill in all required fields");
      return;
    }

    const user = this.form.value as UserModel;
    console.log("Authenticating with:", user);
    // call service or proceed with logic
  }
}
```

---

### 🧩 5. Optional DirectiveBinder Enhancement (Future)

To support `cd-model="form.controls.username"` seamlessly,
you can slightly extend your `CdDirectiveBinder` to evaluate expressions safely using `Function` constructor — we can discuss this next if you want.

---

### ✅ Features Achieved

* Fully object-oriented (no RxJS, decorators, or dependency injection)
* Works natively in browser/PWA environment
* Easily integrable with your existing controller and directive system
* Mimics Angular’s `FormControl` and `FormGroup` behavior
* Simple validation API
* Lightweight, maintainable, and portable across environments

---



Here’s the **enhanced version of `CdDirectiveBinder`** that supports
bindings like:

```html
<input cd-model="form.controls.username" />
```

It will dynamically resolve deep expressions (not just direct properties like `username`)
and establish **two-way data binding** between your controller and the DOM.

---

### 🧩 Enhanced Directive Binder

```ts
// src/CdShell/core/directives/cd-directive-binder.ts

/**
 * The enhanced CdDirectiveBinder enables two-way data binding
 * for deep property expressions like "form.controls.username"
 * in addition to simple keys like "username".
 */
export class CdDirectiveBinder {
  controller: any;

  constructor(controller: any) {
    this.controller = controller;
  }

  /**
   * Binds cd-click and cd-model directives to the controller.
   */
  bind(rootElement: Document | HTMLElement = document): void {
    if (!rootElement) return;

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
      const expr = el.getAttribute("cd-model");
      if (!expr) return;

      const getter = this.createGetter(expr);
      const setter = this.createSetter(expr);

      const inputEl = el as HTMLInputElement;
      const initialValue = getter(this.controller);

      // Initialize input value from controller
      if (initialValue !== undefined && inputEl instanceof HTMLInputElement) {
        inputEl.value = this.extractValue(initialValue);
      }

      // Listen to user input changes
      inputEl.addEventListener("input", (e) => {
        const value = (e.target as HTMLInputElement).value;
        const target = getter(this.controller);

        // If it's a CdFormControl, call setValue
        if (target && typeof target.setValue === "function") {
          target.setValue(value);
        } else {
          setter(this.controller, value);
        }
      });

      // Observe updates from form controls (simple polling for now)
      this.observeControlChanges(expr, inputEl);
    });
  }

  /**
   * Builds a safe getter from a dot-expression string.
   * Example: "form.controls.username" → controller.form.controls.username
   */
  private createGetter(expr: string): (ctx: any) => any {
    try {
      return new Function("ctx", `with(ctx) { return ${expr}; }`) as any;
    } catch {
      return () => undefined;
    }
  }

  /**
   * Builds a safe setter from a dot-expression string.
   * Example: "form.controls.username" → assigns value to target
   */
  private createSetter(expr: string): (ctx: any, value: any) => void {
    const parts = expr.split(".");
    return (ctx: any, value: any) => {
      let target = ctx;
      for (let i = 0; i < parts.length - 1; i++) {
        if (target[parts[i]] === undefined) return;
        target = target[parts[i]];
      }
      const last = parts[parts.length - 1];
      if (target[last] && typeof target[last].setValue === "function") {
        target[last].setValue(value);
      } else {
        target[last] = value;
      }
    };
  }

  /**
   * Extracts primitive value (handles CdFormControl and plain values).
   */
  private extractValue(source: any): any {
    if (!source) return "";
    if (source.value !== undefined) return source.value;
    return source;
  }

  /**
   * Observes form control changes and updates DOM.
   * Currently implemented using a lightweight polling loop.
   */
  private observeControlChanges(expr: string, el: HTMLInputElement): void {
    const getter = this.createGetter(expr);
    let lastValue = getter(this.controller)?.value ?? getter(this.controller);

    const interval = setInterval(() => {
      const current = getter(this.controller)?.value ?? getter(this.controller);
      if (current !== lastValue) {
        el.value = current ?? "";
        lastValue = current;
      }
    }, 200);

    // Optional: attach cleanup hook if you later add unbind()
    (el as any).__cdWatcher = interval;
  }

  unbind(rootElement: Document | HTMLElement = document): void {
    rootElement.querySelectorAll("[cd-model]").forEach((el) => {
      const watcher = (el as any).__cdWatcher;
      if (watcher) clearInterval(watcher);
    });
  }
}
```

---

### ✅ What This Upgrade Enables

* Works for **deep expressions**:
  e.g. `cd-model="form.controls.username"`
* Supports **CdFormControl** objects (uses `.value` and `.setValue()`)
* Updates both:

  * DOM → Controller (user typing)
  * Controller → DOM (programmatic updates)
* Still works with plain variables (e.g. `cd-model="username"`)
* Safe and environment-independent (no decorators or reactive libs)

---

### 🧪 Example Usage

```html
<form id="signInForm" class="cd-sign-in">
  <label>Username</label>
  <input cd-model="form.controls.username" placeholder="Username" />

  <label>Password</label>
  <input cd-model="form.controls.password" type="password" placeholder="Password" />

  <button type="button" cd-click="auth">Sign In</button>
</form>
```

When the user types, the `CdFormControl` objects are updated automatically —
and when you call `this.form.setValue({ username: 'john' })`,
the DOM updates automatically too. 🔄

---

# Compilation Process and Compiled code

Following is the compilation process from controller class codes to compiled code.The document goes to crystallizing the *design contract* between the **TypeScript source controllers** (developer-side) and their **compiled runtime equivalents** (browser/PWA-side).

Let’s first outline how we’ll present this in a **developer guide format**, before manually producing the `sign-in.controller.js` (runtime) equivalent.

---

## 🧭 Developer Guide: Controller Design in Corpdesk PWA

### **Purpose**

Controllers serve as the dynamic glue between form templates and business logic.
They are written in **TypeScript** for maintainability, and later compiled into **runtime JavaScript objects** (used directly in the PWA environment).

---

### **1. Design Goals**

| Goal                             | Description                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| 🧩 **Consistency**               | Maintain a predictable structure between `.ts` source and compiled `.js` output.               |
| ⚙️ **Runtime Portability**       | Make the compiled controllers work seamlessly in the browser without Node or CLI dependencies. |
| 🚀 **Developer Experience (DX)** | Simplify creation, testing, and hot reloading of modules during local development.             |
| 🔄 **Dynamic Reloads**           | Enable runtime updates via `IdeAgentService` without a full reload.                            |

---

### **2. Controller Architecture**

| TypeScript Source (dev)                                            | Compiled JavaScript (runtime)                     |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| Class-based (`export class`)                                       | Object-based (`export const`)                     |
| Uses decorators and imports (e.g. `CdFormControl`, `CdValidators`) | Reduced to plain reactive object fields           |
| `__template()` returns HTML template string                        | Same in compiled form                             |
| `__setup()` handles form binding, listeners                        | Maintained; sometimes extended with runtime hooks |
| Methods like `auth()` handle logic                                 | Same, but simplified for browser runtime          |

---

### **3. Lifecycle Overview**

```
index.html → app.ts → main.ts → ModuleService
                           ↓
                    loads controller
                           ↓
                   controller.__setup()
                           ↓
                    binds form & actions
                           ↓
                     responds to user
```

---

### **4. Runtime Simplification Strategy**

During compilation:

| Aspect              | Dev Controller                                                           | Runtime Controller                            |
| ------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| **Fields**          | `CdFormGroup` controls                                                   | Simple JS props (`username`, `password`)      |
| **Validation**      | `CdValidators`                                                           | Moved to `auth()` method checks               |
| **Binder**          | `CdDirectiveBinder`                                                      | Auto-resolved via lightweight runtime binding |
| **Service Imports** | Imports replaced by runtime stubs (e.g. `IdeAgentService`)               |                                               |
| **Dynamic Imports** | Used only where cyclic dependency may occur (`BaseService.get_svSess()`) |                                               |

---

### **5. Example: Sign-In Controller**

#### **TypeScript Source**

(Developer writes this in `src/CdShell/sys/cd-user/controllers/sign-in.controller.ts`)

```ts
import { CdDirectiveBinder } from "../../base/cd-directive-binder";
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";
import { UserModel } from "../models/user.model";

export class SignInController {
  form: CdFormGroup;

  constructor() {
    this.form = new CdFormGroup({
      username: new CdFormControl("", [CdValidators.required]),
      password: new CdFormControl("", [CdValidators.required, CdValidators.minLength(4)]),
    });
  }

  __template(): string {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="form.controls.username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="form.controls.password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  }

  __setup(): void {
    const binder = new CdDirectiveBinder(this);
    binder.bind();

    const form = document.getElementById("signInForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.auth();
    });
  }

  async auth(): Promise<void> {
    this.form.validateAll();
    if (!this.form.valid) {
      console.error("Form invalid:", this.form);
      alert("Please fill in all required fields");
      return;
    }

    const user = this.form.value as UserModel;
    console.log("Authenticating with:", user);
    // call service or proceed with logic
  }
}
```

---

### **6. Equivalent Runtime Output**

The compiled runtime form should look like this (manual equivalent):

```js
// src/CdShell/sys/cd-user/view/sign-in.controller.js

export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="submit">Sign In</button>
      </form>
    `;
  },

  __setup() {
    console.info("[cd-user] Initializing IdeAgentService (runtime)...");

    try {
      this.svIdeAgent = new IdeAgentService();
      this.svIdeAgent.initialize(() => {
        // Placeholder: handle IDE events
      });
      console.log("[cd-user] svIdeAgent initialized successfully");
    } catch (err) {
      console.error("[cd-user] Failed to initialize svIdeAgent:", err);
    }

    const form = document.getElementById("signInForm");
    if (!form) {
      console.warn("[cd-user] signInForm not found");
      return;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.auth();
    });

    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);

    if (!this.username || !this.password) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      source: { appId: this.devSync?.appId },
      target: "ide-agent",
      action: "AUTH_ATTEMPT",
      data: {
        username: this.username,
        password: this.password,
        timestamp: new Date().toISOString(),
      },
    };

    if (this.devSync?.emitPayload) {
      this.devSync.emitPayload(payload);
    }

    alert(`Hello, ${this.username}!`);
  },

  onDevSyncMessage(payload) {
    const { source, action, data } = payload;
    if (source.appId === this.devSync.appId) return;

    switch (action) {
      case "AUTH_RESULT":
        console.log("[cd-user] Auth result received:", data);
        alert(data.message);
        break;

      case "UPDATE_CONTROLLER":
        console.log("[cd-user] Controller update payload:", data);
        this.applyControllerUpdate(data);
        break;

      default:
        console.log("[cd-user] Unknown DevSync action:", action);
    }
  },

  applyControllerUpdate(updateData) {
    console.log("[cd-user] Applying runtime update:", updateData);
  },
};
```

---

### **7. Next Steps**

* ✅ Finalize base runtime interface shared by all compiled controllers.
* 🔧 Define transformation policy:
  `FormGroup → flat fields`, `Control validators → runtime checks`.
* ⚡ Introduce lightweight binding system in browser (`cd-model` + `cd-click` directives).
* 🧠 Introduce `IdeAgentService` event bridge for runtime updates.

---

# 🧭 **Corpdesk Developer Guide: Themed Form Validation UX (POC)**

## 1. 🎯 Goal

To create a **unified validation experience** that:

* Gives **visual feedback** (color, icons, labels) when inputs are invalid.
* Integrates with **Corpdesk theming** (`/themes/common/base.css`, `/themes/default/theme.css`, etc.).
* Keeps developer-side code declarative (no new learning curve).
* Keeps runtime code simple, compiled from developer metadata.

---

## 2. ⚙️ Overview of Design

| Layer                         | Responsibility                                              | Example                                         |
| ----------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| **Developer Code**            | Defines form, validators, messages                          | `CdValidators.required("Username is required")` |
| **Compiler / Manual Runtime** | Translates validation metadata to plain JS checks           | `if (!this.username)`                           |
| **Theming System**            | Provides CSS variables + classes for invalid / valid states | `.cd-invalid`, `.cd-valid`, `.cd-hint`          |
| **DirectiveBinder**           | Dynamically toggles classes and updates help labels         | `binder.applyValidationStyles()`                |

---

## 3. 🧩 Developer-Side Code Example

`src/CdShell/sys/cd-user/controllers/sign-in.controller.ts`

```ts
import { CdDirectiveBinder } from "../../base/cd-directive-binder";
import { CdFormGroup } from "../../cd-guig/controllers/cd-form-group.control";
import { CdFormControl } from "../../cd-guig/controllers/cd-form.control";
import { CdValidators } from "../../cd-guig/controllers/cd-validators.controller";

export class SignInController {
  form: CdFormGroup;

  constructor() {
    this.form = new CdFormGroup({
      username: new CdFormControl("", [
        CdValidators.required("Username is required"),
      ]),
      password: new CdFormControl("", [
        CdValidators.required("Password is required"),
        CdValidators.minLength(4, "Password must be at least 4 characters"),
      ]),
    });
  }

  __template(): string {
    return `
      <form id="signInForm" class="cd-form cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <div class="cd-form-field">
          <label>Username</label>
          <input cd-model="form.controls.username" placeholder="Username" />
          <small class="cd-hint" cd-hint-for="username"></small>
        </div>

        <div class="cd-form-field">
          <label>Password</label>
          <input cd-model="form.controls.password" type="password" placeholder="Password" />
          <small class="cd-hint" cd-hint-for="password"></small>
        </div>

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  }

  __setup(): void {
    const binder = new CdDirectiveBinder(this);
    binder.bind();

    const form = document.getElementById("signInForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.auth();
    });
  }

  async auth(): Promise<void> {
    const result = this.form.validateAll();
    const binder = new CdDirectiveBinder(this);
    binder.applyValidationStyles(result);

    if (!this.form.valid) {
      alert("Please correct the highlighted errors.");
      return;
    }

    console.log("Authenticating:", this.form.value);
  }
}
```

---

## 4. 🪄 New Helper Method (DirectiveBinder)

Extend `CdDirectiveBinder` to handle validation visuals:

```ts
applyValidationStyles(result) {
  Object.keys(result).forEach((key) => {
    const control = document.querySelector(`[cd-model$="${key}"]`);
    const hint = document.querySelector(`[cd-hint-for="${key}"]`);
    if (!control) return;

    if (result[key]?.valid) {
      control.classList.remove("cd-invalid");
      control.classList.add("cd-valid");
      if (hint) hint.textContent = "";
    } else {
      control.classList.remove("cd-valid");
      control.classList.add("cd-invalid");
      if (hint) hint.textContent = result[key]?.message || "Invalid field";
    }
  });
}
```

---

## 5. 🎨 Theming Integration

We integrate through **theme CSS variables and classes**:

**`/themes/common/base.css`**

```css
:root {
  --cd-color-valid: #2ecc71;
  --cd-color-invalid: #e74c3c;
  --cd-color-hint: #999;
}

.cd-form-field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.cd-form-field input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.6rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.cd-form-field input.cd-valid {
  border-color: var(--cd-color-valid);
  box-shadow: 0 0 4px var(--cd-color-valid);
}

.cd-form-field input.cd-invalid {
  border-color: var(--cd-color-invalid);
  box-shadow: 0 0 4px var(--cd-color-invalid);
}

.cd-hint {
  font-size: 0.85rem;
  color: var(--cd-color-hint);
}

.cd-form-field input.cd-invalid + .cd-hint {
  color: var(--cd-color-invalid);
}
```

Each theme (e.g., `/themes/dark/theme.css`) can override these variables for custom palette integration.

---

## 6. 🧪 Runtime POC (Manual Version)

For now, we manually generate a runtime equivalent:

```js
export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form id="signInForm" class="cd-form cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <div class="cd-form-field">
          <label>Username</label>
          <input cd-model="username" placeholder="Username" />
          <small class="cd-hint" cd-hint-for="username"></small>
        </div>

        <div class="cd-form-field">
          <label>Password</label>
          <input cd-model="password" type="password" placeholder="Password" />
          <small class="cd-hint" cd-hint-for="password"></small>
        </div>

        <button type="submit">Sign In</button>
      </form>
    `;
  },

  __setup() {
    const binder = new CdDirectiveBinder(this);
    binder.bind();

    const form = document.getElementById("signInForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.auth();
    });
  },

  auth() {
    const errors = [];

    // Validation checks
    if (!this.username) {
      errors.push({ key: "username", msg: "Username is required" });
    }
    if (!this.password) {
      errors.push({ key: "password", msg: "Password is required" });
    } else if (this.password.length < 4) {
      errors.push({ key: "password", msg: "Password must be at least 4 characters" });
    }

    // Apply styles
    errors.forEach((e) => {
      const input = document.querySelector(`[cd-model="${e.key}"]`);
      const hint = document.querySelector(`[cd-hint-for="${e.key}"]`);
      input?.classList.add("cd-invalid");
      if (hint) hint.textContent = e.msg;
    });

    if (errors.length) {
      alert("Please correct the highlighted errors.");
      return;
    }

    alert(`Welcome, ${this.username}!`);
  },
};
```

---

## 7. 📘 Developer Workflow Summary

| Step | Developer                                       | Compiler/Runtime                                            |
| ---- | ----------------------------------------------- | ----------------------------------------------------------- |
| 1.   | Declares form controls + validators             | Compiler flattens validators into inline JS                 |
| 2.   | Uses `CdFormControl` + `CdValidators`           | Runtime has simple fields and validation checks             |
| 3.   | Relies on `CdDirectiveBinder` for model binding | Binder applies theming classes for validation               |
| 4.   | Optionally styles with theme variables          | Themes define `.cd-valid`, `.cd-invalid`, `.cd-hint` colors |

---

## 8. 🧱 Next Steps

1. ✅ Implement `applyValidationStyles()` in `CdDirectiveBinder`.
2. 🧩 Create base validation CSS inside `/themes/common/base.css`.
3. 🌗 Extend theme JSON and CSS to allow theme-level overrides for form colors.
4. 🧪 Test the POC for runtime updates and interactive feedback.
5. 🔄 In later stage, automate the “flattening” during compilation.

---

Would you like me to now produce the **concrete CSS file (`/themes/common/base.css` updated version)** and the **updated DirectiveBinder** implementation (as ready-to-drop code)?


