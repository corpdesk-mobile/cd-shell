import { getEnvironment } from "../../../environment";

const env = getEnvironment();
const isBrowser = env === "browser" || env === "pwa";

// Shim for process global
export const processShim = {
  env: {
    NODE_ENV: isBrowser ? 'production' : process.env?.NODE_ENV || 'development',
    // Add other env vars you need
  },
  version: isBrowser ? 'v18.0.0' : process.version, // Mock version for browser
  versions: isBrowser ? { node: '18.0.0' } : process.versions,
  platform: isBrowser ? 'browser' : process.platform,
  arch: isBrowser ? 'x64' : process.arch,
  cwd: () => isBrowser ? '/' : process.cwd(),
  nextTick: isBrowser ? (callback: Function, ...args: any[]) => 
    Promise.resolve().then(() => callback(...args)) : process.nextTick,
};

// Global process shim for browser
if (isBrowser && typeof window !== 'undefined') {
  (window as any).process = processShim;
}