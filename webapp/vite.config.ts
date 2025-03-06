
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
  // Use /app/ as base path since we need this for the custom domain
  base: '/app/',
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure all assets use the correct MIME types
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Ensure proper chunking for better performance
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    // MIME type settings for development server
    fs: {
      strict: true,
    },
  },
});
