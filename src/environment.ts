/**
 * Core low-level environment detection.
 * This file provides minimal primitives that PlatformDetectorService builds upon.
 */

export type RawEnvironment =
  | "node"
  | "cli"
  | "browser"
  | "pwa"
  | "capacitor-native"
  | "unknown";

/**
 * Returns low-level environment without OS/device/capability info.
 */
export const getEnvironment = (): RawEnvironment => {
  // Detect Capacitor Native safely
  if (typeof window !== "undefined") {
    const cap = (window as any)?.Capacitor;
    if (cap?.isNative === true) {
      return "capacitor-native";
    }
  }

  // Browser or PWA
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (navigator as any)?.standalone === true ||
      window.location.protocol === "file:";

    if ("serviceWorker" in navigator || isStandalone) {
      return "pwa";
    }

    return "browser";
  }

  // Node.js
  if (typeof process !== "undefined" && process.versions?.node) {
    return process.argv?.[1] ? "cli" : "node";
  }

  return "unknown";
};

// ---------------------------------------------------------
// Convenience Checks
// ---------------------------------------------------------

export const isNode = () => {
  const env = getEnvironment();
  return env === "node" || env === "cli";
};

export const isBrowser = () => getEnvironment() === "browser";

export const isPWA = () => getEnvironment() === "pwa";

export const isCLI = () => getEnvironment() === "cli";

export const isCapacitorNative = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window as any)?.Capacitor?.isNative;
};

/**
 * Unified tag used by diagnostic logging or debugging
 * without mixing OS/device/capability details.
 */
export const getPlatformTag = (): string => {
  if (isCapacitorNative()) {
    try {
      return (window as any).Capacitor?.getPlatform?.() || "capacitor-native";
    } catch {
      return "capacitor-native";
    }
  }
  return getEnvironment(); // node, cli, browser, pwa, unknown
};
