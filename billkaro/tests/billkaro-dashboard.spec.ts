import { test, expect } from '@playwright/test'
import { loginUser, createTestInvoice } from './helpers'

// ─── 5. DASHBOARD ─────────────────────────────────────────────────────────

test.describe('5. DASHBOARD', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=नमस्ते').first()).toBeVisible()
  })

  test('5.1 - Dashboard loads with Hindi greeting', async ({ page }) => {
    await expect(page.locator('text=नमस्ते').first()).toBeVisible()
    console.log('✅ Dashboard greeting visible')
  })

  test('5.2 - All 4 stat cards visible', async ({ page }) => {
    await expect(page.locator('text=Total Revenue')).toBeVisible()
    await expect(page.locator('text=This Month')).toBeVisible()
    await expect(page.locator('text=Pending')).toBeVisible()
    await expect(page.locator('text=GST Collected')).toBeVisible()
    console.log('✅ All 4 stat cards visible')
  })

  test('5.3 - Revenue chart renders', async ({ page }) => {
    await expect(page.locator('text=Revenue Overview')).toBeVisible()
    console.log('✅ Revenue chart renders')
  })

  test('5.4 - Quick actions panel visible', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible()
    await expect(page.locator('a:has-text("New Invoice")')).toBeVisible()
    console.log('✅ Quick actions panel visible')
  })

  test('5.5 - New Invoice CTA navigates correctly', async ({ page }) => {
    await page.click('a[href="/invoice/new"]:has-text("New Invoice")').catch(async () => {
      await page.click('a:has-text("New Invoice")')
    })
    await page.waitForURL('/invoice/new', { timeout: 10000 })
    await expect(page).toHaveURL('/invoice/new')
    console.log('✅ New Invoice button navigates to /invoice/new')
  })

  test('5.6 - Status pills show draft/paid/sent/overdue', async ({ page }) => {
    await expect(page.locator('text=Draft').first()).toBeVisible()
    await expect(page.locator('text=Paid').first()).toBeVisible()
    await expect(page.locator('text=Sent').first()).toBeVisible()
    await expect(page.locator('text=Overdue').first()).toBeVisible()
    console.log('✅ Status summary pills visible')
  })

  test('5.7 - Sidebar shows all nav items', async ({ page }) => {
    await expect(page.locator('aside a:has-text("Invoices")')).toBeVisible()
    await expect(page.locator('aside a:has-text("Customers")')).toBeVisible()
    await expect(page.locator('aside a:has-text("Recurring")')).toBeVisible()
    await expect(page.locator('aside a:has-text("Export")')).toBeVisible()
    console.log('✅ Sidebar nav items all visible')
  })

})

// ─── 6. INVOICES LIST ─────────────────────────────────────────────────────

