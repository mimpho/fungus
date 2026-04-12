import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allow Google FedCM popup to postMessage back to the opener.
      // 'same-origin' (Chrome default) blocks cross-origin popups entirely.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'leaflet-vendor': ['leaflet'],
          'data-species': ['./src/data/species.js'],
          'data-zones': ['./src/data/zones.js'],
        },
      },
    },
  },
})
