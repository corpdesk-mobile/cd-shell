// import { ICdStore } from "../../base";

// import { ICdStore } from "../models/cd-store.model";
// import { FileStoreService } from "./file-store.service";
// import { MemoryStoreService } from "./memory-store.service";
// import { RedisStoreService } from "./redis-store.service";

// export class CdStoreFactoryService {
//   static create(type: string): ICdStore {
//     switch (type) {
//       case 'file':
//         return new FileStoreService();
//       case 'redis':
//         return new RedisStoreService();
//       default:
//         return new MemoryStoreService();
//     }
//   }
// }

import { ICdStore } from "../models/cd-store.model";
import { MemoryStoreService } from "./memory-store.service";
import { FileStoreService } from "./file-store.service";
import { RedisStoreService } from "./redis-store.service";
import { isBrowser, isNode, isPWA } from "../../../../environment";
// import { isNode, isBrowser, isPWA } from "../../../environment/utils";

export class CdStoreFactoryService {
  static create(
    type: "memory" | "file" | "redis" = "memory",
    options?: any
  ): ICdStore {
    switch (type) {
      case "file":
        if (!FileStoreService.isAvailable()) {
          console.warn(
            "FileStore is not available in this environment. Falling back to MemoryStore."
          );
          return new MemoryStoreService();
        }
        return new FileStoreService(options?.storagePath);

      case "redis":
        if (!RedisStoreService.isAvailable()) {
          console.warn(
            "RedisStore is not available in this environment. Falling back to MemoryStore."
          );
          return new MemoryStoreService();
        }
        return new RedisStoreService();

      case "memory":
      default:
        return new MemoryStoreService();
    }
  }

  static createEnvironmentAwareStore(options?: any): ICdStore {
    if (isNode()) {
      // In Node.js, prefer file storage
      return this.create("file", options);
    } else if (isPWA() || isBrowser()) {
      // In PWA/Browser, use memory storage or consider IndexedDB for persistence
      return this.create("memory", options);
    } else {
      // Fallback
      return this.create("memory", options);
    }
  }
}
