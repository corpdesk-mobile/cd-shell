import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.', // Root is the project base
  publicDir: 'public',

  build: {
    outDir: 'dist', // Final PWA bundle
    emptyOutDir: true,
    target: 'esnext', // ✅ Use "esnext" instead of "es2022"
    modulePreload: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html'),
      output: {
        format: 'es', // ✅ Ensure ESM output supports top-level await
      },
    },
  },

  esbuild: {
    target: 'esnext', // ✅ Same here to bypass old browser targets
    supported: {
      'top-level-await': true, // ✅ Explicitly enable top-level await
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shell': path.resolve(__dirname, 'dist-ts/CdShell'),
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // ✅ Extend same fix to optimizeDeps
      supported: {
        'top-level-await': true,
      },
    },
  },

  server: {
    open: true,
    port: 5173,
  },

  preview: {
    port: 4173,
    open: true,
  },
});
