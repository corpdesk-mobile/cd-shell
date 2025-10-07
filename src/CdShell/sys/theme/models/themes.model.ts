export interface ITheme {
  name: string;
  id: string;
  colors: IThemeColours;
  font: string;
  logo: string;
  licence:
    | "MIT"
    | "Apache-2.0"
    | "GPL-3.0"
    | "BSD-3-Clause"
    | "CC-BY-4.0"
    | "Commercial"
    | "Public Domain";
  themeGuid: string;
  layout: IThemeLayout;
  vendorGuid: string;
  authorizationGuid: string; // controlls access to end users by the vendor, developer and cd-developers. Can support isolated commercial system dedicated to themes
}

export interface IThemeColours {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface IThemeLayout {
  sidebar: IThemeSidebar;
  header?: IThemeHeader;
  footer?: IThemeFooter;
  ads?: IThemeAds;
}

export interface IThemeHeader {
  visible?: boolean;
  showNotifications?: boolean;
  showUserDropdown?: boolean;
  height?: string;
}

export interface IThemeFooter {
  visible?: boolean;
  height?: string;
}

export interface IThemeSidebar {
  visible?: boolean;
  menu?: IThemeMenu;
}

export interface IThemeMenu {
  menuSystem?: "metismenu" | "plain" | "custom" | "material-design" | "bootstrap";
  menuType?: "vertical" | "horizontal";
  menuPosition?: "top" | "bottom" | "left" | "right";
  menuWidth?: string;
  menuHeight?: string;
  menuBackground?: string;
  menuTextColor?: string;
  iconSize?: number; // e.g., 14
  iconColor?: string; // e.g., "#444"
}

export interface IThemeAds {
  enabled: boolean;
  position: "top" | "bottom" | "left" | "right";
  width: string;
  height: string;
  background: string;
  textColor: string;
  dismissible: boolean;
}
