Implementing a **GVP-compliant Upload Control** represents a significant step forward for the protocol. We are moving from simple attribute mapping (like buttons) to **Complex Component Orchestration**.

In the GVP, `<gvp-uploader>` is a "High-Level Concept." The Developer declares the constraints (Intent), and the Adaptor builds the specialized DOM (Implementation).

### 1. Conceptual Design of the GVP Uploader

For a multi-tenant system, the "Logo Upload" isn't just a file selection; it's a **Validation Pipeline**. We will define a custom tag that the `CdDirectiveBinderService` and the `Bootstrap538AdapterService` will recognize.

**The "Intent" (Developer's Script):**

```html
<gvp-uploader 
  name="tenantLogo" 
  cdFormControl 
  accept="image/png, image/jpeg"
  maxSize="2048" 
  dimensions="200x200"
  preview="true">
</gvp-uploader>

```

---

### 2. Updating the POC: `consumer-resource2.controller.js`

We need to add the `tenantLogo` control to the `CdFormGroup` and the `Identity` tab.

**Controller Logic (`__init` and `__afterInit`):**

```javascript
// Inside __init()
this.form.addControl('tenantLogo', new CdFormControl(""));

// Inside __afterInit()
const currentLogo = cfg.logoPath || "http://localhost:5173/themes/default/logo.png";
this.form.controls.tenantLogo.setValue(currentLogo);

```

**Template Expansion (Tab 1):**

```html
<cd-tab id="tab-identity" icon="fingerprint" label="Identity">
  <div class="cd-section-box mt-3">
    <div class="cd-form-field mt-4">
      <label>Corporate Logo</label>
      <p class="text-muted small">Recommended: 200x200px PNG or JPG (Max 2MB)</p>
      
      <gvp-uploader 
        name="tenantLogo" 
        cdFormControl 
        accept=".png,.jpg,.jpeg"
        max-size="2048"
        data-current-preview="${this.form.controls.tenantLogo.value}">
      </gvp-uploader>
    </div>
  </div>
</cd-tab>

```

---

### 3. Enhancing the `Bootstrap538AdapterService`

To make this work, we add a new "Concept" to the Bootstrap Adaptor. It will find `<gvp-uploader>` tags and wrap the standard HTML5 `<input type="file">` with Bootstrap-specific styling and a preview thumbnail.

**New Method for `Bootstrap538AdapterService`:**

```typescript
private mapUploader() {
  const uploaders = document.querySelectorAll<HTMLElement>("gvp-uploader");
  
  uploaders.forEach(el => {
    if (this.appliedSet.has(el)) return;

    const currentUrl = el.getAttribute('data-current-preview');
    const name = el.getAttribute('name');

    // Build Bootstrap 5 structure
    const wrapper = document.createElement("div");
    wrapper.className = "d-flex align-items-center gap-3 p-3 border rounded bg-light";

    // 1. Preview Image
    const img = document.createElement("img");
    img.src = currentUrl || '';
    img.className = "img-thumbnail";
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "contain";

    // 2. File Input
    const input = document.createElement("input");
    input.type = "file";
    input.name = name || '';
    input.className = "form-control";
    input.accept = el.getAttribute('accept') || '';

    // 3. Logic: Update preview on change
    input.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => img.src = e.target?.result as string;
        reader.readAsDataURL(file);
        
        // Signal the Binder that the value changed
        el.dispatchEvent(new CustomEvent('cd-value-change', { detail: file }));
      }
    });

    wrapper.append(img, input);
    el.innerHTML = '';
    el.appendChild(wrapper);
    
    this.appliedSet.add(el);
  });
}

```

---

### 4. GVP Protocol Advancement: "Component Packaging"

By implementing `<gvp-uploader>`, we are evolving the GVP in two ways:

1. **Attribute Passthrough**: The Adaptor is now responsible for enforcing `max-size` and `accept` logic, which are passed as generic GVP attributes.
2. **Visual Consistency**: When you later implement the `MaterialAdapterService`, you will write a different `mapUploader()` that uses `<mat-form-field>` and a different preview layout, but the **Controller logic remains identical**.

### 5. Multi-Tenant Directory Handling

Since this is a multi-tenant POC, the `onSave()` in the controller should pass the file to a `MediaService` (or similar) that knows the `consumerGuid` context, ensuring the file is saved to:
`assets/tenants/[consumerGuid]/logo.png`

**Next Step Recommendation:**
Should we refine the `onSave()` method in the controller to handle the **Multipart/Form-Data** submission required for the image upload alongside the standard JSON configuration?

```js
__template() {
    console.log("[ctlConsumerResource][__template] this.form =", this.form);
    return `
      <div class="cd-panel">
        <div class="cd-panel-header mb-4">
          <h2><i class="bi bi-person-badge"></i> Consumer Shell Configuration</h2>
          <p class="text-muted">Configure your tenant branding and system-wide UI policies.</p>
        </div>

        <form id="consumerShellConfigForm" class="cd-form">
          
          <cd-tabs id="shellConfigTabs" active-tab="tab-identity">
            
            <cd-tab id="tab-identity" icon="fingerprint" label="Identity">
              <div class="mt-3 cd-section-box">
                
                <div class="cd-form-field">
                  <label class="fw-bold">Application Name</label>
                  <input type="text" name="appName" cdFormControl 
                         placeholder="Enter application title..." class="form-control" />
                  <small class="text-muted">The primary title displayed in the browser tab and shell header.</small>
                </div>

                <div class="cd-form-field mt-4">
                  <label class="fw-bold">Corporate Logo</label>
                  <p class="text-muted small">Update your organization's visual identity. Supported: PNG, JPG (Max 2MB).</p>
                  
                  <gvp-uploader 
                    name="tenantLogo" 
                    cdFormControl 
                    accept=".png,.jpg,.jpeg"
                    max-size="2048"
                    data-current-preview="${this.form?.controls?.tenantLogo?.value || "http://localhost:5173/themes/default/logo.png"}">
                  </gvp-uploader>
                </div>

                <div class="cd-form-field mt-4">
                  <label class="fw-bold">System Log Level</label>
                  <select name="logLevel" cdFormControl class="form-select">
                    <option value="debug">Debug - Verbose logging for development</option>
                    <option value="info">Info - Standard operational messages</option>
                    <option value="warn">Warn - Runtime warnings only</option>
                    <option value="error">Error - Critical system failures only</option>
                  </select>
                </div>
              </div>
            </cd-tab>

            <cd-tab id="tab-startup" icon="rocket_launch" label="Startup">
              <div class="mt-3 cd-section-box">
                <div class="cd-form-field d-flex align-items-center gap-2">
                  <input type="checkbox" name="splashEnabled" cdFormControl id="chkSplash" />
                  <label for="chkSplash" class="mb-0">Enable Branding Splash Screen</label>
                </div>

                <div class="cd-form-field mt-3">
                  <label>Splash Asset Path</label>
                  <input type="text" name="splashPath" cdFormControl 
                         placeholder="e.g. assets/splash.png" class="form-control" />
                </div>

                <div class="cd-form-field mt-3">
                  <label>Minimum Display Duration (ms)</label>
                  <input type="number" name="splashMinDuration" cdFormControl 
                         class="form-control" style="max-width: 200px;" />
                </div>
              </div>
            </cd-tab>

          </cd-tabs>

          <div class="mt-5 p-3 border-top bg-light d-flex justify-content-end">
            <button cdButton class="btn btn-primary px-4" (click)="onSave()">
              <i class="bi bi-save2 me-2"></i> Save Configuration
            </button>
          </div>
          
        </form>
      </div>
    `;
  },
```