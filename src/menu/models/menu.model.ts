export interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  children?: MenuItem[];
}

export interface IMenuAdapter {
  name: string;
  initialize(containerId: string, themeName: string): void;
  destroy?(): void;
}