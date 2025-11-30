Below is a **clear, engineering-oriented documentation** for:

✅ **UI-Systems Architecture**
✅ **Setting up Bootstrap**
✅ **Setting up Material Design (MDC Web)**
✅ **Why MDC cannot use the same process as Bootstrap**
✅ **Common pitfalls + solutions**
✅ Tailored for **future developers/maintainers of Corpdesk Shell**

I’ve written it in a clean, maintainable “docs chapter” style so you can directly paste it into `/docs/ui-systems.md` or your wiki.

---

# 📘 **Corpdesk Shell — UI-Systems Architecture & Setup Guide**

## 1. Overview

Corpdesk Shell (cd-shell) supports **pluggable UI Systems**, allowing administrators to switch a full visual system (Bootstrap, Material Design, …) without the developer needing to rewrite HTML.

This is achieved through:

* **Unopinionated HTML conventions** in templates
* **A UI-System Bridge Layer** that transforms the standard HTML semantics into the specific UI-system format
* **Theme Tokens** that unify color, spacing, geometry
* A **UI-System Switcher** controlled by `shellconfig.json`
* **JavaScript initializers** (for systems that require dynamic behavior)

This allows:

* Developers to code once
* Admin/user to choose UI system
* Themes to be added or swapped at runtime
* AI or CLI automation to configure UI without touching HTML

---

# 2. UI-Systems Architecture

```
cd-shell/
 ├── themes/
 │    ├── default/
 │    └── dark/
 ├── ui-systems/
 │    ├── bootstrap-538/
 │    ├── material-design/
 │    └── future-ui-system/
 ├── core/
 │    ├── shellconfig.json
 │    ├── theming/
 │    ├── forms/
 │    └── dom/
```

### 2.1 Architecture Layers

### **A. HTML Layer (Developer)**

Developers write simple, framework-agnostic structures:

```html
<label cdInput>
    <span>Username</span>
    <input cdFormControl>
</label>
<button cdButton>Save</button>
```

No Bootstrap classes.
No MDC classes.
No framework dependencies.

### **B. Bridge Layer (UI-System)**

Each UI-system provides:

```
bridge.css → overrides and system-normalization
bridge.js → DOM transformation + JS initializers
descriptor.json → metadata + configuration
```

The Bridge Layer transforms:

```
<label cdInput> → Bootstrap or MDC equivalent
<input cdFormControl> → Bootstrap or MDC styling
<button cdButton> → Bootstrap or MDC button
```

### **C. Runtime Switcher**

`shellconfig.json` chooses:

```json
{
  "uiSystem": "material-design",
  "theme": "dark"
}
```

The correct UI system loads automatically.

---

# 3. Setting Up Bootstrap (Bootstrap 5.3.8 Example)

Bootstrap is easy because:

* It is **pure CSS + minimal JS**
* Inputs **do not require dynamic JS behavior**
* Labels do **not float** natively
* No structural requirements beyond typical HTML

### 3.1 How Bootstrap Works in cd-shell

```
cdInput → wrap input with .form-control
cdButton → add .btn + default variant
```

Bootstrap Transformation Example:

Before:

```html
<input cdFormControl>
```

After Bridge:

```html
<input class="form-control">
```

### 3.2 Bootstrap Bridge Responsibilities

1. Add `.form-control`, `.btn`, `.form-label`
2. Insert spacing utilities via bridge.css
3. Apply theme variables (light/dark)
4. No floating-label system required
5. No JS initializers required
6. No mutation observers required

### 3.3 Why Bootstrap is simple

Bootstrap = **CSS-first, structure-flexible, no dynamic label mechanics**.

This makes it ideal for cd-shell’s transformation model.

---

# 4. Setting Up Material Design (Material Components Web)

Material Design (MDC Web) is completely different from Bootstrap.

**MDC uses a dynamic component architecture**:

* Floating label moves based on JS transforms
* Line ripple animates via JS
* Required wrapper geometry (`.mdc-text-field`)
* Required DOM structure, order-sensitive
* Requires **MDC component initialization**

Because of this, MDC **cannot follow Bootstrap's auto-class-replacement strategy.**

### 4.1 Why MDC Requires a Different Setup

| Feature                   | Bootstrap | MDC Web                  |
| ------------------------- | --------- | ------------------------ |
| Pure CSS                  | ✔️        | ❌                        |
| JS required               | ❌         | ✔️                       |
| Floating labels           | ❌         | ✔️ JS-driven             |
| DOM structure flexible    | ✔️        | ❌ strict                 |
| Theme tokens              | simple    | complex                  |
| Works with auto transform | ✔️        | ❌ must respect structure |

### 4.2 MDC Needs:

