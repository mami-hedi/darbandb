import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    tsconfigPaths(),
    tailwindcss(),
    react(),
  ],
  server: {
    port: 8080,
    // Cette configuration résoudra vos erreurs 404 sur les appels API
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Assurez-vous que votre backend tourne bien sur ce port
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
  }
})