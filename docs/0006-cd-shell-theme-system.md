Got it 👌 — thanks for sharing the **theme model + loader + manager**. Let’s document this system in the same structured way we did for **menus** and **modules**, but now with a focus on **themes** and their place in the `cd-shell` vision.

---

# 🎨 Developer Guide: Theme System in `cd-shell`

## 1. Principles of Design

The theme system is a **pillar of the cd-shell vision** because:

* **User-Centric Personalization**
  The shell must adapt visually and structurally to diverse organizations and users, while keeping a common foundation.

* **Separation of Concerns**
  Functionality (modules, menus) and presentation (themes) are kept separate. Themes can be swapped without modifying the logic of modules or menus.

* **Runtime Flexibility**
  Themes can be applied, updated, or replaced **without recompilation**. This supports customization, white-labeling, and commercial theming marketplaces.

* **Vendor Ecosystem**
  Themes can be licensed, sold, or restricted using **licence** and **authorizationGuid** fields. This ensures commercial viability and vendor-controlled access.

* **Scaffolding & Automation**
  Just like modules, themes can eventually be **scaffolded by cd-cli** and later by **AI agents**, generating both JSON descriptors and CSS/asset structures.

---

## 2. The `ITheme` Contract

A theme is described by a structured JSON that implements the `ITheme` interface:

```ts
export interface ITheme {
  name: string;
  id: string;
  colors: IThemeColours;     // defines color scheme
  font: string;              // default font family
  logo: string;              // logo URL
  licence: "MIT" | "Apache-2.0" | ... | "Commercial";
  themeGuid: string;         // unique identifier
  layout: IThemeLayout;      // defines header, footer, sidebar, ads
  vendorGuid: string;        // vendor responsible for theme
  authorizationGuid: string; // restricts usage by vendor or license
}
```

### Key Supporting Models

* **`IThemeColours`** → primary, secondary, accent, background, text.
* **`IThemeLayout`** → structural choices for sidebar, header, footer, ads.
* **`IThemeMenu`** → determines menu system (`plain`, `metismenu`, etc.).
* **`IThemeAds`** → optional advertising banner system.

---

## 3. Theme Loading Process

### Loader: `theme-loader.ts`

Responsible for:

1. **Fetching Theme Definition** (`theme.json`).
2. **Access Control** — verify theme is listed in `shell.config.json`.
3. **Authorization** — check `authorizationGuid` (future expansion).
4. **Applying Theme** → inject colors, fonts, CSS, and logos into DOM.

```ts
export async function loadTheme(themeId: string = "default") {
  const res = await fetch(`/themes/${themeId}/theme.json`);
  if (!res.ok) throw new Error("Theme fetch failed");

  const theme = (await res.json()) as ITheme;

  if (!shellConfig.themeConfig.accessibleThemes.includes(themeId)) {
    throw new Error(`Theme "${themeId}" not allowed`);
  }

  applyTheme(themeId, theme);
}
```

---

### Applier: `applyTheme()`

This function takes a loaded theme and **applies it to the DOM**:

* Hides sidebar if theme disables it.
* Maps color values into **CSS variables** (e.g. `--cd-primary-color`).
* Applies global font.
* Updates shell logo.
* Injects a `theme.css` file (per-theme overrides).
* Sets `body.className` to `theme-{id}` for scoped styling.

---

### Manager: `theme-manager.service.ts`

Provides a **developer-friendly interface** to work with themes:

* **`getAvailableThemes()`** → discover all themes defined in `shell.config.json`.
* **`applyTheme(themeId)`** → switch theme at runtime.
* **`getCurrentThemePath()`** → get path to currently applied theme.

This service is the recommended way for developers to **enumerate, select, and apply themes dynamically**.

---

## 4. Developer Workflow

### 1. Define a Theme

A theme folder must exist under `/public/themes/{themeId}/` with:

* `theme.json` (ITheme definition).
* `theme.css` (styling overrides).
* Assets (logos, icons, backgrounds).

Example `theme.json`:

```json
{
  "name": "Corporate Blue",
  "id": "corporate-blue",
  "colors": {
    "primary": "#0044cc",
    "secondary": "#0077ee",
    "accent": "#ff8800",
    "background": "#f9f9f9",
    "text": "#333333"
  },
  "font": "'Roboto', sans-serif",
  "logo": "/themes/corporate-blue/logo.png",
  "licence": "MIT",
  "themeGuid": "abc-123",
  "layout": {
    "sidebar": {
      "visible": true,
      "menu": { "menuSystem": "metismenu", "menuType": "vertical" }
    },
    "header": { "visible": true, "showUserDropdown": true }
  },
  "vendorGuid": "corpdesk",
  "authorizationGuid": "auth-xyz"
}
```

---

### 2. Update Shell Config

Ensure `shell.config.json` declares the theme:

```json
{
  "themeConfig": {
    "currentThemePath": "/themes/corporate-blue/theme.json",
    "accessibleThemes": ["default", "corporate-blue"]
  }
}
```

---

### 3. Apply Theme at Runtime

From code:

```ts
import { themeManager } from "@/theme/services/theme-manager.service";

await themeManager.applyTheme("corporate-blue");
```

From config (automatic at bootstrap):

* The `bootstrapShell()` process fetches `themeConfig.currentThemePath`.
* `loadTheme()` is invoked with the current theme.

---

## 5. Runtime Requirements

* Themes must be **installable/uninstallable at runtime**, like modules.
* Developers can ship themes as **independent packages** (plug-and-play).
* Vendors can restrict themes via **authorizationGuid**.
* Themes must support **live switching** without page reload.

---

## 6. Ecosystem Context

* **cd-shell** → consumes themes, integrates them into runtime.
* **cd-api** → may provide APIs for theme licensing, user authorization, or vendor controls.
* **cd-cli** → scaffolds new themes (`cd-cli theme-craft create darkmode`).
* **AI agents (future)** → generate theme JSON, CSS, and assets automatically.

---

## 7. Key Takeaways

* Themes are **JSON-first**: declarative contracts that define visual identity.
* Themes are **runtime loaded**: no recompilation required.
* Themes are **vendor-aware**: licensing and authorization are built-in.
* Themes are **automation-ready**: scaffoldable via cd-cli, later via AI.
* Themes tie directly into the **core cd-shell vision**: separation of features, menus, and visual presentation.

---

👉 Would you like me to now **extend this guide with a `cd-cli theme-craft` scaffold template** (like we did for modules), so developers immediately know how to create a valid theme folder?

---

Date: 2025-09-26, Time: 18:00
