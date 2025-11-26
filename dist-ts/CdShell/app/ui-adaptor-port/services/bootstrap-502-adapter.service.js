import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
/**
 * Bootstrap502Adapter: sets data-bs-theme on <html> for Bootstrap v5.0.2
 */
export class Bootstrap502AdapterService {
    async activate(descriptor) {
        console.log(`[${this.constructor.name}] activate() descriptor.id =`, descriptor?.id);
        console.log(`[${this.constructor.name}] activate() descriptor.version =`, descriptor?.version);
        return;
    }
    async deactivate() {
        document.documentElement.removeAttribute("data-bs-theme");
    }
    async applyTheme(themeDescriptorOrId) {
        try {
            if (!themeDescriptorOrId)
                return;
            let mode;
            if (typeof themeDescriptorOrId === "string") {
                mode = themeDescriptorOrId === "dark" ? "dark" : "light";
            }
            else if (typeof themeDescriptorOrId === "object") {
                mode =
                    themeDescriptorOrId.mode ||
                        (themeDescriptorOrId.id === "dark" ? "dark" : "light");
            }
            document.documentElement.setAttribute("data-bs-theme", mode === "dark" ? "dark" : "light");
            console.log("[Bootstrap502Adapter] applied bs-theme:", mode);
        }
        catch (err) {
            console.warn("[Bootstrap502Adapter] applyTheme error", err);
        }
    }
}
// Plugin self-registers
UiSystemAdapterRegistry.register("bootstrap-502", new Bootstrap502AdapterService());
