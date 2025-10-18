import { getEnvironment } from "../../../environment";
const env = getEnvironment();
const isBrowser = env === "browser" || env === "pwa";
// Mock Redis client for browser environment
export class RedisShim {
    constructor() {
        this.isConnected = false;
    }
    async connect() {
        this.isConnected = true;
        console.warn("[Redis Shim] Using mock Redis client in browser environment");
        return this;
    }
    async disconnect() {
        this.isConnected = false;
        return this;
    }
    async get(key) {
        console.warn("[Redis Shim] get() not available in browser");
        return null;
    }
    async set(key, value) {
        console.warn("[Redis Shim] set() not available in browser");
    }
    async del(key) {
        console.warn("[Redis Shim] del() not available in browser");
    }
    async exists(key) {
        console.warn("[Redis Shim] exists() not available in browser");
        return 0;
    }
    on(event, callback) {
        // No-op for browser
        return this;
    }
}
// Export appropriate client based on environment
export const createClient = isBrowser
    ? () => new RedisShim()
    : (await import("redis")).createClient;
