export interface ITheme {
  name: string;
  colors: IThemeColours;
  font: string;
  logo: string;
}

export interface IThemeColours {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}
