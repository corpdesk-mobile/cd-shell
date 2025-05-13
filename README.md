# 📦 Corpdesk Shell (`cd-shell`)

**Corpdesk Shell** is the runtime environment for PWA application responsible for loading and executing independent Corpdesk modules (apps) at runtime. It acts as a lightweight host that dynamically loads modules from local files, remote URLs, or a central registry.

---

## 🚀 Features

- ⚡ Runtime loading of modules via dynamic import
- 🌐 Supports local (file-based) and remote (URL or registry) module access
- 🧩 Modules communicate through standardized contracts (`ICdRequest`, `ICdResponse`)
- 🎨 Theme-aware (default and consumer-specific themes supported)
- 🔒 Secure, session-aware user context

---

## 🧠 Architecture Overview

```mermaid
flowchart TD
  A[cd-shell] --> B[cd-user module]
  A --> C[Other Corpdesk Modules]
  A --> D[cd-registry]
  D --> E[Remote Module Hosting]
  A --> F[Corpdesk Backend API]
  
  B -->|Exports| G(cdUserModule)
  A -->|Loads| G
  F -->|Validates Session & Authorization| A
