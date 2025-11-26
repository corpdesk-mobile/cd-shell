import { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";

/**
 * Bootstrap502Adapter: sets data-bs-theme on <html> for Bootstrap v5.0.2
 */
export class Bootstrap502AdapterService implements IUiSystemAdapter {
  async activate(descriptor: UiSystemDescriptor): Promise<void> {
    console.log(
      `[${this.constructor.name}] activate() descriptor.id =`,
      descriptor?.id
    );
    console.log(
      `[${this.constructor.name}] activate() descriptor.version =`,
      descriptor?.version
    );
    return;
  }

  async deactivate(): Promise<void> {
    document.documentElement.removeAttribute("data-bs-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    try {
      if (!themeDescriptorOrId) return;

      let mode: string | undefined;

      if (typeof themeDescriptorOrId === "string") {
        mode = themeDescriptorOrId === "dark" ? "dark" : "light";
      } else if (typeof themeDescriptorOrId === "object") {
        mode =
          themeDescriptorOrId.mode ||
          (themeDescriptorOrId.id === "dark" ? "dark" : "light");
      }

      document.documentElement.setAttribute(
        "data-bs-theme",
        mode === "dark" ? "dark" : "light"
      );

      console.log("[Bootstrap502Adapter] applied bs-theme:", mode);
    } catch (err) {
      console.warn("[Bootstrap502Adapter] applyTheme error", err);
    }
  }
}

// Plugin self-registers
UiSystemAdapterRegistry.register("bootstrap-502", new Bootstrap502AdapterService());
