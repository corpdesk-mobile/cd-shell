export interface ICdStore {
  save(key: string, data: any): Promise<void>;
  get(key: string): Promise<any | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface IStorageEvents {
  onSave?: (key: string, value: any, meta?: any) => void;
  onLaunch?: () => void;
  onDestroy?: () => void;
  onRemoteUpdate?: (key: string, value: any, source?: string) => void;
}