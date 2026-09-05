import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 *
 * WHY Vite (not Create React App):
 *   - Much faster dev server startup (< 1 second vs 10+ seconds)
 *   - Hot Module Replacement (HMR) — changes appear instantly
 *   - Smaller production bundle
 *   - Better supported in 2024/2025
 *
 * The proxy setting allows frontend (port 5173) to call backend (port 8000)
 * without CORS issues during LOCAL DEVELOPMENT.
 * In production (Vercel + Render), CORS is handled by the backend middleware.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During dev: /api requests → http://localhost:8001/api
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
