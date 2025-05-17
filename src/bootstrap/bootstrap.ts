import { ShellConfig } from "../base/models/IBase";
import { loadShellConfig } from "../config/shell.config";
import { loadThemeConfig } from "../config/themeConfig";
import { renderMenuWithSystem } from "../menu/services/menuRenderer";
import { loadModule } from "../module/services/module.service";
import { ITheme } from "../theme/models/themes.model";
import { loadTheme } from "../theme/services/theme-loader";
import { logger } from "../utils/logger";

export async function bootstrapShell() {
  logger.setLevel("debug");
  logger.debug("starting bootstrapShell()");
  logger.debug("bootstrapShell()/01:");
  const shellConfig: ShellConfig = await loadShellConfig();
  logger.debug("bootstrapShell()/02:");
  if (shellConfig.logLevel) {
    logger.setLevel(shellConfig.logLevel);
  }
  logger.debug("bootstrapShell()/03:");
  const themeConfig = await loadThemeConfig();
  logger.debug("bootstrapShell()/04:");
  logger.debug("bootstrapShell()/themeConfig:", themeConfig);

  // Set title
  document.title =
    shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";
  logger.debug("bootstrapShell()/05:");

  // Set logo
  const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
  logger.debug("bootstrapShell()/06:");
  if (logoEl && themeConfig.logo) {
    logoEl.src = themeConfig.logo;
  }
  logger.debug("bootstrapShell()/07:");
  // Apply theme color
  if (themeConfig.colors.primary) {
    document.documentElement.style.setProperty(
      "--theme-color",
      themeConfig.colors.primary
    );
  }
  logger.debug("bootstrapShell()/08:");

  // 👉 Load default module
  if (shellConfig.defaultModulePath) {
    logger.debug("bootstrapShell()/09:");
    const [ctx, moduleId] = shellConfig.defaultModulePath.split("/");
    logger.debug("bootstrapShell()/ctx:", ctx);
    logger.debug("bootstrapShell()/moduleId:", moduleId);
    logger.debug("bootstrapShell()/10:");

    // 👉 Render menu
    const moduleInfo = await loadModule(ctx, moduleId);
    if (moduleInfo.menu) {
      logger.debug("loadModule()/menu:", moduleInfo.menu);
      // 👉 Render menu
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      if (!resTheme.ok) {
        const errorText = await resTheme.text();
        throw new Error(
          `Theme fetch failed: ${resTheme.status} ${resTheme.statusText}. Body: ${errorText}`
        );
      }
      const theme = (await resTheme.json()) as ITheme;
      logger.debug("loadModule()/theme:", theme);
      renderMenuWithSystem(moduleInfo.menu, theme);
    } else {
      logger.debug("loadModule()/no menu to render");
    }
    logger.debug("bootstrapShell()/11:");
  }

  // load theme
  loadTheme("default");

  // toggle menu visibility
  const burger = document.getElementById("cd-burger")!;
  const sidebar = document.getElementById("cd-sidebar")!;
  const overlay = document.getElementById("cd-overlay")!;

  burger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("hidden");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.add("hidden");
  });
}

bootstrapShell().catch((err) => {
  console.error("[BOOTSTRAP ERROR]", err);
});
