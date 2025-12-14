// This file is responsible for bootstrapping the shell application
import { ITheme } from "../models/themes.model";
import shellConfig from "../../../../../shell.config.json";
import { IShellConfig } from "../../moduleman/models/config.model";
// import { ThemeConfig, ThemeShellConfig } from "../../base";
// import { ShellConfig } from "../../moduleman/models/config.model";

// export class ThempeLoaderService {
//   async loadTheme(themeId: string = "default") {
//     console.debug("loadTheme(): loading theme ID:", themeId);
//     const themePath = `/themes/${themeId}/theme.json`;

//     const res = await fetch(themePath);

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(
//         `Theme fetch failed: ${res.status} ${res.statusText}. Body: ${errorText}`
//       );
//     }

//     const theme = (await res.json()) as ITheme;

//     // Access control based on shell config
//     const themeConfig: ThemeConfig = shellConfig.themeConfig;
//     if (!themeConfig.accessibleThemes.includes(themeId)) {
//       throw new Error(
//         `Theme "${themeId}" is not accessible as per shell configuration.`
//       );
//     }

//     // (Optional future feature) Authorization check
//     if (theme.authorizationGuid && !this.isAuthorized(theme.authorizationGuid)) {
//       throw new Error(`User is not authorized to use theme: ${theme.name}`);
//     }

//     this.applyTheme("default", theme);

//     console.debug("Theme loaded successfully:", themeId);
//   }

//   // Example licensing/authorization function
//   isAuthorized(authGuid: string): boolean {
//     // Placeholder logic — real implementation could check session, license keys, or vendor rules
//     return true;
//   }

//   applyTheme(themeId: string, theme: ITheme) {
//     if (!theme.layout.sidebar?.visible) {
//       const sidebar = document.getElementById("cd-sidebar");
//       if (sidebar) sidebar.style.display = "none";
//     }
//     // Apply CSS variables
//     Object.entries(theme.colors).forEach(([key, value]) => {
//       document.documentElement.style.setProperty(`--cd-${key}-color`, value);
//     });

//     document.body.style.fontFamily = theme.font || "sans-serif";

//     const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
//     if (logoEl && theme.logo) {
//       logoEl.src = theme.logo;
//     }

//     // Inject CSS file
//     const existingLink = document.getElementById(
//       "theme-css"
//     ) as HTMLLinkElement;
//     const newHref = `/themes/${themeId}/theme.css`;

//     if (existingLink) {
//       existingLink.href = newHref;
//     } else {
//       const linkEl = document.createElement("link");
//       linkEl.id = "theme-css";
//       linkEl.rel = "stylesheet";
//       linkEl.href = newHref;
//       document.head.appendChild(linkEl);
//     }

//     document.body.className = ""; // Clear previous
//     document.body.classList.add(`theme-${themeId}`);
//   }
// }

// import { ThemeService } from "./theme.service.js";

export class ThemeLoaderService {
  async loadTheme(themeId: string = "default") {
    console.debug("ThemeLoaderService: Loading theme ID:", themeId);

    const themePath = `/themes/${themeId}/theme.json`;
    const res = await fetch(themePath);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Theme fetch failed: ${res.status} ${res.statusText}. Body: ${errorText}`
      );
    }

    const theme = (await res.json()) as ITheme;

    // ✅ Fetch shellConfig safely
    const shellConfig = (window as any).shellConfig as IShellConfig | undefined;
    if (!shellConfig) {
      console.warn("ThemeLoaderService: shellConfig not found in window context.");
    } else {
      const themeConfig = shellConfig.themeConfig;
      if (
        themeConfig?.accessibleThemes &&
        !themeConfig.accessibleThemes.includes(themeId)
      ) {
        throw new Error(
          `Theme "${themeId}" is not accessible as per shell configuration.`
        );
      }
    }

    // Optional licensing check
    if (theme.authorizationGuid && !this.isAuthorized(theme.authorizationGuid)) {
      throw new Error(`User is not authorized to use theme: ${theme.name}`);
    }

    this.applyTheme(themeId, theme);

    console.debug("ThemeLoaderService: Theme loaded successfully:", themeId);
  }

  // Example licensing/authorization function
  isAuthorized(authGuid: string): boolean {
    // Placeholder logic — real implementation could check session, license keys, or vendor rules
    return true;
  }

  applyTheme(themeId: string, theme: ITheme) {
    // Sidebar visibility
    if (theme.layout.sidebar?.visible === false) {
      const sidebar = document.getElementById("cd-sidebar");
      if (sidebar) sidebar.style.display = "none";
    }

    // ✅ Apply CSS variables from theme colors
    Object.entries(theme.colors || {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--cd-${key}-color`, value);
    });

    // ✅ Font
    document.body.style.fontFamily = theme.font || "sans-serif";

    // ✅ Logo
    const logoEl = document.getElementById("cd-logo") as HTMLImageElement | null;
    if (logoEl && theme.logo) {
      logoEl.src = theme.logo;
    }

    // ✅ Inject or update theme CSS link
    const newHref = `/themes/${themeId}/theme.css`;
    let linkEl = document.getElementById("theme-css") as HTMLLinkElement | null;

    if (linkEl) {
      linkEl.href = newHref;
    } else {
      linkEl = document.createElement("link");
      linkEl.id = "theme-css";
      linkEl.rel = "stylesheet";
      linkEl.href = newHref;
      document.head.appendChild(linkEl);
    }

    // ✅ Apply theme class to <body>
    document.body.className = ""; // clear previous classes
    document.body.classList.add(`theme-${themeId}`);
  }
}


