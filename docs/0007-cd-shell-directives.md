


# 🧩  Corpdesk CdShell Directives Developer Guide

Refs:
- docs/0007-cd-shell-directives.md
- docs/0021-cd-reactive-forms-implementation.md
- docs/0020-cd-shell-form-processing.md


## 1. Overview

The Corpdesk shell is designed to dynamically load, compile, and execute modular components (controllers, services, and models) both during development and runtime.
Each module conforms to a predictable structure under `/src/CdShell/{app,sys}/`.

Modules are organized as follows:

```
src/
└── CdShell/
    ├── sys/
    │   └── cd-user/
    │       ├── controller/
    │       │   └── sign-in.controller.ts
    │       ├── model/
    │       │   └── user.model.ts
    │       └── service/
    │           └── user.service.ts
    └── app/
        └── ...
```

Each module’s `controller`, `model`, and `service` layer corresponds to a distinct runtime role, just like in Angular—but designed to operate dynamically at runtime.

---

## 2. Controller Design

All controllers inherit from the abstract base class `CdShellController`:

```ts
export abstract class CdShellController {
  abstract template(): string;
  abstract setup(): void;
  abstract processFormData(): Record<string, any>;

  // optional: override for auth or other actions
  auth?(data: any): void;

  // lifecycle hooks
  onInit?(): void;
  onDestroy?(): void;
}
```

### **Method Responsibilities**

| Method              | Purpose                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `template()`        | Returns the raw HTML structure of the view, expressed as a string. This represents what will be rendered into the DOM.                 |
| `setup()`           | Executes initialization logic after the template is rendered. Often used to bind events, initialize DOM elements, or set up listeners. |
| `processFormData()` | Extracts and returns form data from DOM elements with `cd-model` bindings.                                                             |
| `auth?(data)`       | Optional method for authentication or action-level authorization.                                                                      |
| `onInit?()`         | Lifecycle hook invoked immediately after the controller is initialized.                                                                |
| `onDestroy?()`      | Lifecycle hook invoked before controller teardown, for cleanup.                                                                        |

---

## 3. Runtime Controller Format

While the source code for a controller is class-based (for structure and type safety),
the **runtime output** is transformed into a **plain JavaScript object**.

### **Example (runtime form)**

```ts
export const ctlSignIn = {
  __template() {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <label for="username">Username</label>
        <input id="username" type="text" cd-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" cd-model="password" required />

        <button type="submit" class="cd-button" cd-click="auth">Sign In</button>
      </form>
    `;
  },

  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  __processFormData() {
    const username = document.querySelector('[cd-model="username"]').value || "";
    const password = document.querySelector('[cd-model="password"]').value || "";
    return { username, password };
  },

  auth() {
    const { username, password } = this.__processFormData();
    console.log("Auth triggered with:", username, password);
    alert(`Hello, ${username}!`);
  },
};
```

This transformation is handled automatically during the **post-build phase**.

---

## 4. The `post-build.js` Process

After Vite completes its build process, the **post-build script** (`post-build.js`) performs the following tasks:

1. **Copies compiled TypeScript output** from `dist-ts/` to the runtime directory (`dist/`).
2. **Transforms controllers** from class-based structures into runtime executable objects (`ctl*` constants).
3. **Registers modules** for discovery by `ModuleService`.
4. **Adds build timestamp** to console output for traceability.

This guarantees that:

* `npm run build` produces runtime-ready modules.
* `npm run preview` launches an environment capable of dynamically loading and executing those modules.

---

## 5. Module Loader Workflow

### **File: `module/services/module.service.ts`**

Responsible for discovering and loading modules at runtime.

### **Execution Flow**

1. `npm run build`

   * TypeScript compiles to `/dist-ts`.
   * Vite compiles to `/dist`.
   * `post-build.js` finalizes runtime controllers.

2. `index.html` → loads `app.ts`

3. `app.ts` → initializes `Main.ts`

4. `Main.ts` → calls `ModuleService` to discover available modules

5. `ModuleService` uses:

   * `import.meta.glob("./src/CdShell/**/index.js")` (in Vite/browser)
   * Node-based discovery in production (`dist-ts/CdShell`)

6. The loaded modules register their controllers, which are rendered into the DOM.

---

## 6. Runtime Directives

### **1️⃣ `cd-model`**

Two-way binding between input fields and controller state.
Used by `processFormData()` to read or write user data.

Example:

```html
<input cd-model="username" />
```

---

### **2️⃣ `cd-click`**

#### **Purpose**

Provides declarative event binding — linking HTML elements directly to controller methods.

#### **Syntax**

```html
<button cd-click="onSubmit">Submit</button>
```

#### **Runtime Handling**

* The runtime scans for elements with `cd-click` attributes.
* The value (e.g., `onSubmit`) is resolved as a method in the controller.
* A click event listener is automatically attached.

Equivalent to:

```ts
element.addEventListener("click", () => controller.onSubmit());
```

#### **Example**

```ts
export const ctlDashboard = {
  __template() {
    return `
      <div>
        <button cd-click="refreshData">Refresh</button>
        <button cd-click="logout">Logout</button>
      </div>
    `;
  },
  refreshData() {
    console.log("Refreshing dashboard data...");
  },
  logout() {
    console.log("User logged out.");
  },
};
```

If `cd-click` points to an undefined method, the runtime logs:

```
[cd-click] Method 'refreshData' not found in ctlDashboard
```

#### **Advantages**

| Feature                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| 🔹 Declarative Binding | Keeps templates clean; logic remains in JS.                    |
| 🔹 Scoped              | Event methods automatically reference the controller instance. |
| 🔹 Familiar            | Similar to Angular’s `(click)` or Vue’s `@click`.              |
| 🔹 Lightweight         | Works natively in the browser without framework dependencies.  |

---

### **Future Directives**

| Directive   | Purpose                   |
| ----------- | ------------------------- |
| `cd-if`     | Conditional rendering     |
| `cd-for`    | Iterative rendering       |
| `cd-submit` | Form submission           |
| `cd-bind`   | Attribute binding         |
| `cd-class`  | Dynamic class application |

---

## 7. Summary

The Corpdesk Shell runtime architecture achieves:

* Dynamic module discovery and loading.
* Conversion from TypeScript class controllers into lightweight runtime objects.
* Directive-based interaction (`cd-model`, `cd-click`).
* Full compatibility with both Vite (development) and Node (production).
* A predictable, extensible modular hierarchy mirroring Angular, but executed purely at runtime.

---


---

**Date: 2025-10-04, Time: 23:05**
──────────────────────────────


# CdShell Directives implementation

The CdShell directives system is a lightweight, explicit binding mechanism designed to link HTML element events and data inputs directly to methods and properties on a **Controller Object**. This guide details the core philosophy and implementation of the current directives: `cd-click` and `cd-model`.

-----

## I. Core Philosophy and Execution Flow

The binding process is executed immediately after a module's HTML template is rendered into the DOM, ensuring the module is interactive from the moment it appears.

### The Binding Sequence

1.  **Template Injection:** The `ModuleService.loadModule()` method retrieves the module's template (`moduleInfo.template`) and sets the `innerHTML` of the main container (`#cd-main-content`).
2.  **Controller Setup:** The optional `__setup()` method is called on the controller (`moduleInfo.controller`).
3.  **Directive Binding:** A new instance of **`CdDirectiveBinder`** is created, taking the controller as its argument.
4.  **DOM Scan:** The `binder.bind(container)` method scans the newly injected HTML for elements possessing `cd-*` attributes.
5.  **Event Attachment:** Event listeners (like `click` or `input`) are attached to the DOM elements, explicitly calling methods or setting properties on the controller.

