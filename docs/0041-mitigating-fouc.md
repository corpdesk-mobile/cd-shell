# Mitigating FOUC

Now that you have a good understanding how the api works, we are going to be figuring how to do the following from the following step by step. It is not a strict plan but general trajectory.
- avoid unwanted rendering of a page before css is loaded
- manually set ui-system/themes setting in consumer-profile
- manually set ui-system/themes setting in user-profile
- manually set ui-system/themes setting in indexedDb
- manually set ui-system/themes setting in sqlite
- load theme via login
- implement animated svg during launch/login
- sustain a session + ui-systm/theme settings via indexedDb
So first:
Currently when loading the page, we have the page render 'badly' for a brief moment before css is loaded.
I notice this does not happen in most modern applications but a long time a ago this was a normal occurence.
How can we only show the page after every page has rendered properly.

---

Nice — this is a classic Flash Of Unstyled Content (FOUC) problem. Below I’ll give a short explanation of the options and then show **practical, copy-pasteable** techniques you can use immediately (generic HTML/JS + Angular-specific). Pick the approach that fits your trade-offs (SSR/critical CSS ≫ preload ≫ hide-body).

---

# Why it happens (quick)

Browsers paint HTML as soon as they parse it. If your external CSS or fonts haven’t loaded yet, the browser will show unstyled HTML briefly. Modern apps avoid it by shipping either critical CSS inline (so first paint is styled correctly) or by preventing render until required assets load.

---

# Recommended approaches (ranked)

1. **Server-Side Rendering (SSR) + inline critical CSS** — best UX, prevents FOUC reliably.
2. **Inline small "critical" CSS** that styles the above-the-fold elements so page looks correct before full stylesheet loads.
3. **Preload stylesheet + onload to swap to rel=stylesheet** (fast and reliable).
4. **Hide content until app bootstraps** (simple but will delay first visible paint — acceptable for splash/launcher flows).
5. **CSS-in-JS / component-level inline styles** (if you use that system).

---

# Quick patterns & code

## 1) Best practice: inline *critical* CSS for the initial viewport

Put minimal CSS in `index.html` that covers layout and header styles (few lines). This prevents FOUC without hiding the whole page.

```html
<!-- index.html -->
<head>
  <!-- Minimal critical CSS for header: inline so first paint is styled -->
  <style>
    /* only above-the-fold/critical rules — keep tiny */
    html,body{height:100%}
    body{margin:0;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}
    header,nav{display:block}
    .app-root {min-height:100vh; background:#fff}
    /* don't hide content — this lets first paint look OK */
  </style>

  <!-- Preload the full CSS -->
  <link rel="preload" href="/styles.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles.css"></noscript>
</head>
```

**Why:** user sees a visually-correct initial paint quickly. The full CSS replaces/augments the inline rules.

---

## 2) Preload stylesheet + onload fallback (works well for SPA)

This is a robust pattern that hints browser to fetch CSS early and apply it when ready.

```html
<link rel="preload" href="/styles.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```

---

## 3) Hide body until CSS + fonts are ready (simple, deterministic)

This forces the app to remain hidden until you explicitly unhide it. Use sparingly — it delays first paint.

**index.html**

```html
<head>
  <!-- Inline style that initially hides content -->
  <style id="initial-hide">
    html.loading, body.loading { visibility: hidden; opacity: 0; }
  </style>

  <!-- Load CSS -->
  <link rel="stylesheet" href="/styles.css" onload="document.documentElement.classList.remove('loading');">
  <script>
    // mark as loading immediately
    document.documentElement.classList.add('loading');

    // Wait for stylesheet(s) + fonts (optional)
    function whenReady() {
      const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
      const stylesReady = new Promise(resolve => {
        // If stylesheet is onload-backed above, it will remove 'loading' class
        // But we also provide a fallback timer in case of network weirdness
        const t = setTimeout(resolve, 3000);
        window.addEventListener('load', () => { clearTimeout(t); resolve(); }, { once: true });
      });
      return Promise.all([fontsReady, stylesReady]);
    }

    whenReady().then(() => {
      document.documentElement.classList.remove('loading');
      const el = document.getElementById('initial-hide');
      if (el) el.parentNode.removeChild(el);
    });
  </script>
</head>
```

