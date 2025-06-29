import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import history from 'connect-history-api-fallback'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use(
          history({
            rewrites: [
              { from: /^\/templates\/.*$/, to: '/index.html' }
            ]
          })
        )
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