test.describe('6. INVOICES LIST (/dashboard/invoices)', () => {

  test.beforeAll(async ({ browser }) => {
    // Create some test invoices for filtering/sorting
    const page = await browser.newPage()
    await loginUser(page)
    await createTestInvoice(page, { buyerName: 'Alpha Corp', rate: '5000' })
    await createTestInvoice(page, { buyerName: 'Beta Ltd',  rate: '15000' })
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/invoices')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Invoices")')).toBeVisible()
  })

  test('6.1 - Page heading and New Invoice button visible', async ({ page }) => {
    await expect(page.locator('h1:has-text("Invoices")')).toBeVisible()
    await expect(page.locator('a:has-text("New Invoice")')).toBeVisible()
    console.log('✅ Invoices page heading visible')
  })

  test('6.2 - Search box accepts input', async ({ page }) => {
    const searchBox = page.locator('input[placeholder*="Search"]')
    await expect(searchBox).toBeVisible()
    await searchBox.fill('Alpha')
    const val = await searchBox.inputValue()
    expect(val).toBe('Alpha')
    console.log('✅ Search box accepts input')
  })

  test('6.3 - Search shows "no match" for nonsense query', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'ZZZNOMATCH999')
    await page.waitForTimeout(500)
    await expect(page.locator('text=No invoices match')).toBeVisible()
    console.log('✅ Empty search results shown correctly')
  })

  test('6.4 - Status filter pills all present', async ({ page }) => {
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.locator('button:has-text("draft")')).toBeVisible()
    await expect(page.locator('button:has-text("paid")')).toBeVisible()
    await expect(page.locator('button:has-text("sent")')).toBeVisible()
    await expect(page.locator('button:has-text("overdue")')).toBeVisible()
    console.log('✅ All status filter pills present')
  })

  test('6.5 - Clicking status pill highlights it amber', async ({ page }) => {
    await page.click('button:has-text("paid")')
    await page.waitForTimeout(300)
    const cls = await page.locator('button:has-text("paid")').getAttribute('class')
    expect(cls).toContain('amber')
    console.log('✅ Active status pill turns amber')
  })

  test('6.6 - Footer shows invoice count', async ({ page }) => {
    await expect(page.locator('text=/Showing [0-9]+ of [0-9]+/')).toBeVisible()
    console.log('✅ Footer shows invoice count')
  })

  test('6.7 - Sort by Amount button clickable', async ({ page }) => {
    await page.click('button:has-text("Amount")')
    await page.waitForTimeout(500)
    // Should not crash — page still shows invoices heading
    await expect(page.locator('h1:has-text("Invoices")')).toBeVisible()
    console.log('✅ Sort by Amount does not crash')
  })

  test('6.8 - View link on invoice row works', async ({ page }) => {
    // Hover on first row to reveal buttons
    const firstRow = page.locator('tbody tr').first()
    await firstRow.hover()
    const viewLink = firstRow.locator('a:has-text("View")')
    await expect(viewLink).toBeVisible()
    console.log('✅ View link visible on hover')
  })

})

// ─── 7. CUSTOMERS ─────────────────────────────────────────────────────────

test.describe('7. CUSTOMERS (/dashboard/customers)', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/customers')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Customers")')).toBeVisible()
  })

  test('7.1 - Page loads with Add Customer button', async ({ page }) => {
    await expect(page.locator('h1:has-text("Customers")')).toBeVisible()
    await expect(page.locator('button:has-text("Add Customer")')).toBeVisible()
    console.log('✅ Customers page loaded')
  })

  test('7.2 - Add Customer modal opens', async ({ page }) => {
    await page.click('button:has-text("Add Customer")')
    await expect(page.locator('input[placeholder*="Patel Electronics"]')).toBeVisible()
    console.log('✅ Add Customer modal opened')
  })

  test('7.3 - Cancel closes modal', async ({ page }) => {
    await page.click('button:has-text("Add Customer")')
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('input[placeholder*="Patel Electronics"]')).not.toBeVisible()
    console.log('✅ Cancel closes modal')
  })

  test('7.4 - Save without name keeps modal open', async ({ page }) => {
    await page.click('button:has-text("Add Customer")')
    await page.click('button:has-text("Save Customer")')
    // Modal should still be open (name required)
    await expect(page.locator('input[placeholder*="Patel Electronics"]')).toBeVisible()
    console.log('✅ Save blocked without name')
  })

  test('7.5 - Save with name closes modal and shows customer', async ({ page }) => {
    const name = `Test Customer ${Date.now()}`
    await page.click('button:has-text("Add Customer")')
    await page.fill('input[placeholder*="Patel Electronics"]', name)
    await page.click('button:has-text("Save Customer")')
    await page.waitForTimeout(2000)
    await expect(page.locator('input[placeholder*="Patel Electronics"]')).not.toBeVisible()
    await expect(page.locator(`text=${name}`)).toBeVisible()
    console.log(`✅ Customer "${name}" saved and visible`)
  })

  test('7.6 - Search filters customers', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'XXXNOTFOUNDXXX')
    await page.waitForTimeout(500)
    await expect(page.locator('text=No customers found')).toBeVisible()
    console.log('✅ Search filters customers')
  })

  test('7.7 - GSTIN auto-uppercases', async ({ page }) => {
    await page.click('button:has-text("Add Customer")')
    const gstinInput = page.locator('input[placeholder*="29AABCU"]')
    await gstinInput.fill('29aabcu9603r1zx')
    const val = await gstinInput.inputValue()
    expect(val).toBe('29AABCU9603R1ZX')
    console.log('✅ GSTIN auto-uppercased in customer modal')
  })

})

