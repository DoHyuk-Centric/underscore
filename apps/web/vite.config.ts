import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode === 'ait' ? [aitDevtools.vite()] : []),
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/market-data': 'http://localhost:3000',
    },
  },
}))
