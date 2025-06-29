// dashboard/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: true, // ⬅️  bind on all + disable host check
    port: 4000, // any free port
    strictPort: true,
    allowedHosts: true, // still allowed, but host:true is the key
    hmr: {
      protocol: "wss",
      clientPort: 443, // HTTPS front-end port Replit uses
      // no host here – Vite will fall back to window.location.host
    },
  },
  appType: "spa",
});
