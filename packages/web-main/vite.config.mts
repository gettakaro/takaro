/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  build: {
    minify: 'esbuild',
    manifest: true,
    sourcemap: true,
    cssMinify: 'lightningcss',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  server: {
    warmup: {
      clientFiles: [
        // commonly used files to warm up the esbuild cache
        './src/router.tsx',
        './src/index.tsx',
      ],
    },
  },
  css: {
    transformer: 'lightningcss',
  },
  plugins: [
    react(),
    TanStackRouterVite({ autoCodeSplitting: true, target: 'react' }),
    checker({ typescript: true }),
    tsconfigPaths(),
  ],

  envDir: '../../',
});
