import { isNode } from "../../../../environment";
import { ICdStore } from "../models/cd-store.model";

export class RedisStoreService implements ICdStore {
  private redisClient: any;

  init(redisClient: any) {
    this.redisClient = redisClient; // Assume redisClient is an instance of a connected Redis client
  }

  async save(key: string, data: any): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(data));
  }

  async get(key: string): Promise<any | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clear(): Promise<void> {
    await this.redisClient.flushDb();
  }

  static isAvailable(): boolean {
    return isNode();
  }
}
