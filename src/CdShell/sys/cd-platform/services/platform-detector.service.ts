/**
 * PlatformDetectorService
 * -----------------------
 * Centralized platform/environment analysis for Corpdesk Shell.
 *
 * Responsibilities:
 *  - Detect environment (node, browser, pwa, capacitor-native, cli)
 *  - Detect OS family (windows, mac, linux, android, ios, unknown)
 *  - Detect device category (mobile, tablet, desktop)
 *  - Detect runtime capabilities (indexeddb, filesystem, touch, notifications…)
 *
 * This service is pure and safe and does not throw errors
 * even when running in strict sandboxed environments.
 */
import { isNode, isBrowser, isPWA } from "../../../../environment";
import {
  DeviceCategory,
  EnvironmentType,
  OSFamily,
  PlatformCapabilities,
  PlatformInfo,
} from "../models/platform-detector.model";

export class PlatformDetectorService {
  // Singleton instance
  private static _instance: PlatformDetectorService;

  static getInstance(): PlatformDetectorService {
    if (!this._instance) {
      this._instance = new PlatformDetectorService();
    }
    return this._instance;
  }

  // ---------------------------------------------------------------------
  // STATIC WRAPPER: used by factories or services needing quick platform info
  // ---------------------------------------------------------------------
  static detectPlatform(): PlatformInfo {
    return PlatformDetectorService.getInstance().getPlatformInfo();
  }

  // ---------------------------------------------------------------------
  // ENVIRONMENT DETECTION
  // ---------------------------------------------------------------------

  getEnvironment(): EnvironmentType {
    // Capacitor Native Detection
    if (typeof window !== "undefined" && (window as any)?.Capacitor?.isNative) {
      return "capacitor-native";
    }

    if (isPWA()) return "pwa";
    if (isBrowser()) return "browser";
    if (isNode()) return "node";

    return "unknown";
  }

  isCapacitorNative(): boolean {
    try {
      return !!(
        typeof window !== "undefined" && (window as any)?.Capacitor?.isNative
      );
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // OS DETECTION
  // ---------------------------------------------------------------------

  getOSFamily(): OSFamily {
    if (isNode()) {
      const p = require("os");
      const platform = p.platform();

      if (platform === "win32") return "windows";
      if (platform === "darwin") return "mac";
      if (platform === "linux") return "linux";
      return "unknown";
    }

    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();

      if (/windows|win32/.test(ua)) return "windows";
      if (/mac os|macintosh/.test(ua)) return "mac";
      if (/linux/.test(ua)) return "linux";
      if (/android/.test(ua)) return "android";
      if (/iphone|ipad|ipod|ios/.test(ua)) return "ios";
    }

    return "unknown";
  }

  // ---------------------------------------------------------------------
  // DEVICE CATEGORY DETECTION
  // ---------------------------------------------------------------------

  getDeviceCategory(): DeviceCategory {
    try {
      if (typeof navigator === "undefined") return "desktop";

      const ua = navigator.userAgent.toLowerCase();

      if (/mobi|android/.test(ua)) return "mobile";
      if (/tablet|ipad/.test(ua)) return "tablet";
      return "desktop";
    } catch {
      return "unknown";
    }
  }

  // ---------------------------------------------------------------------
  // CAPABILITY CHECKS
  // ---------------------------------------------------------------------

  getCapabilities(): PlatformCapabilities {
    return {
      indexedDb: this.canUseIndexedDb(),
      localStorage: this.canUseLocalStorage(),
      sessionStorage: this.canUseSessionStorage(),
      fileSystemAccess: this.canUseFSAccess(),
      touchSupport: this.hasTouchSupport(),
      serviceWorkers: this.hasServiceWorker(),
      notifications: this.hasNotificationSupport(),
      backgroundSync: this.hasBackgroundSync(),
    };
  }

  private canUseIndexedDb(): boolean {
    try {
      return typeof indexedDB !== "undefined";
    } catch {
      return false;
    }
  }

  private canUseLocalStorage(): boolean {
    try {
      return typeof localStorage !== "undefined";
    } catch {
      return false;
    }
  }

  private canUseSessionStorage(): boolean {
    try {
      return typeof sessionStorage !== "undefined";
    } catch {
      return false;
    }
  }

  private canUseFSAccess(): boolean {
    try {
      return !!(window as any).showOpenFilePicker; // Chrome/Edge
    } catch {
      return false;
    }
  }

  private hasTouchSupport(): boolean {
    try {
      const nav: any = navigator;
      return (
        "ontouchstart" in window ||
        (typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) ||
        (typeof nav.msMaxTouchPoints === "number" && nav.msMaxTouchPoints > 0)
      );
    } catch {
      return false;
    }
  }

  private hasServiceWorker(): boolean {
    try {
      return "serviceWorker" in navigator;
    } catch {
      return false;
    }
  }

  private hasNotificationSupport(): boolean {
    try {
      return "Notification" in window;
    } catch {
      return false;
    }
  }

  private hasBackgroundSync(): boolean {
    try {
      return "SyncManager" in window;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // FINAL STRUCTURED REPORT
  // ---------------------------------------------------------------------

  getPlatformInfo(): PlatformInfo {
    const env = this.getEnvironment();
    const os = this.getOSFamily();
    const device = this.getDeviceCategory();
    const capabilities = this.getCapabilities();

    return {
      environment: env,
      os,
      device,
      capabilities,

      isWeb: env === "browser",
      isPWA: env === "pwa",
      isCapacitorNative: env === "capacitor-native",

      // explicit flags
      isNode: env === "node" || env === "cli",
      supportsRedis: env === "node",
      isCLI: env === "cli",

      // browser umbrella: web + pwa
      isBrowser: env === "browser" || env === "pwa",

      // browser umbrella: web + pwa
      hasIndexedDb: env === "browser" || env === "pwa",

      isDesktop: device === "desktop",
    };
  }
}
