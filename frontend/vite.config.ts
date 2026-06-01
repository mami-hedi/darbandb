import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite' // <--- ASSUREZ-VOUS D'AVOIR CET IMPORT

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(), // <--- ASSUREZ-VOUS DE L'AJOUTER ICI (AVANT LE PLUGIN TANSTACK)
    tanstackStart(),
    react(),
  ],
  server: {
    port: 8080,
  },
})