// import { ICdStore } from "../../base";
export class CdStoreService {
    constructor() {
        this.store = new Map();
    }
    async save(key, data) {
        this.store.set(key, data);
    }
    async get(key) {
        return this.store.get(key) || null;
    }
    async delete(key) {
        this.store.delete(key);
    }
    async clear() {
        this.store.clear();
    }
}
