import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { numberToWords } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoiceId, recipientEmail, message } = await req.json()

    const { data: inv } = await supabase
      .from('invoices').select('*').eq('id', invoiceId).eq('user_id', user.id).single()
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const toEmail = recipientEmail || inv.buyer_email
    if (!toEmail) return NextResponse.json({ error: 'No recipient email' }, { status: 400 })

    // Build HTML email
    const items = Array.isArray(inv.items) ? inv.items : []
    const itemRows = items.map((item: any, i: number) => `
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:10px 12px;font-size:13px">${i + 1}. ${item.name}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;font-family:monospace">${item.qty}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;font-family:monospace">₹${Number(item.rate).toLocaleString('en-IN')}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;font-family:monospace;font-weight:600">₹${Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>`).join('')

    const gstRows = inv.gst_type === 'cgst'
      ? `<tr><td style="padding:6px 12px;color:#666;font-size:12px">CGST</td><td style="padding:6px 12px;text-align:right;font-family:monospace;font-size:12px">₹${(Number(inv.total_gst) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
         <tr><td style="padding:6px 12px;color:#666;font-size:12px">SGST</td><td style="padding:6px 12px;text-align:right;font-family:monospace;font-size:12px">₹${(Number(inv.total_gst) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`
      : `<tr><td style="padding:6px 12px;color:#666;font-size:12px">IGST</td><td style="padding:6px 12px;text-align:right;font-family:monospace;font-size:12px">₹${Number(inv.total_gst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`

    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'DM Sans',Arial,sans-serif">
  <div style="max-width:620px;margin:32px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    
    <!-- Header -->
    <div style="background:#18181b;padding:28px 32px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <span style="font-size:22px;font-weight:900;color:white;letter-spacing:-0.5px">Bill<span style="color:#f5a623">Karo</span></span>
      </div>
      <div style="text-align:right">
        <div style="font-size:24px;font-weight:900;color:#f5a623;line-height:1">TAX INVOICE</div>
        <div style="color:#888;font-size:11px;font-family:monospace;margin-top:4px">${inv.invoice_number}</div>
      </div>
    </div>

    <!-- Greeting -->
    <div style="padding:24px 32px;background:#fffbf3;border-bottom:1px solid #f0e8d0">
      <p style="margin:0;font-size:15px;color:#333">
        ${message || `Dear ${inv.buyer_name || 'Sir/Madam'},`}<br><br>
        Please find your invoice <strong>${inv.invoice_number}</strong> for <strong>₹${Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> attached below.
        ${inv.due_date ? `<br>Payment due by <strong>${fmtDate(inv.due_date)}</strong>.` : ''}
      </p>
    </div>

    <!-- Parties -->
    <div style="display:flex;gap:0;border-bottom:1px solid #f0f0f0">
      <div style="flex:1;padding:20px 32px;border-right:1px solid #f0f0f0">
        <div style="font-size:10px;color:#aaa;font-family:monospace;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">From</div>
        <div style="font-weight:700;font-size:14px">${inv.seller_name || '—'}</div>
        ${inv.seller_gstin ? `<div style="font-family:monospace;font-size:11px;color:#888;margin-top:2px">GSTIN: ${inv.seller_gstin}</div>` : ''}
        <div style="font-size:12px;color:#666;margin-top:4px;white-space:pre-line">${inv.seller_address || ''}</div>
      </div>
      <div style="flex:1;padding:20px 32px">
        <div style="font-size:10px;color:#aaa;font-family:monospace;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Bill To</div>
        <div style="font-weight:700;font-size:14px">${inv.buyer_name || '—'}</div>
        ${inv.buyer_gstin ? `<div style="font-family:monospace;font-size:11px;color:#888;margin-top:2px">GSTIN: ${inv.buyer_gstin}</div>` : ''}
        <div style="font-size:12px;color:#666;margin-top:4px;white-space:pre-line">${inv.buyer_address || ''}</div>
      </div>
    </div>

    <!-- Meta -->
    <div style="padding:12px 32px;background:#fafafa;border-bottom:1px solid #f0f0f0;display:flex;gap:24px">
      <span style="font-size:12px;color:#666;font-family:monospace">Date: <strong style="color:#333">${fmtDate(inv.invoice_date)}</strong></span>
      ${inv.due_date ? `<span style="font-size:12px;color:#666;font-family:monospace">Due: <strong style="color:#e55">${fmtDate(inv.due_date)}</strong></span>` : ''}
      <span style="font-size:12px;color:#666;font-family:monospace">Type: <strong style="color:#333">${inv.gst_type?.toUpperCase()}</strong></span>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#18181b;color:white">
          <th style="padding:10px 12px;text-align:left;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:1px">Item</th>
          <th style="padding:10px 12px;text-align:right;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:1px">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:1px">Rate</th>
          <th style="padding:10px 12px;text-align:right;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:1px">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;padding:16px 32px;border-top:1px solid #f0f0f0">
      <table style="width:260px;border-collapse:collapse;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden">
        <tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:8px 16px;color:#666;font-size:13px">Subtotal</td>
          <td style="padding:8px 16px;text-align:right;font-family:monospace;font-size:13px">₹${Number(inv.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        ${gstRows}
        <tr style="background:#18181b">
          <td style="padding:12px 16px;color:white;font-weight:700;font-size:14px">Grand Total</td>
          <td style="padding:12px 16px;text-align:right;font-family:monospace;font-weight:700;font-size:18px;color:#f5a623">₹${Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>

    <!-- Amount in words -->
    <div style="margin:0 32px 20px;background:#fffbf3;border-left:4px solid #f5a623;padding:10px 16px;font-size:12px;color:#555;border-radius:0 6px 6px 0">
      <strong>Amount in Words:</strong> ${numberToWords(Math.round(inv.grand_total))} Rupees Only
    </div>

    ${inv.bank_name ? `<!-- Bank Details -->
    <div style="margin:0 32px 24px;padding:16px;background:#f9f9f9;border-radius:8px;font-size:12px">
      <div style="font-family:monospace;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Bank Details</div>
      <strong>${inv.bank_name}</strong><br>
      ${inv.bank_account ? `A/C: ${inv.bank_account}<br>` : ''}
      ${inv.bank_ifsc ? `IFSC: ${inv.bank_ifsc}` : ''}
    </div>` : ''}

    ${inv.notes ? `<!-- Notes -->
    <div style="margin:0 32px 24px;font-size:12px;color:#888">${inv.notes}</div>` : ''}

    <!-- Footer -->
    <div style="background:#fafafa;border-top:1px solid #f0f0f0;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#aaa">Generated by <a href="https://billkaro.in" style="color:#f5a623;text-decoration:none">BillKaro.in</a> — Free GST Invoice Generator for Indian Businesses</p>
    </div>
  </div>
</body>
</html>`

    // Send via Resend (https://resend.com — free tier: 3000 emails/month)
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      // Return HTML preview if no key configured
      return NextResponse.json({
        success: true,
        preview: true,
        message: 'Add RESEND_API_KEY to .env.local to send real emails. Preview HTML returned.',
        html: html.substring(0, 200) + '...',
        to: toEmail,
      })
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${inv.seller_name || 'BillKaro'} <invoice@billkaro.in>`,
        to: [toEmail],
        subject: `Invoice ${inv.invoice_number} — ₹${Number(inv.grand_total).toLocaleString('en-IN')} from ${inv.seller_name || 'BillKaro'}`,
        html,
        reply_to: inv.seller_email || undefined,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.json()
      return NextResponse.json({ error: err.message || 'Email failed' }, { status: 500 })
    }

    // Update invoice status to 'sent'
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoiceId)

    return NextResponse.json({ success: true, to: toEmail })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
