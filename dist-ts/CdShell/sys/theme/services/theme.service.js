export class ThemeService {
    static setActiveTheme(theme) {
        this.currentTheme = theme;
    }
    static get layout() {
        return this.currentTheme?.layout || {};
    }
    async loadThemeConfig() {
        console.debug("ThemeService::loadThemeConfig(): 01");
        const res = await fetch("/themes/default/theme.json");
        console.debug("ThemeService::loadThemeConfig(): 01");
        console.debug("ThemeService::loadThemeConfig()/res:", res);
        if (!res.ok) {
            console.debug("ThemeService::loadThemeConfig(): 02");
            throw new Error(`ThemeService::loadThemeConfig:Failed to load shell config: ${res.statusText}`);
        }
        console.debug("ThemeService::loadThemeConfig(): 03");
        return res.json();
    }
}
