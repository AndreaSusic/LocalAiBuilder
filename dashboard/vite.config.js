import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',                     // listen on all interfaces
    port: Number(process.env.PORT) || 3000,
    strictPort: true,                    // never auto-increment
    allowedHosts: 'all',                 // allow any host header
    hmr: {
      protocol: 'wss',                   // use secure websockets
      clientPort: Number(process.env.PORT) || 443
      // no `host:` here—let the client use window.location.hostname
    }
  }
})