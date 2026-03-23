import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This endpoint is called daily by Vercel Cron Jobs
// Add to vercel.json: { "crons": [{ "path": "/api/cron/recurring", "schedule": "0 6 * * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Find all active recurring invoices due today or overdue
  const { data: due, error } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('is_active', true)
    .lte('next_run_date', today)

  if (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []
  let generated = 0
  let failed = 0

  for (const rec of (due || [])) {
    try {
      // Check end date
      if (rec.end_date && rec.end_date < today) {
        await supabase.from('recurring_invoices').update({ is_active: false }).eq('id', rec.id)
        continue
      }

      const items = Array.isArray(rec.items) ? rec.items : []
      const processedItems = items.map((item: any) => {
        const taxable = (item.rate || 0) * (item.qty || 1)
        const gst_amount = taxable * (item.gst_rate || 0) / 100
        return { ...item, taxable, gst_amount, total: taxable + gst_amount }
      })

      const subtotal = processedItems.reduce((s: number, i: any) => s + i.taxable, 0)
      const total_gst = processedItems.reduce((s: number, i: any) => s + i.gst_amount, 0)

      // Get next invoice number for this user
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', rec.user_id)

      const invoice_number = `${rec.prefix || 'INV'}-${String((count || 0) + 1).padStart(4, '0')}`

      // Calculate due date (15 days from today)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 15)

      const { data: newInv, error: invError } = await supabase.from('invoices').insert({
        user_id: rec.user_id,
        invoice_number,
        invoice_date: today,
        due_date: dueDate.toISOString().split('T')[0],
        place_of_supply: rec.place_of_supply,
        status: rec.auto_send ? 'sent' : 'draft',
        gst_type: rec.gst_type || 'cgst',
        buyer_name: rec.buyer_name,
        buyer_gstin: rec.buyer_gstin,
        buyer_address: rec.buyer_address,
        buyer_phone: rec.buyer_phone,
        buyer_email: rec.buyer_email,
        items: processedItems,
        subtotal,
        total_gst,
        grand_total: subtotal + total_gst,
        notes: rec.notes,
      }).select().single()

      if (invError) throw invError

      // Calculate next run date
      const nextRun = new Date(today)
      if (rec.frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7)
      else if (rec.frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1)
      else if (rec.frequency === 'quarterly') nextRun.setMonth(nextRun.getMonth() + 3)
      else nextRun.setFullYear(nextRun.getFullYear() + 1)

      // Update recurring record
      await supabase.from('recurring_invoices').update({
        next_run_date: nextRun.toISOString().split('T')[0],
        total_generated: (rec.total_generated || 0) + 1,
        last_generated_at: new Date().toISOString(),
      }).eq('id', rec.id)

      // Auto-send email if configured
      if (rec.auto_send && rec.buyer_email && process.env.RESEND_API_KEY) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: newInv.id, recipientEmail: rec.buyer_email }),
        })
      }

      results.push({ id: rec.id, invoice: invoice_number, status: 'generated' })
      generated++
    } catch (err: any) {
      results.push({ id: rec.id, error: err.message, status: 'failed' })
      failed++
    }
  }

  return NextResponse.json({
    success: true,
    date: today,
    processed: due?.length || 0,
    generated,
    failed,
    results,
  })
}
