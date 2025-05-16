import { IMenuAdapter, MenuItem } from "../models/menu.model";
import type { ITheme } from "../../theme/models/themes.model";
import { MetisMenuAdapter } from "./metismenu-adaptor.service";
import { logger } from "../../utils/logger";

let currentAdapter: any = null;

export function renderMenuWithSystem(
  menu: MenuItem[],
  theme: ITheme,
  containerId = "cd-sidebar"
) {
  logger.debug("Starting renderMenuWithSystem()");
  logger.debug("renderMenuWithSystem()/01");
  // Always render plain HTML
  renderPlainMenu(menu, containerId);

  // Initialize adapter if needed
  const system = theme?.layout?.sidebar?.menu?.menuSystem || "plain";
  const adapter = menuAdapterFactory(system);
  logger.debug("renderMenuWithSystem()/adapter:", JSON.stringify(adapter));
  if (currentAdapter?.destroy) {
    logger.debug("renderMenuWithSystem()/02");
    currentAdapter.destroy();
  }
  if (adapter) {
    logger.debug("renderMenuWithSystem()/03");
    adapter.initialize(containerId, theme.id);
    currentAdapter = adapter;
  }
  logger.debug("renderMenuWithSystem()/04");
}

export function renderPlainMenu(
  menu: MenuItem[],
  containerId: string = "sidebar"
) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<ul class="cd-menu-root">${renderMenuHtml(menu)}</ul>`;
}

/**
 * Recursively renders the menu items into HTML.
 * @param menu - The menu items to render.
 * @returns The rendered HTML string.
 */
function renderMenuHtml(menu: MenuItem[]): string {
  return menu
    .map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      return `
        <li class="cd-menu-item" data-route="${item.route || ""}">
          <span class="cd-menu-label">${item.label}</span>
          ${
            hasChildren
              ? `<ul class="cd-submenu">${renderMenuHtml(item.children!)}</ul>`
              : ""
          }
        </li>
      `;
    })
    .join("");
}

/**
 * Factory function to create a menu adapter based on the system type.
 * @param system - The system type (e.g., "metismenu", "plain").
 * @returns An instance of the corresponding menu adapter or null if no adapter is needed.
 */
export function menuAdapterFactory(system: string): IMenuAdapter | null {
  switch (system) {
    case "metismenu":
      return new MetisMenuAdapter();
    // Add more as needed
    case "plain":
    default:
      return null; // plain menu needs no JS enhancement
  }
}
