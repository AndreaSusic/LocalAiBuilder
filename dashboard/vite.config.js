import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
   base: '/dashboard/',       
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4000,  // ← use Replit’s PORT
    strictPort: true,
    allowedHosts: 'all',
    hmr: {
      protocol: 'wss',
      clientPort: Number(process.env.PORT) || 4000
    }
  }
})