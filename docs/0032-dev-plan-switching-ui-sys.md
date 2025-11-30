Below is a **precise, engineering-ready milestone plan**, tailored to the exact structure of Corpdesk Shell, the systems we already built, and the next milestone goals.

---

# 🚀 **Milestone Plan: UI-System Switching (Bootstrap ↔ Material Design)**

**Target Duration:** 10–14 days (realistic estimate)
**Start Point:** Current stable milestone (26 Nov 2025)

---
# ✅ **Core Objective**

While the system is meant to be able to switch between ui-systems and also between themes, the current state can only load bootstrap and switch between themes.
The next stage of development is to develop a proof of concept demonstrating switching of ui-system by implementing switch between bootstrap and material-design. Additionally there should be capacity to switch between default and dark theme.

This requires **refactoring loaders**, **standardizing UI-system descriptors**, and **making index.css compatible with both systems**.

---

# ================================

# 📌 **PHASE 1 — Introduce Unified UI-System Contract (2 days)**

# ================================

### 🎯 Goal

Ensure both Bootstrap and Material-Design ui-systems expose the *exact same interface* so the shell can swap seamlessly.

### 📂 Files to modify

| File                                                       | Action                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **/src/CdShell/sys/ui-system/ui-system-loader.service.ts** | Add multi-system support (bootstrap/material). Add `setActiveSystem()`. Add `loadSystemAssets()`. |
| **/src/CdShell/sys/ui-system/contracts/UIAdapter.ts**      | Expand contract: `renderMenu()`, `renderButton()`, `icons`, `classes`.                            |
| **/public/ui-systems/bootstrap-538/descriptor.json**       | Update into new universal format.                                                                 |
| **/public/ui-systems/material-design/descriptor.json**     | Create equivalent descriptor.                                                                     |
| **/public/ui-systems/material-design/**                    | Add minimal Material CSS+JS assets.                                                               |

### 🔧 Tasks

1. **Define UI-system contract** (methods + expected CSS variables).
2. **Ensure each UI-system exports:**

   * root CSS file
   * menu styles
   * widget styles
   * variables (light/dark)
3. Update the loader to accept:

   ```ts
   setActiveSystem("bootstrap") or setActiveSystem("material")
   ```

---

# ================================

# 📌 **PHASE 2 — Theme Engine Upgrade (3–4 days)**

# ================================

### 🎯 Goal

Support **light & dark** variants for **each** UI-system.

### 📂 Files to modify

| File                                                      | Action                                         |
| --------------------------------------------------------- | ---------------------------------------------- |
| **/src/CdShell/sys/ui-system/ui-theme-loader.service.ts** | Add logic for per-system themes.               |
| **/src/CdShell/sys/theme/theme.service.ts**               | Add switchTheme() with UI-system context.      |
| **/themes/<themeName>/theme-config.json**                 | Separate per-system & per-variant configs.     |
| **index.css**                                             | Convert remaining hardcoded colors → CSS vars. |

### 🔧 Technical tasks

1. **Refactor ThemeConfig structure**

   ```json
   {
     "system": "bootstrap",
     "variant": "dark",
     "colors": {
       "primary": "...",
       "surface": "...",
       "background": "...",
       "text": "..."
     }
   }
   ```

2. **Theme Loader** selects theme based on:

   * current ui-system
   * current variant (light/dark)

3. Make `index.css` fully UI-system agnostic by restructuring:

   * all layout styles stay here
   * all “component look” moves to UI-system layer

---

# ================================

# 📌 **PHASE 3 — Sidebar & Menu Abstraction (2–3 days)**

# ================================

### 🎯 Goal

Allow each UI-system to “skin” the menu differently.

### 📂 Files

| File                                                        | Action                                         |
| ----------------------------------------------------------- | ---------------------------------------------- |
| **/src/CdShell/sys/menu/menu.service.ts**                   | Move UI-specific classes to adapters.          |
| **/src/CdShell/sys/ui-system/systems/bootstrap.adapter.ts** | Implement Bootstrap menu look.                 |
| **/src/CdShell/sys/ui-system/systems/material.adapter.ts**  | Implement Material Design menu look.           |
| **public/themes/common/bridge.css**                         | Remove previous Bootstrap-dependent overrides. |

### 🔧 Tasks

* Move `.metismenu` style decisions into adapter files.
* Allow Material UI-system to:

  * Use MD ripple effects
  * Use MD caret
  * Use MD spacing

Bootstrap version keeps:

* Chevron arrows
* Collapse behavior

We then standardize events via:

```ts
adapter.applyMenuBehavior(domElement);
```

---

# ================================

# 📌 **PHASE 4 — Implement Switching Mechanism (1–2 days)**

# ================================

### 🎯 Goal

Enable live switching without reloading app shell.

### 📂 Files

| File                     | Action                                                        |
| ------------------------ | ------------------------------------------------------------- |
| **/src/CdShell/main.ts** | Add switchSystem(), switchTheme(), and internal reload steps. |
| **/src/CdShell/app.ts**  | Provide global router hooks to refresh look.                  |

### 🔧 Switching flow

1. Deactivate current system (remove previous CSS links)
2. Load new ui-system descriptor
3. Load its CSS files
4. Load theme variant for that system
5. Re-render menu
6. Apply ripple/collapse/arrow behavior from new adapter

---

# ================================

# 📌 **PHASE 5 — QA + Accessibility + Edge Cases (2 days)**

# ================================

### 📌 Validate

* Dark mode contrast vs. WCAG AA
* Hover/focus/blur behavior in both systems
* Mobile responsiveness
* Burger → X animation consistency
* Sidebar transitions
* Dynamic controller loading not affected

### 📂 Files

| File                    | Action                                 |
| ----------------------- | -------------------------------------- |
| **index.css**           | Validate responsive logic              |
| **ui-system CSS files** | Ensure each system overrides correctly |
| **diagnosis.ts**        | Add `diag_uiSystem()` helper           |

---

# ================================

# 📅 **Overall Timeline**

# ================================

| Phase                              | Duration |
| ---------------------------------- | -------- |
| **Phase 1 – UI-system Contract**   | 2 days   |
| **Phase 2 – Theme Engine Upgrade** | 3–4 days |
| **Phase 3 – Menu Abstraction**     | 2–3 days |
| **Phase 4 – Switch Mechanism**     | 1–2 days |
| **Phase 5 – QA & Cleanup**         | 2 days   |

### **Total:** 10–14 days

(Depending on how complete Material Design assets already are.)

---

# ================================

# 🎁 Deliverables at End of Milestone

# ================================

### ✔ Ability to switch ui-systems:

```
bootstrap → material → bootstrap
```

### ✔ Ability to switch theme variants:

```
light ↔ dark (per system)
```

### ✔ Refactored loaders

### ✔ Clean index.css (system-agnostic)

### ✔ Two UI-system adapters

### ✔ Full menu re-skinning per UI-system

### ✔ Strong diagnostics for theme/system switching

### ✔ Documented configuration examples

---

If you'd like, I can generate next:

📌 A full **Gantt chart**
📌 A **file-by-file diff plan**
📌 A **clean folder structure diagram** for both systems
📌 A **technical design document**

Just tell me.