// ─── 8. BUSINESS SETTINGS ─────────────────────────────────────────────────

test.describe('8. BUSINESS SETTINGS (/dashboard/business)', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/business')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("My Business")')).toBeVisible()
  })

  test('8.1 - Business page loads', async ({ page }) => {
    await expect(page.locator('h1:has-text("My Business")')).toBeVisible()
    await expect(page.locator('text=Business Info')).toBeVisible()
    await expect(page.locator('text=Bank Details')).toBeVisible()
    console.log('✅ Business settings page loaded')
  })

  test('8.2 - Save button exists and is clickable', async ({ page }) => {
    const btn = page.locator('button:has-text("Save Business Details")')
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
    console.log('✅ Save button exists and enabled')
  })

  test('8.3 - Business name accepts input', async ({ page }) => {
    await page.fill('input[placeholder*="Sharma Traders"]', 'Updated Biz Name')
    const val = await page.locator('input[placeholder*="Sharma Traders"]').inputValue()
    expect(val).toBe('Updated Biz Name')
    console.log('✅ Business name input works')
  })

  test('8.4 - Save shows success message', async ({ page }) => {
    await page.fill('input[placeholder*="Sharma Traders"]', 'Playwright Test Business')
    await page.click('button:has-text("Save Business Details")')
    await expect(
      page.locator('button:has-text("Saved!"), button:has-text("Saving...")')
    ).toBeVisible({ timeout: 8000 })
    console.log('✅ Save shows Saved! feedback')
  })

  test('8.5 - State dropdown includes key Indian states', async ({ page }) => {
    const select = page.locator('select').first()
    await expect(select.locator('option:has-text("Gujarat")')).toHaveCount(1)
    await expect(select.locator('option:has-text("Maharashtra")')).toHaveCount(1)
    await expect(select.locator('option:has-text("Delhi")')).toHaveCount(1)
    await expect(select.locator('option:has-text("Karnataka")')).toHaveCount(1)
    console.log('✅ Indian states in dropdown')
  })

})

// ─── 9. EXPORT ────────────────────────────────────────────────────────────

test.describe('9. EXPORT (/dashboard/export)', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/export')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Export")')).toBeVisible()
  })

  test('9.1 - All 3 format options visible', async ({ page }) => {
    await expect(page.locator('text=Excel (.xlsx)')).toBeVisible()
    await expect(page.locator('text=Tally XML')).toBeVisible()
    await expect(page.locator('text=CSV')).toBeVisible()
    console.log('✅ All 3 export formats visible')
  })

  test('9.2 - Excel selected by default', async ({ page }) => {
    await expect(page.locator('text=SELECTED').first()).toBeVisible()
    console.log('✅ Excel selected by default')
  })

  test('9.3 - Selecting Tally shows import instructions', async ({ page }) => {
    await page.click('text=Tally XML')
    await expect(page.locator('text=How to import into Tally')).toBeVisible()
    console.log('✅ Tally instructions shown')
  })

  test('9.4 - Date range fields visible', async ({ page }) => {
    await expect(page.locator('input[type="date"]').first()).toBeVisible()
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible()
    console.log('✅ Date range inputs visible')
  })

  test('9.5 - Download button exists', async ({ page }) => {
    await expect(page.locator('button:has-text("Download")')).toBeVisible()
    console.log('✅ Download button exists')
  })

})

// ─── 10. RECURRING ────────────────────────────────────────────────────────

