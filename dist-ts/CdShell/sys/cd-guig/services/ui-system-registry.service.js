// export class UiSystemRegistryService {
//   private static systems: UiSystemSchema[] = [];
//   private static activeSystemId: string = "";
//   private static registry = new Map<string, IUiSystemAdapter>();
//   static register(system: UiSystemSchema): void {
//     this.systems.push(system);
//   }
//   static getActive(): UiSystemSchema | null {
//     return this.systems.find(s => s.id === this.activeSystemId) ?? null;
//   }
//   static list(): UiSystemSchema[] {
//     return [...this.systems];
//   }
// }
export class UiSystemAdapterRegistry {
    static { this.registry = new Map(); }
    static register(id, adapter) {
        console.log("[UiSystemAdapterRegistry] register:", id, adapter);
        this.registry.set(id, adapter);
    }
    static get(id) {
        return this.registry.get(id) || null;
    }
    static list() {
        return Array.from(this.registry.keys());
    }
}
