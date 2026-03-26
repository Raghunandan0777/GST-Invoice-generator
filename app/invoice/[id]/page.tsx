import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, numberToWords } from '@/lib/utils'
import type { Invoice, InvoiceItem } from '@/lib/types'
import InvoiceActions from './InvoiceActions'

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single()
  if (!inv) notFound()

  const items: InvoiceItem[] = inv.items || []
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="min-h-screen bg-zinc-200">
      {/* Action Bar */}
      <InvoiceActions invoice={inv} />

      {/* Invoice */}
      <div className="flex justify-center p-8 pt-4">
        <div id="invoice-doc" className="bg-white w-full max-w-3xl shadow-xl rounded-sm p-12 text-zinc-900" >

          {/* Header */}
          <div className="flex justify-between items-start pb-6 mb-6 border-b-2 border-zinc-900">
            <div>
              <h1 className="font-syne font-black text-[22px] text-zinc-900 leading-tight">{inv.seller_name || 'Business Name'}</h1>
              {inv.seller_gstin && <p className="font-mono text-xs text-zinc-500 mt-1">GSTIN: {inv.seller_gstin}</p>}
              <p className="text-xs text-zinc-500 mt-1 max-w-xs whitespace-pre-line">{inv.seller_address}</p>
              {inv.seller_phone && <p className="text-xs text-zinc-500 mt-0.5">📞 {inv.seller_phone}</p>}
              {inv.seller_email && <p className="text-xs text-zinc-500">✉ {inv.seller_email}</p>}
            </div>
            <div className="text-right">
              <p className="font-syne font-black text-[44px] text-amber-400 leading-none">TAX</p>
              <p className="font-syne font-black text-[44px] text-zinc-900 leading-none -mt-1">INVOICE</p>
              <div className="mt-3 text-xs text-zinc-500 space-y-1 font-mono">
                <p>No: <strong className="text-zinc-800">{inv.invoice_number}</strong></p>
                <p>Date: {fmtDate(inv.invoice_date)}</p>
                {inv.due_date && <p>Due: {fmtDate(inv.due_date)}</p>}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">From</p>
              <p className="font-syne font-bold text-base leading-tight">{inv.seller_name || '—'}</p>
              {inv.seller_gstin && <p className="font-mono text-xs text-zinc-500">GSTIN: {inv.seller_gstin}</p>}
              <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">{inv.seller_address}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">Bill To / बिल प्राप्तकर्ता</p>
              <p className="font-syne font-bold text-base leading-tight">{inv.buyer_name || '—'}</p>
              {inv.buyer_gstin && <p className="font-mono text-xs text-zinc-500">GSTIN: {inv.buyer_gstin}</p>}
              <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">{inv.buyer_address}</p>
              {inv.buyer_phone && <p className="text-xs text-zinc-500 mt-0.5">📞 {inv.buyer_phone}</p>}
            </div>
          </div>

          {/* Meta strip */}
          <div className="bg-zinc-50 border border-zinc-200 rounded px-4 py-2 mb-6 flex gap-6 text-xs font-mono text-zinc-600">
            {inv.place_of_supply && <span>Place of Supply: <strong className="text-zinc-800">{inv.place_of_supply}</strong></span>}
            <span>GST Type: <strong className="text-zinc-800">{inv.gst_type === 'cgst' ? 'CGST + SGST' : 'IGST'}</strong></span>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr className="bg-zinc-900 text-white">
                {['#', 'Description', 'HSN', 'Rate', 'Qty', 'Taxable', inv.gst_type === 'cgst' ? 'CGST+SGST' : 'IGST', 'Total'].map(h => (
                  <th key={h} className={`px-3 py-2.5 font-mono text-xs tracking-wider ${h === '#' || h === 'HSN' ? 'text-left' : h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-zinc-100">
                  <td className="px-3 py-2.5 text-zinc-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{item.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">{item.hsn || '—'}</td>
                  <td className="px-3 py-2.5 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{item.qty}</td>
                  <td className="px-3 py-2.5 text-right font-mono">₹{Number(item.taxable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs">
                    <span className="text-zinc-400">@{item.gst_rate}%</span><br/>
                    ₹{Number(item.gst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold">₹{Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 border border-zinc-200 rounded overflow-hidden">
              <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-mono">₹{Number(inv.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {inv.gst_type === 'cgst' ? (
                <>
                  <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                    <span className="text-zinc-500">CGST</span>
                    <span className="font-mono">₹{(Number(inv.total_gst) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                    <span className="text-zinc-500">SGST</span>
                    <span className="font-mono">₹{(Number(inv.total_gst) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                  <span className="text-zinc-500">IGST</span>
                  <span className="font-mono">₹{Number(inv.total_gst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 bg-zinc-900 text-white">
                <span className="font-syne font-bold">Grand Total</span>
                <span className="font-mono font-bold text-amber-400 text-lg">₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-2.5 mb-6 text-xs text-zinc-700 rounded-r">
            <strong>Amount in Words:</strong> {numberToWords(Math.round(inv.grand_total))} Rupees Only
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-200">
            <div>
              {inv.bank_name && (
                <>
                  <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">Bank Details</p>
                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p><strong className="text-zinc-800">{inv.bank_name}</strong></p>
                    {inv.bank_account && <p>A/C: {inv.bank_account}</p>}
                    {inv.bank_ifsc && <p>IFSC: {inv.bank_ifsc}</p>}
                    {inv.bank_holder && <p>{inv.bank_holder}</p>}
                  </div>
                </>
              )}
            </div>
            <div>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">Notes & Terms</p>
              <p className="text-xs text-zinc-500">{inv.notes}</p>
              <div className="mt-10 text-right">
                <div className="border-t border-zinc-400 inline-block pt-2 pr-8">
                  <p className="font-mono text-xs text-zinc-400">Authorised Signatory</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-300 mt-8">Generated by BillKaro.in — Free GST Invoice Generator</p>
        </div>
      </div>
    </div>
  )
}
