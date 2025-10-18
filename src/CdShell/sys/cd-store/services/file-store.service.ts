// // file-dev-sync-store.ts
// import { promises as fs } from 'fs';
// import path from 'path';
// import { ICdStore } from '../models/cd-store.model';
// // import { ICdStore } from '../../base';

// export class FileStoreService implements ICdStore {
//   private filePath: string;

//   constructor(basePath: string = './.devsync-store.json') {
//     this.filePath = path.resolve(basePath);
//   }

//   private async readFile(): Promise<Record<string, any>> {
//     try {
//       const content = await fs.readFile(this.filePath, 'utf-8');
//       return JSON.parse(content || '{}');
//     } catch {
//       return {};
//     }
//   }

//   private async writeFile(data: Record<string, any>): Promise<void> {
//     await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
//   }

//   async save(key: string, data: any): Promise<void> {
//     const store = await this.readFile();
//     store[key] = data;
//     await this.writeFile(store);
//   }

//   async get(key: string): Promise<any | null> {
//     const store = await this.readFile();
//     return store[key] ?? null;
//   }

//   async delete(key: string): Promise<void> {
//     const store = await this.readFile();
//     delete store[key];
//     await this.writeFile(store);
//   }

//   async clear(): Promise<void> {
//     await this.writeFile({});
//   }
// }

import { isNode } from "../../../../environment";
import { ICdStore } from "../models/cd-store.model";
// import { isNode } from "../../../environment/utils";

// Node.js specific imports - only imported in Node.js environment
let fs: any = null;
let path: any = null;

if (isNode()) {
  // Dynamic imports that will only be executed in Node.js
  import("fs").then((module) => (fs = module));
  import("path").then((module) => (path = module));
}

export class FileStoreService implements ICdStore {
  private storagePath: string;
  private isInitialized = false;
  private filePath: string;

  constructor(basePath?: string) {
    this.storagePath = basePath || "./data";
  }

  private async ensureNodeEnvironment(): Promise<void> {
    if (!isNode()) {
      throw new Error(
        "FileStoreService is only available in Node.js environment"
      );
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

  async get<T>(key: string): Promise<T | null> {
    await this.ensureNodeEnvironment();

    try {
      const filePath = path.join(this.storagePath, `${key}.json`);
      const data = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureNodeEnvironment();

    // Ensure directory exists
    await fs.promises.mkdir(this.storagePath, { recursive: true });

    const filePath = path.join(this.storagePath, `${key}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2));
  }

  async delete(key: string): Promise<void> {
    await this.ensureNodeEnvironment();

    const filePath = path.join(this.storagePath, `${key}.json`);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    await this.ensureNodeEnvironment();

    try {
      await fs.promises.rm(this.storagePath, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
  }

  async keys(): Promise<string[]> {
    await this.ensureNodeEnvironment();

    try {
      const files = await fs.promises.readdir(this.storagePath);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  // Method to check if this store is available in current environment
  static isAvailable(): boolean {
    return isNode();
  }

  private async readFile(): Promise<Record<string, any>> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(content || "{}");
    } catch {
      return {};
    }
  }

  private async writeFile(data: Record<string, any>): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async save(key: string, data: any): Promise<void> {
    const store = await this.readFile();
    store[key] = data;
    await this.writeFile(store);
  }
}
