import { Page, expect } from '@playwright/test'

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: This test user must exist in your Supabase project
// The globalSetup.ts file will verify this during test initialization
// ─────────────────────────────────────────────────────────────────────────────
export const TEST_EMAIL = process.env.TEST_EMAIL || 'test@billkaro.dev'
export const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!'

/**
 * MANUAL LOGIN function (for auth tests without saved session)
 * Throws clear errors if login fails - no silent failures
 */
export async function loginUser(page: Page): Promise<void> {
  console.log(`\n🔐 Login Test: Attempting to login as ${TEST_EMAIL}`)
  console.log(`   → Navigating to /login`)

  try {
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 })
    const currentUrl = page.url()
    console.log(`   → Current URL: ${currentUrl}`)

    if (!currentUrl.includes('/login')) {
      throw new Error(
        `Expected to be on /login, but got ${currentUrl}\n` +
        `Possible issue: User might already be logged in`
      )
    }

    // Verify form elements exist
    console.log(`   → Looking for email input`)
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await expect(emailInput).toBeVisible({ timeout: 10000 }).catch(() => {
      throw new Error(
        `Email input field not found on /login\n` +
        `Selector tried: input[type="email"]\n` +
        `Check if login page structure changed`
      )
    })

    await expect(passwordInput).toBeVisible({ timeout: 10000 }).catch(() => {
      throw new Error(`Password input field not found on /login`)
    })

    await expect(submitButton).toBeVisible({ timeout: 10000 }).catch(() => {
      throw new Error(`Submit button not found on /login`)
    })

    // Fill credentials
    console.log(`   → Filling email: ${TEST_EMAIL}`)
    await emailInput.fill(TEST_EMAIL)

    console.log(`   → Filling password`)
    await passwordInput.fill(TEST_PASSWORD)

    // Submit form
    console.log(`   → Clicking submit button`)
    await submitButton.click()

    // Wait for navigation with timeout
    console.log(`   → Waiting for redirect to dashboard or onboarding...`)
    await page.waitForURL(/\/(dashboard|onboarding)/, {
      timeout: 20000,
    }).catch(async (error) => {
      // Provide detailed error info
      const currentUrl = page.url()
      const errorElement = await page.locator('[role="alert"]').first()
      const errorText = await errorElement.textContent().catch(() => null)
      
      throw new Error(
        `❌ Login redirect failed after ${error.message.includes('timeout') ? '20 seconds' : 'navigation'}\n` +
        `   Current URL: ${currentUrl}\n` +
        `   Expected: /dashboard or /onboarding\n` +
        `   Error on page: "${errorText || 'No error message found'}"\n` +
        `   Possible causes:\n` +
        `   1. Credentials are wrong\n` +
        `   2. User doesn't exist in Supabase\n` +
        `   3. Supabase is not configured\n` +
        `   4. Email not confirmed in Supabase\n` +
        `   5. App server not running properly`
      )
    })

    const postLoginUrl = page.url()
    console.log(`   ✅ Redirected to: ${postLoginUrl}`)

    // Handle onboarding flow if needed
    if (postLoginUrl.includes('/onboarding')) {
      console.log(`   → On onboarding, checking for skip button`)
      const skipButton = page.locator('button:has-text("Skip"), button:has-text("Skip for now")')
      const skipExists = await skipButton.isVisible().catch(() => false)

      if (skipExists) {
        console.log(`   → Clicking skip button`)
        await skipButton.click()
        console.log(`   → Waiting for redirect from onboarding`)
        await page.waitForURL('/dashboard', { timeout: 15000 }).catch(async () => {
          throw new Error(
            `Failed to skip onboarding and redirect to dashboard\n` +
            `Current URL: ${page.url()}`
          )
        })
      }
    }

    // Final verification
    const finalUrl = page.url()
    console.log(`   → Final URL: ${finalUrl}`)

    if (!finalUrl.includes('/dashboard') && !finalUrl.includes('/onboarding')) {
      throw new Error(
        `❌ After login, expected dashboard or onboarding\n` +
        `   Got: ${finalUrl}`
      )
    }

    // Check for logged-in indicators
    const userMenu = await page.locator('[data-testid="user-menu"], button:has-text("Settings"), button:has-text("Logout")').first()
    const isLoggedIn = await userMenu.isVisible().catch(() => false)

    if (!isLoggedIn) {
      console.warn(`   ⚠️  Warning: Logged-in user menu not found, but URL suggests logged in`)
    }

    console.log(`   ✅ Login successful!\n`)

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`\n❌ Login failed: ${message}\n`)
    throw error
  }
}

export async function createTestInvoice(
  page: Page,
  overrides: Record<string, string> = {}
): Promise<string> {
  console.log(`\n📝 Creating test invoice`)
  
  try {
    console.log(`   → Navigating to /invoice/new`)
    await page.goto('/invoice/new', { waitUntil: 'networkidle', timeout: 30000 })
    
    const invoiceNumber = `TEST-${Date.now()}`
    console.log(`   → Invoice number: ${invoiceNumber}`)

    // Try common field selectors
    const sellerNameInput = page.locator('#sellerName, input[name="sellerName"], input[placeholder*="Seller"]').first()
    const buyerNameInput = page.locator('#buyerName, input[name="buyerName"], input[placeholder*="Buyer"]').first()
    const invoiceNoInput = page.locator('#invoiceNo, input[name="invoiceNo"], input[placeholder*="Invoice"]').first()

    if (await sellerNameInput.isVisible().catch(() => false)) {
      await sellerNameInput.fill(overrides.sellerName || 'Test Seller Pvt Ltd')
      console.log(`   ✓ Filled seller name`)
    }

    if (await buyerNameInput.isVisible().catch(() => false)) {
      await buyerNameInput.fill(overrides.buyerName || 'Test Buyer Co')
      console.log(`   ✓ Filled buyer name`)
    }

    if (await invoiceNoInput.isVisible().catch(() => false)) {
      await invoiceNoInput.fill(invoiceNumber)
      console.log(`   ✓ Filled invoice number`)
    }

    // Save
    console.log(`   → Looking for save button`)
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Draft")').first()
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click()
      console.log(`   → Clicking save`)
    }

    // Wait for invoice to be saved
    console.log(`   → Waiting for invoice to be created`)
    await page.waitForURL(/\/invoice\/[a-zA-Z0-9-]+$/, { timeout: 20000 })

    const finalUrl = page.url()
    const invoiceId = finalUrl.split('/invoice/')[1].split('/')[0]
    console.log(`   ✅ Invoice created with ID: ${invoiceId}\n`)

    return invoiceId
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to create test invoice: ${message}`)
  }
}

/**
 * Helper to verify app is in expected state
 */
export async function verifyPageUrl(page: Page, expectedPattern: RegExp | string, description: string): Promise<void> {
  const actualUrl = page.url()
  const isMatch = typeof expectedPattern === 'string' 
    ? actualUrl === expectedPattern 
    : expectedPattern.test(actualUrl)

  if (!isMatch) {
    throw new Error(
      `❌ URL verification failed: ${description}\n` +
      `   Expected: ${expectedPattern}\n` +
      `   Got: ${actualUrl}`
    )
  }
}
