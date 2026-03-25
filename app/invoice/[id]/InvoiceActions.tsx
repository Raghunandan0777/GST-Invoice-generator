'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getStatusColor } from '@/lib/utils'
import type { InvoiceStatus } from '@/lib/types'

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function InvoiceActions({ invoice }: { invoice: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status)
  const [updating, setUpdating] = useState(false)
  const [showStatuses, setShowStatuses] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showPayLink, setShowPayLink] = useState(false)
  const [emailTo, setEmailTo] = useState(invoice.buyer_email || '')
  const [emailMsg, setEmailMsg] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailDone, setEmailDone] = useState('')
  const [payLink, setPayLink] = useState('')
  const [loadingLink, setLoadingLink] = useState(false)

  async function updateStatus(s: InvoiceStatus) {
    setUpdating(true)
    await supabase.from('invoices').update({ status: s }).eq('id', invoice.id)
    setStatus(s); setShowStatuses(false); setUpdating(false)
    router.refresh()
  }

  async function deleteInvoice() {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    await supabase.from('invoices').delete().eq('id', invoice.id)
    router.push('/dashboard/invoices')
  }

  async function sendEmail() {
    setSendingEmail(true); setEmailDone('')
    const res = await fetch('/api/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoice.id, recipientEmail: emailTo, message: emailMsg }),
    })
    const data = await res.json()
    if (data.success) {
      setEmailDone('✓ Email sent! Status updated to Sent.')
      setStatus('sent')
      setTimeout(() => { setShowEmail(false); setEmailDone('') }, 2500)
    } else {
      setEmailDone('❌ ' + (data.error || 'Failed to send'))
    }
    setSendingEmail(false)
  }

  async function generatePayLink() {
    setLoadingLink(true)
    const res = await fetch('/api/payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoice.id }),
    })
    const data = await res.json()
    setPayLink(data.url || '')
    setLoadingLink(false)
  }

  function shareWhatsApp() {
    const msg = `Hi, please find Invoice *${invoice.invoice_number}* for *₹${Number(invoice.grand_total).toLocaleString('en-IN')}* from *${invoice.seller_name}*.\n\nDue: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'N/A'}\n${payLink ? `Pay here: ${payLink}` : ''}`
    window.open(`https://wa.me/${invoice.buyer_phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

  return (
    <>
      <div className="no-print sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="text-zinc-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
            ← Invoices
          </Link>
          <span className="text-zinc-700 hidden sm:block">|</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-sm text-amber-400 font-medium">{invoice.invoice_number}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-sm text-zinc-400 truncate max-w-32">{invoice.buyer_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status */}
          <div className="relative">
            <button onClick={() => setShowStatuses(!showStatuses)}
              className={`text-xs px-3 py-1.5 rounded-full font-mono uppercase cursor-pointer transition-colors ${getStatusColor(status)}`}>
              {status} ▾
            </button>
            {showStatuses && (
              <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-10 min-w-32">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                    className={`w-full text-left px-4 py-2.5 text-xs font-mono uppercase hover:bg-zinc-700 transition-colors ${s === status ? 'text-amber-400' : 'text-zinc-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email */}
          <button onClick={() => setShowEmail(true)}
            className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
            ✉ Email
          </button>

          {/* Payment Link */}
          <button onClick={() => { setShowPayLink(true); if (!payLink) generatePayLink() }}
            className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors">
            💳 Pay Link
          </button>

          {/* WhatsApp */}
          <button onClick={shareWhatsApp}
            className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
            Share
          </button>

          <Link href={`/invoice/${invoice.id}/edit`}
            className="text-xs border border-zinc-700 text-zinc-400 px-3 py-1.5 rounded-lg hover:border-zinc-500 hover:text-white transition-colors">
            ✏ Edit
          </Link>

          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-amber-400 text-black font-syne font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
            🖨️ PDF
          </button>

          <button onClick={deleteInvoice} className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-1 py-1.5">🗑</button>
        </div>
      </div>

      {/* EMAIL MODAL */}
      {showEmail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-syne font-bold">Email Invoice <span className="text-zinc-600 font-mono text-xs ml-1">ईमेल भेजें</span></h3>
              <button onClick={() => setShowEmail(false)} className="text-zinc-500 hover:text-white text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Send To</label>
                <input value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="customer@email.com" type="email" className={inp}/>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Message (optional)</label>
                <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)} rows={3}
                  placeholder={`Dear ${invoice.buyer_name || 'Sir/Madam'}, please find your invoice attached...`}
                  className={`${inp} resize-none`}/>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4 text-xs text-zinc-500">
                <p className="font-mono text-amber-400 mb-1">📧 Invoice #{invoice.invoice_number}</p>
                <p>Amount: <strong className="text-white">₹{Number(invoice.grand_total).toLocaleString('en-IN')}</strong></p>
                {invoice.due_date && <p>Due: <strong className="text-white">{new Date(invoice.due_date).toLocaleDateString('en-IN')}</strong></p>}
              </div>
              {emailDone && (
                <div className={`text-sm rounded-lg px-4 py-3 ${emailDone.startsWith('✓') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {emailDone}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowEmail(false)} className="flex-1 border border-zinc-700 text-zinc-400 py-2.5 rounded-xl hover:border-zinc-500 transition-colors text-sm">Cancel</button>
                <button onClick={sendEmail} disabled={sendingEmail || !emailTo}
                  className="flex-1 bg-blue-500 text-white font-syne font-bold py-2.5 rounded-xl hover:bg-blue-400 transition-colors disabled:opacity-50 text-sm">
                  {sendingEmail ? '⏳ Sending...' : '✉ Send Email'}
                </button>
              </div>
              <p className="text-center text-xs text-zinc-600">Add RESEND_API_KEY to .env.local for real emails</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT LINK MODAL */}
      {showPayLink && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-syne font-bold">Payment Link <span className="text-zinc-600 font-mono text-xs ml-1">भुगतान लिंक</span></h3>
              <button onClick={() => setShowPayLink(false)} className="text-zinc-500 hover:text-white text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">💳</p>
                <p className="font-syne font-black text-2xl text-purple-400">₹{Number(invoice.grand_total).toLocaleString('en-IN')}</p>
                <p className="text-zinc-500 text-sm mt-1">{invoice.invoice_number} · {invoice.buyer_name}</p>
              </div>

              {loadingLink ? (
                <div className="text-center text-zinc-500 py-4 text-sm">⏳ Generating payment link...</div>
              ) : payLink ? (
                <div className="space-y-3">
                  <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 flex items-center gap-2">
                    <input readOnly value={payLink} className="flex-1 bg-transparent text-xs text-zinc-300 font-mono outline-none truncate"/>
                    <button onClick={() => { navigator.clipboard.writeText(payLink) }}
                      className="text-xs text-amber-400 hover:underline shrink-0">Copy</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => window.open(payLink, '_blank')}
                      className="bg-purple-500/20 text-purple-300 border border-purple-500/30 py-2.5 rounded-xl text-sm hover:bg-purple-500/30 transition-colors font-syne font-bold">
                      Open Link
                    </button>
                    <button onClick={shareWhatsApp}
                      className="bg-green-500/20 text-green-300 border border-green-500/30 py-2.5 rounded-xl text-sm hover:bg-green-500/30 transition-colors font-syne font-bold">
                      📱 WhatsApp
                    </button>
                  </div>
                </div>
              ) : null}
              <p className="text-center text-xs text-zinc-600">Add Razorpay keys to .env.local to generate real payment links</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
