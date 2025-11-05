// import { ITheme } from "../models/themes.model";
export class ThemeService {
    // Define static field with proper type
    static { this.currentTheme = null; }
    async loadThemeConfig(themeId = "default") {
        console.debug(`ThemeService::loadThemeConfig(${themeId})`);
        const res = await fetch(`/themes/${themeId}/theme.json`);
        if (!res.ok)
            throw new Error(`Failed to load theme config: ${res.statusText}`);
        const theme = (await res.json());
        ThemeService.setActiveTheme(theme);
        return theme;
    }
    static setActiveTheme(theme) {
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
    static get activeTheme() {
        return ThemeService.currentTheme;
    }
}