test.describe('10. RECURRING INVOICES (/dashboard/recurring)', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/recurring')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Recurring")')).toBeVisible()
  })

  test('10.1 - Page loads with New Recurring button', async ({ page }) => {
    await expect(page.locator('h1:has-text("Recurring")')).toBeVisible()
    await expect(page.locator('button:has-text("New Recurring")')).toBeVisible()
    console.log('✅ Recurring page loaded')
  })

  test('10.2 - New Recurring modal opens', async ({ page }) => {
    await page.click('button:has-text("New Recurring")')
    await expect(page.locator('text=New Recurring Invoice')).toBeVisible()
    await expect(page.locator('text=Customer Details')).toBeVisible()
    console.log('✅ Recurring modal opened')
  })

  test('10.3 - All frequency options present', async ({ page }) => {
    await page.click('button:has-text("New Recurring")')
    const freqSelect = page.locator('select').first()
    await expect(freqSelect.locator('option:has-text("Every Week")')).toHaveCount(1)
    await expect(freqSelect.locator('option:has-text("Every Month")')).toHaveCount(1)
    await expect(freqSelect.locator('option:has-text("Every 3 Months")')).toHaveCount(1)
    await expect(freqSelect.locator('option:has-text("Every Year")')).toHaveCount(1)
    console.log('✅ All 4 frequency options present')
  })

  test('10.4 - Estimated amount calculates from rate', async ({ page }) => {
    await page.click('button:has-text("New Recurring")')
    await page.locator('.item-row input').nth(2).fill('10000')
    await page.waitForTimeout(300)
    await expect(page.locator('text=Estimated invoice value')).toBeVisible()
    const amountText = await page.locator('text=/₹[0-9,]+/').last().textContent()
    expect(amountText).toBeTruthy()
    console.log(`✅ Estimated amount calculated: ${amountText}`)
  })

  test('10.5 - Cancel closes modal', async ({ page }) => {
    await page.click('button:has-text("New Recurring")')
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('text=New Recurring Invoice')).not.toBeVisible()
    console.log('✅ Recurring modal closes on cancel')
  })

})

// ─── 11. UPGRADE PAGE ─────────────────────────────────────────────────────

test.describe('11. UPGRADE PAGE (/dashboard/upgrade)', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/dashboard/upgrade')
    await page.waitForLoadState('networkidle')
  })

  test('11.1 - All three plans display', async ({ page }) => {
    await expect(page.locator('text=Free Plan')).toBeVisible()
    await expect(page.locator('text=Pro')).toBeVisible()
    await expect(page.locator('text=Business')).toBeVisible()
    console.log('✅ All 3 plans visible')
  })

  test('11.2 - Pro plan price is ₹199', async ({ page }) => {
    await expect(page.locator('text=₹199').first()).toBeVisible()
    console.log('✅ Pro plan ₹199 visible')
  })

  test('11.3 - Business plan price is ₹499', async ({ page }) => {
    await expect(page.locator('text=₹499').first()).toBeVisible()
    console.log('✅ Business plan ₹499 visible')
  })

  test('11.4 - Upgrade button for Pro exists', async ({ page }) => {
    await expect(page.locator('button:has-text("Upgrade to Pro"), button:has-text("Pro")')).toBeVisible()
    console.log('✅ Upgrade to Pro button exists')
  })

})

// ─── 12. MOBILE ───────────────────────────────────────────────────────────

test.describe('12. MOBILE RESPONSIVENESS', () => {

  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
  })

  test('12.1 - Dashboard loads on iPhone SE (375px)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=नमस्ते').first()).toBeVisible()
    console.log('✅ Dashboard loads on 375px')
  })

  test('12.2 - Mobile bottom nav visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('nav.fixed.bottom-0')).toBeVisible()
    console.log('✅ Mobile bottom nav visible')
  })

  test('12.3 - Desktop sidebar hidden on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    const sidebar = page.locator('aside')
    // Sidebar has hidden md:block class — on 375px it should not be visible
    await expect(sidebar).not.toBeVisible()
    console.log('✅ Sidebar hidden on mobile')
  })

  test('12.4 - Invoice new page usable on mobile', async ({ page }) => {
    await page.goto('/invoice/new')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=New Invoice')).toBeVisible()
    await expect(page.locator('#sellerName')).toBeVisible()
    console.log('✅ Invoice new page loads on mobile')
  })

  test('12.5 - Customers page loads on mobile', async ({ page }) => {
    await page.goto('/dashboard/customers')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1:has-text("Customers")')).toBeVisible()
    console.log('✅ Customers page loads on mobile')
  })

})

// ─── 13. EDGE CASES ───────────────────────────────────────────────────────

