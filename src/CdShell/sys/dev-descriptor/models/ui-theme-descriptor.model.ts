/**
 * @file ui-theme-descriptor.model.ts
 * @description
 * Represents metadata and configuration for a UI theme.
 */

// export interface ThemeDescriptor {
//   id: string;
//   name: string;
//   assetPath?: string; // Path to theme CSS file
//   variables?: Record<string, string>; // CSS custom properties
//   compatibleWith?: string[]; // List of compatible UI systems
// }

/**
 * Theme descriptor for color, typography, and variable configuration.
 */
export interface UiThemeDescriptor {
  id: string;
  name: string;
  cssPath?: string; // Path to theme CSS file
  variables?: Record<string, string>; // CSS custom properties
  compatibleWith?: string[]; // List of compatible UI systems

  themeName: string;
  colorScheme?: Record<string, string>;
  typography?: Record<string, string>;
  spacing?: Record<string, string>;
  animations?: Record<string, string>;

/* Duplicate interface removed. Properties merged above. */
  scripts?: string[];
  stylesheets?: string[];

  // Integration metadata
  author?: string;
  license?: string;
  repository?: string;

  // Custom system extensions (AI metadata, metrics, etc.)
  extensions?: Record<string, any>;
}


