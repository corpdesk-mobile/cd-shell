// src/index.ts
import { ThempeLoaderService } from './CdShell/sys/theme/services/theme-loader.service';
import { Main } from './main';
// import { loadShellConfig } from './config/shell.config.old';
// import { ShellConfig } from './CdShell/sys/base/i-base_';
// import { loadTheme } from './CdShell/sys/theme/services/theme-loader.service';
export async function startShell() {
    console.log('🟢 Starting PWA-OS (cd-shell)...');
    const m = new Main();
    const svThempeLoader = new ThempeLoaderService();
    const shellConfig = await m.loadShellConfig();
    console.log('📄 Shell config loaded:', shellConfig);
    await svThempeLoader.loadTheme(shellConfig.themeConfig.currentThemePath);
    console.log('🎨 Theme applied:', shellConfig.themeConfig);
    const app = new Main();
    await app.run();
    console.log('✅ Shell bootstrapped successfully');
}
// Auto-start if not being imported as library
if (require.main === module) {
    startShell().catch(err => {
        console.error('❌ Failed to start shell:', err);
    });
}
