import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@senchat/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    host: true, // listen on all interfaces (0.0.0.0) for LAN access
    port: 5173,
  },
});
