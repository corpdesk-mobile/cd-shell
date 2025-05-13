
// export async function bootstrapShell() {
//     console.log('starting bootstrapShell()');
//   const shellConfig = await fetch('/shell.config.json').then(res => res.json());
//   const themeConfig = await fetch(shellConfig.themeConfig).then(res => res.json());
//   console.log('themeConfig:', themeConfig);

//   // Set title
//   document.title = shellConfig.appName || shellConfig.fallbackTitle || 'Corpdesk';

//   // Set logo
//   const logoEl = document.getElementById('cd-logo') as HTMLImageElement;
  
//   if (logoEl && themeConfig.logo) {
//     logoEl.src = themeConfig.logo;
//   }

//   // Apply theme color
//   if (themeConfig.themeColor) {
//     document.documentElement.style.setProperty('--theme-color', themeConfig.themeColor);
//   }

// }

export async function bootstrapShell() {
  console.log('starting bootstrapShell()');

  const shellConfig = await fetch('/shell.config.json').then(res => res.json());
  const themeConfig = await fetch(shellConfig.themeConfig).then(res => res.json());

  // Set title
  document.title = shellConfig.appName || shellConfig.fallbackTitle || 'Corpdesk';

  // Set logo
  const logoEl = document.getElementById('cd-logo') as HTMLImageElement;
  if (logoEl && themeConfig.logo) {
    logoEl.src = themeConfig.logo;
  }

  // Apply theme color
  if (themeConfig.themeColor) {
    document.documentElement.style.setProperty('--theme-color', themeConfig.themeColor);
  }

  // 👉 Load default module
  if (shellConfig.defaultModule) {
    const [ctx, moduleId] = shellConfig.defaultModule.split('/');
    await loadModule(ctx, moduleId);
  }
}


export async function loadModule(ctx: string, moduleId: string) {
  const modulePath = `/${ctx}/${moduleId}/index.js`;
  const mod = await import(/* @vite-ignore */modulePath);
  const moduleInfo = mod.cdUserModule;

  // Render default template
  document.getElementById('content')!.innerHTML = moduleInfo.template;

  // Initialize any logic inside controller (e.g. bind buttons)
  // Optional: you could export and call a `boot()` method for controller logic here
}

await bootstrapShell();
