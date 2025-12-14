Nice — I’ll lay out a concise, developer-focused design + implementation guide that explains the concepts, how the policy works (user vs consumer), the data model and precedence rules, event-driven sync, storage choices, example APIs, and a safe rollout plan. I’ll also include small code sketches (pseudo/TS) you can drop into the shell to implement the behavior.

---

# Overview — what this doc covers

* Concept: UI-systems & Themes as configurable resources in a multi-tenant Corpdesk
* Policy model: who can change what (consumer admin vs user) and how locking works
* Data model: IShellConfig, ThemeShellConfig (extended) and profiles
* Precedence & effective resolution rules (how the system chooses which UI + theme to show)
* Save & read flows: `user/settings/save()` vs `consumer/settings/save()` and how they differ
* Sync & resiliency: events, sync points (onLaunch, onSave, onDestroy), offline-first with IndexedDB + backend sync
* Implementation recommendations, APIs, and step-by-step migration plan
* Security and multi-tenant considerations

---

# 1) Concept — motivation & actors

* **UI-system** = a library/theme/implementation (Bootstrap, Material, Plain) with CSS/JS + bridge styles and a descriptor.
* **Theme** = palette + layout tokens (dark, default, contrast...) that may be provided per ui-system.
* **Actors**

  * *Consumer Admin* (tenant-level admin): can limit which ui-systems / themes users in that consumer can select (can lock).
  * *User* (end-user): can personalize UI if allowed by consumer policy.
  * *System* (shell): fallback configuration (shellconfig.json) + runtime overrides.

Goal: allow per-tenant (consumer) policy that restricts user choices while still allowing permitted personalization, with offline capability and robust sync.

---

# 2) Data model (recommended interfaces)

Below are the **recommended** TS interfaces (compatible with your existing `ThemeShellConfig` — extended safely).

```ts
// src/CdShell/sys/base/i-base.ts

export interface IUISystemDescriptor {
  id: string; // e.g. "material-design"
  displayName?: string;
  allowedThemes?: string[]; // helper for consumer masks
  // other descriptor props...
}

export interface ThemeShellConfig {
  currentThemePath: string;
  accessibleThemes: string[];        // allowed theme ids e.g. ["default","dark"]
  allowUserSelection?: boolean;      // can users change theme?
  defaultThemeId?: string;           // default when nothing else chosen

  /** Optional UI-system mapping extensions for advanced integration */
  uiSystem?: {
    base: "bootstrap" | "material" | "antd" | "tailwind" | "corpdesk" | string;
    overrideCss?: boolean;
    componentMap?: Record<string, string>;
  };

  /** New: lock-level policy for consumer admin */
  policy?: {
    locked?: boolean;                 // if true, users cannot change theme
    allowedThemeIds?: string[];       // explicit allowed themes (can be subset of accessibleThemes)
  };
}

/** Shell config used by system-level, consumer-level or user-level configs */
export interface IShellConfig {
  appName?: string;
  fallbackTitle?: string;
  appVersion?: string;
  appDescription?: string;
  themeConfig?: ThemeShellConfig;
  defaultModulePath?: string;
  logLevel?: "debug" | "info" | "warn" | "error";
  uiConfig?: {
    defaultUiSystemId?: string;
    defaultThemeId?: string;
    defaultFormVariant?: string;
    uiSystemBasePath?: string;
    // New: consumer lock/policy area for uiSystem
    policy?: {
      uiSystemLocked?: boolean;        // if true, users cannot change uiSystem
      allowedUiSystems?: string[];     // list of allowed ui-system ids
    };
  };
  // optional metadata: tenant id, modifiedAt etc
  metadata?: {
    tenantId?: number | string;
    modifiedAt?: string;
    modifiedBy?: string;
  };
}
```

**Why this shape?**

* We preserved your original fields and extended them with `policy` so existing shellconfig.json remains compatible.
* `ThemeShellConfig.policy` and `uiConfig.policy` let consumer admins lock or whitelist allowed options.

---

# 3) Precedence rules — how effective config is resolved

When the app needs the effective UI system & theme, compute them in this order (highest precedence first):

1. **Consumer-level policy overrides** (IConsumerProfile.shellConfig)

   * If consumer locks `uiSystemLocked = true` or `theme policy.locked = true`, these force the chosen values and prevent user overrides.
   * If `allowedUiSystems` / `allowedThemeIds` exists, they restrict which choices are valid for users.
2. **User-level preferences** (IUserProfile.shellConfig / userProfile.userPreferences) **only if** allowed by consumer policy (`allowUserSelection` true and consumer not locking).
3. **App / Shell persisted config** (shellconfig.json or system default persisted by admin) — this is the fallback persistent server-side default.
4. **Built-in defaults** (hard-coded defaults when nothing saved).

This rule ensures tenant policies are authoritative, users can personalize only within consumer permissions, and shell defaults apply otherwise.

