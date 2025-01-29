import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Box/',
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});