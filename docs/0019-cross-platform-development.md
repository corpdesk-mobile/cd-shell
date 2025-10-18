# Cross-Platform Development Guide: Node.js, PWA, CLI & Embedded Systems

## Executive Summary

This guide outlines a comprehensive strategy for building a unified codebase that runs across multiple environments: Node.js server, Node.js CLI, PWA (browser/mobile), and embedded systems. The core principle is **"Write Once, Run Anywhere"** with environment-specific optimizations.

## 1. Environment Architecture & Shim Strategy

### Environment Detection System

**Core Detection Utility** (`src/environment.ts`):
```typescript
export type Environment = 'node' | 'browser' | 'pwa' | 'cli' | 'embedded' | 'edge';

export const getEnvironment = (): Environment => {
  // Browser detection
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (('serviceWorker' in navigator) || 
        window.matchMedia('(display-mode: standalone)').matches) {
      return 'pwa';
    }
    return 'browser';
  }
  
  // Node.js detection
  if (typeof process !== 'undefined' && process.versions?.node) {
    if (process.argv[1] && process.argv[0].includes('node')) {
      return 'cli';
    }
    return 'node';
  }
  
  // Embedded detection (IoT, Raspberry Pi, etc.)
  if (typeof process !== 'undefined' && process.arch === 'arm') {
    return 'embedded';
  }
  
  // Edge runtime (Vercel, Cloudflare Workers, etc.)
  if (typeof EdgeRuntime !== 'undefined') {
    return 'edge';
  }
  
  return 'browser'; // Fallback
};

// Convenience methods
export const isNode = () => getEnvironment() === 'node' || getEnvironment() === 'cli';
export const isBrowser = () => getEnvironment() === 'browser';
export const isPWA = () => getEnvironment() === 'pwa';
export const isCLI = () => getEnvironment() === 'cli';
export const isEmbedded = () => getEnvironment() === 'embedded';
export const isEdge = () => getEnvironment() === 'edge';
```

### Shim Architecture Principles

**What are Shims?**
Shims are adapter layers that provide consistent APIs across different environments by translating or polyfilling environment-specific functionality.

**Shim Design Patterns:**

```typescript
// 1. Conditional Import Pattern
export const getDatabase = async () => {
  if (isNode()) {
    const { Database } = await import('better-sqlite3');
    return new Database('app.db');
  } else {
    const { SQLiteStore } = await import('./browser/sqlite-shim');
    return new SQLiteStore();
  }
};

// 2. Factory Pattern
export class StorageFactory {
  static createStore(type: string) {
    switch (getEnvironment()) {
      case 'node':
        return new FileStore();
      case 'pwa':
        return new IndexedDBStore();
      case 'embedded':
        return new LiteStore(); // Lightweight for embedded
      default:
        return new MemoryStore();
    }
  }
}

// 3. Adapter Pattern
export class UnifiedStorage implements IStorage {
  private adapter: IStorage;
  
  constructor() {
    this.adapter = isNode() ? new NodeAdapter() : new BrowserAdapter();
  }
  
  async get(key: string) {
    return this.adapter.get(key);
  }
}
```

## 2. Storage Strategies & Data Persistence

### Backend Storage (Node.js/Server)

| Storage Type | Use Case | Implementation |
|-------------|----------|----------------|
| **PostgreSQL** | Primary relational data | TypeORM entities |
| **Redis** | Caching, sessions, real-time data | Redis client with connection pooling |
| **File System** | File storage, backups | Node.js fs module with stream handling |
| **SQLite** | CLI tools, embedded systems | better-sqlite3 for performance |

**Backend Storage Service:**
```typescript
// src/CdShell/sys/storage/backend-storage.service.ts
export class BackendStorageService {
  private typeorm: TypeOrmService;
  private redis: RedisService;
  private file: FileStorageService;

  async saveUser(user: UserEntity) {
    // Primary storage
    await this.typeorm.getRepository(UserEntity).save(user);
    
    // Cache for quick access
    await this.redis.set(`user:${user.id}`, user);
    
    // Audit trail
    await this.file.append('user-audit.log', JSON.stringify(user));
  }
}
```

### Frontend Storage (PWA/Browser)

| Storage Type | Capacity | Persistence | Use Case |
|-------------|----------|-------------|----------|
| **IndexedDB** | ~1GB | Persistent | Large datasets, offline data |
| **SQLite WASM** | ~2GB+ | Persistent | SQL operations, complex queries |
| **localStorage** | 5-10MB | Persistent | Settings, small data |
| **sessionStorage** | 5-10MB | Session | Temporary data |
| **OPFS** | Large | Persistent | File system-like access |

**Unified Storage Interface:**
```typescript
// src/CdShell/sys/storage/storage.interface.ts
export interface IUnifiedStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  query?(condition: any): Promise<any[]>; // For SQL-like operations
}

// Factory implementation
export class StorageService implements IUnifiedStorage {
  private impl: IUnifiedStorage;
  
  constructor() {
    this.impl = StorageFactory.createEnvironmentAwareStorage();
  }
  
  async get<T>(key: string): Promise<T | null> {
    return this.impl.get<T>(key);
  }
  
  // ... other methods delegate to this.impl
}
```

