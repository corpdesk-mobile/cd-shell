import { IMenuAdapter, MenuItem } from "../models/menu.model";
import type { ITheme } from "../../theme/models/themes.model";
import { MetisMenuAdapter } from "./metismenu-adaptor.service";
// import { logger } from "../../../utils/logger";

export class MenuService {
  currentAdapter: any = null;

  renderMenuWithSystem(
    menu: MenuItem[],
    theme: ITheme,
    containerId = "cd-sidebar"
  ) {
    // this.logger.debug("Starting renderMenuWithSystem()");
    // this.logger.debug("renderMenuWithSystem()/01");
    // Always render plain HTML
    this.renderPlainMenu(menu, containerId);

    // Initialize adapter if needed
    const system = theme?.layout?.sidebar?.menu?.menuSystem || "plain";
    const adapter = this.menuAdapterFactory(system);
    // this.logger.debug("renderMenuWithSystem()/adapter:", JSON.stringify(adapter));
    if (this.currentAdapter?.destroy) {
      // this.logger.debug("renderMenuWithSystem()/02");
      this.currentAdapter.destroy();
    }
    if (adapter) {
      // this.logger.debug("renderMenuWithSystem()/03");
      adapter.initialize(containerId, theme.id);
      this.currentAdapter = adapter;
    }
    // this.logger.debug("renderMenuWithSystem()/04");
  }

  renderPlainMenu(
    menu: MenuItem[],
    containerId: string = "sidebar",
    cdToken?: string
  ) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<ul class="cd-menu-root">${this.renderMenuHtml(
      menu
    )}</ul>`;
    // Attach handlers to <li> elements
    this.attachClickHandlers(container, menu, cdToken);
  }

  attachClickHandlers(
    container: HTMLElement,
    menu: MenuItem[],
    cdToken?: string
  ) {
    const items = container.querySelectorAll(".cd-menu-item");
    let index = 0;
    this.walkMenu(menu, container, items, index, cdToken);
  }

  walkMenu(
    menu: MenuItem[],
    parentEl: Element | HTMLElement,
    items: NodeListOf<Element>,
    index: number,
    cdToken: string
  ) {
    for (const item of menu) {
      const li = items[index++];
      if (li) {
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onMenuClick(item, cdToken);
        });
      }
      if (item.children?.length) {
        this.walkMenu(item.children, li, items, index, cdToken);
      }
    }
  }

  onMenuClick(item: MenuItem, cdToken?: string) {
    // this.logger.debug("onMenuClick()/01:", item);
    // this.logger.debug("onMenuClick()/item:", item);
    // this.logger.debug("Menu clicked:", item.label);

    if (item.itemType === "action") {
      // this.logger.debug("onMenuClick()/02:", item);
      if (item.action) {
        // this.logger.debug("Executing action for item:", item.label);
        item.action();
        return;
      }
    }

    if (item.itemType === "template") {
      // this.logger.debug("onMenuClick()/03:", item);
      if (item.template) {
        // this.logger.debug("Loading template for item:", item.label);
        this.loadResource({ cdToken, item });
        return;
      }
    }

    // this.logger.debug("onMenuClick()/04:", item);
    // Fallback to route if present
    if (item.itemType === "route" && item.route) {
      // this.logger.debug(`Navigating to route: ${item.route}`);
      if (item.route) {
        window.location.hash = item.route;
      }
    }
  }

  loadResource(options: { cdToken?: string; item?: MenuItem } = {}) {
    // this.logger.debug("loadResource()/01:");
    const { cdToken, item } = options;

    // Example authorization guard (placeholder)
    const isAuthorized = true; // Replace with real logic
    if (!isAuthorized) {
      // this.logger.debug("loadResource()/02:");
      // this.logger.warn("Access denied for", item?.label);
      return;
    }

    if (item?.template) {
      // this.logger.debug("loadResource()/03:");
      const html =
        typeof item.template === "function" ? item.template() : item.template;
      // this.logger.debug("Loaded HTML:", html);
      const contentEl = document.getElementById("cd-main-content");
      if (contentEl) {
        // this.logger.debug("loadResource()/04:");
        contentEl.innerHTML = html;
        const controller = item.controller;
        if (controller?.__setup && typeof controller.__setup === "function") {
          controller.__setup(); // 🔁 safely attach event listeners
        }
      }
    }

    // Optional lifecycle hook
    if (window.cdShell?.lifecycle?.onViewLoaded) {
      // this.logger.debug("loadResource()/05:");
      window.cdShell.lifecycle.onViewLoaded(item, cdToken);
    }
  }

  /**
   * Recursively renders the menu items into HTML.
   * @param menu - The menu items to render.
   * @returns The rendered HTML string.
   */

  renderMenuHtml(menu: MenuItem[]): string {
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
              ? `<ul class="cd-submenu">${this.renderMenuHtml(item.children!)}</ul>`
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
  menuAdapterFactory(system: string): IMenuAdapter | null {
    switch (system) {
      case "metismenu":
        return new MetisMenuAdapter();
      // Add more as needed
      case "plain":
      default:
        return null; // plain menu needs no JS enhancement
    }
  }
}
