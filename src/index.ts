// src/index.ts

import { bootstrapShell } from './bootstrap/bootstrap';
import { loadShellConfig } from './config/shell.config';
import { loadTheme } from './theme/theme-loader';
import { loadDefaultModule } from './bootstrap/moduleManager';
import { ShellConfig } from './base/models/IBase';

export async function startShell(): Promise<void> {
  console.log('🟢 Starting PWA-OS (cd-shell)...');

  const config  = await loadShellConfig();
  console.log('📄 Shell config loaded:', config);

  await loadTheme(config.themeConfig);
  console.log('🎨 Theme applied:', config.themeConfig);

  await loadDefaultModule(config.defaultModule);
  console.log('📦 Default module loaded:', config.defaultModule);

  await bootstrapShell(config);
  console.log('✅ Shell bootstrapped successfully');
}

// Auto-start if not being imported as library
if (require.main === module) {
  startShell().catch(err => {
    console.error('❌ Failed to start shell:', err);
  });
}
