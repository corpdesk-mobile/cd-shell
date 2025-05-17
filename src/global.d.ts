export {}; // <- this makes it a module

declare global {
  interface Window {
    cdShell?: {
      logger?: {
        debug?: (...args: any[]) => void;
        warn?: (...args: any[]) => void;
        error?: (...args: any[]) => void;
      };
      lifecycle?: {
        onViewLoaded?: (item?: any, cdToken?: string) => void;
      };
      // Extend with more as needed
    };
  }
}
