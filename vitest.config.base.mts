/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Shared Vitest configuration for Takaro monorepo packages
 * Use this base config to ensure consistency across all packages
 */
export const createVitestConfig = (packagePath: string = '.') => {
  return defineConfig({
    test: {
      // Global test APIs (describe, it, expect) available without imports
      globals: true,
      
      // Node environment for backend packages (API, services, etc.)
      environment: 'node',
      
      // Include all test files with our naming convention
      include: [
        '**/*.test.ts',
        '**/*.unit.test.ts', 
        '**/*.integration.test.ts',
      ],
      
      // Exclude build output and node_modules
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/_data/**',
      ],
      
      // Test timeout settings
      testTimeout: 30000, // 30 seconds for integration tests
      hookTimeout: 30000,
      
      // Better error reporting
      reporter: ['verbose'],
      
      // Setup files for global imports
      setupFiles: ['../../test-setup.ts'],
      
      // Handle dependencies properly
      server: {
        deps: {
          // Externalize all node_modules except specific packages we need to inline
          external: [/node_modules/],
          // Force inline problematic packages to avoid ESM issues
          inline: [
            '@sentry/node',
            '@sentry/core',
            '@sentry/utils',
            '@sentry/types',
            '@takaro/test',
            '@takaro/modules',
          ],
        },
      },
    },
    
    // Enable TypeScript path mapping from tsconfig.json
    plugins: [tsconfigPaths()],
    
    // Look for .env files in the root
    envDir: '../../',
    
    // Resolve imports properly for monorepo
    resolve: {
      alias: {
        // Add aliases here if needed for specific packages
      },
    },
  });
};

// Default export for packages that don't need customization
export default createVitestConfig();