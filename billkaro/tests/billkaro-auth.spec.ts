import { test, expect } from '@playwright/test'
import { TEST_EMAIL, TEST_PASSWORD, loginUser } from './helpers'

// ─── 1. AUTHENTICATION ────────────────────────────────────────────────────

test.describe('1. AUTHENTICATION', () => {

  test('1.1 - Landing page loads with correct content', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/BillKaro/)
    await expect(page.locator('text=BillKaro').first()).toBeVisible()
    await expect(page.locator('text=GST Invoice').first()).toBeVisible()
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible()
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
    console.log('✅ Landing page loaded correctly')
  })

  test('1.2 - Signup page renders correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('text=Sign up with Google')).toBeVisible()
    console.log('✅ Signup page renders correctly')
  })

  test('1.3 - Login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('text=Continue with Google')).toBeVisible()
    console.log('✅ Login page renders correctly')
  })

  test('1.4 - Invalid login shows error and stays on /login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]',    'nobody@nowhere.com')
    await page.fill('input[type="password"]', 'wrongpassword123')
    await page.click('button[type="submit"]')
    // Wait for error message — must appear within 10s
    await expect(
      page.locator('.bg-red-500\\/10, [class*="red"]').first()
    ).toBeVisible({ timeout: 10000 })
    // Must still be on login page
    await expect(page).toHaveURL(/\/login/)
    console.log('✅ Invalid login shows error correctly')
  })

  test('1.5 - Empty email blocks form submission', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL('/login')
    console.log('✅ Empty form blocked')
  })

  test('1.6 - Protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
    console.log('✅ /dashboard redirects to /login when not logged in')
  })

  test('1.7 - Successful login redirects to dashboard', async ({ page }) => {
    await loginUser(page)
    await expect(page).toHaveURL(/\/dashboard/)
    // Dashboard should show greeting
    await expect(page.locator('text=नमस्ते').first()).toBeVisible()
    console.log('✅ Login successful and redirected to dashboard')
  })

  test('1.8 - Already logged in redirects away from /login', async ({ page }) => {
    await loginUser(page)
    await page.goto('/login')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard/)
    console.log('✅ Logged-in user redirected from /login to /dashboard')
  })

  test('1.9 - Logout clears session', async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/settings')
    await expect(page.locator('text=Sign out')).toBeVisible()
    await page.click('text=Sign out')
    await page.waitForURL('/', { timeout: 10000 })
    // Now /dashboard should redirect to login
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
    console.log('✅ Logout clears session correctly')
  })

})

// ─── 2. ONBOARDING ────────────────────────────────────────────────────────

test.describe('2. ONBOARDING FLOW', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/onboarding')
    await expect(page.locator('text=Welcome to BillKaro')).toBeVisible()
  })

  test('2.1 - Welcome step shows all elements', async ({ page }) => {
    await expect(page.locator('text=Welcome to BillKaro')).toBeVisible()
    await expect(page.locator('button:has-text("Let\'s Set Up")')).toBeVisible()
    await expect(page.locator('button:has-text("Skip for now")')).toBeVisible()
    // Progress steps
    await expect(page.locator('text=Welcome')).toBeVisible()
    await expect(page.locator('text=Business Info')).toBeVisible()
    console.log('✅ Welcome step renders correctly')
  })

  test('2.2 - Continue button disabled without business name', async ({ page }) => {
    await page.click('button:has-text("Let\'s Set Up")')
    await expect(page.locator('text=Business Details')).toBeVisible()
    const continueBtn = page.locator('button:has-text("Continue")')
    await expect(continueBtn).toBeDisabled()
    console.log('✅ Continue disabled without business name')
  })

  test('2.3 - Continue enabled after typing business name', async ({ page }) => {
    await page.click('button:has-text("Let\'s Set Up")')
    await page.fill('input[placeholder*="Sharma Traders"]', 'My Test Shop')
    const continueBtn = page.locator('button:has-text("Continue")')
    await expect(continueBtn).toBeEnabled()
    console.log('✅ Continue enabled after name entered')
  })

  test('2.4 - GSTIN auto-uppercases', async ({ page }) => {
    await page.click('button:has-text("Let\'s Set Up")')
    const input = page.locator('input[placeholder*="27AAPFU"]')
    await input.fill('27aapfu0939f1zv')
    const val = await input.inputValue()
    expect(val).toBe('27AAPFU0939F1ZV')
    console.log('✅ GSTIN auto-uppercased')
  })

  test('2.5 - Valid GSTIN shows green indicator', async ({ page }) => {
    await page.click('button:has-text("Let\'s Set Up")')
    const input = page.locator('input[placeholder*="27AAPFU"]')
    await input.fill('27AAPFU0939F1ZV')
    await expect(page.locator('text=Valid GSTIN').first()).toBeVisible()
    console.log('✅ Valid GSTIN shows green')
  })

  test('2.6 - Invalid GSTIN shows error', async ({ page }) => {
    await page.click('button:has-text("Let\'s Set Up")')
    const input = page.locator('input[placeholder*="27AAPFU"]')
    await input.fill('BADGSTIN1234567')
    await expect(page.locator('text=Invalid GSTIN format').first()).toBeVisible()
    console.log('✅ Invalid GSTIN shows error')
  })

  test('2.7 - Skip navigates to dashboard', async ({ page }) => {
    await page.click('button:has-text("Skip for now")')
    await page.waitForURL('/dashboard', { timeout: 10000 })
    await expect(page).toHaveURL('/dashboard')
    console.log('✅ Skip goes to dashboard')
  })

  test('2.8 - Full flow saves business and redirects', async ({ page }) => {
    await page.click('button:has-text("Let\'s Set Up")')
    await page.fill('input[placeholder*="Sharma Traders"]', 'Playwright Test Biz')
    await page.click('button:has-text("Continue")')
    await expect(page.locator('text=Bank Details')).toBeVisible()
    await page.fill('input[placeholder*="State Bank"]', 'Test Bank')
    await page.click('button:has-text("Finish Setup")')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    await expect(page).toHaveURL('/dashboard')
    console.log('✅ Full onboarding completes and saves')
  })

})
