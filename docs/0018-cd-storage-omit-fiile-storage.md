
Gemini suggesion:
---
That's an excellent clarification. The best way to handle code that needs to work across Node.js, PWA (browser), CLI, and embedded environments is to use **Environment Variables** or **Conditional Compilation** techniques provided by bundlers like Vite/Rollup, combined with **Dynamic Imports** for the Node.js specific module.

The core solution involves two parts:

1.  **Define Environment Variables** in Vite to signal the target platform (PWA/Browser).
2.  Use **Conditional Logic** and **Dynamic Imports** in your factory service.

## Suggested Fix: Environment-Based Conditional Loading

### 1\. Configure Environment Variables in Vite

Vite automatically exposes `import.meta.env` with variables like `NODE_ENV`. You can leverage this or define a custom one. Since you're targeting PWA, we'll ensure Node-specific code is skipped.

Your existing `vite.config.ts` is fine, but you can explicitly define global variables if needed, though often setting up the factory to check the *existence* of Node-specific globals is cleaner for cross-platform packages.

### 2\. Implement Conditional Logic and Dynamic Imports

Modify your store factory service (`cd-store-factory.service.ts`) to use helper methods that check the environment and then use a **dynamic `import()`** for the problematic file. Dynamic imports are key because Rollup (Vite's bundler) will treat them as a **split point** and won't attempt to resolve the dependencies (`fs`) unless that code path is executed.

#### Update `src/CdShell/sys/cd-store/services/cd-store-factory.service.ts`

Introduce environment detection helpers and use them for the Node-specific store.

```typescript
// --- Environment Helper Methods (for your cross-platform module) ---

/** Checks if the current environment is Node.js. */
export function isNode(): boolean {
  // Common check for Node.js environment
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/** Checks if the current environment is a browser (PWA). */
export function isPWA(): boolean {
  // A browser environment has a 'window' and 'document' object.
  // We exclude environments like Web Workers which might not have 'document'.
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// -------------------------------------------------------------------

// The rest of your factory logic
import { MemoryStore } from './memory-store.service';
import { ICdStore } from '../models/cd-store.model';
// ... other static imports

export async function createStore(strategy: 'file' | 'memory' | 'redis'): Promise<ICdStore> {
  switch (strategy) {
    case 'memory':
      return new MemoryStore();
    
    // ... other cases like 'redis' (which likely needs its own dynamic import)

    case 'file':
      // 1. Use the helper method to check if the environment supports file storage (Node.js)
      if (isNode()) {
        // 2. Use a DYNAMIC IMPORT() for the Node-specific file. 
        // This is crucial: Rollup/Vite only processes this file during runtime if 'isNode' is true.
        try {
          // The specific import path is relative to the current file
          const { FileStore } = await import('./file-store.service'); 
          return new FileStore();
        } catch (e) {
          // Fallback if the file somehow fails to load even in Node.js
          console.error("Failed to load file-store.service in Node environment:", e);
          throw new Error('File storage dependency failed to load.');
        }
      } else if (isPWA()) {
        // 3. Graceful handling for PWA/Browser builds
        console.warn('File storage requested but only MemoryStore is available in PWA environment.');
        // Optionally, throw an error or fall back to a safe storage method
        return new MemoryStore(); // Fallback to MemoryStore
      } else {
        // Handle other environments (e.g., CLI, embedded)
        throw new Error('File storage strategy is not supported in this environment.');
      }
      
    default:
      throw new Error(`Unknown store strategy: ${strategy}`);
  }
}
```

-----

### 3\. Configure Rollup Externals (Optional but Robust)

To completely assure Rollup/Vite does not try to bundle `fs` even as a failed external dependency, you can explicitly mark `fs` and `path` as external in your Vite configuration. This tells the bundler, "Don't touch these; they'll be provided by the runtime environment (Node.js) if needed."

#### Update `vite.config.ts`

```typescript
// vite.config.ts

// ... existing configuration

export default defineConfig({
  // ... existing config

  build: {
    // ... existing build config
    rollupOptions: {
      input: path.resolve(__dirname, "public/index.html"),
      output: {
        format: "es",
      },
      // ✅ Add 'fs' and 'path' to externals.
      // This tells Rollup to skip bundling these native Node modules.
      external: ['fs', 'path'], 
    },
  },
  // ... rest of the config
});
```

### Summary of the Fix

By combining the **`isNode()` helper** with a **dynamic `import()`** inside that condition, your PWA build will successfully compile. When running in a browser:

1.  `isNode()` returns `false`.
2.  The `import('./file-store.service')` line is skipped.
3.  The bundler never needs to resolve the `import { promises as fs } from 'fs';` line, thus avoiding the "promises is not exported by \_\_vite-browser-external:fs" error.
4.  When running in a Node.js project (CLI/Server), `isNode()` returns `true`, the dynamic import is executed, and the Node.js runtime provides the `fs` module successfully.

---
DeepSeek fix:

---

Looking at your issue, you need a way to conditionally include Node.js-specific code only in Node.js environments while excluding it from PWA builds. Here's a comprehensive solution:

## 1. Create Environment Detection Utilities

Create a new file `src/CdShell/sys/environment/utils.ts`:

```typescript
// Environment detection utilities
export const isNode = (): boolean => {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
};

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

export const isPWA = (): boolean => {
  return isBrowser() && 
         ('serviceWorker' in navigator || 
          window.matchMedia('(display-mode: standalone)').matches);
};

export const isCLI = (): boolean => {
  return isNode() && process.argv[1] !== undefined;
};

// Runtime environment detection
export const getEnvironment = (): 'node' | 'browser' | 'pwa' | 'cli' | 'unknown' => {
  if (isNode()) {
    return isCLI() ? 'cli' : 'node';
  }
  if (isPWA()) {
    return 'pwa';
  }
  if (isBrowser()) {
    return 'browser';
  }
  return 'unknown';
};
```

## 2. Update Vite Configuration

Modify your `vite.config.ts` to handle Node.js modules gracefully:

```typescript
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

const viteConfig = {
  https: {
    key: fs.readFileSync(path.resolve("/home/emp-12/.ssl/key.pem")),
    cert: fs.readFileSync(path.resolve("/home/emp-12/.ssl/cert.pem")),
  },
  port: 5173,
  host: "localhost",
  open: true,
};

export default defineConfig({
  server: viteConfig,
  preview: viteConfig,
  root: ".",
  publicDir: "public",

  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    modulePreload: true,
    rollupOptions: {
      input: path.resolve(__dirname, "public/index.html"),
      output: {
        format: "es",
      },
      // Externalize Node.js modules for browser builds
      external: ['fs', 'path', 'crypto', 'util', 'stream'],
    },
  },

  esbuild: {
    target: "esnext",
    supported: {
      "top-level-await": true,
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
    },
    extensions: [".js", ".ts"],
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: {
        "top-level-await": true,
      },
    },
    // Exclude Node.js modules from dependency optimization
    exclude: ['fs', 'path', 'crypto'],
  },

  // Define global constants for environment detection
  define: {
    __IS_NODE__: JSON.stringify(false),
    __IS_BROWSER__: JSON.stringify(true),
    __IS_PWA__: JSON.stringify(true),
  },
});
```

## 3. Update File Store Service

Modify `src/CdShell/sys/cd-store/services/file-store.service.ts`:

```typescript
import { ICdStore } from '../models/cd-store.model';
import { isNode } from '../../../environment/utils';

// Node.js specific imports - only imported in Node.js environment
let fs: any = null;
let path: any = null;

if (isNode()) {
  // Dynamic imports that will only be executed in Node.js
  import('fs').then(module => fs = module);
  import('path').then(module => path = module);
}

export class FileStoreService implements ICdStore {
  private storagePath: string;
  private isInitialized = false;

  constructor(basePath?: string) {
    this.storagePath = basePath || './data';
  }

  private async ensureNodeEnvironment(): Promise<void> {
    if (!isNode()) {
      throw new Error('FileStoreService is only available in Node.js environment');
    }

    if (!this.isInitialized) {
      // Ensure dynamic imports are loaded
      if (!fs) {
        const fsModule = await import('fs');
        fs = fsModule;
      }
      if (!path) {
        const pathModule = await import('path');
        path = pathModule;
      }
      this.isInitialized = true;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureNodeEnvironment();
    
    try {
      const filePath = path.join(this.storagePath, `${key}.json`);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureNodeEnvironment();

    // Ensure directory exists
    await fs.promises.mkdir(this.storagePath, { recursive: true });
    
    const filePath = path.join(this.storagePath, `${key}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2));
  }

  async delete(key: string): Promise<void> {
    await this.ensureNodeEnvironment();

    const filePath = path.join(this.storagePath, `${key}.json`);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    await this.ensureNodeEnvironment();

    try {
      await fs.promises.rm(this.storagePath, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
  }

  async keys(): Promise<string[]> {
    await this.ensureNodeEnvironment();

    try {
      const files = await fs.promises.readdir(this.storagePath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Method to check if this store is available in current environment
  static isAvailable(): boolean {
    return isNode();
  }
}
```

## 4. Update Store Factory Service

Modify `src/CdShell/sys/cd-store/services/cd-store-factory.service.ts`:

```typescript
import { ICdStore } from '../models/cd-store.model';
import { MemoryStoreService } from './memory-store.service';
import { FileStoreService } from './file-store.service';
import { RedisStoreService } from './redis-store.service';
import { isNode, isBrowser, isPWA } from '../../../environment/utils';

export class CdStoreFactoryService {
  static createStore(type: 'memory' | 'file' | 'redis' = 'memory', options?: any): ICdStore {
    switch (type) {
      case 'file':
        if (!FileStoreService.isAvailable()) {
          console.warn('FileStore is not available in this environment. Falling back to MemoryStore.');
          return new MemoryStoreService();
        }
        return new FileStoreService(options?.storagePath);
      
      case 'redis':
        if (!RedisStoreService.isAvailable()) {
          console.warn('RedisStore is not available in this environment. Falling back to MemoryStore.');
          return new MemoryStoreService();
        }
        return new RedisStoreService(options?.redisConfig);
      
      case 'memory':
      default:
        return new MemoryStoreService();
    }
  }

  static createEnvironmentAwareStore(options?: any): ICdStore {
    if (isNode()) {
      // In Node.js, prefer file storage
      return this.createStore('file', options);
    } else if (isPWA() || isBrowser()) {
      // In PWA/Browser, use memory storage or consider IndexedDB for persistence
      return this.createStore('memory', options);
    } else {
      // Fallback
      return this.createStore('memory', options);
    }
  }
}
```

## 5. Alternative: Conditional File Processing

If you want to completely exclude the file from PWA builds, create a build-time solution:

**Update vite.config.ts with a plugin:**

```typescript
import { defineConfig, Plugin } from "vite";

// Vite plugin to conditionally exclude files
function conditionalExclude(): Plugin {
  return {
    name: 'conditional-exclude',
    resolveId(source, importer) {
      if (source.includes('file-store.service') && !importer?.includes('node')) {
        // Return a virtual module for browser environments
        return '\0virtual:file-store-stub';
      }
      return null;
    },
    load(id) {
      if (id === '\0virtual:file-store-stub') {
        // Return a stub implementation for browser environments
        return `
          export class FileStoreService {
            static isAvailable() { return false; }
            async get() { throw new Error('FileStore not available in browser'); }
            async set() { throw new Error('FileStore not available in browser'); }
            async delete() { throw new Error('FileStore not available in browser'); }
            async clear() { throw new Error('FileStore not available in browser'); }
            async keys() { throw new Error('FileStore not available in browser'); }
          }
        `;
      }
      return null;
    }
  };
}

export default defineConfig({
  // ... your existing config
  plugins: [conditionalExclude()],
});
```

## Usage Examples

```typescript
// In your application code
import { CdStoreFactoryService } from './cd-store-factory.service';

// Automatic environment-aware store
const store = CdStoreFactoryService.createEnvironmentAwareStore();

// Or manually choose with fallback
const store = CdStoreFactoryService.createStore('file', {
  storagePath: './my-data'
}); // Will automatically fallback to memory store in PWA

// Check availability
import { FileStoreService } from './file-store.service';
if (FileStoreService.isAvailable()) {
  // Use file storage
} else {
  // Use alternative storage
}
```

This solution provides:
- **Runtime environment detection** with utility functions
- **Graceful fallbacks** when Node.js modules aren't available
- **Build-time safety** by externalizing Node.js modules
- **Flexible store selection** that adapts to the environment
- **Clean separation** between Node.js and browser/PWA code

The file store will now work in Node.js environments and automatically fall back to memory storage in PWA environments without causing build errors.