---

# 4) Save flows and difference between user.save() vs consumer.save()

### consumer/settings/save()

* **Authority**: consumer admin (server-validated).
* **Operation**:

  1. Validate permission: ensure request made by consumer admin.
  2. Update **consumer profile** in backend (primary canonical store for tenant policies).
  3. Optionally update server-side shelldefaults for tenant (so new users get the policy).
  4. Emit event `consumer:settings:changed` (bubbled to PWA clients via WS/Push if connected).
  5. Persist a local copy in IndexedDB for offline reads (for PWA clients).
* **Important**: Consumer save MUST be authoritative, and server persists to DB. Clients should treat consumer profile as the highest source.

### user/settings/save()

* **Authority**: individual user.
* **Operation**:

  1. Read consumer policy first (to confirm allowed).
  2. If allowed, update **user profile** (persist to backend user profile endpoint).
  3. Also persist locally in IndexedDB (for offline).
  4. Emit `user:settings:changed`.
* **Notes**: If consumer policy forbids change, return an error and/or suggest allowed options.

---

# 5) Sync & events model (recommended)

Implement a **Storage Event Manager** (lightweight event bus inside store layer). Handlers:

* `onSave(key, value, context)` — fired whenever a store write happens
* `onLaunch()` — called on app start; responsible for initial sync and reconciliation
* `onDestroy()` — cleanup, flush queues
* `onRemoteUpdate(key, value, source)` — invoked when backend pushes updates (via WebSocket/Push)

**Sync triggers**:

* `Installation` (first run): sync consumer & user profiles from backend to IndexedDB (primary offline store)
* `Launch` (every app start): verify local data age; if stale, attempt backend sync
* `Save` (every write): local store write → schedule background sync to backend (if online); optionally replicate to other local stores (e.g., File/SQLite on Capacitor)

**Conflict resolution strategy**

* Consumer settings: server wins (admin authoritative).
* User settings: last-writer-wins by timestamp; but if backend and local diverge and backend has more recent, backend wins. Keep version/timestamp to reconcile.

---

# 6) Storage architecture & recommended strategy

**Primary sources of truth**

* **Backend DB (server)** — canonical source for consumer policies and (optionally) user profiles.
* **Client-side**: use **IndexedDB** as the offline primary store for PWA. On Capacitor/native, use **SQLite** (fast, consistent SQL) as device-local persistent store.

**Sync topology**

* Writes:

  * User save → local IndexedDB write + enqueue remote sync task → try push to backend; if offline, background sync retries.
  * Consumer save → server-side persist; publish to tenants via messaging; clients subscribe to WS/push to update local caches.
* Reads:

  * At runtime read effective config using precedence algorithm (consumer → user → shell → defaults) using local caches first (IndexedDB), and attempt to refresh from backend asynchronously.

**Why both IndexedDB and SQLite?**

* IndexedDB is native to browsers/PWAs.
* SQLite via Capacitor provides better performance and compatibility for native builds; interface can be the same (adapter layer).

---

# 7) Implementation: sample APIs & helper functions

### Effective config resolver (simplified)

```ts
async function getEffectiveShellConfig(userId?: number, tenantId?: number): Promise<IShellConfig> {
  // 1. Load consumer config (local cache or backend)
  const consumerCfg = await ConsumerStore.getShellConfig(tenantId);
  // 2. Load user profile
  const userProfile = await UserStore.getUserProfile(userId);

  // base: shell file defaults
  const appShell = await AppShellConfigService.get(); // reads shellconfig.json or shell cache

  // Start with app defaults
  const effective: IShellConfig = deepClone(appShell);

  // Apply consumer-level overrides and policies
  if (consumerCfg?.uiConfig) {
    merge(effective.uiConfig, consumerCfg.uiConfig);
    // push policy into effective for use by UI
    effective.uiConfig = { ...effective.uiConfig, policy: consumerCfg.uiConfig.policy };
  }
  if (consumerCfg?.themeConfig) {
    effective.themeConfig = { ...effective.themeConfig, ...(consumerCfg.themeConfig || {}) };
  }

  // Apply user preferences only if allowed
  if (userProfile?.shellConfig && effective.themeConfig?.allowUserSelection !== false && !(effective.themeConfig?.policy?.locked)) {
    // Merge but keep consumer policy constraints
    const userPref = userProfile.shellConfig;
    // enforce allowed lists:
    if (effective.uiConfig?.policy?.allowedUiSystems?.length) {
       if (userPref.uiConfig?.defaultUiSystemId && effective.uiConfig.policy.allowedUiSystems.includes(userPref.uiConfig.defaultUiSystemId)) {
         effective.uiConfig.defaultUiSystemId = userPref.uiConfig.defaultUiSystemId;
       }
    } else if (userPref.uiConfig?.defaultUiSystemId) {
       effective.uiConfig.defaultUiSystemId = userPref.uiConfig.defaultUiSystemId;
    }
    // same for theme
    if (userPref.themeConfig?.defaultThemeId) {
       // ensure allowed by consumer policy
       const allowed = effective.themeConfig?.policy?.allowedThemeIds ?? effective.themeConfig?.accessibleThemes;
       if (!allowed || allowed.includes(userPref.themeConfig.defaultThemeId)) {
         effective.themeConfig.defaultThemeId = userPref.themeConfig.defaultThemeId;
       }
    }
  }

  return effective;
}
```

