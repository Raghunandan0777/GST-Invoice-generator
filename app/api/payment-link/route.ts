import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoiceId } = await req.json()

    const { data: inv } = await supabase.from('invoices').select('*').eq('id', invoiceId).eq('user_id', user.id).single()
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    // ── Razorpay Payment Link ──────────────────────────────────────────
    // Uncomment when Razorpay keys are set:
    //
    // const razorpayAuth = Buffer.from(
    //   `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    // ).toString('base64')
    //
    // const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${razorpayAuth}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: Math.round(inv.grand_total * 100), // paise
    //     currency: 'INR',
    //     accept_partial: false,
    //     description: `Payment for Invoice ${inv.invoice_number}`,
    //     customer: {
    //       name: inv.buyer_name || 'Customer',
    //       email: inv.buyer_email || '',
    //       contact: inv.buyer_phone || '',
    //     },
    //     notify: {
    //       sms: !!inv.buyer_phone,
    //       email: !!inv.buyer_email,
    //     },
    //     reminder_enable: true,
    //     notes: {
    //       invoice_number: inv.invoice_number,
    //       invoice_id: inv.id,
    //     },
    //     callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-link/callback`,
    //     callback_method: 'get',
    //   }),
    // })
    // const link = await response.json()
    //
    // // Save payment link URL to invoice
    // await supabase.from('invoices').update({ payment_link: link.short_url }).eq('id', invoiceId)
    //
    // return NextResponse.json({ url: link.short_url, id: link.id })

    // ── Placeholder (until Razorpay keys added) ────────────────────────
    const placeholderUrl = `https://rzp.io/l/placeholder-${inv.invoice_number}`
    return NextResponse.json({
      url: placeholderUrl,
      message: 'Add Razorpay keys to .env.local to generate real payment links',
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}
