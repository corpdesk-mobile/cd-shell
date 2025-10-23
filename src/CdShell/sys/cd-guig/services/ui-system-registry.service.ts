import { UiSystemSchema } from "../models/ui-system-schema.model";
import { UiThemeLoaderService } from "./ui-theme-loader.service";

export class UiSystemRegistryService {
  private static systems: UiSystemSchema[] = [];
  private static activeSystemId: string = "";

  static register(system: UiSystemSchema): void {
    this.systems.push(system);
  }

  static activate(id: string): void {
    const sys = this.systems.find(s => s.id === id);
    if (!sys) throw new Error(`UI system not found: ${id}`);
    this.activeSystemId = id;
    UiThemeLoaderService.loadActiveTheme(sys);
  }

  static getActive(): UiSystemSchema | null {
    return this.systems.find(s => s.id === this.activeSystemId) ?? null;
  }

  static list(): UiSystemSchema[] {
    return [...this.systems];
  }
}
