# Corpdesk(PWA) Project Roadmap

## Accomplished

* ✅ Set up `cd-shell` capable of running plugin modules at runtime.
* ✅ Established manual files for testing how `cd-shell` should load and run.
* ✅ Created `cd-user` project used to generate a module that `cd-shell` can run during runtime.

### Development Milestones

* ✅ Updated documentation and work plan.
* ✅ Updated repository:

  * `cd-shell`
  * `cd-user`
* ✅ Tested basic theming.
* ✅ Integrated Metis Menu as an optional menu system.
* ✅ Themed menu integration.
* ✅ Manual file tests:

  * Load themed, integrated menu into `cd-shell` GUI.
  * Trigger alert via button click from module template.
  * Test `__processFormData()` with a mock sign-in form.
  * Document findings.

---

## Current Work

* 🚧 Develop `cd-user` to output a module that installs and runs on `cd-shell` during runtime.

  * Modify structure for compatibility.
* 🚧 Test module loading from `cd-user` in `cd-shell`.
* 🚧 Select and integrate theme systems:

  * Bootstrap
  * Materialize
  * Others
* 🚧 Build custom themes based on selected system.
* 🚧 Enable theme switching at runtime.
* 🚧 Use `theme.json` to determine theme at build time.
* 🚧 Enable sub-themes for end-user customization.

---

## Next Steps

### Registry Setup

* 🛠️ Set up `cd-registry` to host published modules.

### CLI-Based Project Standardization

* 🧰 Standardize project setup for developers:

  * `npm install -g @corpdesk/cd-cli@latest`
  * `cd-cli new --mod-proj cd-core-modules` → Create a reusable module project.
  * `cd-cli new --shell coop` → Install full dev environment with core modules (`cd-user`, `cd-moduleman`, `cd-comm`, etc.)

### Platform Tooling

* ✳️ Design `cd-admin` for managing `cd-shell` admin features.

### Remote Module Execution

* 🌐 Test running remote modules via URL.

### Mobile Emulator Testing

* 📱 Test all features and modules in Android/iOS emulator.

### Registry Demo Modules

* 📦 Build and test base projects to demo in `cd-registry`:

  * `inte-ract` → Corpdesk collaborative interaction module.
  * `cd-moduleman` → Manage installed modules.
  * `cd-comm` → Messaging and communication.
  * `coop` → A saccos/banking module.

### Long-Term

* 🧭 Refine architecture:

  * Business model
  * Security protocols
  * Policy administration
* 🧪 Design sandbox environments for experimentation.
