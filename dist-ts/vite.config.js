// import { defineConfig } from "vite";
// import fs from "fs";
// import path from "path";
// const viteConfig = {
//   https: {
//     key: fs.readFileSync(path.resolve("/home/emp-12/.ssl/key.pem")),
//     cert: fs.readFileSync(path.resolve("/home/emp-12/.ssl/cert.pem")),
//   },
//   port: 5173,
//   host: "localhost",
//   open: true,
// };
// export default defineConfig({
//   server: viteConfig,
//   preview: viteConfig,
//   root: ".",
//   publicDir: "public",
//   build: {
//     outDir: "dist",
//     emptyOutDir: true,
//     target: "esnext",
//     modulePreload: true,
//     rollupOptions: {
//       input: path.resolve(__dirname, "public/index.html"),
//       output: {
//         format: "es",
//       },
//       // Externalize Node.js modules for browser builds
//       external: ['fs', 'path', 'crypto', 'util', 'stream'],
//     },
//   },
//   esbuild: {
//     target: "esnext",
//     supported: {
//       "top-level-await": true,
//     },
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//       "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
//     },
//     extensions: [".js", ".ts"],
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       target: "esnext",
//       supported: {
//         "top-level-await": true,
//       },
//     },
//     // Exclude Node.js modules from dependency optimization
//     exclude: ['fs', 'path', 'crypto'],
//   },
//   // Define global constants for environment detection
//   define: {
//     __IS_NODE__: JSON.stringify(false),
//     __IS_BROWSER__: JSON.stringify(true),
//     __IS_PWA__: JSON.stringify(true),
//   },
// });
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
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
    server: {
        ...viteConfig,
        // Add headers for WASM and OPFS support
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
    preview: {
        ...viteConfig,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
    root: ".",
    publicDir: "public",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        target: "esnext", // Important for WASM and modern features
        modulePreload: true,
        rollupOptions: {
            input: path.resolve(__dirname, "public/index.html"),
            output: {
                format: "es",
            },
            external: [
                // Externalize Node.js modules that shouldn't be bundled for browser
                'redis',
                'chalk',
                'util',
                'fs',
                'path',
                'crypto',
                'stream',
                'http',
                'https',
                'net',
                'tls',
                'zlib',
                'os',
                'child_process',
                'cluster',
                'dgram',
                'dns',
                'domain',
                'module',
                'readline',
                'repl',
                'tty',
                'url',
                'vm',
                'worker_threads',
                'perf_hooks',
                'querystring',
                'buffer',
                'assert',
                'constants',
                'events',
                'punycode',
                'string_decoder',
                'timers',
                'uglify-js',
            ],
        },
    },
    esbuild: {
        target: "esnext",
        supported: {
            "top-level-await": true,
        },
        // Add TypeScript decorator support
        tsconfigRaw: {
            compilerOptions: {
                experimentalDecorators: true,
                // emitDecoratorMetadata: true,
                useDefineForClassFields: false,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
            // Redirect problematic Node.js modules to browser-friendly shims
            'redis': path.resolve(__dirname, 'src/CdShell/sys/utils/redis-shim.ts'),
            'chalk': path.resolve(__dirname, 'src/CdShell/sys/utils/chalk-shim.ts'),
            'util': path.resolve(__dirname, 'src/CdShell/sys/utils/util-shim.ts'),
            'path': path.resolve(__dirname, 'src/CdShell/sys/utils/path-shim.ts'),
            'fs': path.resolve(__dirname, 'src/CdShell/sys/utils/fs-shim.ts'),
            'os': path.resolve(__dirname, 'src/CdShell/sys/utils/os-shim.ts'),
            'crypto': path.resolve(__dirname, 'src/CdShell/sys/utils/crypto-shim.ts'),
            'stream': path.resolve(__dirname, 'src/CdShell/sys/utils/stream-shim.ts'),
            'buffer': path.resolve(__dirname, 'src/CdShell/sys/utils/buffer-shim.ts'),
            // Optional: Add shims for other commonly used Node.js modules
            'process': path.resolve(__dirname, 'src/CdShell/sys/utils/process-shim.ts'),
        },
        extensions: [".js", ".ts", ".wasm"], // Add WASM extension
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
            supported: {
                "top-level-await": true,
            },
            // Define globals for esbuild
            define: {
                global: 'globalThis',
            },
        },
        exclude: [
            // Exclude Node.js modules and WASM packages from optimization
            'redis',
            'chalk',
            'util',
            'fs',
            'path',
            'crypto',
            'stream',
            'os',
            'sql.js',
            '@sqlite.org/sqlite-wasm',
            'dexie',
            // Add other Node.js specific modules
            'http', 'https', 'net', 'tls', 'zlib',
            'child_process', 'cluster', 'dgram', 'dns',
        ],
        include: [
            // Force include reflect-metadata for dependency optimization
            'reflect-metadata',
            'lodash',
            'moment',
            'uuid',
        ],
    },
    define: {
        // Global constants for environment detection
        __IS_NODE__: JSON.stringify(false),
        __IS_BROWSER__: JSON.stringify(true),
        __IS_PWA__: JSON.stringify(true),
        // Define process.env for browser environment
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        'process.version': JSON.stringify('v18.0.0'),
        'process.versions': JSON.stringify({ node: '18.0.0' }),
        'process.platform': JSON.stringify('browser'),
        'process.arch': JSON.stringify('x64'),
        'process.cwd': JSON.stringify(() => '/'),
        // Global polyfill
        global: 'globalThis',
    },
    // Plugins array if you need to add any in the future
    plugins: [
    // You can add Vite plugins here as needed
    // Example: wasm plugin, legacy browser support, etc.
    ],
});
