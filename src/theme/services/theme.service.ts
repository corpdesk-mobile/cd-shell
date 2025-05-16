import { ITheme } from "../models/themes.model";

export class ThemeService {
  private static currentTheme: ITheme;

  static setActiveTheme(theme: ITheme) {
    this.currentTheme = theme;
  }

  static get layout() {
    return this.currentTheme?.layout || {};
  }
}
