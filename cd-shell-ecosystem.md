# Cd Platform Ecosystem Documentation

## Overview

The Cd Platform is a modular, controller-driven architecture designed to support dynamic user modules, runtime theming, and full compatibility with desktop and mobile platforms. It enables seamless development and deployment through the `cd-cli`, runtime execution through `cd-shell`, and modular publishing through `cd-registry`.

## Key Components

| Component      | Description                                                                |
|----------------|----------------------------------------------------------------------------|
| `cd-cli`       | Command-line tool for module generation, testing, registration, and publish |
| `cd-shell`     | Runtime platform to load modules, apply themes, and provide GUI integration |
| `cdModuleBuilder` | Bundles and processes source files into build-ready controllers/templates  |
| `cd-registry`  | Remote store for publishing and pulling modules                           |

## Directory Structure (Example)

```
src/
├── modules/
│   └── sys/
│       └── cd-user/
│           ├── cd-user.module.ts
│           ├── controllers/
│           │   ├── sign-in.controller.ts
│           │   └── sign-up.controller.ts
│           ├── templates/
│           │   ├── sign-in.template.html
│           │   └── sign-up.template.html
│           └── index.ts

```

## Development Workflow

```
graph TD
    A[Start with cd-cli] --> B[cd-cli register]
    B --> C[cd-cli generate module <module-name>]
    C --> D[cd-cli generate controller <controllers>]
    D --> E[Edit controller/template files]
    E --> F[cd-cli run (via vite)]
    F --> G[Test with cd-shell]
    G --> H[cd-cli login]
    H --> I[cd-cli publish]
```
## Runtime Architecture
```
graph TB
    A[cd-shell] --> B[cd-user Module]
    A --> C[Theme Engine]
    A --> D[Menu Loader]
    B --> E[SignInController]
    B --> F[SignUpController]
    E --> G[__template()]
    E --> H[__setup()]
    E --> I[__processFormData()]
```

## Example SignInController

```
export class SignInController {
  templateFile = "sign-in.controller.html";

  __setup() {
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = this.__processFormData();
      this.auth(formData);
    });
  }

  __processFormData() {
    const username = (document.querySelector('[cd-model="username"]') as HTMLInputElement)?.value || "";
    const password = (document.querySelector('[cd-model="password"]') as HTMLInputElement)?.value || "";
    return { username, password };
  }

  auth(authData: { username: string; password: string }) {
    window.cdShell?.logger?.debug?.("Auth called with", authData);
  }
}

```

## Features Supported So Far

✅ Dynamic menu integration into cd-shell

✅ Runtime themes and icons with Metis compatibility

✅ Alert/event triggers from buttons

✅ Form template processing via __template()

✅ Auto-generated __processFormData()

✅ Compatible with Vite for dev testing

✅ Can run in Android/iOS emulator environments

## Theme & Licensing

Modules and themes can be:

Open source (MIT, Apache, etc.)

Commercial

Locked or switchable during runtime

Checklist Before Publishing a Module



## Next Steps

Finalize standard controller/template file formats

Create cdModuleBuilder plugin system for custom directives and elements

Define module validation schema for cd-registry

Develop integrated UI for cd-cli to aid less technical users