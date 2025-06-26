import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv.picard.replit.dev',
      '.replit.dev',
      '.repl.co'
    ],
    hmr: {
      protocol: 'wss',
      clientPort: 443
    }
  }
})