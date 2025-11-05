/**
 * ControllerCacheService
 * ----------------------
 * Ensures that controllers are initialized exactly once,
 * respecting the lifecycle order: __init() → __setup().
 *
 * Uses Object.create() to preserve getters and lifecycle
 * functions without prematurely executing them.
 */
export class ControllerCacheService {
  private static instance: ControllerCacheService;
  private cache: Record<string, any> = {};

  public static getInstance(): ControllerCacheService {
    console.log("[ControllerCacheService][getInstance] start...");
    if (!ControllerCacheService.instance) {
      ControllerCacheService.instance = new ControllerCacheService();
    }
    return ControllerCacheService.instance;
  }

  /**
   * Retrieves or initializes a controller instance.
   * Guarantees lifecycle sequence: __init() → __setup().
   */
  // public async getOrInitializeController(
  //   moduleId: string,
  //   controllerDef: any
  // ): Promise<any> {
  //   console.log("[ControllerCacheService][getOrInitializeController] start...");

  //   // 1️⃣ Return cached controller if available
  //   if (this.cache[moduleId]) {
  //     console.log(`[ControllerCacheService] Using cached controller: ${moduleId}`);
  //     return this.cache[moduleId];
  //   }

  //   console.log(`[ControllerCacheService] Creating new instance for: ${moduleId}`);

  //   // 2️⃣ Proper instantiation preserving getters and prototype
  //   //    This avoids triggering getter evaluation (unlike {...spread})
  //   const instance = Object.create(controllerDef);

  //   // 3️⃣ Copy *only* plain data props that exist on the literal
  //   for (const key of Object.keys(controllerDef)) {
  //     const descriptor = Object.getOwnPropertyDescriptor(controllerDef, key);
  //     // only copy if it’s a data property (not getter/setter)
  //     if (descriptor && descriptor.value !== undefined && typeof descriptor.value !== "function") {
  //       instance[key] = descriptor.value;
  //     }
  //   }

  //   // 4️⃣ Run __init() synchronously (basic setup)
  //   if (typeof instance.__init === "function") {
  //     console.log(`[ControllerCacheService] Running __init() for ${moduleId}`);
  //     try {
  //       instance.__init();
  //     } catch (err) {
  //       console.error(`[ControllerCacheService] __init() failed for ${moduleId}`, err);
  //     }
  //   }

  //   // 5️⃣ Run __setup() asynchronously (secondary setup)
  //   if (typeof instance.__setup === "function") {
  //     console.log(`[ControllerCacheService] Running __setup() for ${moduleId}`);
  //     try {
  //       await instance.__setup();
  //     } catch (err) {
  //       console.error(`[ControllerCacheService] __setup() failed for ${moduleId}`, err);
  //     }
  //   }

  //   // 6️⃣ Cache the initialized controller for future retrieval
  //   this.cache[moduleId] = instance;
  //   console.log(`[ControllerCacheService] Cached instance for ${moduleId}`);

  //   return instance;
  // }
  public async getOrInitializeController(
    moduleId: string,
    controllerDef: any
  ): Promise<any> {
    console.log("[ControllerCacheService][getOrInitializeController] start...");

    // 1️⃣ Cached?
    if (this.cache[moduleId]) {
      console.log(
        `[ControllerCacheService] Using cached controller: ${moduleId}`
      );
      return this.cache[moduleId];
    }

    console.log(
      `[ControllerCacheService] Creating new instance for: ${moduleId}`
    );

    // 2️⃣ Defensive validation
    if (!controllerDef || typeof controllerDef !== "object") {
      console.error(
        `[ControllerCacheService] Invalid controllerDef for '${moduleId}'.`,
        controllerDef
      );
      return null;
    }

    // 3️⃣ Safe instantiation
    let instance: any;
    try {
      instance = Object.create(controllerDef);
    } catch (err) {
      console.error(
        `[ControllerCacheService] Failed to create instance for '${moduleId}'.`,
        err
      );
      return null;
    }

    // 4️⃣ Copy non-function props
    for (const key of Object.keys(controllerDef)) {
      const descriptor = Object.getOwnPropertyDescriptor(controllerDef, key);
      if (
        descriptor &&
        descriptor.value !== undefined &&
        typeof descriptor.value !== "function"
      ) {
        instance[key] = descriptor.value;
      }
    }

    // 5️⃣ Run hooks safely
    try {
      if (typeof instance.__init === "function") instance.__init();
      if (typeof instance.__setup === "function") await instance.__setup();
    } catch (err) {
      console.error(
        `[ControllerCacheService] Initialization failed for '${moduleId}'.`,
        err
      );
    }

    // 6️⃣ Cache it
    this.cache[moduleId] = instance;
    console.log(`[ControllerCacheService] Cached instance for ${moduleId}`);

    return instance;
  }

  /**
   * Optional utility — clear or reinitialize a specific controller.
   */
  public forceReinit(moduleId: string): void {
    console.log(`[ControllerCacheService] Force reinit for: ${moduleId}`);
    const instance = this.cache[moduleId];
    if (instance && typeof instance.__init === "function") {
      instance.__init();
    }
  }
}
