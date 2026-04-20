import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite's @vitejs/plugin-react 6 uses oxc-transform by default and no longer accepts a `babel`
// option. We enforce React Compiler compliance statically via the eslint-plugin-react-compiler
// rule (`react-compiler/react-compiler: error`) rather than running the Babel transform.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5174,
    strictPort: true
  },
  preview: {
    port: 4174,
    strictPort: true
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
})
