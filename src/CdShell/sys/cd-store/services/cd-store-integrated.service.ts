// cd-store-integrated.service.ts

import { CdStoreFactoryService } from "./cd-store-factory.service";
import { IndexedDbStoreService } from "./indexeddb-store.service";
// import { PlatformDetectorService } from "../../platform/platform-detector.service";
import { ICdStore } from "../models/cd-store.model";
import { PlatformDetectorService } from "../../cd-platform/services/platform-detector.service";

export class CdStoreIntegratedService {
  private static instance: ICdStore;

  static getInstance(): ICdStore {
    if (!this.instance) {
      this.instance = this.createBestStore();
    }
    return this.instance;
  }

  /** Decide which store is best for the current environment */
  private static createBestStore(): ICdStore {
    const platform = PlatformDetectorService.detectPlatform();

    console.log("[CdStoreIntegratedService] Platform detected:", platform);

    // ---- PRIORITY ORDER ----
    // 1. Node.js → FileStore
    if (platform.isNode) {
      console.log("[CdStoreIntegratedService] Using FileStore (Node detected)");
      return CdStoreFactoryService.create("file");
    }

    // 2. Browser/PWA/CAPACITOR → Prefer IndexedDB
    if (platform.isBrowser || platform.isPWA || platform.isCapacitorNative) {
      if (platform.hasIndexedDb) {
        console.log("[CdStoreIntegratedService] Using IndexedDB store");
        return new IndexedDbStoreService();
      }

      // If IndexedDB not available (Safari private mode)
      console.warn(
        "[CdStoreIntegratedService] IndexedDB unavailable — using MemoryStore"
      );
      return CdStoreFactoryService.create("memory");
    }

    // 3. Redis only in server mode (future-proof)
    if (platform.supportsRedis) {
      console.log("[CdStoreIntegratedService] Redis available — using RedisStore");
      return CdStoreFactoryService.create("redis");
    }

    // 4. LAST fallback
    console.warn("[CdStoreIntegratedService] Falling back to MemoryStore");
    return CdStoreFactoryService.create("memory");
  }
}
