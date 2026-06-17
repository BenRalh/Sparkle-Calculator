import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // Production (GitHub Pages) is served from a repo subpath; dev stays at root.
  base: command === 'build' ? '/Sparkle-Calculator/' : '/',
  plugins: [react()],
}))
