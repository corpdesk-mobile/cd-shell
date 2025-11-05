// import { UiSystemDescriptor } from "../../models/ui-system-descriptor.model";
// import { UiGenericAdaptorService } from "./ui-generic-adaptor.service";

import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
import { UiConfig } from "../../moduleman/models/config.model";
import { ConfigService } from "../../moduleman/services/config.service";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
// import { SysCacheService } from "../../moduleman/services/controller-cache.service";
import { STATIC_UI_SYSTEM_REGISTRY } from "../models/ui-system-schema.model";

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
  // REMOVED: private configService = new ConfigService(); 
  private activeSystem: UiSystemDescriptor | null = null;

  constructor(private sysCache: SysCacheService) {
    // this.sysCache is now the data source.
  }

  /**
   * ⭐ fetchAvailableSystems: Now takes the pre-loaded config (uiConfig: UiConfig).
   */
  async fetchAvailableSystems(uiConfig: UiConfig): Promise<UiSystemDescriptor[]> {
    console.log('[UiSystemLoaderService][fetchAvailableSystems] starting async data load.');
    
    // Config is provided. No redundant await this.configService.loadConfig() here.
    
    const systems: UiSystemDescriptor[] = [];
    
    // Simulate 'discover' logic 
    STATIC_UI_SYSTEM_REGISTRY.forEach(descriptor => {
        systems.push(descriptor);
    });
    
    return systems;
  }

  /**
   * 2. REFACTORED: Returns a single registered UI system descriptor by ID.
   * Reads from the Singleton cache.
   */
  getSystemById(id: string): UiSystemDescriptor | undefined {
    // Retrieves the array of systems from the cache and searches it.
    const availableSystems: UiSystemDescriptor[] = this.sysCache.get('uiSystems');
    return availableSystems.find(system => system.id === id);
  }

  /**
   * 3. REFACTORED: Returns a list of all registered UI systems.
   * Reads from the Singleton cache.
   */
  list(): UiSystemDescriptor[] {
    // Reads directly from the guaranteed populated cache.
    return this.sysCache.get('uiSystems');
  }

  // 4. REMOVED: async loadDescriptor()
  //    (This logic should be integrated into fetchAvailableSystems and only deals with transient I/O).
  
  // 5. REMOVED: register()
  //    (Registration is now implicit during the single SysCacheService load).


  /**
   * 6. REFACTORED: Activates the given UI system by ID.
   * Now uses getSystemById() (which uses the cache) to find the descriptor.
   */
  /**
   * Activates the given UI system by ID.
   * This process now loads the core system assets and the assets
   * defined by the currently active theme (themeActive).
   */
  async activate(id: string): Promise<void> {
    console.log('[UiSystemLoaderService][activate] start')
    
    // Use the cache-dependent method to find the descriptor
    const descriptor: UiSystemDescriptor | undefined = this.getSystemById(id); 
    if (!descriptor) throw new Error(`UI system not found: ${id}`);

    this.activeSystem = descriptor;
    console.log(
      `[UiSystemLoaderService] Activating UI system: ${descriptor.name}`
    );
    
    // ... (rest of activate logic for loading scripts and CSS remains the same) ...
  }
  
  /**
   * Returns the currently active UI system.
   */
  getActive(): UiSystemDescriptor | null {
    // This remains the same, referring to the *active* state managed by this instance
    return this.activeSystem;
  }

  /**
   * Utility: load a CSS file dynamically.
   */
  private async loadCSS(path: string): Promise<void> {
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
  private async loadScript(path: string): Promise<void> {
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
