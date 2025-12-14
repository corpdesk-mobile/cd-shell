import { MemoryStoreService } from "./memory-store.service";
import { FileStoreService } from "./file-store.service";
import { RedisStoreService } from "./redis-store.service";
import { IndexedDbStoreService } from "./indexeddb-store.service";
import { SQLiteStoreService } from "./sqlite-store.service";
import { PlatformDetectorService } from "../../cd-platform/services/platform-detector.service";
// import { PlatformDetectorService } from "../../cd-platform/platform-detector.service";
export class CdStoreFactoryService {
    /**
     * Create store based on explicit type request.
     */
    static create(type, options) {
        switch (type) {
            case "file":
                if (!FileStoreService.isAvailable()) {
                    console.warn("[CdStoreFactory] FileStore unavailable → fallback");
                    return new MemoryStoreService();
                }
                return new FileStoreService(options?.storagePath);
            case "redis":
                if (!RedisStoreService.isAvailable()) {
                    console.warn("[CdStoreFactory] RedisStore unavailable → fallback");
                    return new MemoryStoreService();
                }
                return new RedisStoreService();
            case "indexeddb":
                if (!IndexedDbStoreService.isAvailable()) {
                    console.warn("[CdStoreFactory] IndexedDB unavailable → fallback");
                    return new MemoryStoreService();
                }
                return new IndexedDbStoreService();
            case "sqlite":
                if (!SQLiteStoreService.isAvailable()) {
                    console.warn("[CdStoreFactory] SQLiteStore unavailable → fallback");
                    return new MemoryStoreService();
                }
                return new SQLiteStoreService(options);
            case "memory":
            default:
                return new MemoryStoreService();
        }
    }
    /**
     * Auto–select best storage strategy based on detected platform.
     * Prioritized order:
     *
     *   Capacitor-native → SQLite
     *   Browser/PWA → IndexedDB
     *   Node.js backend → FileStore
     *   CLI / Fallback → MemoryStore
     */
    static createEnvironmentAwareStore(options) {
        const platform = PlatformDetectorService.detectPlatform();
        console.log("[CdStoreFactory] environment detected:", platform);
        if (platform.isCapacitorNative) {
            // Best persistent choice for mobile/desktop via Capacitor.
            if (SQLiteStoreService.isAvailable()) {
                return new SQLiteStoreService(options);
            }
        }
        if (platform.isBrowser || platform.isPWA) {
            // Browser-based persistence.
            if (IndexedDbStoreService.isAvailable()) {
                return new IndexedDbStoreService();
            }
        }
        if (platform.isNode) {
            // Server-type environment: use file or Redis
            if (FileStoreService.isAvailable()) {
                return new FileStoreService(options?.storagePath);
            }
            if (RedisStoreService.isAvailable()) {
                return new RedisStoreService();
            }
        }
        // fallback
        return new MemoryStoreService();
    }
    /**
     * Factory for sync-enabled store.
     * (This will integrate with SyncManager later.)
     */
    static createSyncedStore(options) {
        const store = this.createEnvironmentAwareStore(options);
        // Later: wrap with SyncManager
        // return SyncManager.wrap(store);
        return store;
    }
}
