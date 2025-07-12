// dashboard/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite configuration for the dashboard:
 *  • React plugin for JSX/TSX support
 *  • SPA build to /dist (for “npm run build”)
 *  • Dev-server on port 5173 with HMR over WSS
 *  • Proxy every /api/* call to the Express backend on :5000
 *  • `host: true` + `allowedHosts: true` so Replit’s long
 *    sub-domain can reach the dev-server without “Blocked request”.
 */
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
    host: true, // bind on 0.0.0.0 and disable host-header check
    port: 5173, // preferred dev port (falls back if taken)
    strictPort: false, // auto-pick the next free port when 5173 is busy
    allowedHosts: true, // ✅ permit any external host (Replit sub-domain)

    hmr: {
      protocol: "wss", // Replit serves over HTTPS → use secure websockets
      clientPort: 443, // browser connects on 443 through the proxy
      // host is omitted → Vite falls back to `window.location.host`
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
    // add any other Express endpoints you call from the browser
  },
});
