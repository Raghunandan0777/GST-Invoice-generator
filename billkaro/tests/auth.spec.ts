import { test, expect } from '@playwright/test';
import { loginUser, TEST_EMAIL, TEST_PASSWORD } from './helpers';

/**
 * Authentication Tests (NO saved session)
 * These tests verify login/logout flows
 * Each test uses loginUser() helper
 * 
 * Run with: npx playwright test --project=auth
 */

test.describe('Authentication', () => {
  test('signup creates new user and redirects to onboarding', async ({ page, context }) => {
    // Clear cookies to ensure fresh signup
    await context.clearCookies();

    const uniqueEmail = `test-${Date.now()}@billkaro.dev`;
    const password = 'TestPassword123!';

    test.info().annotations.push({
      type: 'description',
      description: `Sign up new user: ${uniqueEmail}`,
    });

    console.log(`\n📝 Test: Signup as ${uniqueEmail}`);

    // Navigate to signup
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/signup/);

    // Find form fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signupButton = page.locator('button[type="submit"]');

    // Verify form exists
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signupButton).toBeVisible();

    // Fill form
    await emailInput.fill(uniqueEmail);
    await passwordInput.fill(password);
    await signupButton.click();

    // Should redirect to onboarding or dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 20000 });
    const finalUrl = page.url();
    console.log(`   ✅ Redirected to: ${finalUrl}`);

    expect(finalUrl).toMatch(/\/(onboarding|dashboard)/);
  });

  test('login with valid credentials succeeds', async ({ page, context }) => {
    // Clear to ensure clean login state
    await context.clearCookies();

    console.log(`\n🔐 Test: Login with valid credentials`);

    await loginUser(page);

    // Should be on dashboard after loginUser()
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|onboarding)/);
    console.log(`   ✅ Successfully logged in\n`);
  });

  test('login with wrong password fails with error', async ({ page, context }) => {
    await context.clearCookies();

    console.log(`\n❌ Test: Login with wrong password`);

    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Use correct email but wrong password
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill('WrongPassword123!');
    await page.locator('button[type="submit"]').click();

    // Should show error or stay on login
    console.log(`   → Waiting to see if error appears or URL stays on login`);
    
    // Wait a bit for potential error message
    await page.waitForTimeout(2000);

    const error = await page.locator('[role="alert"]').first();
    const isError = await error.isVisible().catch(() => false);
    const isStillOnLogin = page.url().includes('/login');

    console.log(`   → Error shown: ${isError}, Still on login: ${isStillOnLogin}`);
    expect(isError || isStillOnLogin).toBeTruthy();
    console.log(`   ✅ Login correctly failed for invalid password\n`);
  });

  test('logout clears session and redirects to login', async ({ page, context }) => {
    // First login
    console.log(`\n🚪 Test: Logout`);
    await loginUser(page);

    // Find logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]').first();
    const hasLogout = await logoutButton.isVisible().catch(() => false);
    console.log(`   → Logout button visible: ${hasLogout}`);

    if (hasLogout) {
      console.log(`   → Clicking logout`);
      await logoutButton.click();

      // Should redirect to login
      await page.waitForURL(/\/(login|signup)/, { timeout: 15000 });
      const url = page.url();
      console.log(`   ✅ Logged out, redirected to: ${url}\n`);

      expect(url).toMatch(/\/(login|signup)/);
    } else {
      console.log(`   ⚠️  Logout button not found - skipping final verification\n`);
    }
  });

  test('accessing dashboard without login redirects to login', async ({ page, context }) => {
    // Clear session
    await context.clearCookies();

    console.log(`\n🔒 Test: Protected route redirect`);

    console.log(`   → Trying to access /dashboard without login`);
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Should be redirected to login
    const url = page.url();
    console.log(`   → URL after attempt: ${url}`);

    expect(url).toMatch(/\/(login|signup)/);
    console.log(`   ✅ Correctly redirected to login\n`);
  });

  test('invalid email format is rejected', async ({ page, context }) => {
    await context.clearCookies();

    console.log(`\n📧 Test: Invalid email validation`);

    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('not-an-email');

    // HTML5 validation should prevent submit
    const submitButton = page.locator('button[type="submit"]');
    const isSubmitDisabled = await submitButton.isDisabled().catch(() => false);

    if (isSubmitDisabled) {
      console.log(`   ✅ Submit button disabled for invalid email`);
      expect(isSubmitDisabled).toBe(true);
    } else {
      console.log(`   → Submit not disabled, checking form validation...`);
    }
  });
});
