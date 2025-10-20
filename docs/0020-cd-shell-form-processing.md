

# 🧩 Corpdesk Forms and Directive Binding Guide

### Version: Draft 0.1 — October 2025

Refs:
- docs/0007-cd-shell-directives.md
- docs/0021-cd-reactive-forms-implementation.md
- docs/0020-cd-shell-form-processing.md

---

## 1. 🎯 Overview

The **Corpdesk PWA Form Architecture** is designed to provide a *lightweight, reactive form experience* inspired by Angular’s **Reactive Forms**, but fully **framework-agnostic** — written in **plain TypeScript / JavaScript**, compatible with both **Node** and **browser (PWA)** environments.

At its core, the system:

* Uses **controller classes** (in `controllers/`) that drive HTML templates.
* Compiles those controllers into plain JS **views** (in `views/`).
* Uses **directive bindings** (`cd-model`, `cd-click`, etc.) to connect DOM elements to controller logic.
* Provides a minimal **form API** (`CdFormGroup`, `CdFormControl`) for managing data and validation reactively — *without decorators, injection, or RxJS.*

This enables developers to write clean, portable, and environment-safe logic that behaves consistently in both server-driven and client-driven contexts.

---

## 2. 🧭 Design Principles

| Principle                  | Description                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Simplicity**             | No dependency on Angular, React, or Vue. The system is written in plain OOP.                           |
| **Portability**            | Works in Node.js (CLI, backend) and browser/PWA environments alike.                                    |
| **Predictability**         | Clear controller → view → DOM binding patterns.                                                        |
| **Transparency**           | Explicit control flow, no hidden decorators or lifecycle magic.                                        |
| **Lightweight Reactivity** | Two-way data binding achieved through the directive binder and form controls, with zero RxJS overhead. |

---

## 3. 🧠 Developer Experience (DX) Goals

| Goal                             | Outcome                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Angular-like familiarity**     | Developers can use familiar syntax like `[formControl]="username"` or `cd-model="form.controls.username"`. |
| **Controller-managed templates** | Each controller defines its own HTML template string via `__template()`.                                   |
| **Consistent structure**         | Every module has `controllers/`, `models/`, `services/`, `views/`.                                         |
| **Rapid iteration**              | Compiled JS controllers are easily reloadable in a live PWA environment.                                   |
| **Unified form handling**        | Standardized interfaces for reading, writing, and validating form data.                                    |

---

## 4. 🧩 Architecture

```
src/
└── CdShell/
    ├── sys/
    │   └── cd-user/
    │       ├── controllers/
    │       │   └── sign-in.controller.ts
    │       ├── models/
    │       │   └── user.model.ts
    │       ├── services/
    │       │   └── forms.service.ts
    │       └── view/
    │           └── sign-in.controller.js
    └── core/
        └── directives/
            └── cd-directive-binder.ts
```

---

## 5. 🏗 Implementation Layers

### 5.1 `CdFormControl` (core form unit)

Represents a single form field with value, state, and validation methods.

```ts
export class CdFormControl<T = any> {
  value: T;
  touched = false;
  dirty = false;
  validators: ((value: T) => string | null)[] = [];
  errors: string[] = [];

  constructor(initialValue: T, validators: ((value: T) => string | null)[] = []) {
    this.value = initialValue;
    this.validators = validators;
  }

  setValue(value: T): void {
    this.value = value;
    this.dirty = true;
    this.validate();
  }

  validate(): boolean {
    this.errors = this.validators.map(fn => fn(this.value)).filter(e => e !== null) as string[];
    return this.errors.length === 0;
  }

  get valid(): boolean {
    return this.errors.length === 0;
  }
}
```

---

### 5.2 `CdFormGroup` (form container)

Represents a collection of controls.

```ts
export class CdFormGroup {
  controls: Record<string, CdFormControl>;

  constructor(controls: Record<string, CdFormControl>) {
    this.controls = controls;
  }

  get value() {
    const result: Record<string, any> = {};
    for (const key in this.controls) {
      result[key] = this.controls[key].value;
    }
    return result;
  }

  setValue(values: Record<string, any>) {
    for (const key in values) {
      if (this.controls[key]) {
        this.controls[key].setValue(values[key]);
      }
    }
  }

  get valid(): boolean {
    return Object.values(this.controls).every(c => c.valid);
  }
}
```

