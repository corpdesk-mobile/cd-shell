import shellConfig from "../../../../../public/shell.config.json";
import { ThempeLoaderService } from "./theme-loader.service";
// import { loadTheme } from "./theme-loader.service";
export class ThemeManagerService {
    config = shellConfig.themeConfig;
    svThemeLoader = new ThempeLoaderService();
    async getAvailableThemes() {
        const themes = [];
        for (const themeId of this.config.accessibleThemes) {
            try {
                const res = await fetch(`/themes/${themeId}/theme.json`);
                if (!res.ok)
                    continue;
                const theme = await res.json();
                themes.push(theme);
            }
            catch (err) {
                console.warn(`Failed to load theme: ${themeId}`, err);
            }
        }
        return themes;
    }
    async applyTheme(themeId) {
        return await this.svThemeLoader.loadTheme(themeId);
    }
    getCurrentThemePath() {
        return this.config.currentThemePath;
    }
}
export const themeManager = new ThemeManagerService();