**Angular-specific**: instead of relying on window load, unhide after Angular bootstraps (safer for SPA).

---

## 4) Angular: hide until bootstrap completes (recommended for SPA)

Add an inline rule in `index.html` and unhide from `main.ts` after the app is ready. This gives you control — you can also wait for theme load from storage (indexedDB) or an API call.

**index.html**

```html
<head>
  <style id="initial-hide">body { visibility: hidden; }</style>
</head>
<body>
  <app-root></app-root>
  <script src="main.js"></script>
</body>
```

**src/main.ts**

```ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    // optionally wait for your theme initialization or fonts:
    // await themeService.initializedPromise();

    const hideEl = document.getElementById('initial-hide');
    if (hideEl) hideEl.remove();
    document.body.style.visibility = 'visible';
  })
  .catch(err => console.error(err));
```

**Better**: use `APP_INITIALIZER` provider in Angular to load theme/settings from indexedDB or SQLite BEFORE bootstrap completes, then remove the hide style when done. This prevents flash and guarantees correct theme on first paint.

---

## 5) Wait for fonts + CSS (fonts commonly cause layout shifts)

If you use web fonts, you should wait for them (or use font-display:swap carefully). Example to wait for fonts and styles:

```js
Promise.all([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise(resolve => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    let count = links.length;
    if (!count) return resolve();
    links.forEach(l => l.addEventListener('load', () => { if (--count===0) resolve();}, { once:true }));
    // fallback timeout
    setTimeout(resolve, 3000);
  })
]).then(() => {
  // unhide page
});
```

---

# Practical advice — which to choose

* If you have SSR available: **SSR + inline critical CSS** -> go that way. Best UX, SEO, and no FOUC.
* If SSR is not possible: **Inline small critical CSS + preload full CSS**. This gives a good balance.
* If you control the SPA bootstrap and want full control (e.g., show animated splash while theme loads): **hide body + APP_INITIALIZER** to load theme from indexedDB before showing UI.
* Avoid the approach that hides everything for too long — users prefer some immediate feedback. If you hide, show a lightweight animated SVG/splash (you mentioned animated svg later) so user sees progress.

---

# Extra: example Angular `APP_INITIALIZER` that loads theme before render

```ts
// theme-init.service.ts
import { Injectable } from '@angular/core';
@Injectable({providedIn:'root'})
export class ThemeInitService {
  initialized = false;
  async init() {
    // load theme from indexedDB or sqlite through an API
    // apply CSS variables or add theme class to documentElement
    const theme = await loadThemeFromIndexedDb(); // implement this
    document.documentElement.classList.add(theme);
    this.initialized = true;
  }
}

// app.module.ts
import { APP_INITIALIZER } from '@angular/core';
@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (svc: ThemeInitService) => () => svc.init(),
      deps: [ThemeInitService],
      multi: true
    }
  ]
})
export class AppModule {}
```

With the `index.html` hide style removed after bootstrap (see `main.ts`), the first visible paint will already have your theme.

---

# Short checklist to fix your FOUC now

1. Inline tiny critical CSS in `index.html` (cover header/nav).
2. Use `<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">`.
3. If you need deterministic theme application, use `APP_INITIALIZER` to load theme from indexedDB and **hide body** until done (but show a small splash animation during the wait).
4. Preload fonts and/or use `font-display` to reduce layout shift.
5. Consider SSR when you want the best UX long term.

---

If you want, I can:

* provide a ready-to-drop `index.html` + `main.ts` example tuned for your Corpdesk app, or
* write an `APP_INITIALIZER` + indexedDB snippet that loads the ui-system/theme and applies it before first render, and also returns an animated SVG splash while waiting.

