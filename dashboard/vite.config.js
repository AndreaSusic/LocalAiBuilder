import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If it's a GET request for a template route that doesn't include a file extension
          if (req.method === 'GET' && req.url && req.url.startsWith('/templates/') && !req.url.includes('.')) {
            // Rewrite to root for React Router to handle
            req.url = '/';
          }
          next();
        });
      }
    }
  ],
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