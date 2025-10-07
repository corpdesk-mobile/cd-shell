import shellConfig from "../../../../../shell.config.json";
export class ThempeLoaderService {
    async loadTheme(themeId = "default") {
        console.debug("loadTheme(): loading theme ID:", themeId);
        const themePath = `/themes/${themeId}/theme.json`;
        const res = await fetch(themePath);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Theme fetch failed: ${res.status} ${res.statusText}. Body: ${errorText}`);
        }
        const theme = (await res.json());
        // Access control based on shell config
        const themeConfig = shellConfig.themeConfig;
        if (!themeConfig.accessibleThemes.includes(themeId)) {
            throw new Error(`Theme "${themeId}" is not accessible as per shell configuration.`);
        }
        // (Optional future feature) Authorization check
        if (theme.authorizationGuid && !this.isAuthorized(theme.authorizationGuid)) {
            throw new Error(`User is not authorized to use theme: ${theme.name}`);
        }
        this.applyTheme("default", theme);
        console.debug("Theme loaded successfully:", themeId);
    }
    // Example licensing/authorization function
    isAuthorized(authGuid) {
        // Placeholder logic — real implementation could check session, license keys, or vendor rules
        return true;
    }
    applyTheme(themeId, theme) {
        if (!theme.layout.sidebar?.visible) {
            const sidebar = document.getElementById("cd-sidebar");
            if (sidebar)
                sidebar.style.display = "none";
        }
        // Apply CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--cd-${key}-color`, value);
        });
        document.body.style.fontFamily = theme.font || "sans-serif";
        const logoEl = document.getElementById("cd-logo");
        if (logoEl && theme.logo) {
            logoEl.src = theme.logo;
        }
        // Inject CSS file
        const existingLink = document.getElementById("theme-css");
        const newHref = `/themes/${themeId}/theme.css`;
        if (existingLink) {
            existingLink.href = newHref;
        }
        else {
            const linkEl = document.createElement("link");
            linkEl.id = "theme-css";
            linkEl.rel = "stylesheet";
            linkEl.href = newHref;
            document.head.appendChild(linkEl);
        }
        document.body.className = ""; // Clear previous
        document.body.classList.add(`theme-${themeId}`);
    }
}