Which of those would you like me to produce next?


Given the **actual Corpdesk Shell loading pipeline** you've shown, we can now be *very precise* about how to avoid FOUC.
Your app loads:

* **index.html** → immediately renders header + empty layout
* **/src/app.ts** → loads → runs **Main.run()**
* Main.run():

  * loads config
  * loads UI-system CSS bundles
  * loads shell CSS (base + index)
  * loads theme CSS
  * loads modules
  * renders menu
  * loads controller views

💥 **FOUC happens because the HTML “shell” renders before UI-system + theme CSS arrive.**
This is *expected* because your CSS is loaded *dynamically and asynchronously*.

---

# ✅ Your options to prevent FOUC (specific to THIS architecture)

### **Option A (RECOMMENDED FOR CORPDESK SHELL):**

## ✔ Show a splash screen until UI-System + Theme are fully applied

This is the best architectural fit because your framework *must load UI-system CSS dynamically* — Bootstrap/Material/etc only becomes known at runtime.

### **Why this is ideal**

* You already have a multi-step async startup pipeline.
* You want runtime switchable UI-systems and themes.
* Your layout and controllers depend on system CSS.
* Preloading or inlining critical CSS is impossible because the UI-system is **not known at build time**.

### **Implementation outline**

1. **index.html hides the shell body completely** and shows a small loading SVG.
2. In **Main.run()**, after:

   ```ts
   await this.applyStartupUiSettings();  // UI-system + theme fully loaded
   ```

   → remove the splash and reveal the shell.

This gives you a clean, controlled first paint.

---

### **Option B: Inline “neutral” critical CSS (minimal fallback)**

You can inline 30–50 lines of CSS that stabilize:

* header height
* sidebar hidden state
* layout flexbox
* default background and typography

This prevents layout jumps, but **you still risk mismatched styles** because actual Bootstrap/Material styles override them later.

### Works but inferior to Option A because:

* With multiple UI-systems, you cannot predict all default states.
* You still see a visual jump when the real UI-system CSS arrives.

---

### **Option C: Preload CSS**

Not possible for your UI-system CSS because:

* It is loaded dynamically from:

  ```
  UiSystemLoaderService.activate(system)
  uiSystemLoader.loadCSS(...)
  uiThemeLoader.loadThemeById(...)
  ```
* You don’t know these file paths until runtime.

So **preload cannot solve your specific FOUC**.

---

### **Option D: Delay rendering header/layout until after CSS loads**

This is similar to Option A but hides **only the shell** instead of the whole page.

---

# 🎯 RECOMMENDATION (100% aligned with Corpdesk Shell architecture)

## 🥇 Option A: **Splash screen + controlled reveal**

### **Step 1 — Add splash + hide body in index.html**

```html
<body class="preload">
  <div id="cd-splash">
    <img src="/assets/splash.svg" class="splash-logo" />
  </div>

  <header id="cd-header" style="display:none"></header>
  <div id="cd-layout" style="display:none"></div>

  <script type="module" src="/src/app.ts"></script>

  <style>
    body.preload #cd-header,
    body.preload #cd-layout {
      display: none;
    }
    #cd-splash {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      z-index: 9999;
    }
  </style>
</body>
```

---

### **Step 2 — In Main.run(), unhide after UI-system + theme are loaded**

You already have this perfect point:

```ts
await this.applyStartupUiSettings();
```

Immediately after this line (before rendering sidebar), add:

```ts
// 🌟 Reveal the app (CSS fully loaded)
document.body.classList.remove("preload");

const splash = document.getElementById("cd-splash");
if (splash) splash.remove();

document.getElementById("cd-header")!.style.display = "";
document.getElementById("cd-layout")!.style.display = "";
```

---

### **Step 3 — (Optional) Animate SVG splash**

Since you later want animated startup SVG, this becomes easy because the splash is already defined.

