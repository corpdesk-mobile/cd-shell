// // src/menu/adapters/metis-menu.adapter.ts

// import { IMenuAdapter } from "../models/menu.model";
// import MetisMenu from 'metismenujs';

// export class MetisMenuAdapter implements IMenuAdapter {
//   name = 'metismenu';
//   private instance: any;

//   initialize(containerId: string): void {
//     const selector = `#${containerId} ul.cd-menu-root`;
//     this.instance = new MetisMenu(selector);
//   }

//   destroy(): void {
//     if (this.instance && typeof this.instance.dispose === 'function') {
//       this.instance.dispose();
//     }
//   }
// }

// src/menu/services/metismenu-adaptor.service.ts
import MetisMenu from "metismenujs";
import { loadStyle } from "../../utils/load-style.service";
import { loadScript } from "../../utils/load-script.service";
import { IMenuAdapter } from "../models/menu.model";
// import { loadStyle } from '../../utils/load-style';

// export class MetisMenuAdapter {
//   name = "metismenu";
//   private instance: any;

//   async initialize(containerId: string) {
//     // Dynamically load style and script
//     await loadStyle('https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.css');
//     await loadScript('https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.js');
//     const el = document.getElementById(containerId)?.querySelector("ul");
//     if (!el) return;

//     this.instance = new MetisMenu(el);
//   }

//   destroy() {
//     if (this.instance?.dispose) {
//       this.instance.dispose(); // If using Bootstrap-style plugins
//     }
//     this.instance = null;
//   }
// }

export class MetisMenuAdapter implements IMenuAdapter {
  name: string;
  private instance: MetisMenu | null = null;

  async initialize(containerId: string, themeName: string): Promise<void> {
    // Dynamically load style and script
    await loadStyle(
      "https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.css"
    );
    await loadScript(
      "https://cdn.jsdelivr.net/npm/metismenujs/dist/metismenujs.min.js"
    );
    await loadStyle(`/themes/${themeName}/menu-systems/metismenu.css`);

    const container = document.getElementById(containerId);
    if (!container) return;

    const root = container.querySelector("ul.cd-menu-root");
    if (!root) return;

    // Transform the neutral structure into MetisMenu-compatible
    this.transformForMetisMenu(root);

    // Initialize MetisMenu
    this.instance = new MetisMenu("#menu");
  }

  destroy(): void {
    // Cleanup logic for MetisMenu if needed
  }

  private transformForMetisMenu(root: Element): void {
    root.classList.remove("cd-menu-root");
    root.classList.add("metismenu");
    root.setAttribute("id", "menu");

    root.querySelectorAll(".cd-menu-item").forEach((li) => {
      const label = li.querySelector(".cd-menu-label");
      const route = li.getAttribute("data-route") || "#";
      const hasChildren = li.querySelector("ul");

      // Replace span with <a>
      if (label) {
        const a = document.createElement("a");
        a.innerHTML = label.innerHTML;
        a.href = hasChildren ? "#" : `/${route}`;
        if (hasChildren) {
          a.classList.add("has-arrow");
          a.setAttribute("aria-expanded", "false");
        }
        label.replaceWith(a);
      }

      // Remove helper classes
      li.classList.remove("cd-menu-item");
    });

    root.querySelectorAll("ul.cd-submenu").forEach((ul) => {
      ul.classList.remove("cd-submenu");
    });
  }
}
