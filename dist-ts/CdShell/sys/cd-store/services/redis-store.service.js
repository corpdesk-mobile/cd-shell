import { isNode } from "../../../../environment";
export class RedisStoreService {
    init(redisClient) {
        this.redisClient = redisClient; // Assume redisClient is an instance of a connected Redis client
    }
    async save(key, data) {
        await this.redisClient.set(key, JSON.stringify(data));
    }
    async get(key) {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }
    async delete(key) {
        await this.redisClient.del(key);
    }
    async clear() {
        await this.redisClient.flushDb();
    }
    static isAvailable() {
        return isNode();
    }
}
