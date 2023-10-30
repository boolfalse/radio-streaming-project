
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config';

export default defineConfig({
  build: {
    minify: process.env.APP_ENV === 'production' ? 'esbuild' : false,
    cssMinify: process.env.APP_ENV === 'production',
  },
  plugins: [react()],
  server: {
    https: process.env.APP_ENV === 'production',
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.VITE_BACKEND_PORT || 3001}`,
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: `http://localhost:${process.env.VITE_BACKEND_PORT || 3001}`,
        ws: true,
      },
    }
  },
});
