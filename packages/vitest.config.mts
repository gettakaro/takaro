import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      '**/*.test.ts',
      '**/*.unit.test.ts', 
      '**/*.integration.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/_data/**',
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    reporter: ['verbose'],
    setupFiles: ['./test-setup.ts'],
  },
  plugins: [tsconfigPaths()],
  envDir: '../',
});