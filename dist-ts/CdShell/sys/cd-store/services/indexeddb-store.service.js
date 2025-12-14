import { isBrowser, isPWA } from "../../../../environment";
export class IndexedDbStoreService {
    static { this.DB_NAME = "cd-shell-store"; }
    static { this.STORE_NAME = "kv-store"; }
    static { this.DB_VERSION = 1; }
    constructor() {
        this.db = null;
    }
    // ------------------------------------------------------------
    // Check environment support
    // ------------------------------------------------------------
    static isAvailable() {
        return typeof indexedDB !== "undefined" && (isBrowser() || isPWA());
    }
    // ------------------------------------------------------------
    // Initialization (lazy)
    // ------------------------------------------------------------
    async init() {
        if (this.db)
            return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(IndexedDbStoreService.DB_NAME, IndexedDbStoreService.DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IndexedDbStoreService.STORE_NAME)) {
                    db.createObjectStore(IndexedDbStoreService.STORE_NAME);
                }
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onerror = () => reject(request.error || new Error("IndexedDB init failed"));
        });
    }
    // ------------------------------------------------------------
    // SAVE
    // ------------------------------------------------------------
    async save(key, data) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IndexedDbStoreService.STORE_NAME, "readwrite");
            const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);
            const req = store.put(data, key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error || new Error("IndexedDB save() failed"));
        });
    }
    // ------------------------------------------------------------
    // GET
    // ------------------------------------------------------------
    async get(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IndexedDbStoreService.STORE_NAME, "readonly");
            const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => {
                resolve(req.result ?? null);
            };
            req.onerror = () => reject(req.error || new Error("IndexedDB get() failed"));
        });
    }
    // ------------------------------------------------------------
    // DELETE
    // ------------------------------------------------------------
    async delete(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IndexedDbStoreService.STORE_NAME, "readwrite");
            const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error || new Error("IndexedDB delete() failed"));
        });
    }
    // ------------------------------------------------------------
    // CLEAR ALL DATA
    // ------------------------------------------------------------
    async clear() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IndexedDbStoreService.STORE_NAME, "readwrite");
            const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error || new Error("IndexedDB clear() failed"));
        });
    }
    // ------------------------------------------------------------
    // LIST KEYS (optional helper for tools)
    // ------------------------------------------------------------
    async keys() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IndexedDbStoreService.STORE_NAME, "readonly");
            const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);
            const keys = [];
            const req = store.openCursor();
            req.onsuccess = () => {
                const cursor = req.result;
                if (cursor) {
                    keys.push(cursor.key);
                    cursor.continue();
                }
                else {
                    resolve(keys);
                }
            };
            req.onerror = () => reject(req.error || new Error("IndexedDB keys() failed"));
        });
    }
}