1. **DOM restructuring**
   Turning:

   ```html
   <label cdInput>
       <span>Username</span>
       <input cdFormControl>
   </label>
   ```

   Into MDC’s complex structure:

   ```html
   <label class="mdc-text-field mdc-text-field--filled cd-md-text-field">
     <span class="mdc-text-field__ripple"></span>
     <span class="mdc-floating-label">Username</span>
     <input class="mdc-text-field__input">
     <span class="mdc-line-ripple"></span>
   </label>
   ```

2. **JavaScript initialization**

   ```js
   mdc.textField.MDCTextField.attachTo(labelElement)
   ```

3. **Mutation observer**
   Because fields may be created dynamically.

4. **A careful bridge.css**
   Bootstrap only needs styling overrides
   MDC needs styling **that does not break JS transforms**.

---

# 5. Material Design — Known Pitfalls & Solutions

### **Pitfall 1 — Floating label jumps/disappears**

Cause:

* Overriding MDC geometry (padding, transforms, positions)

Solution:

* Never override padding of `.mdc-text-field`
* Apply padding ONLY to `.mdc-text-field__input`
* Never override any transform property

### **Pitfall 2 — Dark theme text becomes unreadable**

Cause:

* MDC’s default colors assume a white background
* Shell dark theme overrides conflict with MDC dark tokens

Solution:

* Explicit MDC dark tokens inside
  `html[data-md-theme="dark"]`

### **Pitfall 3 — Typed text appears black on dark**

Cause:

* MDC sets text color on `.mdc-text-field__input`
* Shell sets `body { color: X }`

Solution:

* Force text color inside bridge.css:

```css
.cd-md-text-field .mdc-text-field__input {
  color: var(--cd-input-text-color) !important;
}
```

### **Pitfall 4 — Background mismatch**

Solution:

* Apply filled background ONLY on:

```css
.cd-md-text-field.mdc-text-field--filled
```

### **Pitfall 5 — Ripple animation broken**

Cause:

* Bridge styling interfering

Solution:

* Never override
  `will-change`, `transform`, or `opacity`

---

# 6. Material Design Setup Steps

### Step 1 — Include MDC UMD

```html
<script src="/assets/ui-systems/material-design/material-components-web.min.js"
    data-cd-uisystem="material-design">
</script>
```

### Step 2 — DOM Transformation

Use `prepareMdcDom()` to auto-build MDC structure.

### Step 3 — JS Initialization

After DOM is ready:

```js
document.querySelectorAll('.mdc-text-field')
 .forEach(el => mdc.textField.MDCTextField.attachTo(el))
```

### Step 4 — Apply bridge.css

The bridge must:

* Set padding only inside the input
* Ensure good light + dark theme contrast
* Avoid breaking MDC animations

### Step 5 — Theme Switching

cd-shell injects:

```
<html data-md-theme="light">
<html data-md-theme="dark">
```

Bridge.css must react accordingly.

---

# 7. Final Notes for Future Developers

### A. Bootstrap is “easy mode”

* CSS-based
* Light DOM
* No JS
* Ideal for rapid development

### B. Material Design is “strict mode”

* JS-driven
* Structure-dependent
* Must respect MDC rules
* Requires a custom bridge

### C. Adding new UI Systems

Future systems (e.g., Fluent UI, Ant Design) may behave like:

* Bootstrap (CSS-only)
* MDC (JS + strict structure)

Each system must declare **its bridge rules** in:

```
ui-systems/<system>/descriptor.json
```

### D. AI integration

Agents can:

* Create configuration
* Switch UI systems
* Modify theme values
* Adjust variations (filled, outlined, icons, etc.)

This allows cd-shell to become fully **AI-configurable**.

---

────────────
**Date:** 2025-11-29, **Time:** 20:03 EAT
────────────

Below is a **clear and authoritative technical assessment** of your `MaterialDesignAdapterService`, confirming *exactly* how MDC was initialized, *why it worked*, and *what future developers must understand*.
After that, I give **the documentation section you requested** — covering:

✔ ui-systems architecture
✔ Bootstrap setup
✔ Material Design setup
✔ Why Material cannot be initialized like Bootstrap
✔ Pitfalls and solutions
✔ Notes based on your actual implementation

Everything is written for future maintainers of **cd-shell**.

---

# ✅ **1. ASSESSMENT OF YOUR CURRENT ADAPTER (What You Achieved)**

Your implementation **fully meets the MDC UMD integration requirements**:

### ✔ 1. Installed @material/* from npm

You installed:

```
@material/textfield
@material/floating-label
@material/line-ripple
@material/notched-outline
sass
```

These are needed *only for producing the CSS* (via SCSS).

### ✔ 2. Created `material.scss`

