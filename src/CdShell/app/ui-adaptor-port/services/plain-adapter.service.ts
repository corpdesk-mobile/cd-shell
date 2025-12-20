import { IUiSystemAdapter } from "../../../sys/cd-guig/models/ui-system-adaptor.model";
import { UiSystemAdapterRegistry } from "../../../sys/cd-guig/services/ui-system-registry.service";
import { UiSystemDescriptor } from "../../../sys/dev-descriptor/models/ui-system-descriptor.model";

/**
 * MaterialAdapter — applies Material Design theme logic
 */
export class PlainAdapterService implements IUiSystemAdapter {
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
    document.documentElement.removeAttribute("data-md-theme");
  }

  async applyTheme(themeDescriptorOrId: any): Promise<void> {
    if (!themeDescriptorOrId) return;

    const mode =
      typeof themeDescriptorOrId === "string"
        ? themeDescriptorOrId
        : themeDescriptorOrId.mode;

    if (mode === "dark") {
      document.documentElement.classList.add("md-dark");
      document.documentElement.classList.remove("md-light");
    } else {
      document.documentElement.classList.remove("md-dark");
      document.documentElement.classList.add("md-light");
    }

    console.log("[MaterialAdapter] applyTheme:", mode);
  }
}

// Plugin self-registers
// UiSystemAdapterRegistry.register("plain", new PlainAdapterService());
