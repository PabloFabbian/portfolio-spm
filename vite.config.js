import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiLocal, versionJson } from './vite.plugins.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), apiLocal(), versionJson()],
})
