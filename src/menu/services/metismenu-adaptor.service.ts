// src/menu/services/metismenu-adaptor.service.ts
import MetisMenu from "metismenujs";
import { loadStyle } from "../../utils/load-style.service";
import { loadScript } from "../../utils/load-script.service";
import { IMenuAdapter, IMenuIcon } from "../models/menu.model";
import { IThemeMenu } from "../../theme/models/themes.model";

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

  //   private transformForMetisMenu(root: Element): void {
  //     root.classList.remove("cd-menu-root");
  //     root.classList.add("metismenu");
  //     root.setAttribute("id", "menu");

  //     root.querySelectorAll(".cd-menu-item").forEach((li) => {
  //       const label = li.querySelector(".cd-menu-label");
  //       const route = li.getAttribute("data-route") || "#";
  //       const iconMetaEncoded = li.getAttribute("data-icon");
  //       const hasChildren = li.querySelector("ul");

  //       // Decode and parse icon config if present
  //       let iconMeta: IMenuIcon | null = null;
  //       if (iconMetaEncoded) {
  //         try {
  //           const iconJson = atob(iconMetaEncoded); // ✅ Decode from base64
  //           iconMeta = JSON.parse(iconJson); // ✅ Then parse JSON
  //         } catch (err) {
  //           console.warn("Failed to decode or parse icon metadata", err);
  //         }
  //       }

  //       // Replace <span> with <a>
  //       if (label) {
  //         const a = document.createElement("a");
  //         a.href = hasChildren ? "#" : `/${route}`;
  //         a.classList.add("menu-link");

  //         // Add icon if available
  //         if (iconMeta) {
  //           const iconEl = this.createIconElement(iconMeta);
  //           if (iconEl) a.appendChild(iconEl);
  //         }

  //         // Add label text
  //         const labelSpan = document.createElement("span");
  //         labelSpan.textContent = label.textContent || "";
  //         a.appendChild(labelSpan);

  //         // Add dropdown arrow if the item has children
  //         if (hasChildren) {
  //           a.classList.add("has-arrow");
  //           a.setAttribute("aria-expanded", "false");

  //           const arrow = document.createElement("i");
  //           arrow.classList.add("menu-arrow", "fa-solid", "fa-chevron-right");
  //           a.appendChild(arrow);
  //         }

  //         label.replaceWith(a);
  //       }

  //       li.classList.remove("cd-menu-item");
  //     });

  //     root.querySelectorAll("ul.cd-submenu").forEach((ul) => {
  //       ul.classList.remove("cd-submenu");
  //     });
  //   }
  private transformForMetisMenu(root: Element): void {
    root.classList.remove("cd-menu-root");
    root.classList.add("metismenu");
    root.setAttribute("id", "menu");

    root.querySelectorAll(".cd-menu-item").forEach((li) => {
      const label = li.querySelector(".cd-menu-label");
      const route = li.getAttribute("data-route") || "#";
      const iconMetaEncoded = li.getAttribute("data-icon");
      const hasChildren = li.querySelector("ul");

      let iconMeta: IMenuIcon | null = null;
      if (iconMetaEncoded) {
        try {
          const iconJson = atob(iconMetaEncoded);
          iconMeta = JSON.parse(iconJson);
        } catch (err) {
          console.warn("Failed to decode or parse icon metadata", err);
        }
      }

      if (label) {
        const a = document.createElement("a");
        a.href = hasChildren ? "#" : `/${route}`;
        a.classList.add("menu-link");

        // Add icon with spacing
        if (iconMeta) {
          const iconEl = this.createIconElement(iconMeta);
          if (iconEl) {
            iconEl.classList.add("menu-icon"); // ✅ spacing class added here
            a.appendChild(iconEl);
          }
        }

        // Add label text
        const labelSpan = document.createElement("span");
        labelSpan.textContent = label.textContent || "";
        a.appendChild(labelSpan);

        // Add dropdown arrow
        if (hasChildren) {
          a.classList.add("has-arrow");
          a.setAttribute("aria-expanded", "false");

          const arrow = document.createElement("i");
          arrow.classList.add("menu-arrow", "fa-solid", "fa-chevron-right");
          a.appendChild(arrow);
        }

        label.replaceWith(a);
      }

      li.classList.remove("cd-menu-item");
    });

    root.querySelectorAll("ul.cd-submenu").forEach((ul) => {
      ul.classList.remove("cd-submenu");
    });
  }

  //   private createIconElement(icon: IMenuIcon): HTMLElement | null {
  //     if (!icon.iconType) return null;

  //     switch (icon.iconType) {
  //       case "fontawesome": {
  //         const i = document.createElement("i");
  //         i.className = icon.icon; // e.g., "fa-solid fa-user"
  //         if (icon.iconClass) i.classList.add(...icon.iconClass.split(" "));
  //         if (icon.iconColor) i.style.color = icon.iconColor;
  //         if (icon.iconSize) i.style.fontSize = `${icon.iconSize}px`;
  //         return i;
  //       }

  //       case "svg": {
  //         const wrapper = document.createElement("span");
  //         wrapper.innerHTML = icon.icon;
  //         return wrapper.firstElementChild as HTMLElement;
  //       }

  //       case "string": {
  //         const span = document.createElement("span");
  //         span.textContent = icon.icon;
  //         return span;
  //       }

  //       default:
  //         return null;
  //     }
  //   }
  private createIconElement(icon: IMenuIcon): HTMLElement | null {
    if (!icon.iconType) return null;

    const themeMenu: IThemeMenu | undefined = this.getCurrentThemeMenu(); // Implement this to read from theme

    const iconSize = themeMenu?.iconSize ?? 14;
    const iconColor = themeMenu?.iconColor ?? "#444";

    switch (icon.iconType) {
      case "fontawesome": {
        const i = document.createElement("i");
        i.className = icon.icon;
        i.style.color = iconColor;
        i.style.fontSize = `${iconSize}px`;
        return i;
      }

      case "svg": {
        const wrapper = document.createElement("span");
        wrapper.innerHTML = icon.icon;
        const svgEl = wrapper.firstElementChild as HTMLElement | null;
        if (svgEl) {
          svgEl.style.color = iconColor;
          svgEl.style.width = `${iconSize}px`;
          svgEl.style.height = `${iconSize}px`;
        }
        return svgEl;
      }

      case "string": {
        const span = document.createElement("span");
        span.textContent = icon.icon;
        span.style.color = iconColor;
        span.style.fontSize = `${iconSize}px`;
        return span;
      }

      default:
        return null;
    }
  }

  private getCurrentThemeMenu(): IThemeMenu | undefined {
  try {
    const themeJson = localStorage.getItem("cd-theme"); // or wherever you cache the active theme
    const theme = themeJson ? JSON.parse(themeJson) : null;
    return theme?.layout?.sidebar?.menu;
  } catch {
    return undefined;
  }
}

}
