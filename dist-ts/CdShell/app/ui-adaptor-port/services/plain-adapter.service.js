/**
 * MaterialAdapter — applies Material Design theme logic
 */
export class PlainAdapterService {
    setMeta(meta) {
        this.meta = meta;
    }
    async activate(descriptor) {
        console.log(`[${this.constructor.name}] activate() descriptor.id =`, descriptor?.id);
        console.log(`[${this.constructor.name}] activate() descriptor.version =`, descriptor?.version);
        return;
    }
    async deactivate() {
        document.documentElement.removeAttribute("data-md-theme");
    }
    async applyTheme(themeDescriptorOrId) {
        if (!themeDescriptorOrId)
            return;
        const mode = typeof themeDescriptorOrId === "string"
            ? themeDescriptorOrId
            : themeDescriptorOrId.mode;
        if (mode === "dark") {
            document.documentElement.classList.add("md-dark");
            document.documentElement.classList.remove("md-light");
        }
        else {
            document.documentElement.classList.remove("md-dark");
            document.documentElement.classList.add("md-light");
        }
        console.log("[MaterialAdapter] applyTheme:", mode);
    }
}
// Plugin self-registers
// UiSystemAdapterRegistry.register("plain", new PlainAdapterService());
