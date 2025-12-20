import { defineConfig, type ConfigEnv, type UserConfig } from "vite";
import fs from "fs";
import path from "path";

/**
 * ---------------------------------------------------------
 * DEV HTTPS RESOLUTION
 * ---------------------------------------------------------
 * HTTPS is DEVELOPMENT-ONLY and OPTIONAL.
 *
 * Enable via:
 *   vite --mode secure
 *
 * This avoids polluting shell.config with build-tool concerns.
 * shell.config governs runtime UI behavior, not dev servers.
 * ---------------------------------------------------------
 */

function resolveHttps(mode: string) {
  if (mode !== "secure") return undefined;

  try {
    const keyPath = "/home/emp-12/.ssl/key.pem";
    const certPath = "/home/emp-12/.ssl/cert.pem";

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.warn(
        "[Vite] HTTPS requested but cert files not found → falling back to HTTP"
      );
      return undefined;
    }

    console.info("[Vite] HTTPS enabled (secure mode)");

    return {
      key: fs.readFileSync(path.resolve(keyPath)),
      cert: fs.readFileSync(path.resolve(certPath)),
    };
  } catch (err) {
    console.warn("[Vite] Failed to load HTTPS certs → HTTP fallback", err);
    return undefined;
  }
}

/**
 * ---------------------------------------------------------
 * MAIN VITE CONFIG
 * ---------------------------------------------------------
 */

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const httpsConfig = resolveHttps(mode);

  /**
   * Shared dev/preview server configuration
   * HTTPS is conditionally injected ONLY if enabled
   */
  const devServerConfig = {
    port: 5173,
    host: "localhost",
    open: true,

    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },

    ...(httpsConfig ? { https: httpsConfig } : {}),
  };

  return {
    // ------------------------------------------------------
    // DEV SERVER
    // ------------------------------------------------------
    server: devServerConfig,

    // ------------------------------------------------------
    // PREVIEW SERVER (vite preview)
    // ------------------------------------------------------
    preview: devServerConfig,

    // ------------------------------------------------------
    // PROJECT STRUCTURE
    // ------------------------------------------------------
    root: ".",
    publicDir: "public",

    // ------------------------------------------------------
    // BUILD CONFIG
    // ------------------------------------------------------
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "esnext",
      modulePreload: true,

      rollupOptions: {
        input: path.resolve(__dirname, "public/index.html"),
        output: {
          format: "es",
        },

        /**
         * Node modules explicitly excluded from browser bundle
         */
        external: [
          "redis",
          "chalk",
          "util",
          "fs",
          "path",
          "crypto",
          "stream",
          "http",
          "https",
          "net",
          "tls",
          "zlib",
          "os",
          "child_process",
          "cluster",
          "dgram",
          "dns",
          "domain",
          "module",
          "readline",
          "repl",
          "tty",
          "url",
          "vm",
          "worker_threads",
          "perf_hooks",
          "querystring",
          "buffer",
          "assert",
          "constants",
          "events",
          "punycode",
          "string_decoder",
          "timers",
          "uglify-js",
        ],
      },
    },

    // ------------------------------------------------------
    // ESBUILD / TS SUPPORT
    // ------------------------------------------------------
    esbuild: {
      target: "esnext",
      supported: {
        "top-level-await": true,
      },

      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: false,
        },
      },
    },

    // ------------------------------------------------------
    // MODULE RESOLUTION & SHIMS
    // ------------------------------------------------------
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shell": path.resolve(__dirname, "dist-ts/CdShell"),

        // Node → browser shims
        redis: path.resolve(__dirname, "src/CdShell/sys/utils/redis-shim.ts"),
        chalk: path.resolve(__dirname, "src/CdShell/sys/utils/chalk-shim.ts"),
        util: path.resolve(__dirname, "src/CdShell/sys/utils/util-shim.ts"),
        path: path.resolve(__dirname, "src/CdShell/sys/utils/path-shim.ts"),
        fs: path.resolve(__dirname, "src/CdShell/sys/utils/fs-shim.ts"),
        os: path.resolve(__dirname, "src/CdShell/sys/utils/os-shim.ts"),
        crypto: path.resolve(__dirname, "src/CdShell/sys/utils/crypto-shim.ts"),
        stream: path.resolve(
          __dirname,
          "src/CdShell/sys/utils/stream-shim.ts"
        ),
        buffer: path.resolve(
          __dirname,
          "src/CdShell/sys/utils/buffer-shim.ts"
        ),
        process: path.resolve(
          __dirname,
          "src/CdShell/sys/utils/process-shim.ts"
        ),
      },

      extensions: [".js", ".ts", ".wasm"],
    },

    // ------------------------------------------------------
    // DEPENDENCY OPTIMIZATION
    // ------------------------------------------------------
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
        supported: {
          "top-level-await": true,
        },
        define: {
          global: "globalThis",
        },
      },

      exclude: [
        "redis",
        "chalk",
        "util",
        "fs",
        "path",
        "crypto",
        "stream",
        "os",
        "sql.js",
        "@sqlite.org/sqlite-wasm",
        "dexie",
        "http",
        "https",
        "net",
        "tls",
        "zlib",
        "child_process",
        "cluster",
        "dgram",
        "dns",
      ],

      include: ["reflect-metadata", "lodash", "moment", "uuid"],
    },

    // ------------------------------------------------------
    // GLOBAL DEFINES (Browser Runtime)
    // ------------------------------------------------------
    define: {
      __IS_NODE__: JSON.stringify(false),
      __IS_BROWSER__: JSON.stringify(true),
      __IS_PWA__: JSON.stringify(true),

      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
      "process.version": JSON.stringify("v18.0.0"),
      "process.versions": JSON.stringify({ node: "18.0.0" }),
      "process.platform": JSON.stringify("browser"),
      "process.arch": JSON.stringify("x64"),
      "process.cwd": JSON.stringify(() => "/"),

      global: "globalThis",
    },

    // ------------------------------------------------------
    // PLUGINS (reserved)
    // ------------------------------------------------------
    plugins: [],
  };
});
