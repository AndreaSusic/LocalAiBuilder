import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-routing',
      configureServer(server) {
        server.middlewares.use('/templates', (req, res, next) => {
          // For template routes, serve the index.html to let React Router handle it
          if (req.method === 'GET' && !req.url.includes('.')) {
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