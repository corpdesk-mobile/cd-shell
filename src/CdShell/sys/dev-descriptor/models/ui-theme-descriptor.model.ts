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
// export interface UiThemeDescriptor {
//   id: string;
//   name: string;
//   cssPath?: string; // Path to theme CSS file
//   variables?: Record<string, string>; // CSS custom properties
//   compatibleWith?: string[]; // List of compatible UI systems

//   themeName: string;
//   colorScheme?: Record<string, string>;
//   typography?: Record<string, string>;
//   spacing?: Record<string, string>;
//   animations?: Record<string, string>;

// /* Duplicate interface removed. Properties merged above. */
//   scripts?: string[];
//   stylesheets?: string[];

//   // Integration metadata
//   author?: string;
//   license?: string;
//   repository?: string;

//   // Custom system extensions (AI metadata, metrics, etc.)
//   extensions?: Record<string, any>;
// }

export interface UiThemeDescriptor {
  /** * Primary identifier used for selection (e.g., 'dark', 'light', 'bootstrap-compact'). 
   * This is used as the <option value> in the dropdown.
   */
  id: string;

  /** * Human-readable name used for display (e.g., 'Dark Mode', 'Classic'). 
   * This is used as the visible text in the dropdown.
   */
  name: string;

  /** * Flag indicating if this is the default theme for its parent UI System. */
  isDefault?: boolean; // NEW PROPERTY

  /** * Array of paths to CSS files specific to this theme (relative to the public/assets/ path).
   * This is the asset the UiThemeLoaderService will inject into the <head>.
   */
  stylesheets?: string[]; 

  /** * Array of paths to JS files specific to this theme (e.g., initialization scripts).
   */
  scripts?: string[]; 

  /** * Key-value pairs for CSS custom properties that should be set globally 
   * (e.g., {'--primary-color': '#007bff'}).
   */
  variables?: Record<string, string>; 
  
  /** * Metadata defining the visual and behavioral aspects of the theme.
   * Consolidates color, typography, spacing, etc., into an optional structure.
   */
  metadata?: {
    colorScheme?: Record<string, string>;
    typography?: Record<string, string>;
    spacing?: Record<string, string>;
    animations?: Record<string, string>;
    // Any other high-level theme configurations
  };

  // --- Integration Metadata (optional) ---
  author?: string;
  license?: string;
  repository?: string;
  
  /** * Custom system extensions for AI, telemetry, etc.
   */
  extensions?: Record<string, any>;
}

// export interface UiThemeDescriptor {
//   id: string; // e.g., 'dark', 'light', 'bootstrap-compact'
//   name: string; // e.g., 'Dark Mode', 'Classic'
  
//   /** * Flag indicating if this is the default theme for its parent UI System. */
//   isDefault?: boolean; // NEW PROPERTY

//   stylesheets?: string[]; 
//   scripts?: string[]; 
//   variables?: Record<string, string>; 
//   metadata?: {
//     colorScheme?: Record<string, string>;
//     // ...
//   };
//   // ... (other properties) ...
// }


