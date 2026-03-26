import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 15000 },
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
    ['junit', { outputFile: 'junit-results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    headless: false,
  },
  globalSetup: require.resolve('./tests/globalSetup.ts'),
  projects: [
    // Authentication tests - no saved session (login, signup, redirects)
    {
      name: 'auth',
      testMatch: '**/billkaro-auth.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Authenticated tests - uses saved session from globalSetup
    {
      name: 'authenticated',
      testMatch: ['**/billkaro-dashboard.spec.ts', '**/billkaro-invoice.spec.ts', '**/billkaro-features.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/auth.json',
      },
    },
    // Public tests - no login required (landing, 404, privacy, terms)
    {
      name: 'public',
      testMatch: '**/billkaro-public.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: undefined, // App should already be running at localhost:3000
});