### Cross-Environment Data Sync

**Offline-First Strategy:**
```typescript
// src/CdShell/sys/sync/sync-manager.service.ts
export class SyncManager {
  async syncData() {
    if (!navigator.onLine) {
      // Queue operations for later sync
      await this.queueOperation('create', 'user', userData);
      return;
    }
    
    // Online - sync immediately
    await this.httpClient.post('/api/sync', this.getPendingOperations());
    await this.clearPendingOperations();
  }
  
  async resolveConflicts(local: any, remote: any) {
    // Implement conflict resolution strategy
    // Last-write-wins, manual merge, or custom business logic
    return this.conflictResolver.resolve(local, remote);
  }
}
```

## 3. Database & ORM Strategy

### Backend: TypeORM with PostgreSQL

**Entity Definition (Shared):**
```typescript
// src/shared/entities/user.entity.ts
@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  displayName: string;

  // Virtual fields (not persisted)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

**Repository Pattern:**
```typescript
// src/CdShell/sys/data/repositories/user.repository.ts
export class UserRepository extends BaseRepository<UserEntity> {
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email } });
  }
  
  async searchUsers(query: string): Promise<UserEntity[]> {
    return this.createQueryBuilder('user')
      .where('user.email LIKE :query OR user.displayName LIKE :query', 
        { query: `%${query}%` })
      .getMany();
  }
}
```

### Frontend SQL Options

| Solution | SQL Support | Storage | Size | Recommended For |
|----------|-------------|---------|------|----------------|
| **SQL.js** | Full SQLite | Memory | ~1MB | Complex queries, small datasets |
| **OPFS + SQLite** | Full SQLite | Persistent | Large | Production PWAs, large data |
| **Dexie.js** | IndexedDB API | Persistent | Large | Simple queries, ease of use |
| **Lovefield** | SQL-like | IndexedDB | Medium | Complex queries on IndexedDB |

**SQLite WASM Implementation:**
```typescript
// src/CdShell/sys/storage/sqlite-wasm.service.ts
export class SQLiteWasmService implements IUnifiedStorage {
  private db: any;
  
  async initialize() {
    const sqlite = await import('@sqlite.org/sqlite-wasm');
    this.db = new sqlite.oo1.OpfsDb('/app.db');
    
    // Create tables matching your TypeORM entities
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        displayName TEXT,
        createdAt INTEGER,
        updatedAt INTEGER
      )
    `);
  }
  
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return this.db.exec({ sql, bind: params, returnValue: 'resultRows' });
  }
}
```

### Data Synchronization Strategy

**Bi-directional Sync:**
```typescript
// src/CdShell/sys/sync/universal-sync.service.ts
export class UniversalSyncService {
  async syncEntity<T extends BaseEntity>(entity: T) {
    const lastSync = await this.getLastSyncTime();
    const changes = await this.detectChanges(entity, lastSync);
    
    if (isNode()) {
      // Server: apply changes to database
      await this.applyToDatabase(changes);
    } else {
      // Client: store locally and queue for sync
      await this.storeLocally(changes);
      await this.queueForSync(changes);
    }
  }
  
  private async detectChanges(entity: any, since: Date) {
    // Implement change detection logic
    return this.changeDetector.detect(entity, since);
  }
}
```

## 4. Vite & Browser Limitations in PWA/Embedded

### Vite-Specific Considerations

**Module Resolution Challenges:**
```typescript
// vite.config.ts - Critical configurations
export default defineConfig({
  build: {
    target: 'esnext', // Essential for modern features
    rollupOptions: {
      external: [
        // Node.js modules that don't work in browser
        'fs', 'path', 'crypto', 'util', 'os', 'stream',
        'http', 'https', 'net', 'tls', 'child_process'
      ]
    }
  },
  
  resolve: {
    alias: {
      // Redirect Node.js modules to browser shims
      'path': '/src/shim/path-browser.ts',
      'fs': '/src/shim/fs-browser.ts',
      'crypto': '/src/shim/crypto-browser.ts'
    }
  },
  
  define: {
    // Global polyfills
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.platform': JSON.stringify('browser'),
    global: 'globalThis'
  },
  
  optimizeDeps: {
    // Exclude problematic packages
    exclude: ['@sqlite.org/sqlite-wasm', 'sql.js', 'bcrypt']
  }
});
```

### Browser Environment Limitations

**Unavailable in Browser:**
- Raw TCP sockets (Redis, databases)
- File system access
- Child processes
- Native modules (.node files)
- System environment variables

**Workarounds:**
```typescript
// src/CdShell/sys/utils/browser-adapter.ts
export class BrowserAdapter {
  // File system replacement
  static async readFile(path: string): Promise<Uint8Array> {
    if (isBrowser()) {
      // Use OPFS or IndexedDB
      const file = await OPFS.getFile(path);
      return file.arrayBuffer();
    }
    return fs.promises.readFile(path);
  }
  
  // Network replacement
  static createClient(endpoint: string) {
    if (isBrowser()) {
      return new WebSocketClient(endpoint);
    }
    return new NetSocketClient(endpoint);
  }
}
```

### PWA-Specific Optimizations

**Service Worker Strategy:**
```typescript
// public/sw.js
const CACHE_NAME = 'app-v1';
const API_CACHE_NAME = 'api-v1';

self.addEventListener('fetch', (event) => {
  // API calls - network first, then cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          const clone = response.clone();
          caches.open(API_CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
  
  // Static assets - cache first
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

## 5. Embedded Systems Considerations

### Resource Constraints

**Lightweight Implementations:**
```typescript
// src/CdShell/sys/storage/embedded-storage.service.ts
export class EmbeddedStorageService implements IUnifiedStorage {
  // Use SQLite instead of PostgreSQL
  private db: Database;
  
