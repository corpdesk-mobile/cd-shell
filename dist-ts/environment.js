// // Environment detection utilities
// export const isNode = (): boolean => {
//   return (
//     typeof process !== "undefined" &&
//     process.versions != null &&
//     process.versions.node != null
//   );
// };
// export const isBrowser = (): boolean => {
//   return typeof window !== "undefined" && typeof document !== "undefined";
// };
// export const isPWA = (): boolean => {
//   return (
//     isBrowser() &&
//     ("serviceWorker" in navigator ||
//       window.matchMedia("(display-mode: standalone)").matches)
//   );
// };
// export const isCLI = (): boolean => {
//   return isNode() && process.argv[1] !== undefined;
// };
// // Runtime environment detection
// export const getEnvironment = ():
//   | "node"
//   | "browser"
//   | "pwa"
//   | "cli"
//   | "unknown" => {
//   if (isNode()) {
//     return isCLI() ? "cli" : "node";
//   }
//   if (isPWA()) {
//     return "pwa";
//   }
//   if (isBrowser()) {
//     return "browser";
//   }
//   return "unknown";
// };
export const getEnvironment = () => {
    // Check for browser first
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        // Check for PWA
        if ("serviceWorker" in navigator ||
            window.matchMedia("(display-mode: standalone)").matches ||
            window.location.protocol === "file:") {
            return "pwa";
        }
        return "browser";
    }
    // Check for Node.js
    if (typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null) {
        return process.argv[1] ? "cli" : "node";
    }
    return "unknown";
};
// Convenience helpers
export const isNode = () => getEnvironment() === "node" || getEnvironment() === "cli";
export const isBrowser = () => getEnvironment() === "browser";
export const isPWA = () => getEnvironment() === "pwa";
export const isCLI = () => getEnvironment() === "cli";
