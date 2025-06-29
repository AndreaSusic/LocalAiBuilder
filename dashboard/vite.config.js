import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'GET' && 
              req.url && 
              req.url.startsWith('/templates/') && 
              !req.url.includes('.') &&
              req.headers.accept &&
              req.headers.accept.includes('text/html')) {
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