---

# 🔥 Result:

### ✔ No FOUC

The user sees **only the splash** while:

* UI-System CSS loads
* Theme CSS loads
* Shell CSS loads
* Modules & controllers load

### Then everything appears fully styled in one frame.

---

# 📌 Summary of Available Options

| Option                                | Prevents FOUC                                       | Works with dynamic UI-system | Best UX |
| ------------------------------------- | --------------------------------------------------- | ---------------------------- | ------- |
| Splash + delayed reveal (recommended) | ⭐⭐⭐⭐⭐                                               | Yes                          | ⭐⭐⭐⭐⭐   |
| Inline critical CSS                   | ⭐⭐⭐                                                 | Partially                    | ⭐⭐      |
| Preload CSS                           | ⭐                                                   | No                           | ⭐       |
| Hide everything until CSS loads       | ⭐⭐                                                  | Yes                          | ⭐⭐⭐     |
| SSR                                   | Not applicable because UI-system is runtime dynamic | ❌                            | ❌       |

---

# ✔ Final Recommendation

### Use **Splash + delayed reveal** because:

* You have dynamic runtime UI-system switching.
* You load theme + system CSS asynchronously.
* It gives a clean and professional launch sequence.
* It integrates perfectly with your upcoming “animated SVG during launch/login”.

---

If you want, I can now give you:

### 👉 **A fully implemented splash system**

with:

* generated SVG animation
* fade-out transition
* automatic theme preload
* integration into your `Main.run()` flow
* theme-aware splash colors

Just tell me:
**Do you want the full implementation now?**

# Bug Fixes

Good, thanks for sharing the full stack — this made the problem very clear.
You are **not far off**, but there are **three concrete architectural bugs** and **two design traps** causing the continuous blank screen.

I’ll go step by step:

---

## 1️⃣ Root Cause #1 — You are **overwriting `#cd-splash`**

### What index.html does

```html
<div id="cd-splash"></div>
```

### What `showSplash()` does

```ts
const wrapper = document.createElement("div");
wrapper.id = "cd-splash";
wrapper.innerHTML = html;
document.body.appendChild(wrapper);
```

🔴 **Problem**
You now have **two elements with the same id** (`cd-splash`):

1. One from `index.html`
2. One dynamically appended

DOM APIs like:

```ts
document.getElementById("cd-splash")
```

will return **the first match**, not necessarily the one with the SVG.

👉 Result:

* Your splash HTML loads
* Your hide logic operates on the *wrong node*
* SVG remains detached / invisible
* Screen appears blank forever

### ✅ Fix (choose ONE)

#### Option A (recommended): **Reuse the existing node**

```ts
async showSplash(): Promise<void> {
  return new Promise(async (resolve) => {
    const splash = document.getElementById("cd-splash");
    if (!splash) return resolve();

    const path = "/splashscreens/corpdesk-default.html";

    try {
      const html = await fetch(path).then(r => r.text());
      splash.innerHTML = html;
      splash.style.display = "block";
      resolve();
    } catch (err) {
      console.error("[Splash] load failed", err);
      resolve();
    }
  });
}
```

#### Option B: Remove `<div id="cd-splash"></div>` from `index.html`

(but Option A is cleaner)

---

## 2️⃣ Root Cause #2 — **Wrong fetch path**

### You configured

```json
"splash": {
  "path": "/splashscreens/corpdesk-default.html"
}
```

### But your code uses

```ts
const path = "public/splashscreens/corpdesk-default.html";
```

🔴 **Problem**
In Vite / static servers:

* `/public` is **not** part of runtime paths
* `/public` is the **build-time source**
* Assets are served from `/`

👉 This fetch **silently fails** (404), but your `.catch()` resolves without logging enough detail.

### ✅ Fix

```ts
const path = "/splashscreens/corpdesk-default.html";
```

Also: **read from config**, not hardcoded.

