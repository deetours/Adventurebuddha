import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // Separate UI libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          // Separate routing
          'router': ['react-router-dom'],
          // Separate state management
          'state-management': ['zustand', '@tanstack/react-query'],
          // Separate animation library
          'animation': ['framer-motion'],
          // Separate chart libraries
          'charts': ['recharts'],
          // Separate utility libraries
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'zustand',
      'framer-motion',
      'react-router-dom',
    ],
  },
});