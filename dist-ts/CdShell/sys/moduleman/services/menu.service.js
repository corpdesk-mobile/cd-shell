import { MetisMenuAdapter } from "./metismenu-adaptor.service";
import { ControllerCacheService } from "./controller-cache.service";
import { inspect } from "util";
// import { logger } from "../../../utils/logger";
export class MenuService {
    constructor() {
        this.currentAdapter = null;
        this._activeController = null; // 💡 NEW: Tracks the current controller instance
        this.activeController = null;
    }
    renderMenuWithSystem(menu, theme, containerId = "cd-sidebar") {
        console.debug("Starting renderMenuWithSystem()");
        console.debug("renderMenuWithSystem()/01");
        // Always render plain HTML
        this.renderPlainMenu(menu, containerId);
        // Initialize adapter if needed
        const system = theme?.layout?.sidebar?.menu?.menuSystem || "plain";
        const adapter = this.menuAdapterFactory(system);
        console.debug("renderMenuWithSystem()/adapter:", JSON.stringify(adapter));
        if (this.currentAdapter?.destroy) {
            console.debug("renderMenuWithSystem()/02");
            this.currentAdapter.destroy();
        }
        if (adapter) {
            console.debug("renderMenuWithSystem()/03");
            adapter.initialize(containerId, theme.id);
            this.currentAdapter = adapter;
        }
        console.debug("renderMenuWithSystem()/04");
    }
    renderPlainMenu(menu, containerId = "sidebar", cdToken) {
        const container = document.getElementById(containerId);
        if (!container)
            return;
        console.log(`MenuService::renderPlainMenu()/menu:`, this.renderMenuHtml(menu));
        container.innerHTML = `<ul class="cd-menu-root">${this.renderMenuHtml(menu)}</ul>`;
        // Attach handlers to <li> elements
        this.attachClickHandlers(container, menu, cdToken);
    }
    attachClickHandlers(container, menu, cdToken) {
        const links = container.querySelectorAll(".cd-menu-link");
        links.forEach((linkEl) => {
            linkEl.addEventListener("click", (e) => {
                e.preventDefault(); // prevent `#` navigation
                e.stopPropagation();
                const id = linkEl.getAttribute("data-id");
                if (!id)
                    return;
                const item = this.findMenuItemById(menu, id);
                if (item)
                    this.onMenuClick(item, cdToken);
            });
        });
    }
    findMenuItemById(menu, id) {
        for (const item of menu) {
            if (item.menuId === id)
                return item;
            if (item.children) {
                const found = this.findMenuItemById(item.children, id);
                if (found)
                    return found;
            }
        }
        return null;
    }
    walkMenu(menu, parentEl, items, index, cdToken) {
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
    // onMenuClick(item: MenuItem, cdToken?: string) {
    //   console.debug(`Menu clicked → ID: ${item.menuId}, Label: ${item.label}`);
    //   console.debug(
    //     "MenuService:onMenuClick()/item:",
    //     inspect(item, { depth: 2 })
    //   );
    //   if (item.itemType === "action" && item.action) {
    //     item.action();
    //     return;
    //   }
    //   if (item.itemType === "template" && item.template) {
    //     this.loadResource({ cdToken, item });
    //     return;
    //   }
    //   if (item.itemType === "route" && item.route) {
    //     this.loadResource({ cdToken, item });
    //     return;
    //   }
    //   console.warn("Unhandled menu item type:", item.itemType);
    // }
    onMenuClick(item, cdToken) {
        console.debug(`Menu clicked → ID: ${item.menuId}, Label: ${item.label}`);
        console.debug("MenuService:onMenuClick()/item:", inspect(item, { depth: 2 }));
        // 🔹 CASE 1: ACTION ITEMS (explicit actions)
        if (item.itemType === "action" && item.action) {
            console.debug(`[MenuService] Executing action for '${item.label}'`);
            item.action();
            return;
        }
        // 🔹 CASE 2: ROUTE ITEMS (these are the only ones that redraw content)
        if (item.itemType === "route" && item.route && item.controller) {
            console.debug(`[MenuService] Loading route content for '${item.label}'`);
            this.loadResource({ cdToken, item });
            return;
        }
        // 🔹 CASE 3: TEMPLATE ITEMS (legacy or static templates)
        if (item.itemType === "template" && item.template && item.controller) {
            console.debug(`[MenuService] Loading template for '${item.label}'`);
            this.loadResource({ cdToken, item });
            return;
        }
        // 🔹 CASE 4: CONTAINER ITEMS (pure menu parents with children)
        if (item.children && item.children.length > 0) {
            console.debug(`[MenuService] Toggling menu node expansion for '${item.label}'`);
            // ✅ Expand/collapse behavior
            const nodeEl = document
                .querySelector(`[data-id="${item.menuId}"]`)
                ?.closest("li.cd-menu-item");
            if (nodeEl) {
                nodeEl.classList.toggle("expanded");
                const subMenu = nodeEl.querySelector(".cd-submenu");
                if (subMenu)
                    subMenu.classList.toggle("open");
            }
            // 🔸 NOTE: Do NOT clear or re-render main content area.
            return;
        }
        // 🔹 CASE 5: UNKNOWN TYPE
        console.warn(`[MenuService] Unhandled menu item type '${item.itemType}' for label '${item.label}'`);
    }
    async loadResource(options = {}) {
        console.log("MenuService::loadResource()/start...");
        console.log("[MenuService][loadResource] options:", options);
        const { cdToken, item } = options;
        if (!item) {
            console.error("MenuService.loadResource() called without a valid MenuItem.");
            return;
        }
        const cacheService = ControllerCacheService.getInstance();
        const contentEl = document.getElementById("cd-main-content");
        let targetController;
        // --- 1️⃣ Deactivate currently active controller ---
        if (this.activeController &&
            typeof this.activeController.__deactivate === "function") {
            console.log("MenuService::loadResource()/01: Executing __deactivate() on active controller");
            await this.activeController.__deactivate();
        }
        // --- 2️⃣ Retrieve or initialize the target controller (now auto-runs __init + __setup) ---
        console.log("MenuService::loadResource()/02: Retrieving controller via cache service");
        targetController = await cacheService.getOrInitializeController(item.route || `${item.moduleId}-${item.label}`, item.controller);
        if (!targetController) {
            console.error(`[MenuService] Failed to initialize controller for route: ${item.route}`);
            return;
        }
        // --- 3️⃣ Safety Guard: Wait until essential loaders exist ---
        let waitCount = 0;
        while ((!targetController.uiSystemLoader || !targetController.svCdAdmin) &&
            waitCount < 10) {
            console.warn(`[MenuService] Waiting for controller services to initialize... attempt ${waitCount + 1}`);
            await new Promise((res) => setTimeout(res, 20)); // 20ms delay
            waitCount++;
        }
        if (contentEl) {
            console.log("MenuService::loadResource()/03: Injecting template into DOM");
            let html = "";
            if (typeof item.template === "function") {
                html = item.template.call(targetController);
            }
            else if (typeof targetController.__template === "function") {
                html = targetController.__template.call(targetController);
            }
            else {
                html = item.template || "";
            }
            contentEl.innerHTML = html;
        }
        // --- 5️⃣ Activate Controller (DOM Binding Phase) ---
        if (typeof targetController.__activate === "function") {
            console.log("MenuService::loadResource()/04: Executing __activate()");
            await targetController.__activate();
        }
        // --- 6️⃣ AfterInit Hook (Final View Sync Phase) ---
        if (typeof targetController.__afterInit === "function") {
            console.log("MenuService::loadResource()/05: Executing __afterInit()");
            await targetController.__afterInit();
        }
        // --- 7️⃣ Mark as active controller ---
        this.activeController = targetController;
        console.log("MenuService::loadResource()/end");
    }
    /**
     * Retrieves the controller instance currently active in the main content area.
     */
    getActiveController() {
        return this._activeController;
    }
    /**
     * Sets the controller instance that will be considered 'active'.
     */
    setActiveController(controller) {
        this._activeController = controller;
    }
    /**
     * Recursively renders the menu items into HTML.
     * @param menu - The menu items to render.
     * @returns The rendered HTML string.
     */
    renderMenuHtml(menu) {
        return menu
            .map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const encodedIcon = item.icon ? btoa(JSON.stringify(item.icon)) : "";
            const itemType = item.itemType || "route";
            const route = item.route || "";
            const itemId = item.menuId ||
                `auto-${index}-${Math.random().toString(36).slice(2, 8)}`;
            // 🔁 Ensure stable id for later lookup
            item.menuId = itemId;
            return `
        <li 
          id="menu-item-${itemId}"
          class="cd-menu-item" 
          data-id="${itemId}"
          data-type="${itemType}"
          data-route="${route}"
          ${encodedIcon ? `data-icon="${encodedIcon}"` : ""}
          tabindex="0"
          role="button"
        >
          <a href="#" class="cd-menu-link" data-id="${itemId}">
            <span class="cd-menu-label">${item.label}</span>
            ${hasChildren
                ? `<span class="cd-menu-toggle-icon fa fa-chevron-right"></span>`
                : ""}
          </a>
          ${hasChildren
                ? `<ul class="cd-submenu">${this.renderMenuHtml(item.children)}</ul>`
                : ""}
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
    menuAdapterFactory(system) {
        switch (system) {
            case "metismenu":
                return new MetisMenuAdapter();
            // Add more as needed
            case "plain":
            default:
                return null; // plain menu needs no JS enhancement
        }
    }
    // 🧠 Convert string to kebab-case
    toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }
    // 🧩 Recursively assign deterministic menu IDs
    assignMenuIds(menu, parentId = "") {
        return menu.map((item) => {
            const baseName = item.label || item.route || "item";
            const itemId = `menu-item-${parentId ? parentId + "-" : ""}${this.toKebabCase(baseName)}`;
            const withId = {
                ...item,
                menuId: itemId,
            };
            if (item.children && item.children.length > 0) {
                withId.children = this.assignMenuIds(item.children, this.toKebabCase(baseName));
            }
            return withId;
        });
    }
    // 🚀 High-level helper to prepare full menu
    prepareMenu(menu) {
        // 1️⃣ Assign stable menu IDs
        const menuWithIds = this.assignMenuIds(menu);
        // 2️⃣ Normalize item types (route, template, action, etc.)
        const normalizedMenu = this.ensureItemTypes(menuWithIds);
        // 3️⃣ Return fully prepared structure
        return normalizedMenu;
    }
    /**
     * Ensures that each menu item has an explicit itemType based on its properties.
     */
    ensureItemTypes(menu) {
        return menu.map((item) => {
            // Restrict inferredType to the same union used by MenuItem.itemType and default to "route"
            let inferredType = "route";
            if (item.itemType) {
                inferredType = item.itemType; // respect explicit type
            }
            else if (item.action) {
                inferredType = "action";
            }
            else if (item.template) {
                inferredType = "template";
            }
            else if (item.route) {
                inferredType = "route";
            }
            const normalizedItem = {
                ...item,
                itemType: inferredType,
            };
            if (item.children && item.children.length > 0) {
                normalizedItem.children = this.ensureItemTypes(item.children);
            }
            return normalizedItem;
        });
    }
}
