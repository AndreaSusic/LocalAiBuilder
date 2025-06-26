import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',                     // listen on all interfaces
    port: Number(process.env.PORT) || 3000,
    strictPort: true,                    // 👈 never auto-increment
    allowedHosts: 'all',
    hmr: {
      host: process.env.REPL_SLUG
        ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : 'localhost',
      port: 5173,
      protocol: 'wss'
    }
  }
})