// import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";
// import { Bootstrap502Adapter } from "../services/bootstrap-502-adaptor.service";
// import { MaterialAdapter } from "../services/material-adaptor.service";
// import { PlainAdapter } from "../services/plain-adaptor.service";
// import { Bootstrap538Adapter } from "../services/ui-system-adapters";

import { Bootstrap502AdapterService } from "../../../app/ui-adaptor-port/services/bootstrap-502-adapter.service";
import { Bootstrap538AdapterService } from "../../../app/ui-adaptor-port/services/bootstrap-538-adapter.service";
import { MaterialDesignAdapterService } from "../../../app/ui-adaptor-port/services/material-design-adapter.service";
import { PlainAdapterService } from "../../../app/ui-adaptor-port/services/plain-adapter.service";
import { UiSystemDescriptor } from "../../dev-descriptor/models/ui-system-descriptor.model";

export interface IUiSystemAdapter {
  activate(descriptor: UiSystemDescriptor): Promise<void>;
  deactivate(): Promise<void>;
  applyTheme(themeId: string): Promise<void>;
}

/**
 * A single concept's mapping information.
 * Example concepts:
 * - "button"
 * - "input"
 * - "formGroup"
 * - "card"
 */
export interface UiConceptMapping {
  /** CSS class string to apply to the rendered element */
  class?: string;

  /** Inline style overrides (rarely used, but supported) */
  style?: Record<string, string>;

  /** Attribute overrides (e.g., {"data-bs-toggle": "tooltip"}) */
  attrs?: Record<string, string>;

  /** Optional: transform raw DOM before render */
  transform?: (el: HTMLElement) => void;

  /** Optional: metadata for future AI/plugin use */
  metadata?: Record<string, any>;
}



/**
 * Collection of mappings for a single UI system.
 * Maps concept → mapping configuration
 */
export type UiSystemMapping = Record<string, UiConceptMapping>;


export const SYSTEM_ADAPTERS: Record<string, IUiSystemAdapter> = {
  "bootstrap-502": new Bootstrap502AdapterService(),
  "bootstrap-538": new Bootstrap538AdapterService(),
  "material-design": new MaterialDesignAdapterService(),
  "plain": new PlainAdapterService(),
};

export type UiSystemId =
  | "bootstrap-538"
  | "bootstrap-502"
  | "tailwind"
  | "material-mui"
  | "custom";

// export interface UiSystemDescriptor {
//   id: UiSystemId;
//   version?: string;
//   theme?: "light" | "dark";
//   manifestUrl?: string;
//   cssLoaded?: boolean;
// }

export const DEFAULT_SYSTEM: UiSystemDescriptor = {
  id: "bootstrap-538",
  version: "5.3.8",
  themeActive: "light",
}