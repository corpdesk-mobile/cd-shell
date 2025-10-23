import { UiThemeLoaderService } from "./ui-theme-loader.service";
export class UiSystemRegistryService {
    static { this.systems = []; }
    static { this.activeSystemId = ""; }
    static register(system) {
        this.systems.push(system);
    }
    static activate(id) {
        const sys = this.systems.find(s => s.id === id);
        if (!sys)
            throw new Error(`UI system not found: ${id}`);
        this.activeSystemId = id;
        UiThemeLoaderService.loadActiveTheme(sys);
    }
    static getActive() {
        return this.systems.find(s => s.id === this.activeSystemId) ?? null;
    }
    static list() {
        return [...this.systems];
    }
}