### The Controller Context (`this`)

A crucial aspect of the design is maintaining the correct execution context. When a directive (like `cd-click`) triggers an action, the method runs with **the controller object** as its `this` context. This allows controller methods to directly access and modify state properties (e.g., `this.username` or `this.password`) defined on the controller itself.

-----

## II. Available Directives

### 1\. The `cd-click` Directive

The `cd-click` directive handles event binding for user interactions, primarily the mouse click.

#### **Purpose**

To bind a DOM element's native `click` event to a specific method defined on the module's controller.

#### **Implementation (`CdDirectiveBinder`)**

The binder queries the DOM for `[cd-click]` attributes, retrieves the method name, and attaches an event listener:

```typescript
// cd-directive-binder.ts (Simplified)
rootElement.querySelectorAll("[cd-click]").forEach((el) => {
  const methodName = el.getAttribute("cd-click");
  const method = this.controller[methodName];
  if (typeof method === "function") {
    // Key Concept: method.bind(this.controller) ensures 'this' inside 'auth()' 
    // refers to the ctlSignIn object, not the HTML button element.
    el.addEventListener("click", method.bind(this.controller));
  }
});
```

#### **Usage Example (`sign-in.controller.ts`)**

In the template, the button calls the `auth` method on the controller when clicked:

```html
<button type="button" cd-click="auth">Sign In</button>
```

In the controller, the method is defined:

```javascript
// ctlSignIn
auth() {
  // 'this' refers to ctlSignIn
  console.log("Auth triggered with:", this.username, this.password);
}
```

-----

### 2\. The `cd-model` Directive

The `cd-model` directive implements a basic form of **two-way data binding** between an input element and a property on the module's controller.

#### **Purpose**

To synchronize the `value` property of an input element with a corresponding state property on the controller.

#### **Implementation (`CdDirectiveBinder`)**

The binding process involves two steps: **Initialization** and **Synchronization**.

1.  **Initialization:** Reads the property from the controller and sets the input's initial value.
2.  **Synchronization:** Attaches an `input` event listener (which fires on every change) to update the controller property instantly.

<!-- end list -->

```typescript
// cd-directive-binder.ts (Simplified)
rootElement.querySelectorAll("[cd-model]").forEach((el) => {
  const modelKey = el.getAttribute("cd-model");

  // Initialization (Controller → View)
  if (this.controller[modelKey] !== undefined && el instanceof HTMLInputElement) {
    el.value = this.controller[modelKey];
  }

  // Synchronization (View → Controller)
  el.addEventListener("input", (e) => {
    this.controller[modelKey] = (e.target as HTMLInputElement).value;
  });
});
```

#### **Usage Example (`sign-in.controller.ts`)**

In the template, the `cd-model` attribute links the input to a controller property:

```html
<input cd-model="username" placeholder="Username" />
```

In the controller, the linked property must be defined:

```javascript
// ctlSignIn
username: "", // State property linked to the input
password: "",
// ...
```

Any character typed into the "Username" input is immediately reflected in `ctlSignIn.username`. This synchronized value is then available for methods like `auth()`.
