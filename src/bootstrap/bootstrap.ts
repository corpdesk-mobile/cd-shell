import { ShellConfig } from "../base/models/IBase";
import { loadShellConfig } from "../config/shell.config";
import { loadThemeConfig } from "../config/themeConfig";
import { renderPlainMenu } from "../menu/services/menuRenderer";
import { loadModule } from "../module/services/module.service";
import { logger } from "../utils/logger";

export async function bootstrapShell() {
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
    await loadModule(ctx, moduleId);
    logger.debug("bootstrapShell()/11:");
  }

  

}


await bootstrapShell();
