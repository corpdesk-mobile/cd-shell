// import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-concept-descriptor.model";

import { UiThemeDescriptor } from "../../dev-descriptor/models/ui-theme-descriptor.model";

export interface UiSystemSchema {
  id: string;                           // e.g. "material-design" or "bootstrap-5"
  displayName: string;
  version: string;

  // Where assets for this system are located in the PWA
  assetPath: string;                    // e.g. /assets/ui-systems/material-design/

  // Maps of UUD component names to local components or directives
  componentMap: Record<string, string>; // e.g. { button: "mat-button", card: "mat-card" }
  directiveMap: Record<string, string>; // e.g. { tooltip: "matTooltip" }

  // Theme definitions
  themes: UiThemeDescriptor[];
  
  // Defines translation logic for DOM-level rendering
  translator: string;                   // name of service implementing IUiSystemTranslator
}
