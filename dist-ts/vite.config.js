import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
// import config from "./config";
const viteConfig = {
    https: {
        key: fs.readFileSync(path.resolve("/home/emp-12/.ssl/key.pem")),
        cert: fs.readFileSync(path.resolve("/home/emp-12/.ssl/cert.pem")),
    },
    port: 5173,
    host: "localhost",
    open: true,
};
export default defineConfig({
    server: viteConfig, // Use HTTP server configuration
    preview: viteConfig, // Preview server same as dev server
    root: ".", // Root is the project base
    publicDir: "public",
    build: {
        outDir: "dist", // Final PWA bundle
        emptyOutDir: true,
        target: "esnext", // ✅ Use "esnext" instead of "es2022"
        modulePreload: true,
        rollupOptions: {
            input: path.resolve(__dirname, "public/index.html"),
            output: {
                format: "es", // ✅ Ensure ESM output supports top-level await
            },
        },
    },
    esbuild: {
        target: "esnext", // ✅ Same here to bypass old browser targets
        supported: {
            "top-level-await": true, // ✅ Explicitly enable top-level await
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
        },
        extensions: [".js", ".ts"],
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext", // ✅ Extend same fix to optimizeDeps
            supported: {
                "top-level-await": true,
            },
        },
    },
});
