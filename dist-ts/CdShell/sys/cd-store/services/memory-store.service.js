// memory-dev-sync-store.ts
// import { IDevSyncStore } from './dev-sync-store.interface';
export class MemoryStoreService {
    constructor() {
        this.store = new Map();
    }
    async save(key, data) {
        this.store.set(key, data);
    }
    async get(key) {
        return this.store.get(key) ?? null;
    }
    async delete(key) {
        this.store.delete(key);
    }
    async clear() {
        this.store.clear();
    }
}
