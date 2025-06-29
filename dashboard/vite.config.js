import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to handle SPA routing
const spaFallback = () => ({
  name: 'spa-fallback',
  configureServer(server) {
    server.middlewares.use('/templates', (req, res, next) => {
      // If the request is for a template route that doesn't exist as a file,
      // serve the index.html instead
      if (req.url && req.url.startsWith('/templates/')) {
        req.url = '/';
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), spaFallback()],
  appType: 'spa',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    port: 4000,
    strictPort: true,
    allowedHosts: 'all',
    hmr: {
      protocol: 'wss',
      clientPort: 443
    }
  }
})