### Store Event Manager interface

```ts
interface IStorageEvents {
  onSave?: (key: string, value: any, meta?: any) => void;
  onLaunch?: () => void;
  onDestroy?: () => void;
  onRemoteUpdate?: (key: string, value: any, source?: string) => void;
}
```

**Store implementation pattern**

* Each store (IndexedDbStoreService, SQLiteStoreService, FileStoreService) implements `ICdStore` *and* an optional `subscribe(events: IStorageEvents)` method to register event listeners.

---

# 8) Implementation & rollout plan (practical steps)

**Phase 0 — Safe scaffolding**

1. Add/extend interfaces in codebase (IShellConfig, ThemeShellConfig.policy).
2. Add `PlatformDetectorService` (you already generated).
3. Implement IndexedDbStoreService and SQLiteStoreService adapters (you requested these — add to factory).

**Phase 1 — Local-only POC**

1. Implement and test `getEffectiveShellConfig()` in client only using local shellconfig.json + IndexedDB user/consumer caches.
2. Make sure UI reads `getEffectiveShellConfig()` for rendering (and subscribes to storage events).

**Phase 2 — Backend integration**

1. Implement API endpoints:

   * `GET /tenant/:id/shell-config`
   * `PUT /tenant/:id/shell-config`
   * `GET /users/:id/profile`
   * `PUT /users/:id/profile`
2. On consumer save, persist and broadcast (via WS or SSE) to logged-in clients.

**Phase 3 — Offline & Sync**

1. Implement IndexedDB store with queue for offline writes and background sync.
2. Implement event manager for `onSave`/`onLaunch` flows.
3. Implement server reconciliation: store a version or updatedAt timestamp on configs to detect conflicts.

**Phase 4 — Capacitor / Mobile**

1. Add SQLite adapter and use it on native builds.
2. Make CdStoreFactoryService return SQLite store when `PlatformDetectorService.isCapacitorNative`.

---

# 9) Security & multi-tenant concerns

* **Validation**: consumer settings API must validate caller is tenant admin.
* **Scoping**: store per-tenant data keyed by `tenantId` to avoid leakage.
* **Encryption**: consider encrypting sensitive data in local stores on mobile.
* **Timestamps & versions**: store `modifiedBy`, `modifiedAt`, `version` to help conflict resolution.
* **Least privilege**: user preferences should never override consumer policy; enforce on server.

---

# 10) UI/UX suggestions

* When user attempts change but consumer locked, show clear message: “Your organization requires use of X. Personalization is disabled.”
* Show currently active UI-System and Theme in user/settings with source badge: “(Tenant default)”, “(Your preference)”, “(Application default)”.
* When consumer changes policy, broadcast a toast: “Your organization has changed UI settings — visual updates will apply.”

---

# 11) Example sequences (for clarity)

**User changes theme (online)**

1. UI -> `UserSettings.save({ themeId: 'dark' })`
2. Client checks consumer policy (local copy) — allowed → writes to IndexedDB and calls backend API.
3. Backend stores user preference and returns success; event `user:settings:changed` emitted.

**Consumer admin locks UI-system**

1. Admin UI -> `ConsumerSettings.save({ uiConfig: { defaultUiSystemId: 'bootstrap-538', policy: { uiSystemLocked: true }}})`
2. Server stores policy and broadcasts `consumer:settings:changed`.
3. Clients receive and invalidate caches → call `getEffectiveShellConfig()` → UI reloads or binder runs to re-map components.

**Offline first**

* Client reads from IndexedDB at launch; UI loads quickly using effective config. Background sync attempts to refresh from server.

---

# 12) Practical next steps I can deliver now (pick 1–3)

* Implement `IndexedDbStoreService` (you asked earlier).
* Implement `SQLiteStoreService` adapter (for Capacitor).
* Add event manager glue (`StorageEventsManager`) and wire into CdStoreFactoryService.
* Provide code for `getEffectiveShellConfig()` + example mutation APIs.

Tell me which of these you want first and I’ll generate the code (or multiple) right away.

---

If helpful, I can also produce:

* OpenAPI sample for the consumer/user settings APIs
* UI snippets for the settings page showing policy labels and effective source badges

— Cheers, ready to generate the chosen code next.

---

Date: 2025-12-06, Time: 19:00
