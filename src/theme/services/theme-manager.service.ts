// src/theme/services/themeManager.service.ts
import { ITheme } from "../models/themes.model";
import shellConfig from "../../../public/shell.config.json";
import { loadTheme } from "./theme-loader";

export class ThemeManagerService {
  private config = shellConfig.themeConfig;

  async getAvailableThemes(): Promise<ITheme[]> {
    const themes: ITheme[] = [];

    for (const themeId of this.config.accessibleThemes) {
      try {
        const res = await fetch(`/themes/${themeId}/theme.json`);
        if (!res.ok) continue;

        const theme = await res.json() as ITheme;
        themes.push(theme);
      } catch (err) {
        console.warn(`Failed to load theme: ${themeId}`, err);
      }
    }

    return themes;
  }

  async applyTheme(themeId: string) {
    return await loadTheme(themeId);
  }

  getCurrentThemePath(): string {
    return this.config.currentThemePath;
  }
}

export const themeManager = new ThemeManagerService();
