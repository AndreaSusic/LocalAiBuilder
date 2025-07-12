// dashboard/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Replit exposes REPL_SLUG (40-char id) and runs containers in the
 * “picard.replit.dev” cluster.  Using that we can compute the public host:
 *   <REPL_SLUG>.picard.replit.dev
 *
 * Locally REPL_SLUG is undefined, so we fall back to localhost.
 */
const replSlug = process.env.REPL_SLUG; // e.g. 840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv
const publicHost = replSlug ? `${replSlug}.picard.replit.dev` : "localhost";

export default defineConfig({
  plugins: [react()],
  appType: "spa",
  base: "./",

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },

  server: {
    host: true, // 0.0.0.0 so Replit proxy can reach it
    port: 5173,
    strictPort: false,
    allowedHosts: true,

    https: false, // plain HTTP inside container (TLS handled by proxy)

    hmr: {
      protocol: "wss", // secure WebSocket for browsers on HTTPS
      host: publicHost, // 840478aa-…picard.replit.dev  OR localhost
      clientPort: 443, // external TLS port
    },

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/login": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
