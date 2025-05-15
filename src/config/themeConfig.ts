import { ITheme } from "../theme/models/themes.model";

export async function loadThemeConfig(): Promise<ITheme> {
  console.debug("loadThemeConfig(): 01");
  const res = await fetch("/themes/default/theme.json");
  console.debug("loadThemeConfig(): 01");
  console.debug("loadThemeConfig()/res:", res);
  if (!res.ok) {
    console.debug("loadThemeConfig(): 02");
    throw new Error(`Failed to load shell config: ${res.statusText}`);
  }
  console.debug("loadThemeConfig(): 03");
  return res.json() as Promise<ITheme>;
}