You placed the SCSS bundle inside:

```
ui-system/material-design/material.scss
```

This is correct. It is the canonical MDC setup.

### ✔ 3. Compiled SCSS → CSS

You created:

```
material.min.css
```

This step is mandatory — MDC **cannot** run using your own CSS approximations.

### ✔ 4. Downloaded and placed UMD JS locally

You saved:

```
material-components-web.min.js
```

This is **exactly what MDC needs** to activate floating labels.

### ✔ 5. Correct MDC Initialization inside Adapter

Your adapter does the correct UMD flow:

* detect `window.mdc`
* detect `mdc.textField.MDCTextField`
* error-safe instantiation
* fallback animation for non-JS scenarios
* MutationObserver auto-mapping
* DOM replacement with MDC-compliant DOM
* delayed initialization (debounced batch)

This is **identical to MDC’s recommended enterprise-integration pattern**.

### ✔ 6. Real DOM transformation

Your `prepareMdcDom()` constructs:

```
<label class="mdc-text-field mdc-text-field--filled cd-md-text-field">
    <span class="mdc-text-field__ripple"></span>
    <span class="mdc-floating-label"></span>
    <input class="mdc-text-field__input">
    <span class="mdc-line-ripple"></span>
</label>
```

This is the **canonical MDC filled text-field DOM**, and the reason animation suddenly started working.

### ✔ 7. Theme attribute application

You correctly set:

```
html[data-md-theme="dark"]
```

This lets bridge.css make dark theme overrides.

---

# ⭐ **Conclusion:**

Your implementation is **structurally correct** and follows recommended MDC UMD integration practices for non-React, non-Vue, non-Angular environments.

Now, below is the **full documentation** requested.

---

# 📘 **CD-SHELL UI SYSTEMS — ARCHITECTURE & INTEGRATION GUIDE**

## (Bootstrap + Material Design + Future Ui-Systems)

---

# 1. UI-SYSTEMS ARCHITECTURE (Foundations)

Corpdesk Shell is designed so that:

### ✔ The developer writes **framework-neutral HTML**

Example:

```html
<div class="cd-form-field">
    <label>Username</label>
    <input type="text" name="userName" />
</div>

<button cdButton>Save</button>
```

This HTML does **not belong to Bootstrap or Material**.

### ✔ A Ui-System transforms the neutral HTML into the chosen style

For example:

* Bootstrap → converts into `.form-control`, `.btn`, etc.
* Material → wraps inputs in MDC structure, applies JS behavior
* Future systems → Tailwind Forms, Fluent UI, ShadCN etc.

### ✔ Ui-System selection is dynamic (`shellconfig.json`)

Examples:

```
"uiSystem": "bootstrap"
"uiSystem": "material-design"
```

Switching the ui-system:

* loads different CSS
* loads different JS (if needed)
* changes concept-mapping behavior
* reconstructs DOM as needed
* keeps your app’s markup unchanged

### ✔ Every ui-system has:

```
ui-system/
  └── material-design/
        descriptor.json
        material.min.css
        material-components-web.min.js
        bridge.css
        material.scss  (dev only)
        icons/
```

---

# 2. HOW BOOTSTRAP UI-SYSTEM WORKS (Simple Flow)

Bootstrap requires:

### ✔ CSS only

Bootstrap is purely CSS (except components like modals, tooltips, but those are optional).

### ✔ One-step mapping

Using your adapter, Bootstrap:

* finds `.cd-form-field input`
* applies `.form-control`
* finds `<button cdButton>`
* applies `.btn btn-primary`
* applies grid & spacing classes

### ✔ No DOM reconstruction

Bootstrap **does not** need special wrapper markup.

### ✔ No JavaScript initialization

Bootstrap inputs do not have animations, so the system:

* adds classes
* applies theme
* done

### ✔ Predictable visual behavior

Bootstrap renders OK without JavaScript.

---

# 3. WHY MATERIAL DESIGN CANNOT USE THE SAME FLOW AS BOOTSTRAP

Material Web (MDC) is **fundamentally different** from Bootstrap:

| Feature           | Bootstrap                      | Material Design (MDC)                           |
| ----------------- | ------------------------------ | ----------------------------------------------- |
| Styles            | CSS classes                    | CSS + DOM + JS behavior                         |
| Inputs            | `<input class="form-control">` | *Complex structure with ripple, label, outline* |
| Floating label    | Pure CSS                       | JS-driven animation engine                      |
| Required wrappers | None                           | Mandatory `<label class="mdc-text-field...">`   |
| Theme             | CSS variables                  | CSS variables + JS-hydrated DOM                 |
| Behavior          | no JS needed                   | JS required                                     |

✔ This is why:

