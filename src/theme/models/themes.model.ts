export interface ITheme {
  name: string;
  colors: IThemeColours;
  font: string;
  logo: string;
  licence: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'CC-BY-4.0' | 'Commercial' | 'Public Domain';
  themeGuid: string;
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
