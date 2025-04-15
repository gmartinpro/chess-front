import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
        secure: false,
        changeOrigin: true,
        rewriteWsOrigin: true
      }
    }
  },
  preview: {
    host: true,
    port: 5173
  }
});
