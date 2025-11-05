// import { ITheme } from "../models/themes.model";

// export class ThemeService {
//   private static currentTheme: ITheme;

//   static setActiveTheme(theme: ITheme) {
//     this.currentTheme = theme;
//   }

//   static get layout() {
//     return this.currentTheme?.layout || {};
//   }

//   async loadThemeConfig(): Promise<ITheme> {
//     console.debug("ThemeService::loadThemeConfig(): 01");
//     const res = await fetch("/themes/default/theme.json");
//     console.debug("ThemeService::loadThemeConfig(): 01");
//     console.debug("ThemeService::loadThemeConfig()/res:", res);
//     if (!res.ok) {
//       console.debug("ThemeService::loadThemeConfig(): 02");
//       throw new Error(
//         `ThemeService::loadThemeConfig:Failed to load shell config: ${res.statusText}`
//       );
//     }
//     console.debug("ThemeService::loadThemeConfig(): 03");
//     return res.json() as Promise<ITheme>;
//   }
// }

import { ITheme } from "../models/themes.model";

export class ThemeService {
  // Define static field with proper type
  static currentTheme: ITheme | null = null;

  async loadThemeConfig(themeId = "default"): Promise<ITheme> {
    console.debug(`ThemeService::loadThemeConfig(${themeId})`);
    const res = await fetch(`/themes/${themeId}/theme.json`);
    if (!res.ok) throw new Error(`Failed to load theme config: ${res.statusText}`);

    const theme = (await res.json()) as ITheme;
    ThemeService.setActiveTheme(theme);
    return theme;
  }

  static setActiveTheme(theme: ITheme) {
    ThemeService.currentTheme = theme;

    // Apply colors as CSS variables
    if (theme?.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        const val = String(value);
        document.documentElement.style.setProperty(`--cd-${key}-color`, val);
      });
    }
  }

  static get layout() {
    return ThemeService.currentTheme?.layout || {};
  }

  static get activeTheme(): ITheme | null {
    return ThemeService.currentTheme;
  }
}


