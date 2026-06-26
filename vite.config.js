import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ('./') so the build works whether it's served from a domain
// root (Vercel) or a repo subpath (GitHub Pages). Single-page app, no routing.
export default defineConfig({
  base: './',
  plugins: [react()],
})
