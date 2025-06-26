import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    /**
     * Let Vite bind on 0.0.0.0 so Replit can
     * expose it on its public URL.
     */
    host: true,
    port: 5173,       // or any free port
    /**
     * Easiest: allow *any* host when running in Replit.
     * (You can tighten this later.)
     */
    allowedHosts: 'all',    // ← key line
  },
});