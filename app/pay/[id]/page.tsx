import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, numberToWords } from '@/lib/utils'
import PayButton from './PayButton'

export default async function PayPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: inv } = await supabase
    .from('invoices')
    .select('invoice_number,invoice_date,due_date,buyer_name,seller_name,seller_gstin,grand_total,total_gst,subtotal,gst_type,items,status,notes')
    .eq('id', params.id)
    .single()

  if (!inv) notFound()

  const items = Array.isArray(inv.items) ? inv.items : []
  const isPaid = inv.status === 'paid'

  return (
    <div className="min-h-screen bg-zinc-950 flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-syne font-black text-3xl mb-1">
            Bill<span className="text-amber-400">Karo</span>
          </div>
          <p className="text-zinc-500 text-sm">Secure Payment Portal</p>
        </div>

        {/* Invoice Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          {/* Top */}
          <div className="bg-zinc-800/50 px-6 py-5 flex items-start justify-between border-b border-zinc-800">
            <div>
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">Invoice from</p>
              <p className="font-syne font-bold text-lg">{inv.seller_name}</p>
              {inv.seller_gstin && <p className="font-mono text-xs text-zinc-500">GSTIN: {inv.seller_gstin}</p>}
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-zinc-500">{inv.invoice_number}</p>
              <p className="text-xs text-zinc-600 mt-1">{formatDate(inv.invoice_date)}</p>
              {inv.due_date && (
                <p className={`text-xs mt-1 ${new Date(inv.due_date) < new Date() && !isPaid ? 'text-red-400' : 'text-zinc-500'}`}>
                  Due: {formatDate(inv.due_date)}
                </p>
              )}
            </div>
          </div>

          {/* Billed to */}
          <div className="px-6 py-4 border-b border-zinc-800">
            <p className="font-mono text-xs text-zinc-600 uppercase tracking-wider mb-1">Billed to</p>
            <p className="font-syne font-bold">{inv.buyer_name || 'Customer'}</p>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b border-zinc-800 space-y-2">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-zinc-600 text-xs font-mono">{item.qty} × ₹{Number(item.rate).toLocaleString('en-IN')} + {item.gst_rate}% GST</p>
                </div>
                <p className="font-mono font-semibold text-zinc-300">
                  ₹{Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(Number(inv.subtotal))}</span>
            </div>
            {inv.gst_type === 'cgst' ? (
              <>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>CGST</span>
                  <span className="font-mono">{formatCurrency(Number(inv.total_gst) / 2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>SGST</span>
                  <span className="font-mono">{formatCurrency(Number(inv.total_gst) / 2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm text-zinc-400">
                <span>IGST</span>
                <span className="font-mono">{formatCurrency(Number(inv.total_gst))}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
              <span className="font-syne font-black text-lg">Total Due</span>
              <span className="font-syne font-black text-2xl text-amber-400">
                {formatCurrency(Number(inv.grand_total))}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-mono">
              {numberToWords(Math.round(inv.grand_total))} Rupees Only
            </p>
          </div>
        </div>

        {/* Pay Button or Paid Badge */}
        {isPaid ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-syne font-black text-xl text-green-400">Payment Received!</p>
            <p className="text-zinc-500 text-sm mt-2">This invoice has been paid. Thank you!</p>
          </div>
        ) : (
          <PayButton invoiceId={params.id} amount={Number(inv.grand_total)} invoiceNumber={inv.invoice_number} buyerName={inv.buyer_name} />
        )}

        <p className="text-center text-xs text-zinc-700 mt-6">
          Powered by <span className="text-amber-400/70">BillKaro</span> · Secured by Razorpay
        </p>
      </div>
    </div>
  )
}