```ts
const shellConfig = await this.loadShellConfig();
const path = shellConfig.splash?.path;
```

---

## 3️⃣ Root Cause #3 — You hide the app root **but never show it**

### index.html

```html
<div id="cd-root" style="visibility: hidden">
```

### hideSplash()

```ts
if (splash && splash.parentNode) {
  splash.parentNode.removeChild(splash);
}
```

🔴 **Problem**
You **never restore visibility** of `#cd-root`.

So:

* Splash is removed
* App stays invisible
* Result: blank screen

### ✅ Fix (mandatory)

```ts
async hideSplash(): Promise<void> {
  return new Promise<void>((resolve) => {
    const splash = document.getElementById("cd-splash");
    const root = document.getElementById("cd-root");

    if (splash) {
      const container = splash.querySelector("#splash-container") as HTMLElement;
      if (container) container.classList.add("fade-out");
    }

    setTimeout(() => {
      splash?.remove();
      if (root) root.style.visibility = "visible";
      resolve();
    }, 800);
  });
}
```

---

## 4️⃣ Design Trap — **Full HTML document injected into a div**

Your splash file contains:

```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>...</body>
</html>
```

🔴 **Problem**
Injecting a full HTML document into a `<div>` is **undefined behavior**:

* `<head>` styles may be ignored
* Scripts may not execute reliably
* SVG animations may not start

### ✅ Correct pattern (important)

Your splash file **must be a fragment**, not a document.

#### ❌ Current

```html
<!DOCTYPE html>
<html>
<body>
  <div id="splash-container">...</div>
</body>
</html>
```

#### ✅ Correct

```html
<style>
  /* splash styles */
</style>

<div id="splash-container">
  <!-- SVG -->
</div>

<script>
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("CorpdeskSplashDone"));
  }, 3800);
</script>
```

---

## 5️⃣ Design Trap — Competing splash lifecycles

You currently have **two hide mechanisms**:

1. Event-based

```ts
window.addEventListener("CorpdeskSplashDone", () => {
  this.hideSplash();
});
```

2. Explicit hide at end of `run()`

```ts
await this.hideSplash();
```

🔴 **Problem**

* Splash may be removed **mid-bootstrap**
* Or removed twice
* Or fade applied to wrong element

### ✅ Pick ONE (recommended)

Since this is a **system splash**, not animation-driven:

✔ **Remove the event entirely**
✔ Control splash lifecycle **only from Main**

```ts
// REMOVE this
window.addEventListener("CorpdeskSplashDone", ...)
```

---

## 6️⃣ Minimum Logging You Should Add (Highly Recommended)

### In `showSplash()`

```ts
this.logger.debug("[Splash] loading", path);
this.logger.debug("[Splash] injected HTML length", html.length);
```

### After injection

```ts
this.logger.debug(
  "[Splash] container present",
  !!document.querySelector("#splash-container")
);
```

### In `hideSplash()`

```ts
this.logger.debug("[Splash] hide start");
this.logger.debug("[Splash] root visibility restored");
```

### In `run()`

```ts
diag_css("[BOOT] splash shown");
diag_css("[BOOT] splash hidden");
```

---

## 7️⃣ Final Correct Mental Model (Important)

**Corpdesk splash is NOT a page**
It is:

* A transient DOM fragment
* Owned by `Main`
* Injected → animated → removed
* App root explicitly revealed

Once you treat it that way, everything becomes deterministic.

---

## 8️⃣ Summary of Required Fixes (Checklist)

✔ Use **one** `#cd-splash`
✔ Fetch from `/splashscreens/...`
✔ Restore `#cd-root` visibility
✔ Convert splash HTML to fragment
✔ Remove duplicate hide logic
✔ Add visibility + DOM presence logs

---

If you want, next I can:

* Refactor splash into a **SplashService**
* Add **timeout fail-safe**
* Add **SVG load confirmation hooks**
* Or adapt this splash to **Corpdesk UI-system theming**

Just say the word.



