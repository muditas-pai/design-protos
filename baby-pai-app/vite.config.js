import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import annotations from './vite-plugin-annotations'

// base './' keeps every asset URL relative, so the built app runs from any
// path — the Pages subpath, a local server, or opened straight from Finder.
// Paired with HashRouter in App.jsx, which is what makes file:// work.
export default defineConfig({
  plugins: [react(), annotations({ root: import.meta.dirname })],
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
  // the app imports ../design-system/pai.css directly rather than copying it,
  // so the dev server has to be allowed to read one level up
  server: { fs: { allow: ['..'] } },
})
