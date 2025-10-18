// import { ICdStore } from "../../base";

import { ICdStore } from "../models/cd-store.model";

export class CdStoreService implements ICdStore {
  private store = new Map<string, any>();

  async save(key: string, data: any) {
    this.store.set(key, data);
  }

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  async clear() {
    this.store.clear();
  }
}