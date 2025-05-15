// src/runtime/menuRenderer.ts

import { MenuItem } from "../models/menu.model";


export function renderPlainMenu(menu: MenuItem[], containerId: string = 'sidebar') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<ul class="cd-menu-root">${renderMenuHtml(menu)}</ul>`;
}

function renderMenuHtml(menu: MenuItem[]): string {
  return menu.map(item => {
    const hasChildren = item.children && item.children.length > 0;
    return `
      <li class="cd-menu-item" data-route="${item.route || ''}">
        <span class="cd-menu-label">${item.label}</span>
        ${hasChildren ? `<ul class="cd-submenu">${renderMenuHtml(item.children!)}</ul>` : ''}
      </li>
    `;
  }).join('');
}