  constructor() {
    this.db = new Database('embedded.db', { 
      memory: true, // Use memory for better performance
      readonly: false 
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Simple key-value with SQLite
    const result = this.db.prepare('SELECT value FROM kv WHERE key = ?').get(key);
    return result ? JSON.parse(result.value) : null;
  }
}
```

**Memory Management:**
```typescript
// src/CdShell/sys/utils/memory-manager.ts
export class MemoryManager {
  static monitorMemory() {
    if (isEmbedded()) {
      setInterval(() => {
        const used = process.memoryUsage();
        if (used.heapUsed > 50 * 1024 * 1024) { // 50MB threshold
          this.cleanupCache();
        }
      }, 30000);
    }
  }
  
  private static cleanupCache() {
    // Implement LRU cache eviction
    CacheService.evictOldest(0.2); // Remove 20% oldest entries
  }
}
```

## 6. Development Workflow & Best Practices

### Project Structure
```
src/
├── shared/           # Environment-agnostic code
│   ├── entities/     # TypeORM entities
│   ├── interfaces/   # Common interfaces
│   └── utils/        # Shared utilities
├── browser/          # Browser-specific implementations
├── node/            # Node.js-specific implementations
├── embedded/        # Embedded-specific implementations
└── shim/            # Environment adapters
```

### Build Configuration

**Multiple Build Targets:**
```json
// package.json
{
  "scripts": {
    "build:pwa": "vite build",
    "build:node": "tsc -p tsconfig.node.json",
    "build:cli": "tsc -p tsconfig.cli.json",
    "build:embedded": "tsc -p tsconfig.embedded.json"
  }
}
```

**Environment-Specific TypeScript Configs:**
```json
// tsconfig.pwa.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true
  }
}

// tsconfig.node.json  
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "CommonJS",
    "skipLibCheck": true
  }
}
```

### Testing Strategy

**Cross-Environment Testing:**
```typescript
// tests/storage/storage.test.ts
describe('UnifiedStorage', () => {
  it('should work in all environments', async () => {
    const storage = new StorageService();
    
    await storage.set('test', { value: 123 });
    const result = await storage.get('test');
    
    expect(result).toEqual({ value: 123 });
  });
});

// Run tests in different environments
// npm run test:node    # Node.js environment
// npm run test:browser # Browser environment  
// npm run test:all     # All environments
```

## 7. Deployment & Distribution

### PWA Deployment
- **Hosting**: Netlify, Vercel, or traditional web hosting
- **CDN**: For static assets and caching
- **Service Worker**: Offline functionality and caching strategy

### Node.js Server Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes or Docker Compose
- **Database**: PostgreSQL with connection pooling

### CLI Tool Distribution
```json
// package.json for CLI
{
  "bin": {
    "my-cli": "./dist/cli/index.js"
  },
  "files": ["dist/cli"],
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### Embedded Deployment
- **Lightweight runtime**: Node.js with minimal dependencies
- **Resource monitoring**: Memory and CPU usage tracking
- **Update strategy**: OTA updates with rollback capability

## 8. Performance Optimization

### Bundle Optimization
```typescript
// vite.config.ts - Advanced optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          vendor: ['lodash', 'moment', 'rxjs'],
          // Split environment-specific code
          browser: isBrowser() ? ['./src/browser/index.ts'] : []
        }
      }
    }
  }
});
```

### Lazy Loading Strategy
```typescript
// src/CdShell/sys/utils/lazy-loader.ts
export class LazyLoader {
  static async loadModule(moduleName: string) {
    if (isNode()) {
      return import(`../node/${moduleName}`);
    } else {
      return import(`../browser/${moduleName}`);
    }
  }
}

// Usage
const DatabaseModule = await LazyLoader.loadModule('database');
```

This comprehensive approach ensures your codebase remains maintainable while supporting multiple target environments. The key is consistent interfaces with environment-specific implementations, proper testing across all platforms, and clear documentation for developers working on the system.