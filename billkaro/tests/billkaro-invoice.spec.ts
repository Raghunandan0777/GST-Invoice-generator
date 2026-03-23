import { test, expect } from '@playwright/test'
import { loginUser, createTestInvoice } from './helpers'

// ─── 3. INVOICE CREATION ─────────────────────────────────────────────────

test.describe('3. INVOICE CREATION (/invoice/new)', () => {

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto('/invoice/new')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#sellerName')).toBeVisible()
  })

  test('3.1 - Page loads with form and live preview side by side', async ({ page }) => {
    await expect(page.locator('text=New Invoice')).toBeVisible()
    await expect(page.locator('text=INVOICE')).toBeVisible()
    await expect(page.locator('#sellerName')).toBeVisible()
    await expect(page.locator('#buyerName')).toBeVisible()
    await expect(page.locator('#invoiceNo')).toBeVisible()
    console.log('✅ Invoice new page loaded')
  })

  test('3.2 - Seller name updates live preview instantly', async ({ page }) => {
    await page.fill('#sellerName', 'Sharma Electronics')
    await expect(page.locator('#p-sellerName')).toHaveText('Sharma Electronics')
    console.log('✅ Live preview updates seller name')
  })

  test('3.3 - Buyer name updates live preview', async ({ page }) => {
    await page.fill('#buyerName', 'Patel Industries')
    await expect(page.locator('#p-buyerName')).toHaveText('Patel Industries')
    console.log('✅ Live preview updates buyer name')
  })

  test('3.4 - Valid GSTIN shows green tick', async ({ page }) => {
    const gstinInput = page.locator('input[placeholder*="27AAPFU"]').first()
    await gstinInput.fill('27AAPFU0939F1ZV')
    await expect(page.locator('text=Valid GSTIN').first()).toBeVisible()
    console.log('✅ Valid GSTIN shows green')
  })

  test('3.5 - Invalid GSTIN shows red error', async ({ page }) => {
    const gstinInput = page.locator('input[placeholder*="27AAPFU"]').first()
    await gstinInput.fill('INVALIDGSTIN123')
    await expect(page.locator('text=Invalid GSTIN format').first()).toBeVisible()
    console.log('✅ Invalid GSTIN shows red error')
  })

  test('3.6 - Item rate calculates taxable amount', async ({ page }) => {
    await page.locator('.item-row').first().locator('input').nth(2).fill('50000')
    await page.locator('.item-row').first().locator('input').nth(3).fill('1')
    const amountDisplay = page.locator('.amount-display').first()
    await expect(amountDisplay).toContainText('50,000')
    console.log('✅ Taxable amount calculates correctly')
  })

  test('3.7 - Add item button adds new row', async ({ page }) => {
    const before = await page.locator('.item-row').count()
    await page.click('button:has-text("+ Add Item")')
    const after = await page.locator('.item-row').count()
    expect(after).toBe(before + 1)
    console.log(`✅ Item row added: ${before} → ${after}`)
  })

  test('3.8 - Remove item button removes row', async ({ page }) => {
    await page.click('button:has-text("+ Add Item")')
    const before = await page.locator('.item-row').count()
    await page.locator('.btn-remove').first().click()
    const after = await page.locator('.item-row').count()
    expect(after).toBe(before - 1)
    console.log(`✅ Item row removed: ${before} → ${after}`)
  })

  test('3.9 - Default GST type is CGST+SGST', async ({ page }) => {
    await expect(page.locator('#p-totals')).toContainText('CGST')
    await expect(page.locator('#p-totals')).toContainText('SGST')
    console.log('✅ Default GST type is CGST+SGST')
  })

  test('3.10 - Switching to IGST updates preview header', async ({ page }) => {
    await page.click('label[for="gstIGST"]')
    await expect(page.locator('#gstHeader')).toContainText('IGST')
    console.log('✅ Switched to IGST correctly')
  })

  test('3.11 - 0% GST shows zero tax in preview', async ({ page }) => {
    await page.locator('.item-row').first().locator('input').nth(2).fill('10000')
    await page.locator('.item-row').first().locator('select').selectOption('0')
    await page.waitForTimeout(300)
    const totals = await page.locator('#p-totals').textContent()
    expect(totals).toContain('0.00')
    console.log('✅ 0% GST shows zero tax')
  })

  test('3.12 - Amount in words is in Indian format (Lakh/Crore)', async ({ page }) => {
    await page.locator('.item-row').first().locator('input').nth(2).fill('100000')
    await page.locator('.item-row').first().locator('input').nth(3).fill('1')
    await page.waitForTimeout(300)
    const words = await page.locator('#p-amountWords').textContent()
    expect(words).toMatch(/Lakh|lakh/)
    console.log('✅ Amount in words shows Lakh format')
  })

  test('3.13 - Invoice number pre-filled with INV-XXXX format', async ({ page }) => {
    const val = await page.locator('#invoiceNo').inputValue()
    expect(val).toMatch(/INV-\d{4}/)
    console.log(`✅ Invoice number pre-filled: ${val}`)
  })

  test('3.14 - Invoice date pre-filled with today', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    const val   = await page.locator('#invoiceDate').inputValue()
    expect(val).toBe(today)
    console.log(`✅ Invoice date is today: ${val}`)
  })

  test('3.15 - Save Draft redirects to invoice view', async ({ page }) => {
    await page.fill('#sellerName', 'Draft Seller')
    await page.fill('#buyerName',  'Draft Buyer')
    await page.locator('.item-row').first().locator('input').nth(0).fill('Draft Service')
    await page.locator('.item-row').first().locator('input').nth(2).fill('5000')
    await page.click('button:has-text("Save Draft")')
    await page.waitForURL(/\/invoice\/[a-zA-Z0-9-]+$/, { timeout: 20000 })
    expect(page.url()).toMatch(/\/invoice\/[a-zA-Z0-9-]+$/)
    console.log('✅ Draft saved and redirected to invoice view')
  })

  test('3.16 - After save, buyer name field resets to empty', async ({ page }) => {
    await page.fill('#sellerName', 'Reset Test Seller')
    await page.fill('#buyerName',  'Reset Test Buyer')
    await page.locator('.item-row').first().locator('input').nth(0).fill('Reset Service')
    await page.locator('.item-row').first().locator('input').nth(2).fill('1000')
    await page.click('button:has-text("Save Draft")')
    await page.waitForURL(/\/invoice\/[a-zA-Z0-9-]+$/, { timeout: 20000 })
    // Go back to new invoice
    await page.goto('/invoice/new')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#buyerName')).toBeVisible()
    const buyerVal = await page.locator('#buyerName').inputValue()
    expect(buyerVal).toBe('')
    console.log('✅ Buyer fields reset after save')
  })

  test('3.17 - Can add 10 line items', async ({ page }) => {
    for (let i = 0; i < 9; i++) {
      await page.click('button:has-text("+ Add Item")')
    }
    const count = await page.locator('.item-row').count()
    expect(count).toBe(10)
    console.log('✅ 10 line items added successfully')
  })

  test('3.18 - GSTIN max 15 characters enforced', async ({ page }) => {
    const input = page.locator('input[placeholder*="27AAPFU"]').first()
    await input.fill('12345678901234567890') // 20 chars
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(15)
    console.log(`✅ GSTIN limited to ${val.length} chars`)
  })

  test('3.19 - Place of supply dropdown has Gujarat', async ({ page }) => {
    const select = page.locator('#placeOfSupply')
    await expect(select.locator('option:has-text("Gujarat")')).toHaveCount(1)
    console.log('✅ Place of supply has Indian states')
  })

  test('3.20 - Print button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Print")')).toBeVisible()
    console.log('✅ Print button visible')
  })

})