---

### 5.3 `CdDirectiveBinder` (view → controller bridge)

Binds `cd-model` and `cd-click` directives inside templates to controller logic.

Supports deep expressions like `form.controls.username`:

```html
<input cd-model="form.controls.username" placeholder="Username" />
```

Implementation (simplified):

```ts
export class CdDirectiveBinder {
  constructor(private controller: any) {}

  bind(root: HTMLElement | Document = document): void {
    root.querySelectorAll("[cd-click]").forEach((el) => {
      const method = el.getAttribute("cd-click");
      if (method && typeof this.controller[method] === "function") {
        el.addEventListener("click", this.controller[method].bind(this.controller));
      }
    });

    root.querySelectorAll("[cd-model]").forEach((el) => {
      const expr = el.getAttribute("cd-model");
      const input = el as HTMLInputElement;
      const getter = new Function("ctx", `with(ctx) { return ${expr}; }`);
      const setter = new Function("ctx", "value", `with(ctx) { ${expr} = value; }`);

      input.value = getter(this.controller)?.value ?? "";

      input.addEventListener("input", (e) => {
        const val = (e.target as HTMLInputElement).value;
        const ctrl = getter(this.controller);
        ctrl?.setValue ? ctrl.setValue(val) : setter(this.controller, val);
      });
    });
  }
}
```

---

### 5.4 Example Controller (TypeScript)

```ts
import { CdFormControl, CdFormGroup } from "../../core/forms";
import { CdDirectiveBinder } from "../../core/directives/cd-directive-binder";

export class SignInController {
  form = new CdFormGroup({
    username: new CdFormControl(""),
    password: new CdFormControl("")
  });

  __template(): string {
    return `
      <form id="signInForm" class="cd-sign-in">
        <label>Username</label>
        <input cd-model="form.controls.username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="form.controls.password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  }

  setup(): void {
    const binder = new CdDirectiveBinder(this);
    binder.bind(document);
  }

  auth(): void {
    console.log("Auth triggered:", this.form.value);
  }
}
```

---

### 5.5 Example Compiled View (JS)

```js
export const ctlSignIn = {
  form: {
    controls: {
      username: { value: "" },
      password: { value: "" },
    },
  },

  __template() {
    return `
      <form id="signInForm">
        <label>Username</label>
        <input cd-model="form.controls.username" />
        <label>Password</label>
        <input cd-model="form.controls.password" type="password" />
        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  },

  __setup() {
    new CdDirectiveBinder(this).bind(document);
  },

  auth() {
    alert("Hello " + this.form.controls.username.value);
  },
};
```

---

## 6. 🧪 Example Usage Flow

| Step | Process                                                           |
| ---- | ----------------------------------------------------------------- |
| 1    | Developer writes controller in `controllers/`                     |
| 2    | Controller compiles (manually or via build) into `views/`         |
| 3    | Template renders using `__template()`                             |
| 4    | `CdDirectiveBinder` attaches event and model bindings             |
| 5    | Controller logic interacts with `CdFormGroup` and `CdFormControl` |
| 6    | Form submission handled by controller methods                     |

---

## 7. 🚀 Future Work

| Area                           | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| **Validation UI**              | Show errors automatically in template.                          |
| **Form arrays**                | Introduce `CdFormArray` for dynamic lists.                      |
| **Auto-compilation**           | Automate controller-to-view build step.                         |
| **Template syntax extensions** | Support `[disabled]`, `[class.active]`, and similar directives. |

---

## 8. 💬 Summary

Corpdesk’s new PWA-friendly form architecture establishes a **unified, portable, and declarative approach** to data forms that works seamlessly across environments — **browser, PWA, or Node CLI**.
It empowers developers with familiar Angular-like patterns while preserving **clarity, independence, and full control over execution**.

---

Would you like me to now extend this guide with a **“Form Validation and Error Display”** section (showing how errors appear under inputs using the same directive system)?
