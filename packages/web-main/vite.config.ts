import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

export default defineConfig({
  build: {
    manifest: true,
    sourcemap: true,
  },
  plugins: [react(), tsconfigPaths(), checker({ typescript: true })],
  envDir: '../../',
});
