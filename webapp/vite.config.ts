
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Use root base path since we're using a custom domain
  base: '/',
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure all assets use the correct MIME types
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
