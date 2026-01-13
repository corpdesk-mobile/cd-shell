import { ConfigService } from "../../moduleman/services/config.service";
import { diag_css } from "../../utils/diagnosis";
export class UiThemeLoaderService {
    static { this.ACTIVE_THEME_KEY = "cd-active-theme-id"; }
    static { this.ACTIVE_FORM_VARIANT_KEY = "cd-active-form-variant"; }
    static { this.instance = null; }
    constructor(sysCache) {
        this.configService = ConfigService.getInstance();
        this.sysCache = sysCache;
    }
    static getInstance(sysCache) {
        if (!UiThemeLoaderService.instance) {
            if (!sysCache)
                throw new Error("UiThemeLoaderService.getInstance requires SysCacheService on first call.");
            UiThemeLoaderService.instance = new UiThemeLoaderService(sysCache);
        }
        return UiThemeLoaderService.instance;
    }
    /**
     * Fetch available themes:
     * - Read uiConfig.accessibleThemes or infer
     * - For each theme id, fetch /themes/<id>/theme.json (descriptor)
     * - Return shape: { themes: [{id,name}], variants: [...], descriptors: [full objects], uiConfig }
     */
    async fetchAvailableThemes(uiConfig) {
        console.log("[UiThemeLoaderService][fetchAvailableThemes] start", uiConfig);
        const accessible = (uiConfig && uiConfig.accessibleThemes) ||
            this.configService.config?.themeConfig?.accessibleThemes || [
            "default",
            "dark",
        ];
        const descriptors = [];
        for (const id of accessible) {
            const path = `/themes/${id}/theme.json`;
            try {
                const res = await fetch(path);
                if (!res.ok) {
                    console.warn(`[UiThemeLoaderService] theme descriptor not found: ${path}`);
                    continue;
                }
                const desc = await res.json();
                descriptors.push(desc);
            }
            catch (err) {
                console.warn(`[UiThemeLoaderService] error fetching theme descriptor ${path}`, err);
            }
        }
        // produce lightweight lists
        const themes = descriptors.map((d) => ({ id: d.id, name: d.name }));
        const variants = [
            { id: "standard", name: "Standard" },
            { id: "compact", name: "Compact" },
            { id: "floating", name: "Floating" },
        ];
        return {
            themes,
            variants,
            descriptors,
            uiConfig,
        };
    }
    /**
     * loadThemeById - injects ONLY the theme override CSS (theme.css)
     * base + index should be loaded by Main (or UiSystemLoader) earlier
     */
    async loadThemeById(themeId) {
        diag_css("[UiThemeLoaderService.loadThemeById] start", { themeId });
        // remove previous theme links (data-cd-theme)
        document.querySelectorAll("link[data-cd-theme]").forEach((l) => l.remove());
        const desc = this.getThemeDescriptor(themeId);
        if (!desc) {
            diag_css("[UiThemeLoaderService.loadThemeById] descriptor not found", {
                themeId,
            });
            // still try fallback path
            const fallback = `/themes/${themeId}/theme.css`;
            await this.injectStyle(fallback, themeId, "theme");
            return;
        }
        // prefer descriptor.css or descriptor.css path
        const cssPath = desc.css || desc.cssPath || `/themes/${themeId}/theme.css`;
        await this.injectStyle(cssPath, themeId, "theme");
        diag_css("[UiThemeLoaderService.loadThemeById] loaded", {
            themeId,
            cssPath,
        });
    }
    /**
     * Return full descriptor previously cached in SysCacheService
     */
    getThemeDescriptor(themeId) {
        const descriptors = this.sysCache.get("themeDescriptors") || [];
        return descriptors.find((d) => d.id === themeId);
    }
    async loadFormVariant(formType = "standard") {
        document
            .querySelectorAll("link[data-cd-form]")
            .forEach((el) => el.remove());
        const path = `/themes/common/forms/variants/cd-form-${formType}.css`;
        await this.injectStyle(path, formType, "form");
    }
    async injectStyle(path, key, type = "theme") {
        return new Promise((resolve, reject) => {
            try {
                const head = document.head || document.getElementsByTagName("head")[0];
                if (!head)
                    return reject(new Error("document.head missing"));
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = path;
                if (type === "theme")
                    link.setAttribute("data-cd-theme", key);
                else
                    link.setAttribute("data-cd-form", key);
                link.onload = () => resolve();
                link.onerror = (ev) => reject(new Error(`failed to load ${path}`));
                // preserve order: append to head end
                head.insertAdjacentElement("beforeend", link);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getActiveThemeId() {
        console.log(`[UiThemeLoaderService][getActiveThemeId] start.`);
        return localStorage.getItem(UiThemeLoaderService.ACTIVE_THEME_KEY) || "";
    }
    getActiveFormVariantId() {
        return (localStorage.getItem(UiThemeLoaderService.ACTIVE_FORM_VARIANT_KEY) ||
            "standard");
    }
}
