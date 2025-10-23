/**
 * @file ui-system-descriptor.model.ts
 * @description
 * Defines the Universal UI Descriptor (UUD) structure used by all UI systems.
 * 
 * Each UI system (e.g., Material Design, Bootstrap) provides a descriptor.json file
 * that conforms to this model, allowing dynamic discovery, registration, and activation
 * via the UiSystemLoaderService.
 */

import { UiDomDescriptor } from "./ui-dom-descriptor.model";
import { UiThemeDescriptor } from "./ui-theme-descriptor.model";

export interface UiSystemDescriptor {
  id: string;                        // e.g. 'bootstrap', 'material', 'tailwind'
  name?: string;
  version?: string;
  cssUrl?: string | null;
  jsUrl?: string | null;
  tokenMap?: Record<string, string>; // global tokens (colors, spacing names)
  conceptMappings?: Record<string, UiSystemMapping>;
  renderRules?: Record<string, (domNode: UiDomDescriptor, props:any) => string>; // optional
  metadata?: Record<string, any>; // licensing, provider, aiHints
  // Add missing properties to match the second declaration
  description?: string;
  components?: UiComponentDescriptor[];
  containers?: UiContainerDescriptor[];
  theme?: UiThemeDescriptor;
  scripts?: string[];
  stylesheets?: string[];
  author?: string;
  license?: string;
  repository?: string;
  extensions?: Record<string, any>;
}

// export interface UiSystemDescriptor {
// id: string; // e.g. 'bootstrap-5'
// name?: string;
// version?: string;
// assetPath?: string; // relative public assets path
// tokenMap?: Record<string,string>;
// conceptMappings?: Record<string, UiSystemMapping>;
// renderRules?: Record<string, (domNode: UiDomDescriptor, props:any)=>string>;
// themes?: { name:string; file:string; default?: boolean }[];
// directiveMap?: Record<string,string>;
// metadata?: Record<string, any>;
// }


export interface UiSystemMapping {
  // how to map the canonical DOM node or concept to classes/attributes/render logic
  class?: string | ((props:any)=>string | string[]);
  tag?: string | ((props:any)=>string);
  attr?: Record<string,string | ((props:any)=>string)>;
  wrapper?: UiDomDescriptor | null; // optional wrapper structure
  render?: (domNode: UiDomDescriptor, props:any) => string; // optional explicit renderer
}

// export interface UiSystemMapping {
// class?: string | ((props:any)=>string | string[]);
// tag?: string | ((props:any)=>string);
// attr?: Record<string,string | ((props:any)=>string)>;
// wrapper?: UiDomDescriptor | null;
// render?: (domNode: UiDomDescriptor, props:any)=>string | HTMLElement;
// }

// export interface UiComponentDescriptor {
//   componentType: string;
//   bindings?: UiDataBindingDescriptor[];
//   events?: UiEventDescriptor[];
//   styleRefs?: string[];
// }

/**
 * Represents a basic DOM component or widget within the UI system.
 * These correspond to buttons, inputs, cards, modals, etc.
 */
export interface UiComponentDescriptor {
  id: string; // unique component identifier, e.g., "button", "input"
  label?: string; // human-readable label for admin tools
  htmlTag?: string; // base HTML element tag, e.g., "button", "div"
  classList?: string[]; // system-defined CSS classes
  attributes?: Record<string, string>; // default attributes
  events?: string[]; // supported event names, e.g., ["click", "change"]
  role?: string; // accessibility or ARIA role, e.g., "button"
  category?: string; // group under which this component falls, e.g., "form", "layout"
  variations?: Record<string, UiComponentDescriptor>; // variant mappings, e.g., "outlined", "filled"
}

export interface UiControlDescriptor extends UiComponentDescriptor {
  controlType: "input" | "button" | "select";
  defaultValue?: any;
  options?: any[];
  placeholder?: string;
  required?: boolean;
}

/**
 * Purpose:
    Groups multiple components into reusable UI composites (e.g., “LoginForm”).

    Responsibilities:
        Container for control descriptors.
        Defines internal layout and bindings.
 */
export interface UiCompositeDescriptor {}

export interface UiDataBindingDescriptor {
  source: string; // e.g. "user.name"
  target: string; // e.g. "value"
  direction?: "in" | "out" | "two-way";
}

export interface UiEventDescriptor {
  eventName: string; // e.g. 'click', 'submit'
  handler: string; // e.g. 'onSubmitForm'
  arguments?: any[];
}

/**
 * Represents a collection of related UI elements that together form a layout or structure.
 * For example, a "Card" might consist of "Header", "Body", and "Footer" sub-elements.
 */
export interface UiContainerDescriptor {
  id: string; // unique container ID
  label?: string;
  structure: Record<string, string[]>; // defines child-component relationships
  defaultComponents?: string[]; // components automatically loaded inside
}


