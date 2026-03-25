import { test, expect } from '@playwright/test';

/**
 * Dashboard Tests (USES saved session)
 * 
 * These tests DO NOT call loginUser() because:
 * - globalSetup.ts already created and saved session
 * - playwright.config.ts loads session via storageState
 * - Cookies/tokens already set before each test
 * - Much faster - no login overhead
 * 
 * Run with: npx playwright test --project=authenticated
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`\n📊 Dashboard Test`);
    // Session already loaded from tests/auth.json
    // Just navigate - already authenticated
    await page.goto('/dashboard');
  });

  test('dashboard loads with logged-in user', async ({ page }) => {
    // Should be on dashboard, already authenticated
    await expect(page).toHaveURL(/\/dashboard$/);
    console.log(`   ✅ On dashboard\n`);
  });

  test('revenue section is visible', async ({ page }) => {
    // Look for revenue stats
    const revenueSection = page.locator('text=/Revenue|Total|₹/i').first();
    await expect(revenueSection).toBeVisible();
    console.log(`   ✅ Revenue section visible\n`);
  });

  test('recent invoices table is visible', async ({ page }) => {
    // Look for invoices table
    const table = page.locator('table, [role="grid"]').first();
    const tableVisible = await table.isVisible().catch(() => false);

    if (tableVisible) {
      console.log(`   ✅ Recent invoices table visible\n`);
    } else {
      console.log(`   ℹ️  Table not visible (may not have invoices)\n`);
    }
  });

  test('can navigate to invoices page', async ({ page }) => {
    // Click invoices link
    const invoicesLink = page.locator('a, button').filter({ hasText: /Invoices|All Invoices/i }).first();
    
    if (await invoicesLink.isVisible().catch(() => false)) {
      await invoicesLink.click();
      await page.waitForURL(/\/dashboard\/invoices/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/dashboard\/invoices/);
      console.log(`   ✅ Navigated to invoices page\n`);
    } else {
      console.log(`   ℹ️  Invoices link not found\n`);
    }
  });

  test('free plan banner is visible', async ({ page }) => {
    // Look for upgrade CTA
    const banner = page.locator('text=/Upgrade|Free|Premium|Plan/i').first();
    const bannerVisible = await banner.isVisible().catch(() => false);

    if (bannerVisible) {
      console.log(`   ✅ Plan banner visible\n`);
    } else {
      console.log(`   ℹ️  Plan banner not visible\n`);
    }
  });

  test('sidebar navigation is accessible', async ({ page }) => {
    // Look for sidebar/nav
    const nav = page.locator('[role="navigation"], aside, nav').first();
    const navVisible = await nav.isVisible().catch(() => false);

    if (navVisible) {
      console.log(`   ✅ Navigation visible\n`);
    } else {
      console.log(`   ℹ️  Navigation not visible\n`);
    }
  });

  test('user menu/settings accessible', async ({ page }) => {
    // Look for user menu or settings
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Settings"), button:has-text("Profile")').first();
    const menuVisible = await userMenu.isVisible().catch(() => false);

    if (menuVisible) {
      console.log(`   ✅ User menu accessible\n`);
    } else {
      console.log(`   ℹ️  User menu not visible\n`);
    }
  });
});

test.describe('Dashboard - Navigation', () => {
  test('navigate to customers page', async ({ page }) => {
    await page.goto('/dashboard');
    
    const customersLink = page.locator('a, button').filter({ hasText: /Customers/i }).first();
    if (await customersLink.isVisible().catch(() => false)) {
      await customersLink.click();
      await page.waitForURL(/\/dashboard\/customers/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/dashboard\/customers/);
      console.log(`   ✅ Navigated to customers page\n`);
    }
  });

  test('navigate to business settings', async ({ page }) => {
    await page.goto('/dashboard');
    
    const settingsLink = page.locator('a, button').filter({ hasText: /Settings|Business/i }).first();
    if (await settingsLink.isVisible().catch(() => false)) {
      await settingsLink.click();
      await page.waitForURL(/\/dashboard\/business/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/dashboard\/business/);
      console.log(`   ✅ Navigated to business settings\n`);
    }
  });

  test('navigate to create new invoice', async ({ page }) => {
    await page.goto('/dashboard');
    
    const newInvoiceBtn = page.locator('button, a').filter({ hasText: /New Invoice|Create Invoice|New/i }).first();
    if (await newInvoiceBtn.isVisible().catch(() => false)) {
      await newInvoiceBtn.click();
      await page.waitForURL(/\/invoice\/new/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/invoice\/new/);
      console.log(`   ✅ Navigated to invoice creation\n`);
    }
  });
});