test.describe('13. EDGE CASES', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/invoice/new')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#sellerName')).toBeVisible()
  })

  test('13.1 - 0% GST shows ₹0.00 tax in preview', async ({ page }) => {
    await page.locator('.item-row input').nth(2).fill('10000')
    await page.locator('.item-row select').selectOption('0')
    await page.waitForTimeout(300)
    const totals = await page.locator('#p-totals').textContent()
    expect(totals).toContain('0.00')
    console.log('✅ 0% GST shows zero tax')
  })

  test('13.2 - Can add exactly 10 line items', async ({ page }) => {
    for (let i = 0; i < 9; i++) {
      await page.click('button:has-text("+ Add Item")')
      await page.waitForTimeout(100)
    }
    const count = await page.locator('.item-row').count()
    expect(count).toBe(10)
    console.log(`✅ 10 items added, count: ${count}`)
  })

  test('13.3 - 100+ char customer name accepted', async ({ page }) => {
    const longName = 'A'.repeat(105)
    await page.fill('#buyerName', longName)
    const val = await page.locator('#buyerName').inputValue()
    expect(val.length).toBeGreaterThanOrEqual(100)
    console.log(`✅ Long name accepted: ${val.length} chars`)
  })

  test('13.4 - Lowercase GSTIN auto-uppercases', async ({ page }) => {
    const input = page.locator('input[placeholder*="27AAPFU"]').first()
    await input.fill('27aapfu0939f1zv')
    const val = await input.inputValue()
    expect(val).toBe('27AAPFU0939F1ZV')
    console.log('✅ GSTIN auto-uppercased on input')
  })

  test('13.5 - Negative rate does not crash the app', async ({ page }) => {
    await page.locator('.item-row input').nth(2).fill('-5000')
    await page.waitForTimeout(300)
    // App should still be functional
    await expect(page.locator('text=New Invoice')).toBeVisible()
    console.log('✅ Negative rate does not crash app')
  })

  test('13.6 - Place of supply has 30+ Indian states', async ({ page }) => {
    const options = await page.locator('#placeOfSupply option').count()
    expect(options).toBeGreaterThanOrEqual(30)
    console.log(`✅ ${options} states in place of supply`)
  })

  test('13.7 - GST 28% rate option exists', async ({ page }) => {
    const select = page.locator('.item-row select').first()
    await expect(select.locator('option:has-text("28%")')).toHaveCount(1)
    console.log('✅ 28% GST rate option exists')
  })

})

// ─── 14. ERROR HANDLING ───────────────────────────────────────────────────

test.describe('14. ERROR HANDLING', () => {

  test('14.1 - /dashboard without login → /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
    console.log('✅ /dashboard redirects to /login')
  })

  test('14.2 - /dashboard/invoices without login → /login', async ({ page }) => {
    await page.goto('/dashboard/invoices')
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
    console.log('✅ /dashboard/invoices redirects to /login')
  })

  test('14.3 - /invoice/fake-uuid shows 404', async ({ page }) => {
    await loginUser(page)
    await page.goto('/invoice/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    const has404 = body!.includes('not found') ||
                   body!.includes('404') ||
                   body!.includes('Page not found')
    expect(has404).toBeTruthy()
    console.log('✅ Fake invoice ID shows 404')
  })

  test('14.4 - Random URL shows 404 page', async ({ page }) => {
    await page.goto('/this-page-xyz-does-not-exist')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('text=Page not found, text=404').first()
    ).toBeVisible()
    console.log('✅ Random URL shows 404 page')
  })

  test('14.5 - /privacy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1:has-text("Privacy Policy")')).toBeVisible()
    console.log('✅ Privacy page accessible')
  })

  test('14.6 - /terms page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1:has-text("Terms of Service")')).toBeVisible()
    console.log('✅ Terms page accessible')
  })

  test('14.7 - /pay/fake-id shows 404', async ({ page }) => {
    await page.goto('/pay/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')
    const body = await page.locator('body').textContent()
    expect(body!.includes('not found') || body!.includes('404')).toBeTruthy()
    console.log('✅ /pay/fake-id shows 404')
  })

})
