import { ICdModule } from "../module/models/module.model";
import { ITheme } from "./models/themes.model";

// export async function loadTheme(themeId: string = 'default') {
//   const res = await fetch(`/themes/${themeId}/theme.json`);
//   const theme = await res.json() as ITheme;

//   Object.entries(theme.colors).forEach(([key, value]) => {
    
//     document.documentElement.style.setProperty(`--cd-${key}-color`, value);
//   });

//   document.body.style.fontFamily = theme.font || 'sans-serif';

//   const logoEl = document.getElementById('cd-logo') as HTMLImageElement;
//   if (logoEl && theme.logo) {
//     logoEl.src = theme.logo;
//   }
// }

export async function loadTheme(themeId: string = 'default') {
  console.debug("loadTheme(): loading theme ID:", themeId);
  const res = await fetch(`/themes/${themeId}/theme.json`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Theme fetch failed: ${res.status} ${res.statusText}. Body: ${errorText}`);
  }

  const theme = await res.json() as ITheme;
  console.debug("loadTheme(): parsed theme:", theme);

    Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--cd-${key}-color`, value);
  });

  document.body.style.fontFamily = theme.font || 'sans-serif';

  const logoEl = document.getElementById('cd-logo') as HTMLImageElement;
  if (logoEl && theme.logo) {
    logoEl.src = theme.logo;
  }
}

