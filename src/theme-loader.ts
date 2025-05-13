export async function loadTheme(themeId: string = 'default') {
  const res = await fetch(`/themes/${themeId}/theme.json`);
  const theme = await res.json();

  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--cd-${key}-color`, value);
  });

  document.body.style.fontFamily = theme.font || 'sans-serif';

  const logoEl = document.getElementById('cd-logo') as HTMLImageElement;
  if (logoEl && theme.logo) {
    logoEl.src = theme.logo;
  }
}
