Perfect. We'll **focus the document strictly on `/api`** HTTP requests via `ICdRequest`/`ICdResponse` and leave `/sio` and `/ws` for a separate guide. Here's the revised, integrated section for **API HTTP calls**, including the service flow and the `ModuleRegisterService.registerModuleInCdInstance()` example.

---

# **2. Making HTTP Calls via ICdRequest/ICdResponse**

## **2.1 Overview**

Corpdesk unifies all HTTP API requests using the **CdWire protocol (RFC-0003)**. This allows developers to:

* Construct a **request envelope** (`ICdRequest`)
* Send it via the **HttpService**
* Receive a structured **response envelope** (`ICdResponse`)
* Handle the result through **semantic states** using `CdFxReturn<T>` and `CdFxStateLevel`

All requests are routed through `/api`, which ensures consistent execution across modules, controllers, and actions.

---

## **2.2 ICdRequest / ICdResponse**

**Request (ICdRequest)**

```ts
export interface ICdRequest {
  ctx: string;       // Module context
  m: string;         // Method / service
  c: string;         // Controller
  a: string;         // Action
  dat: EnvelopDat;   // Encapsulated form values & token
  args: any | null;  // Direct payload if needed
}
```

**Response (ICdResponse)**

```ts
export interface ICdResponse {
  app_state: IAppState;
  data: any;
}

export interface IAppState {
  success: boolean;
  info: IRespInfo | null;
  sess: ISessResp | null;
  cache: object | null;
}
```

**Key Notes:**

* `ICdRequest` and `ICdResponse` are part of **CdWire**, which harmonizes Corpdesk module communications.
* All HTTP calls are **descriptor-driven** — the backend resolves the request dynamically based on module, controller, and action.
* Developers do **not manually build routes**; the envelope structure abstracts routing.

---

## **2.3 The HttpService**

`HttpService` is the recommended interface for making HTTP calls. It handles:

* Axios instance management
* Profile-based endpoints
* Debug logging
* Error handling

**Typical usage:**

```ts
import { HttpService } from "CdShell/sys/base/http.service";

const httpService = new HttpService(true); // debugMode

// ICdRequest envelope
const request: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "Create",
  dat: { f_vals: [], token: null },
  args: null,
};

// Send request to API
const response = await httpService.proc(request, "cdApiLocal");

if (response.state) {
  console.log("✅ Request succeeded", response.data);
} else {
  console.error("❌ Request failed", response.message);
}
```

**Highlights:**

* `proc()` wraps the request, applies the proper endpoint from the profile, and returns `CdFxReturn<ICdResponse>`.
* Developers can optionally use `request()` for raw Axios calls when needed.
* Debug mode prints request and response info for development.

---

## **2.4 Building the Request Envelope**

**Why an envelope is important:**

* Provides **uniform execution structure** across modules
* Encapsulates **token, form values, extra data**
* Simplifies **integration with Shell, CLI, and runtime module loader**

**Example flow for module registration:**

```ts
EnvCreate.dat.token = cdToken;
EnvCreate.dat.f_vals[0].data.moduleName = moduleName;
EnvCreate.dat.f_vals[0].cdObj.cdObjName = moduleName;
EnvCreate.ctx = "Sys";
EnvCreate.dat.f_vals[0].data.isSysModule = true;
```

Developers **construct envelopes per scenario**, e.g., `EnvCreate`, `EnvPurge`, or custom envelopes for other actions.

---

## **2.5 Example: Registering a Module**

`ModuleRegisterService.registerModuleInCdInstance()` demonstrates a **full HTTP call workflow**:

```ts
const registerService = new ModuleRegisterService();
registerService.cdToken = sessionToken;

const result = await registerService.registerModuleInCdInstance({
  name: "inventory",
  ctx: "Sys",
});

if (result.state === CdFxStateLevel.Success) {
  console.log("Module registered successfully");
} else {
  console.error("Module registration failed:", result.message);
}
```

**Flow breakdown:**

1. Build the ICdRequest envelope (`EnvCreate`)
2. Set the token, module name, context, and system flags
3. Call `HttpService.proc()` to send the envelope to `/api`
4. Receive `ICdResponse` wrapped in `CdFxReturn`
5. Handle `app_state.success` and log messages accordingly

This pattern is **reusable for any module, controller, or action**.

---

## **2.6 Summary**

* HTTP requests in Corpdesk always go through `/api` using **CdWire envelopes**.
* `ICdRequest` and `ICdResponse` **standardize the communication** across modules and environments.
* `HttpService` handles **endpoint resolution, request sending, and response processing**.
* Developers interact primarily with **envelopes** and **semantic state results**, leaving routing and low-level transport to the framework.
* Special communication channels (`/sio`, `/ws`) are **covered in a separate guide** for real-time and high-performance scenarios.

---

This section now forms a **self-contained guide** for developers implementing HTTP calls via `/api` in Corpdesk.

---

---

## **Date: 2025-12-11, Time: 16:05 (GMT+03)**