> **Material Design cannot be applied by simply adding classes**
> Bootstrap can.

MDC controls:

* label animation
* ripple animation
* validity state
* notched outline
* density
* layout measurement
* floating-label lifecycle

Because of the above, **the adapter must reconstruct the DOM**.

Bootstrap does *not* need this.

---

# 4. SETTING UP MATERIAL DESIGN (Full Documentation)

This is the **canonical process for using MDC inside a non-framework environment**.

### STEP 1 → Install @material/* packages (dev only)

```
npm install @material/textfield @material/floating-label @material/line-ripple @material/notched-outline
npm install sass
```

Purpose:

* brings SCSS source files
* allows creating a custom build

### STEP 2 → Create the MDC SCSS bundle

```
ui-system/material-design/material.scss
```

```scss
@use "@material/textfield";
@use "@material/notched-outline";
@use "@material/floating-label";
@use "@material/line-ripple";

@include textfield.core-styles;
```

### STEP 3 → Compile SCSS → CSS

Add to package.json:

```json
"scripts": {
  "build-mdc": "sass ui-system/material-design/material.scss ui-system/material-design/material.min.css --no-source-map --style=compressed"
}
```

Run:

```
npm run build-mdc
```

### STEP 4 → Download UMD JS

Place:

```
material-components-web.min.js
```

into your ui-system folder.

### STEP 5 → Update descriptor.json

```
{
  "id": "material-design",
  "css": ["material.min.css", "bridge.css"],
  "js": ["material-components-web.min.js"],
  "fonts": [
    "https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap"
  ],
  "conceptMappings": {
    "input": { "class": "mdc-text-field__input" },
    "button": { "class": "mdc-button mdc-button--raised" }
  }
}
```

### STEP 6 → Adapter reconstructs DOM and initializes MDC

Your current adapter already does the following:

* builds MDC wrapper structure
* adds ripple, floating label, line ripple
* assigns MDC classes
* replaces the original `.cd-form-field`
* calls:

```ts
new mdc.textField.MDCTextField(wrapper)
```

This step is **critical** — it activates:

* JS floating-label behavior
* JS ripple behavior
* JS validity
* JS layout recalculations

### STEP 7 → Bridge CSS overrides

You created:

```
bridge.css
```

It handles:

* input background
* dark/light tokens
* placeholder color
* text color
* spacing
* custom shells' tokens

This file ensures MDC blends with Corpdesk theme.

---

# 5. TYPICAL PITFALLS & SOLUTIONS

### ❌ Pitfall 1: Trying to “Bootstrap-style” MDC (class-only)

**Symptom:**
Floating label stuck, wrong outline, ripple not animating.

**Cause:**
MDC **does not** work by classes alone.

**Solution:**
Reconstruct DOM + UMD initialize.

(Your adapter does this correctly.)

---

### ❌ Pitfall 2: Using CDN CSS (missing SCSS tokens)

MDC's CDN CSS is incomplete for customization.

**Solution:**
Local SCSS build.

(You already do this.)

---

### ❌ Pitfall 3: Forgetting UMD JS

**Symptom:**
Floating labels remain broken.

**Solution:**
Load `material-components-web.min.js`.

---

### ❌ Pitfall 4: Bridge.css overriding MDC geometry

**Symptom:**
Line ripple jumps
Label overlaps text
Outline collapses

**Solution:**
Never override:

```
padding
position
transform
height
line-height
```

(Your final bridge.css now follows this rule.)

---

### ❌ Pitfall 5: Theme not applied to root

**Symptom:**
Dark mode text unreadable.

**Solution:**

```
html[data-md-theme="dark"]
```

(Your adapter does this correctly.)

---

# 6. FINAL — What Future Developers Must Remember

### ✔ Bootstrap is trivial

> Add classes → done.

### ✔ Material is a miniature framework

> Requires DOM reconstruction + JS initialization + SCSS build.

### ✔ Ui-System architecture solves this by design

> Developer writes neutral HTML
> Ui-system injects complexity
> Theme applies globally
> Adapter ensures compatibility
> Switching systems needs *zero* code changes

### ✔ Corpdesk Shell is future-proof

This architecture allows integration of:

* Fluent UI
* Tailwind UI
* PrimeNG
* ShadCN
* Carbon Design
* M3 (Material You)
* Custom corporate design systems

All by adding new adapters.

---

# If you want:

I can now produce:

📄 **The final polished official documentation ready for GitHub wiki**
📄 **A diagram of the ui-system architecture**
📄 **A flowchart of MDC initialization**
📄 **A developer onboarding guide**

Just say:

👉 *“Generate the official documentation set.”*

---

Date: **2025-11-29**, Time: **13:32 (GMT+3)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━
