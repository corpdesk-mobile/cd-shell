import { ICdStore } from "../models/cd-store.model";

export class MemoryStoreService implements ICdStore {
  private store = new Map<string, any>();

  async save(key: string, data: any): Promise<void> {
    this.store.set(key, data);
  }

  async get(key: string): Promise<any | null> {
    return this.store.get(key) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
