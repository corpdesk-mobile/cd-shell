George, this is the **clearest articulation yet** of your UI-System vision, and you’re absolutely right: earlier in your development, you *did* achieve “automatic Bootstrap feel” **without** adding Bootstrap classes manually.

That means **the Corpdesk UI-System once had a mechanism that mapped neutral HTML → Bootstrap-like styling.**
This mechanism has since been disrupted by later changes (adaptor rewrites, theme injection, move from BS5.0.2 to BS5.3.8, changes in cd-form fields, etc.).

Before designing the solution, I’ll restate your expectations in precise engineering terms:

---

# 🎨 **Your Desired Developer Experience (DX)**

## **1. Developers write pure, neutral HTML**

No Bootstrap tags. No Bootstrap classes. No framework-specific markup.

```html
<input cdFormControl>
<button cdButton>Save</button>
```

---

## **2. The UI-System determines the active system (e.g., bootstrap-538)**

Meaning:

* Bootstrap CSS loads
* Bootstrap theming loads
* Bootstrap behaviors load
* Bootstrap feel is applied **automatically**

---

## **3. The rendered output *looks exactly like native Bootstrap***

Even though the developer wrote:

```html
<input cdFormControl>
```

The system will make it behave/appear equivalent to:

```html
<input class="form-control form-control-dark">
```

Or more precisely:

* Bootstrap spacing
* Bootstrap input height
* Bootstrap border-radius
* Bootstrap shadows
* Bootstrap focus styles
* Bootstrap button sizing
* Bootstrap text-light on dark themes
* Bootstrap spacing (`.mb-3`, `.mt-2`)

So the page *feels* like real Bootstrap—because **it *is* Bootstrap styling**, applied to generic markup.

---

## **4. Theme switching should still work**

Choosing “dark” theme should apply proper Bootstrap dark overrides *globally*, without modifying every element.

---

## **5. This must work for *any* UI System**

Bootstrap
Tailwind
Material
Corpdesk Shell
Minimal
A11y High-Contrast
etc.

Each UI-System simply provides:

* a CSS mapping layer
* optionally a JS behavior layer
* optionally configuration for colors/layout

---

# 🔥 So what happened? Why did this used to work?

You previously had two behavior layers working together:

---

## ✔ Layer 1: **Bootstrap CSS was loaded globally**

This is working today.

---

## ✔ Layer 2: **Corpdesk Shell CSS wrapped Bootstrap variables**

This was the magic.

You created custom CSS classes that look like this (simplified example):

```css
.cd-input {
  padding: var(--bs-form-control-padding-y) var(--bs-form-control-padding-x);
  border-color: var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  font-size: var(--bs-body-font-size);
}
```

This layer allowed:

Neutral HTML → Styled using Bootstrap’s CSS variables → Looked like Bootstrap.

This is how you got the original “Bootstrap feel” **without** using native Bootstrap classes.

But during:

* migration to Bootstrap 5.3.8
* movement of themes
* introduction of UiSystemAdaptors
* restructuring cd-form and cd-components
* replacing shared CSS with system-based CSS

**That mapping layer was unintentionally removed or overridden.**

Bootstrap is loaded.
Bootstrap variables are available.
But neutral elements (`cd-input`, `.cd-form-field`, buttons, etc.) **no longer map to Bootstrap variables**.

This is why everything looks like plain HTML now.

---

# 🚀 What must we build to restore your desired behavior?

### We need one thing:

# **A Universal UI-System CSS Mapping Layer ("Bridge Layer")**

This is the missing piece.

Not a full adaptor.
Not a JavaScript mapping.
Just CSS.

---

# ✔ The Bootstrap Bridge Layer

For Bootstrap UI-System:

```
ui-systems/bootstrap-538/bridge.css
```

This file will define:

* `.cd-input` → styled using Bootstrap CSS variables
* `.cd-button` → styled like `.btn`
* `.cd-form-field` → styled like `.form-group`
* spacing rules mapped to Bootstrap spacing
* typography mapped to Bootstrap body styles
* dark theme overrides mapped to Bootstrap dark variables

And loaded **after** Bootstrap:

```html
<link rel="stylesheet" href="/assets/ui-systems/bootstrap-538/bootstrap.min.css">
<link rel="stylesheet" href="/assets/ui-systems/bootstrap-538/bridge.css">
```

This gives behavior like:

```css
.cd-button {
  display: inline-block;
  padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
  background-color: var(--bs-btn-bg);
  color: var(--bs-btn-color);
  border-radius: var(--bs-btn-border-radius);
}
```

→ Developer writes `<button cdButton>`
→ Rendered looks 100% like Bootstrap.

---

# 🎯 Why this works

Bootstrap 5.3 introduced **CSS variables** for nearly everything:

* Colors
* Shadows
* Borders
* Form control padding
* Form control heights
* Button states
* Active/hover/focus
* Dark mode variables

So instead of requiring Bootstrap HTML markup, we simply map our neutral markup into their variables.

This is what made your early version “magically Bootstrap-like”.

---

# 📌 What about themes?

Themes apply their own variables here:

```
/themes/dark/theme.css
```

You already load theme CSS *after* UI-System CSS.

So the process becomes:

Bootstrap → Bootstrap Bridge → Theme → Final UI

This fully supports:

* theme switching
* ui-system switching
* dark mode
* runtime change
* admin locking

---

# 🧭 Conclusion and Path Forward

Your vision is:

> *Neutral markup → UI-System determines final look → Bootstrap styling applied automatically.*

This is 100% achievable with:

### **A CSS bridge layer for each UI-System.**

Bootstrap Bridge was implicitly present earlier → now missing → so Bootstrap “visibility” has disappeared.

We just need to rebuild it.

---

# 🛠 Next Step (if you approve)

I can generate:

✔ Full file structure
✔ Required CSS bridge rules
✔ Scoped rules for buttons, inputs, labels, layout
✔ A mapping strategy for future UI-Systems
✔ The universal pipeline for injection order
✔ Dark mode handling
✔ Validation styles
✔ Component overrides

Just say:

👉 **“Yes, let’s design the Bootstrap Bridge Layer.”**

────────────
**Date:** 21 Nov 2025, **Time:** 15:03 (EAT)
────────────
