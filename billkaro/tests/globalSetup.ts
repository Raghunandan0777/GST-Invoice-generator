import { chromium, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const AUTH_FILE = path.join(__dirname, 'auth.json');

/**
 * Global setup that runs ONCE before ALL tests
 * 1. Verifies the app is running
 * 2. Creates and saves authentication session
 */
async function globalSetup() {
  console.log('\n=== PLAYWRIGHT GLOBAL SETUP ===\n');

  // Step 1: Check if server is running
  console.log(`📡 Checking if app is running at ${BASE_URL}...`);
  const isServerRunning = await verifyServerIsRunning();
  if (!isServerRunning) {
    throw new Error(
      `❌ FATAL: App is not running at ${BASE_URL}\n` +
      `    Please start the app with: npm run dev\n` +
      `    Then run tests again`
    );
  }
  console.log('✅ App is running and responding\n');

  // Step 2: Create authentication session
  console.log('🔐 Creating authentication session...');
  await createAuthSession();
  console.log(`✅ Authentication session saved to: ${AUTH_FILE}\n`);

  console.log('=== SETUP COMPLETE ===\n');
}

/**
 * Verify server is reachable before running tests
 */
async function verifyServerIsRunning(maxRetries = 5): Promise<boolean> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${BASE_URL}/`, {
        method: 'HEAD',
        timeout: 5000,
      });
      console.log(`   Attempt ${i + 1}: Server responded with ${response.status}`);
      return true;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        console.log(`   Attempt ${i + 1}: Retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.error(`   Final error: ${lastError?.message}`);
  return false;
}

/**
 * Login and save authentication session for reuse in tests
 */
async function createAuthSession() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('   → Navigating to /login');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });

    // Check if already logged in
    const isLoggedIn = await page.url().includes('/dashboard') || page.url().includes('/onboarding');
    if (isLoggedIn) {
      console.log('   ✓ Already logged in, saving session');
    } else {
      // Fill in credentials
      console.log('   → Filling in login credentials');
      await page.locator('input[type="email"]').fill('test@billkaro.dev');
      await page.locator('input[type="password"]').fill('TestPass123!');

      // Submit form
      console.log('   → Clicking login button');
      await page.click('button[type="submit"]');

      // Wait for redirect
      console.log('   → Waiting for redirect...');
      const navigationPromise = page.waitForURL(/\/(dashboard|onboarding)/, {
        timeout: 20000,
      });

      try {
        await navigationPromise;
      } catch (error) {
        // If redirect timeout, check current state
        const currentUrl = page.url();
        const pageContent = await page.content();

        // Look for error messages
        const errorSelector = '[role="alert"]';
        const errorElement = await page.locator(errorSelector).first();
        const errorText = await errorElement.textContent().catch(() => null);

        throw new Error(
          `❌ Login failed or timed out\n` +
          `    URL: ${currentUrl}\n` +
          `    Expected: /dashboard or /onboarding\n` +
          `    Error message on page: ${errorText || 'None found'}\n` +
          `    Credentials used: test@billkaro.dev / TestPass123!\n` +
          `    Verify this test user exists in Supabase!`
        );
      }

      const postLoginUrl = page.url();
      console.log(`   ✓ Redirected to: ${postLoginUrl}`);
    }

    // Verify we're on a protected page
    const finalUrl = page.url();
    if (!finalUrl.includes('/dashboard') && !finalUrl.includes('/onboarding')) {
      throw new Error(
        `❌ After login, expected /dashboard or /onboarding, but got: ${finalUrl}`
      );
    }

    console.log(`   ✓ Authentication successful, URL: ${finalUrl}`);

    // Save auth session
    await context.storageState({ path: AUTH_FILE });
    console.log(`   ✓ Session saved to ${AUTH_FILE}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to create auth session:\n${errorMessage}\n\n` +
      `Troubleshooting:\n` +
      `1. Is the app running? npm run dev\n` +
      `2. Does test user exist? test@billkaro.dev in Supabase\n` +
      `3. Are Supabase credentials configured?\n` +
      `4. Check app logs for auth errors`
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