// ─── 4. INVOICE VIEW ─────────────────────────────────────────────────────

test.describe('4. INVOICE VIEW (/invoice/[id])', () => {

  let invoiceId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginUser(page)
    invoiceId = await createTestInvoice(page, {
      sellerName: 'View Seller Co',
      buyerName:  'View Buyer Ltd',
      itemName:   'Consulting Service',
      rate:       '25000',
    })
    await page.close()
    console.log(`Created test invoice: ${invoiceId}`)
  })

  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`/invoice/${invoiceId}`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=View Seller Co')).toBeVisible()
  })

  test('4.1 - Seller name displays correctly', async ({ page }) => {
    await expect(page.locator('text=View Seller Co')).toBeVisible()
    console.log('✅ Seller name visible')
  })

  test('4.2 - Buyer name displays correctly', async ({ page }) => {
    await expect(page.locator('text=View Buyer Ltd')).toBeVisible()
    console.log('✅ Buyer name visible')
  })

  test('4.3 - Item name displays correctly', async ({ page }) => {
    await expect(page.locator('text=Consulting Service')).toBeVisible()
    console.log('✅ Item name visible')
  })

  test('4.4 - Grand total is calculated correctly (25000 + 18% = 29500)', async ({ page }) => {
    await expect(page.locator('text=/₹29,500|29,500/')).toBeVisible()
    console.log('✅ Grand total ₹29,500 displayed')
  })

  test('4.5 - Amount in words visible', async ({ page }) => {
    await expect(page.locator('text=Amount in Words')).toBeVisible()
    await expect(page.locator('text=Rupees Only')).toBeVisible()
    console.log('✅ Amount in words displayed')
  })

  test('4.6 - TAX INVOICE heading visible', async ({ page }) => {
    await expect(page.locator('text=TAX')).toBeVisible()
    await expect(page.locator('text=INVOICE')).toBeVisible()
    console.log('✅ TAX INVOICE heading visible')
  })

  test('4.7 - Status badge visible', async ({ page }) => {
    const badge = page.locator('.font-mono').filter({ hasText: /draft|sent|paid|overdue/ }).first()
    await expect(badge).toBeVisible()
    console.log('✅ Status badge visible')
  })

  test('4.8 - Status dropdown shows all options', async ({ page }) => {
    await page.locator('.font-mono').filter({ hasText: /draft|sent|paid/ }).first().click()
    await expect(page.locator('button:has-text("paid")')).toBeVisible()
    await expect(page.locator('button:has-text("overdue")')).toBeVisible()
    await expect(page.locator('button:has-text("sent")')).toBeVisible()
    console.log('✅ Status dropdown shows all options')
  })

  test('4.9 - Edit link navigates to edit page', async ({ page }) => {
    await page.click('a:has-text("Edit"), button:has-text("Edit")')
    await page.waitForURL(`/invoice/${invoiceId}/edit`, { timeout: 10000 })
    await expect(page).toHaveURL(`/invoice/${invoiceId}/edit`)
    console.log('✅ Edit link navigates to edit page')
  })

  test('4.10 - Edit page prefills seller name', async ({ page }) => {
    await page.goto(`/invoice/${invoiceId}/edit`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const val = await page.locator('#sellerName').inputValue()
    expect(val).toBe('View Seller Co')
    console.log(`✅ Edit page prefilled seller: ${val}`)
  })

  test('4.11 - Email modal opens with email field', async ({ page }) => {
    await page.click('button:has-text("✉ Email"), button:has-text("Email")')
    await expect(page.locator('text=Email Invoice')).toBeVisible()
    await expect(page.locator('input[type="email"]').last()).toBeVisible()
    console.log('✅ Email modal opens correctly')
  })

  test('4.12 - Email modal cancel closes modal', async ({ page }) => {
    await page.click('button:has-text("✉ Email"), button:has-text("Email")')
    await expect(page.locator('text=Email Invoice')).toBeVisible()
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('text=Email Invoice')).not.toBeVisible()
    console.log('✅ Email modal closes on cancel')
  })

  test('4.13 - Payment link modal opens', async ({ page }) => {
    await page.click('button:has-text("Pay Link"), button:has-text("💳")')
    await expect(page.locator('text=Payment Link')).toBeVisible()
    console.log('✅ Payment link modal opens')
  })

  test('4.14 - WhatsApp share button exists', async ({ page }) => {
    await expect(page.locator('button:has-text("Share")')).toBeVisible()
    console.log('✅ WhatsApp share button exists')
  })

  test('4.15 - Print/PDF button exists', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF")')).toBeVisible()
    console.log('✅ Print PDF button exists')
  })

  test('4.16 - Back to invoices link works', async ({ page }) => {
    await page.click('a:has-text("← Invoices"), a:has-text("← Back")')
    await page.waitForURL('/dashboard/invoices', { timeout: 10000 })
    await expect(page).toHaveURL('/dashboard/invoices')
    console.log('✅ Back to invoices link works')
  })

})
