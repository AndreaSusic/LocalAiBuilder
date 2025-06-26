import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,               // bind 0.0.0.0  (needed on Replit)
    port: 5173,               // feel free to keep 3000 if you prefer
    allowedHosts: 'all',      // <— stops the "Blocked request" error
    hmr: { clientPort: 443, protocol: 'wss' } // nice-to-have for Replit proxy
  }
});