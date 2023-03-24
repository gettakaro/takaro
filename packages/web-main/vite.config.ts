import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    manifest: true,
    sourcemap: true,
  },
  plugins: [react(), tsconfigPaths()],
  envDir: '../../',
});
