import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite' // <--- AJOUTEZ CET IMPORT

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // <--- AJOUTEZ CE PLUGIN
    tsconfigPaths(),
    tailwindcss(),
    react(),
  ],
  server: {
    port: 8080,
  },
  build: {
    outDir: 'dist',
  }
})