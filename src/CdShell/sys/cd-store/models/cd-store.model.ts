/**
 * A simple key-value store interface for saving, retrieving, and deleting data in corpdesk applications.
 * This can be implemented using various storage backends like in-memory storage, file system, or databases.
 * The methods are asynchronous to accommodate different storage mechanisms.
 */
export interface ICdStore {
  save(key: string, data: any): Promise<void>;
  get(key: string): Promise<any | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}