Below is the **integrated introduction section** for the Corpdesk API documentation, now expanded to clearly include and explain the **three main entry routes** (`/api`, `/sio`, `/ws`) as part of the architectural overview.
This text is ready for production use in your **developer documentation**, **website**, or **onboarding materials**.

---

# **1. Introduction to the Corpdesk API**


The **Corpdesk API** is the backend execution engine of the Corpdesk ecosystem. It is designed as a **runtime-extensible**, **module-oriented**, and **multi-tenant** platform that supports dynamic installation of modules, AI-assisted automation, and deep integration with the Corpdesk CLI, Shell, and GUI systems.

Corpdesk API exposes **three well-defined communication routes**, each optimized for a different category of interaction:

---

## **1.1 API Entry Routes Overview**

### **🔵 `/api` — Standard API Requests (HTTP/REST-like Envelope RPC)**

This is the **primary entry point** for all regular application calls.
Every request follows the **Corpdesk Envelope RPC** structure:

```json
{
  "module": "employee",
  "controller": "profile",
  "action": "update",
  "data": { ... }
}
```

* Frontend → API communication
* CLI operations
* Module installations
* Authentication, CRUD operations, workflows
* All synchronous calls within the system

**Rationale:**
Provides a unified, language-agnostic, framework-agnostic invocation system. Avoids tight coupling to HTTP verbs and allows dynamic routing based entirely on module definitions.

---

### **🟠 `/sio` — Socket.IO Channel (Event-driven, Reliable, Stateful)**

This route provides **real-time communication via Socket.IO** with the following characteristics:

* Auto-reconnection
* Ping/pong heartbeat
* Event names mapped to `module.controller.action`
* Ideal for UI updates, notifications, streaming small events, user presence tracking

**Use cases:**

* Real-time dashboards
* Live forms
* Typing indicators
* State synchronization
* Controlled push notifications

**Rationale:**
Socket.IO abstracts away transport fallbacks and ensures message delivery, ideal for end-user interactions requiring reliability.

---

### **🟢 `/ws` — Raw WebSocket Channel (High-performance, Lightweight, Low-level)**

This route provides **raw WebSocket access** when lower-level, high-throughput, low-latency communication is needed.

**Use cases:**

* High-frequency data streaming
* System-level agent communication
* AI RPC interactions
* CLI-to-API persistent channels
* Machine-to-machine automation
* External integrations

**Rationale:**
Where performance and minimal framing overhead are required, `/ws` provides a pure WebSocket channel without the abstraction layer of Socket.IO.

---

## **1.2 Why Three Routes?**

Corpdesk’s architecture separates communication channels by **interaction category**:

| Route  | Protocol      | Guarantee Level     | Best Use                           |
| ------ | ------------- | ------------------- | ---------------------------------- |
| `/api` | HTTP          | Fully reliable      | Standard RPC calls                 |
| `/sio` | Socket.IO     | Reliable + Stateful | UI Real-time interactions          |
| `/ws`  | Raw WebSocket | Ultra lightweight   | Agents, streaming, backend systems |

This separation gives each subsystem the most appropriate performance profile and keeps Corpdesk future-proof for distributed systems and AI-driven workloads.

---

## **1.3 The Envelope Concept in All Channels**

Whether the communication happens via `/api`, `/sio`, or `/ws`, Corpdesk uses a **universal envelope** that gives the backend the power to resolve requests dynamically:

```json
{
  "module": "sales",
  "controller": "invoice",
  "action": "create",
  "data": { ... }
}
```

Every new module follows the same pattern and automatically becomes routable across all channels.

**Rationale for the Envelope**

1. **Uniformity** — All modules behave the same way (API, SIO, WS).
2. **Runtime installation** — No need to restart the server; modules plug in.
3. **Reduced routing complexity** — Routing is data-driven, not code-driven.
4. **Perfect alignment with Corpdesk Shell and CLI** — Everything calls in the same unified manner.
5. **AI-friendly** — Agents can dynamically discover and execute any module just by scanning metadata.

---

## **1.4 Developer Implementation Overview**

If a developer creates a new module, the pattern is:

### **Step 1: Create module structure**

```
/src/CdApi/app/inventory/
    controllers/
    models/
    services/
    descriptor.json
```

### **Step 2: Define actions in the controller**

```ts
export class StockController extends CdApiController {
  async add() { ... }
  async remove() { ... }
}
```

### **Step 3: Envelope automatically routes calls**

Examples:

**HTTP /api request**

```json
{
  "module": "inventory",
  "controller": "stock",
  "action": "add",
  "data": {...}
}
```

**Socket.IO event emit**

```js
socket.emit("inventory.stock.add", data);
```

**WebSocket message**

```json
["inventory.stock.add", { ... }]
```

The developer doesn’t write routing code; the framework resolves it dynamically.

---

If this is correct, I will move on to the next section (**“Corpdesk Envelope RPC Architecture: The Full Breakdown”**) and continue integrating into the API documentation.

---

---

## **Date: 2025-12-11, Time: 15:44 (GMT+03)**

