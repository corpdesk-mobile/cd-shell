export interface MenuItem {
  label: string;
  itemType: "action" | "template" | "route";
  action?: () => void; // optional custom handler
  template?: () => string; // optional for resource loading
  route?: string; // optional, legacy
  icon?: IMenuIcon;
  controller?: any; // optional, legacy
  children?: MenuItem[];
}

export interface IMenuIcon {
  iconType: "fontawesome" | "svg" | "string";
  icon: string; // value/class/svg string
}

export interface IMenuAdapter {
  name: string;
  initialize(containerId: string, themeName: string): void;
  destroy?(): void;
}