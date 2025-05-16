// src/index.ts

import { bootstrapShell } from './bootstrap/bootstrap';
import { loadShellConfig } from './config/shell.config';
import { ShellConfig } from './base/models/IBase';
import { loadTheme } from './theme/services/theme-loader';

export async function startShell(): Promise<void> {
  console.log('🟢 Starting PWA-OS (cd-shell)...');

  const shellConfig  = await loadShellConfig();
  console.log('📄 Shell config loaded:', shellConfig);

  await loadTheme(shellConfig.themeConfig.currentThemePath);
  console.log('🎨 Theme applied:', shellConfig.themeConfig);

  // await loadDefaultModule(config.defaultModule);
  // console.log('📦 Default module loaded:', config.defaultModule);

  await bootstrapShell();
  console.log('✅ Shell bootstrapped successfully');
}

// Auto-start if not being imported as library
if (require.main === module) {
  startShell().catch(err => {
    console.error('❌ Failed to start shell:', err);
  });
}
