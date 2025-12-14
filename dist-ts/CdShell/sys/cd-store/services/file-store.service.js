import { isNode } from "../../../../environment";
// import { isNode } from "../../../environment/utils";
// Node.js specific imports - only imported in Node.js environment
let fs = null;
let path = null;
if (isNode()) {
    // Dynamic imports that will only be executed in Node.js
    import("fs").then((module) => (fs = module));
    import("path").then((module) => (path = module));
}
export class FileStoreService {
    constructor(basePath) {
        this.isInitialized = false;
        this.storagePath = basePath || "./data";
    }
    async ensureNodeEnvironment() {
        if (!isNode()) {
            throw new Error("FileStoreService is only available in Node.js environment");
        }
        if (!this.isInitialized) {
            // Ensure dynamic imports are loaded
            if (!fs) {
                const fsModule = await import("fs");
                fs = fsModule;
            }
            if (!path) {
                const pathModule = await import("path");
                path = pathModule;
            }
            this.isInitialized = true;
        }
    }
    async get(key) {
        await this.ensureNodeEnvironment();
        try {
            const filePath = path.join(this.storagePath, `${key}.json`);
            const data = await fs.promises.readFile(filePath, "utf-8");
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                return null;
            }
            throw error;
        }
    }
    async set(key, value) {
        await this.ensureNodeEnvironment();
        // Ensure directory exists
        await fs.promises.mkdir(this.storagePath, { recursive: true });
        const filePath = path.join(this.storagePath, `${key}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2));
    }
    async delete(key) {
        await this.ensureNodeEnvironment();
        const filePath = path.join(this.storagePath, `${key}.json`);
        try {
            await fs.promises.unlink(filePath);
        }
        catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
    }
    async clear() {
        await this.ensureNodeEnvironment();
        try {
            await fs.promises.rm(this.storagePath, { recursive: true, force: true });
        }
        catch (error) {
            // Directory might not exist, which is fine
        }
    }
    async keys() {
        await this.ensureNodeEnvironment();
        try {
            const files = await fs.promises.readdir(this.storagePath);
            return files
                .filter((file) => file.endsWith(".json"))
                .map((file) => file.replace(".json", ""));
        }
        catch (error) {
            if (error.code === "ENOENT") {
                return [];
            }
            throw error;
        }
    }
    // Method to check if this store is available in current environment
    static isAvailable() {
        return isNode();
    }
    async readFile() {
        try {
            const content = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(content || "{}");
        }
        catch {
            return {};
        }
    }
    async writeFile(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    async save(key, data) {
        const store = await this.readFile();
        store[key] = data;
        await this.writeFile(store);
    }
}
