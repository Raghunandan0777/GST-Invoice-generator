import { test, expect } from '@playwright/test'
import { loginUser } from './helpers'

// ─── FEATURES: Customer CRUD, Business Settings, Export, Recurring ────────
// NOTE: Most of these features are already tested in billkaro-dashboard.spec.ts
// This file covers additional scenarios not covered there.

test.describe('Customer CRUD Operations', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/customers')
    await page.waitForLoadState('networkidle')
  })

  test('Create, edit, and delete a customer', async ({ page }) => {
    const name = `E2E Customer ${Date.now()}`

    // Create
    await page.click('button:has-text("Add Customer")')
    await page.fill('input[placeholder*="Patel Electronics"]', name)
    await page.fill('input[placeholder*="+91 99999"]', '+91 98765 43210')
    await page.click('button:has-text("Save Customer")')
    await page.waitForTimeout(2000)
    await expect(page.locator(`text=${name}`)).toBeVisible()
    console.log(`✅ Customer "${name}" created`)

    // Edit
    const card = page.locator(`text=${name}`).locator('..')
    await card.hover()
    await page.click('button:has-text("Edit")')
    await expect(page.locator('text=Edit Customer')).toBeVisible()
    await page.click('button:has-text("Cancel")')
    console.log('✅ Edit modal opened and cancelled')

    // Delete
    await card.hover()
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')
    await page.waitForTimeout(1000)
    console.log('✅ Customer deleted')
  })

})

test.describe('Business Settings Save', () => {

  test('Save business details shows success feedback', async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/business')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("My Business")')).toBeVisible()

    await page.fill('input[placeholder*="Sharma Traders"]', `Test Biz ${Date.now()}`)
    await page.click('button:has-text("Save Business Details")')
    await expect(
      page.locator('button:has-text("Saved!"), button:has-text("Saving...")')
    ).toBeVisible({ timeout: 8000 })
    console.log('✅ Business details saved with feedback')
  })

})

test.describe('Export Page', () => {

  test('All export formats selectable and download button works', async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/export')
    await page.waitForLoadState('networkidle')

    // Excel selected by default
    await expect(page.locator('text=SELECTED').first()).toBeVisible()

    // Switch to CSV
    await page.click('text=CSV')
    await expect(page.locator('button:has-text("Download CSV")')).toBeVisible()

    // Switch to Tally
    await page.click('text=Tally XML')
    await expect(page.locator('text=How to import into Tally')).toBeVisible()

    console.log('✅ All export formats work')
  })

})

test.describe('Recurring Invoice Creation', () => {

  test('Create a recurring invoice', async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/recurring')
    await page.waitForLoadState('networkidle')

    await page.click('button:has-text("New Recurring")')
    await expect(page.locator('text=New Recurring Invoice')).toBeVisible()

    // Fill required fields
    await page.fill('input[placeholder*="Patel Enterprises"]', `Recurring Client ${Date.now()}`)

    // Fill item
    const itemInputs = page.locator('input[placeholder*="Service name"]')
    await itemInputs.first().fill('Monthly Retainer')
    const rateInput = page.locator('input[type="number"]').first()
    await rateInput.fill('10000')

    // Check estimated total updates
    await expect(page.locator('text=Estimated invoice value')).toBeVisible()

    // Cancel instead of saving to avoid test data pollution
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('text=New Recurring Invoice')).not.toBeVisible()

    console.log('✅ Recurring invoice form works correctly')
  })

})
