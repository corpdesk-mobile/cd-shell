Below is a **clean, practical guide** on the *missing first step*:
✨ **How to install and set up IndexedDB in a Node.js + TypeScript PWA project**
(Before the larger architecture and service structure you already have.)

---

# ✅ **1. First Important Clarification**

IndexedDB **runs in the browser**, not Node.js.
Therefore:

* You **do not install IndexedDB via npm** (unless you need a wrapper library).
* What you *actually* install are **TypeScript typings**, and optionally a **wrapper helper library**.

Your PWA will use **native browser IndexedDB** inside `/public/index.html` or inside your **client-side TypeScript** code.

Node.js side DOES NOT use IndexedDB.

---

# ✅ **2. What you *do* install**

### **Option A — Native IndexedDB (recommended for PWA)**

Install the official TypeScript types:

```sh
npm install --save-dev @types/wicg-file-system-access
npm install --save-dev @types/indexeddb
```

➡️ These provide full autocompletion and error checking in TypeScript.

### **Option B — Dexie.js wrapper (optional but highly recommended)**

Dexie gives you a clean API, avoids callback hell, and handles versioning easily.

```sh
npm install dexie
npm install --save-dev @types/dexie
```

You can choose **A only** or **A + B**.
Your project will still be 100% browser-native.

---

# ✅ **3. PWA Requirements**

Before working with IndexedDB, your PWA must:

### ✔ Have a registered service worker

Example in `/public/service-worker.js`:

```js
self.addEventListener("install", () => {
  console.log("SW installed");
});
```

### ✔ Have a manifest

`/public/manifest.json`:

```json
{
  "name": "Corpdesk PWA",
  "short_name": "Corpdesk",
  "display": "standalone"
}
```

### ✔ Be served over HTTPS

Already true in your environment.

These are required because IndexedDB is **only available in secure contexts**.

---

# ✅ **4. Basic Directory Structure for IndexedDB**

You add the database logic in your FRONTEND (not Node.js):

```
/src
  /CdShell
    /services
      storage/
        cd-db.service.ts     <-- IndexedDB main handler
```

This file becomes the equivalent of a DB-access layer.

---

# ✅ **5. Minimal IndexedDB Setup (Native API Version)**

### `/src/CdShell/services/storage/cd-db.service.ts`

```ts
export class CdDbService {
  private static instance: CdDbService;
  private db!: IDBDatabase;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new CdDbService();
    }
    return this.instance;
  }

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("corpdesk-shell-db", 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("ui-settings")) {
          db.createObjectStore("ui-settings", { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveUiSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("ui-settings", "readwrite");
      const store = tx.objectStore("ui-settings");
      store.put({ key, value });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getUiSetting(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("ui-settings", "readonly");
      const store = tx.objectStore("ui-settings");
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result?.value);
      req.onerror = () => reject(req.error);
    });
  }
}
```

### 🔥 How to use it

```ts
const db = CdDbService.getInstance();

await db.init();

await db.saveUiSetting("uiSystem", "material-design");
await db.saveUiSetting("theme", "dark");

const uiSystem = await db.getUiSetting("uiSystem");
```

---

# ✅ **6. Dexie.js Version (Even Cleaner)**

### `/src/CdShell/services/storage/cd-db.service.ts`

```ts
import Dexie from "dexie";

export class CdDbService extends Dexie {
  uiSettings!: Dexie.Table<{ key: string; value: any }, string>;

  constructor() {
    super("corpdesk-shell-db");

    this.version(1).stores({
      uiSettings: "key",
    });

    this.uiSettings = this.table("uiSettings");
  }

  save(key: string, value: any) {
    return this.uiSettings.put({ key, value });
  }

  getValue(key: string) {
    return this.uiSettings.get(key).then((r) => r?.value);
  }
}

export const cdDb = new CdDbService();
```

This makes the calling code extremely simple:

```ts
await cdDb.save("uiSystem", "bootstrap-538");
const system = await cdDb.getValue("uiSystem");
```

---

# ✅ **7. Where to Call It in Corpdesk**

You should integrate `IndexedDB` into:

### **SysCacheService**

When loading runtime config:

```
- Try IndexedDB first  
- If empty → load shellconfig.json  
- If loaded → store again in IndexedDB
```

### **ConfigService.saveConfig()**

Should update:

1. IndexedDB
2. SysCacheService
3. Optionally persist to `shellconfig.json` (desktop mode only)

For mobile/PWA users, IndexedDB becomes the **authoritative config storage**.

---

# ✅ **8. Recommended Architecture Decision**

### For a PWA, the BEST strategy is:

### ✔ **Primary storage = IndexedDB**

Fast, offline-friendly, designed for PWAs.

### ✔ **Secondary fallback = shellconfig.json**

Used only on FIRST launch OR desktop admin environment.

### ✔ **Optional sync to backend database**

For multi-device portability.

---

# 🟦 FINAL SUMMARY

To properly integrate IndexedDB into your PWA:

1. **Install TypeScript typings** (+ optionally Dexie)
2. **Create a service layer in `/src/.../services/storage`**
3. **Initialize DB at shell startup**
4. **Wire it into SysCacheService + ConfigService**
5. **Use IndexedDB as the primary config store for PWA users**

---

If you want, I can now:

✅ **Generate a complete IndexedDB integration pack** including:

* `CdDbService`
* `ConfigService.saveConfig()` updated
* `SysCacheService` integration
* Startup initialization hook
* UI-system/theme runtime switching storing to IndexedDB
* Fallback logic

Just say: **"Generate the full integration pack"**.

---

**Date: 2025-12-03, Time: 13:32 (EAT)**
──────────────────────────
**Date: 2025-12-03, Time: 07:15 (UTC)**
