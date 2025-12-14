import { ICdStore } from "../models/cd-store.model";
import { isNode, isCapacitorNative, isBrowser } from "../../../../environment";

// Optional dependencies depending on platform
let BetterSqlite: any = null;
let CapacitorSQLite: any = null;

/**
 * SQLite-backed store for Node.js, Capacitor Native (Android/iOS),
 * and fallback for browser environments.
 */
export class SQLiteStoreService implements ICdStore {
  private db: any = null;
  private platform: "node" | "capacitor" | "unsupported" = "unsupported";
  private isInitialized = false;

  constructor(private dbName: string = "cd-shell.db") {}

  /**
   * Lazy initialize DB based on platform
   */
  private async init() {
    if (this.isInitialized) return;

    if (isNode()) {
      this.platform = "node";
      await this.initNode();
    } else if (isCapacitorNative()) {
      this.platform = "capacitor";
      await this.initCapacitor();
    } else {
      this.platform = "unsupported";
      console.warn("[SQLiteStoreService] SQLite not supported in browser. Use IndexedDBStore.");
    }

    this.isInitialized = true;
  }

  // -------------------------------------------------------------------------
  // NODE.JS SQLITE (better-sqlite3)
  // -------------------------------------------------------------------------
  private async initNode() {
    if (!BetterSqlite) {
      BetterSqlite = await import("better-sqlite3"); // dynamic import
    }

    this.db = new BetterSqlite.default(this.dbName);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    console.log("[SQLiteStoreService] Node SQLite initialized:", this.dbName);
  }

  // -------------------------------------------------------------------------
  // CAPACITOR SQLITE (Android / iOS)
  // -------------------------------------------------------------------------
  private async initCapacitor() {
    if (!CapacitorSQLite) {
      CapacitorSQLite = (await import("@capacitor-community/sqlite")).CapacitorSQLite;
    }

    const { sqlite } = CapacitorSQLite;

    this.db = await sqlite.createConnection({
      database: this.dbName,
      version: 1,
      encrypted: false,
      mode: "no-encryption",
    });

    await this.db.open();

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    console.log("[SQLiteStoreService] Capacitor SQLite initialized");
  }

  // -------------------------------------------------------------------------
  // SAVE
  // -------------------------------------------------------------------------
  async save(key: string, data: any): Promise<void> {
    await this.init();

    if (this.platform === "node") {
      const stmt = this.db.prepare(
        `INSERT INTO kv_store (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      );
      stmt.run(key, JSON.stringify(data));
      return;
    }

    if (this.platform === "capacitor") {
      await this.db.run(
        `INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)`,
        [key, JSON.stringify(data)]
      );
      return;
    }

    throw new Error("SQLite not available in this environment.");
  }

  // -------------------------------------------------------------------------
  // GET
  // -------------------------------------------------------------------------
  async get(key: string): Promise<any | null> {
    await this.init();

    if (this.platform === "node") {
      const row = this.db.prepare(`SELECT value FROM kv_store WHERE key = ?`).get(key);
      return row ? JSON.parse(row.value) : null;
    }

    if (this.platform === "capacitor") {
      const result = await this.db.query(
        `SELECT value FROM kv_store WHERE key = ?`,
        [key]
      );
      if (result.values && result.values.length > 0) {
        return JSON.parse(result.values[0].value);
      }
      return null;
    }

    throw new Error("SQLite not available in this environment.");
  }

  // -------------------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------------------
  async delete(key: string): Promise<void> {
    await this.init();

    if (this.platform === "node") {
      this.db.prepare(`DELETE FROM kv_store WHERE key = ?`).run(key);
      return;
    }

    if (this.platform === "capacitor") {
      await this.db.run(`DELETE FROM kv_store WHERE key = ?`, [key]);
      return;
    }

    throw new Error("SQLite not available in this environment.");
  }

  // -------------------------------------------------------------------------
  // CLEAR
  // -------------------------------------------------------------------------
  async clear(): Promise<void> {
    await this.init();

    if (this.platform === "node") {
      this.db.exec(`DELETE FROM kv_store`);
      return;
    }

    if (this.platform === "capacitor") {
      await this.db.run(`DELETE FROM kv_store`);
      return;
    }

    throw new Error("SQLite not available in this environment.");
  }

  // -------------------------------------------------------------------------
  // isAvailable()
  // -------------------------------------------------------------------------
  static isAvailable(): boolean {
    return isNode() || isCapacitorNative();
  }
}
