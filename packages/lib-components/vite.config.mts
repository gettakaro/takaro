/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: ['default', 'junit'],
    outputFile: {
      junit: '../../reports/junit/lib-components.xml',
    },
  },
  css: {
    transformer: 'lightningcss',
  },
  plugins: [react(), checker({ typescript: true }), tsconfigPaths()],
  envDir: '../../',
});
