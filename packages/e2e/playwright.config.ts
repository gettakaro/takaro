import { devices, defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/* Playwright imports @takaro/test, because of this it loads all files in @takaro/test.
 * @takaro/test uses sinon which defines a global afterEach function.
 * Since we don't use sinon in our tests, we need to define a dummy afterEach function.
 */
global.afterEach = () => {};
globalThis.afterEach = () => {};
global.before = () => {};

const projects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
];

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: './src',
  timeout: 90000,
  expect: {
    timeout: 15000,
  },

  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 4 : 0,

  // Limit the number of failures on CI (faster feedback loop).
  maxFailures: process.env.CI ? 10 : undefined,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : 5,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: '../../reports/playwright-html', open: 'never' }],
    [process.env.CI ? 'github' : 'list', {}],
  ],
  outputDir: '../../reports/playwright-results/',

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://127.0.0.1:13001',

    // Collect trace when retrying the failed test.
    trace: 'on',
  },
  // Configure projects for major browsers.
  projects,
});
