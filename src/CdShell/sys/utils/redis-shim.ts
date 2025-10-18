import { getEnvironment } from "../../../environment";

const env = getEnvironment();
const isBrowser = env === "browser" || env === "pwa";

// Mock Redis client for browser environment
export class RedisShim {
  private isConnected = false;

  async connect() {
    this.isConnected = true;
    console.warn("[Redis Shim] Using mock Redis client in browser environment");
    return this;
  }

  async disconnect() {
    this.isConnected = false;
    return this;
  }

  async get(key: string): Promise<string | null> {
    console.warn("[Redis Shim] get() not available in browser");
    return null;
  }

  async set(key: string, value: string): Promise<void> {
    console.warn("[Redis Shim] set() not available in browser");
  }

  async del(key: string): Promise<void> {
    console.warn("[Redis Shim] del() not available in browser");
  }

  async exists(key: string): Promise<number> {
    console.warn("[Redis Shim] exists() not available in browser");
    return 0;
  }

  on(event: string, callback: Function) {
    // No-op for browser
    return this;
  }
}

// Export appropriate client based on environment
export const createClient = isBrowser
  ? () => new RedisShim()
  : (await import("redis")).createClient;
