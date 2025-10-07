// export {}; // <- this makes it a module

// declare global {
//   interface Window {
//     cdShell?: {
//       logger?: {
//         debug?: (...args: any[]) => void;
//         warn?: (...args: any[]) => void;
//         error?: (...args: any[]) => void;
//       };
//       lifecycle?: {
//         onViewLoaded?: (item?: any, cdToken?: string) => void;
//       };
//       // Extend with more as needed
//     };
//   }
// }

// src/CdShell/sys/base/global.d.ts
export {};

declare global {
  interface CdShellNotify {
    success(msg: string): void;
    error(msg: string): void;
    info?(msg: string): void;
    warn?(msg: string): void;
  }

  interface CdShellProgress {
    start(label?: string): void;
    done(): void;
    set?(percent: number): void;
  }

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
      notify?: CdShellNotify;
      progress?: CdShellProgress;
    };
  }
}

