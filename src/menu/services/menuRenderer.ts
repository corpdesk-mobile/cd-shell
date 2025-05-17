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
  containerId: string = "sidebar",
  cdToken?: string
) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<ul class="cd-menu-root">${renderMenuHtml(menu)}</ul>`;
  // Attach handlers to <li> elements
  attachClickHandlers(container, menu, cdToken);
}

function attachClickHandlers(
  container: HTMLElement,
  menu: MenuItem[],
  cdToken?: string
) {
  const items = container.querySelectorAll(".cd-menu-item");
  let index = 0;

  function walkMenu(menu: MenuItem[], parentEl: Element | HTMLElement) {
    for (const item of menu) {
      const li = items[index++];
      if (li) {
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          onMenuClick(item, cdToken);
        });
      }
      if (item.children?.length) {
        walkMenu(item.children, li);
      }
    }
  }

  walkMenu(menu, container);
}

function onMenuClick(item: MenuItem, cdToken?: string) {
  logger.debug("onMenuClick()/01:", item);
  logger.debug("onMenuClick()/item:", item);
  logger.debug("Menu clicked:", item.label);

  if (item.itemType === "action") {
    logger.debug("onMenuClick()/02:", item);
    if (item.action) {
      logger.debug("Executing action for item:", item.label);
      item.action();
      return;
    }
  }

  if (item.itemType === "template") {
    logger.debug("onMenuClick()/03:", item);
    if (item.template) {
      logger.debug("Loading template for item:", item.label);
      loadResource({ cdToken, item });
      return;
    }
  }

  logger.debug("onMenuClick()/04:", item);
  // Fallback to route if present
  if (item.itemType === "route" && item.route) {
    logger.debug(`Navigating to route: ${item.route}`);
    if (item.route) {
      window.location.hash = item.route;
    }
  }
}

function loadResource(options: { cdToken?: string; item?: MenuItem } = {}) {
  logger.debug("loadResource()/01:");
  const { cdToken, item } = options;

  // Example authorization guard (placeholder)
  const isAuthorized = true; // Replace with real logic
  if (!isAuthorized) {
    logger.debug("loadResource()/02:");
    logger.warn("Access denied for", item?.label);
    return;
  }

  if (item?.template) {
    logger.debug("loadResource()/03:");
    const html =
      typeof item.template === "function" ? item.template() : item.template;
    logger.debug("Loaded HTML:", html);
    const contentEl = document.getElementById("cd-main-content");
    if (contentEl) {
      logger.debug("loadResource()/04:");
      contentEl.innerHTML = html;
      const controller = item.controller;
      if (controller?.__setup && typeof controller.__setup === "function") {
        controller.__setup(); // 🔁 safely attach event listeners
      }
    }
  }

  // Optional lifecycle hook
  if (window.cdShell?.lifecycle?.onViewLoaded) {
    logger.debug("loadResource()/05:");
    window.cdShell.lifecycle.onViewLoaded(item, cdToken);
  }
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
      const route = item.route || "";
      const encodedIcon = item.icon ? btoa(JSON.stringify(item.icon)) : "";

      return `
        <li 
          class="cd-menu-item" 
          data-route="${route}" 
          ${encodedIcon ? `data-icon="${encodedIcon}"` : ""}
        >
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
