import { test, expect } from '@playwright/test'

// ─── PUBLIC PAGE TESTS (no login required) ────────────────────────────────

test.describe('Public Pages', () => {

  test('Landing page loads with BillKaro branding', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/BillKaro/)
    await expect(page.locator('text=BillKaro').first()).toBeVisible()
    console.log('✅ Landing page loads')
  })

  test('Login page renders form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    console.log('✅ Login page renders')
  })

  test('Signup page renders form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    console.log('✅ Signup page renders')
  })

  test('/dashboard redirects to /login when not logged in', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
    console.log('✅ /dashboard redirects to /login')
  })

  test('Privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1:has-text("Privacy Policy")')).toBeVisible()
    console.log('✅ Privacy page loads')
  })

  test('Terms of service page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1:has-text("Terms of Service")')).toBeVisible()
    console.log('✅ Terms page loads')
  })

  test('Random URL shows 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('text=Page not found, text=404').first()
    ).toBeVisible()
    console.log('✅ 404 page works')
  })

  test('/pay/fake-id shows 404 or error', async ({ page }) => {
    await page.goto('/pay/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    expect(body!.includes('not found') || body!.includes('404') || body!.includes('error')).toBeTruthy()
    console.log('✅ /pay/fake-id handled')
  })

})
