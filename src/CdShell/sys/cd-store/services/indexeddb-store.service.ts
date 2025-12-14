import { ICdStore } from "../models/cd-store.model";
import { isBrowser, isPWA } from "../../../../environment";

export class IndexedDbStoreService implements ICdStore {
  private static DB_NAME = "cd-shell-store";
  private static STORE_NAME = "kv-store";
  private static DB_VERSION = 1;

  private db: IDBDatabase | null = null;

  constructor() {}

  // ------------------------------------------------------------
  // Check environment support
  // ------------------------------------------------------------
  static isAvailable(): boolean {
    return typeof indexedDB !== "undefined" && (isBrowser() || isPWA());
  }

  // ------------------------------------------------------------
  // Initialization (lazy)
  // ------------------------------------------------------------
  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(
        IndexedDbStoreService.DB_NAME,
        IndexedDbStoreService.DB_VERSION
      );

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(IndexedDbStoreService.STORE_NAME)) {
          db.createObjectStore(IndexedDbStoreService.STORE_NAME);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () =>
        reject(request.error || new Error("IndexedDB init failed"));
    });
  }

  // ------------------------------------------------------------
  // SAVE
  // ------------------------------------------------------------
  async save(key: string, data: any): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        IndexedDbStoreService.STORE_NAME,
        "readwrite"
      );
      const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);

      const req = store.put(data, key);

      req.onsuccess = () => resolve();
      req.onerror = () =>
        reject(req.error || new Error("IndexedDB save() failed"));
    });
  }

  // ------------------------------------------------------------
  // GET
  // ------------------------------------------------------------
  async get<T = any>(key: string): Promise<T | null> {
    const db = await this.init();

    return new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(
        IndexedDbStoreService.STORE_NAME,
        "readonly"
      );
      const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);

      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ?? null);
      };

      req.onerror = () =>
        reject(req.error || new Error("IndexedDB get() failed"));
    });
  }

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------
  async delete(key: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        IndexedDbStoreService.STORE_NAME,
        "readwrite"
      );
      const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);

      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () =>
        reject(req.error || new Error("IndexedDB delete() failed"));
    });
  }

  // ------------------------------------------------------------
  // CLEAR ALL DATA
  // ------------------------------------------------------------
  async clear(): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        IndexedDbStoreService.STORE_NAME,
        "readwrite"
      );
      const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);

      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () =>
        reject(req.error || new Error("IndexedDB clear() failed"));
    });
  }

  // ------------------------------------------------------------
  // LIST KEYS (optional helper for tools)
  // ------------------------------------------------------------
  async keys(): Promise<string[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        IndexedDbStoreService.STORE_NAME,
        "readonly"
      );
      const store = tx.objectStore(IndexedDbStoreService.STORE_NAME);

      const keys: string[] = [];
      const req = store.openCursor();

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          keys.push(cursor.key as string);
          cursor.continue();
        } else {
          resolve(keys);
        }
      };

      req.onerror = () =>
        reject(req.error || new Error("IndexedDB keys() failed"));
    });
  }
}
