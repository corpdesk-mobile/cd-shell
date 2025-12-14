export type EnvironmentType =
  | "node"
  | "browser"
  | "pwa"
  | "capacitor-native"
  | "cli"
  | "unknown";

export type DeviceCategory = "mobile" | "tablet" | "desktop" | "unknown";

export type OSFamily =
  | "windows"
  | "mac"
  | "linux"
  | "android"
  | "ios"
  | "unknown";

export interface PlatformCapabilities {
  indexedDb: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  fileSystemAccess: boolean;
  touchSupport: boolean;
  serviceWorkers: boolean;
  notifications: boolean;
  backgroundSync: boolean;
}

export interface PlatformInfo {
  environment: EnvironmentType;
  os: OSFamily;
  device: DeviceCategory;
  capabilities: PlatformCapabilities;

  /** Running in a traditional browser tab */
  isWeb: boolean;     // browser only

  /** Running as a standalone PWA */
  isPWA: boolean;

  /** Running as Capacitor Native (Android/iOS) */
  isCapacitorNative: boolean;

  /** Running on Node.js backend or CLI */
  isNode: boolean;

  /** Running in CLI mode */
  isCLI: boolean;

  /** Convenience: browser or PWA */
  isBrowser: boolean;

  /** Desktop-class device (large screens) */
  isDesktop: boolean;

  /** environment where indexedDb is available */
  hasIndexedDb: boolean;

  /** environment where filesystem access is available */
  supportsRedis: boolean;
}
