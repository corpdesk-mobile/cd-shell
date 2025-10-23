// import { UiSystemDescriptor } from "../../models/ui-system-descriptor.model";
// import { UiGenericAdaptorService } from "./ui-generic-adaptor.service";
/**
 * @class UiSystemLoaderService
 * @description
 * Centralized runtime manager for UI systems (Material, Bootstrap, etc.)
 * Handles discovery, loading, caching, activation, and theme switching.
 *
 * Expected directory structure:
 * public/assets/ui-systems/
 * ├── material/
 * │   ├── descriptor.json
 * │   ├── css/
 * │   ├── js/
 * │   └── templates/
 * ├── bootstrap/
 * │   ├── descriptor.json
 * │   └── ...
 *
 * Each `descriptor.json` must comply with `UiSystemDescriptor` format.
 */
export class UiSystemLoaderService {
    // private adaptor: UiGenericAdaptorService;
    constructor() {
        this.registry = new Map();
        this.activeSystem = null;
        // this.adaptor = new UiGenericAdaptorService();
    }
    /**
     * Scans the `/public/assets/ui-systems` directory to discover available UI systems.
     */
    async discover() {
        try {
            const basePath = "/public/assets/ui-systems/";
            const response = await fetch(basePath);
            if (!response.ok)
                throw new Error("Unable to access UI systems directory");
            // Example: we might list contents via API endpoint later
            console.warn("[UiSystemLoaderService] Directory listing not supported by default in browsers.");
            console.warn("→ For now, systems must be pre-registered via `register()` method manually.");
        }
        catch (err) {
            console.error("[UiSystemLoaderService] Discovery failed:", err);
        }
    }
    /**
     * Manually register a UI system descriptor.
     */
    register(descriptor) {
        this.registry.set(descriptor.id, descriptor);
        console.log(`[UiSystemLoaderService] Registered: ${descriptor.name}`);
    }
    /**
     * Returns a list of all registered UI systems.
     */
    list() {
        return Array.from(this.registry.values());
    }
    /**
     * Loads the descriptor for a given system by path.
     */
    async loadDescriptor(id, descriptorPath) {
        try {
            const response = await fetch(descriptorPath);
            const descriptor = (await response.json());
            this.registry.set(id, descriptor);
            console.log(`[UiSystemLoaderService] Loaded descriptor for ${id}`);
            return descriptor;
        }
        catch (err) {
            console.error(`[UiSystemLoaderService] Failed to load descriptor for ${id}:`, err);
            throw err;
        }
    }
    /**
     * Activates the given UI system by ID.
     */
    async activate(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor)
            throw new Error(`UI system not found: ${id}`);
        this.activeSystem = descriptor;
        console.log(`[UiSystemLoaderService] Activating UI system: ${descriptor.name}`);
        // Load CSS (themes)
        if (descriptor.theme?.cssPath) {
            await this.loadCSS(descriptor.theme.cssPath);
        }
        // Load JS if provided
        if (descriptor.scripts) {
            for (const scriptPath of descriptor.scripts) {
                await this.loadScript(scriptPath);
            }
        }
        // Notify the adaptor to switch context
        // this.adaptor.setActiveSystem(descriptor);
    }
    /**
     * Returns the currently active UI system.
     */
    getActive() {
        return this.activeSystem;
    }
    /**
     * Utility: load a CSS file dynamically.
     */
    async loadCSS(path) {
        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = path;
            link.onload = () => resolve();
            link.onerror = () => reject(`Failed to load CSS: ${path}`);
            document.head.appendChild(link);
        });
    }
    /**
     * Utility: load a JavaScript file dynamically.
     */
    async loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = path;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(`Failed to load script: ${path}`);
            document.body.appendChild(script);
        });
    }
}
