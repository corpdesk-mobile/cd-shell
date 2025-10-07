// src/CdShell/sys/core/base-controller.ts
export abstract class CdShellController {
  abstract template(): string;
  abstract setup(): void;
  abstract processFormData(): Record<string, any>;

  // optional: override for auth or other actions
  auth?(data: any): void;

  // lifecycle hooks
  onInit?(): void;
  onDestroy?(): void;
}
