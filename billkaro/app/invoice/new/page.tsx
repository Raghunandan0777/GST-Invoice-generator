'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { numberToWords } from '@/lib/utils'
import GSTINInput from '@/components/ui/GSTINInput'
import { useToast } from '@/components/ui/Toast'
import { INDIAN_STATES, GST_RATES } from '@/lib/types'
import type { InvoiceItem } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const today = new Date().toISOString().split('T')[0]
const dueDefault = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]

function emptyItem(): InvoiceItem {
  return { id: uuid(), name: '', hsn: '', rate: 0, qty: 1, gst_rate: 18, taxable: 0, gst_amount: 0, total: 0 }
}

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const { success, error: toastError } = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [gstType, setGstType] = useState<'cgst' | 'igst'>('cgst')

  // Seller
  const [sellerName, setSellerName] = useState('')
  const [sellerGSTIN, setSellerGSTIN] = useState('')
  const [sellerAddress, setSellerAddress] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [sellerEmail, setSellerEmail] = useState('')

  // Invoice meta
  const [invoiceNo, setInvoiceNo] = useState('INV-0001')
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [dueDate, setDueDate] = useState(dueDefault)
  const [placeOfSupply, setPlaceOfSupply] = useState('Gujarat')

  // Buyer
  const [buyerName, setBuyerName] = useState('')
  const [buyerGSTIN, setBuyerGSTIN] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()])

  // Bank + Notes
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankIFSC, setBankIFSC] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [notes, setNotes] = useState('Payment due within 15 days. Thank you for your business!')

  // Load user's default business
  useEffect(() => {
    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).eq('is_default', true).maybeSingle()
      if (biz) {
        setSellerName(biz.name || '')
        setSellerGSTIN(biz.gstin || '')
        setSellerAddress([biz.address, biz.city, biz.state, biz.pincode].filter(Boolean).join(', '))
        setSellerPhone(biz.phone || '')
        setSellerEmail(biz.email || '')
        setBankName(biz.bank_name || '')
        setBankAccount(biz.bank_account || '')
        setBankIFSC(biz.bank_ifsc || '')
        setBankHolder(biz.bank_holder || '')
      }
      // Get next invoice number
      const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setInvoiceNo(`INV-${String((count || 0) + 1).padStart(4, '0')}`)
    }
    loadBusiness()
  }, [])

  function updateItem(idx: number, field: keyof InvoiceItem, val: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: val }
      const taxable = (Number(updated.rate) || 0) * (Number(updated.qty) || 0)
      const gstAmt = taxable * (Number(updated.gst_rate) || 0) / 100
      return { ...updated, taxable, gst_amount: gstAmt, total: taxable + gstAmt }
    }))
  }

  const subtotal = items.reduce((s, i) => s + i.taxable, 0)
  const totalGST = items.reduce((s, i) => s + i.gst_amount, 0)
  const grandTotal = subtotal + totalGST

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  function resetBuyerFields() {
    setBuyerName(''); setBuyerGSTIN(''); setBuyerAddress('')
    setBuyerPhone(''); setBuyerEmail('')
    setItems([emptyItem()])
    setGstType('cgst')
    setPlaceOfSupply('Gujarat')
    setNotes('Payment due within 15 days. Thank you for your business!')
    const newToday = new Date().toISOString().split('T')[0]
    const newDue = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
    setInvoiceDate(newToday)
    setDueDate(newDue)
  }

  async function saveInvoice(status: 'draft' | 'sent') {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id: user?.id,
      invoice_number: invoiceNo, invoice_date: invoiceDate, due_date: dueDate,
      place_of_supply: placeOfSupply, status, gst_type: gstType,
      seller_name: sellerName, seller_gstin: sellerGSTIN, seller_address: sellerAddress,
      seller_phone: sellerPhone, seller_email: sellerEmail,
      buyer_name: buyerName, buyer_gstin: buyerGSTIN, buyer_address: buyerAddress,
      buyer_phone: buyerPhone, buyer_email: buyerEmail,
      items, subtotal, total_gst: totalGST, grand_total: grandTotal,
      bank_name: bankName, bank_account: bankAccount, bank_ifsc: bankIFSC, bank_holder: bankHolder,
      notes,
    }
    if (user) {
      const { data } = await supabase.from('invoices').insert(payload).select().single()
      if (data) {
        // Get next invoice number
        const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        setInvoiceNo(`INV-\${String((count || 0) + 1).padStart(4, '0')}`)
        setSaving(false)
        router.push(`/invoice/\${data.id}`)
        return
      }
    } else {
      window.print()
      resetBuyerFields()
    }
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* FORM PANEL */}
      <div className="w-[420px] shrink-0 bg-zinc-900 border-r border-zinc-800 overflow-y-auto h-screen sticky top-0">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-syne font-black text-lg">New Invoice <span className="text-zinc-600 font-mono text-xs ml-1">नया इनवॉइस</span></h2>
          <div className="flex gap-2">
            <button onClick={() => saveInvoice('draft')} disabled={saving}
              className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
              Save Draft
            </button>
            <button onClick={() => saveInvoice('sent')} disabled={saving}
              className="text-xs bg-amber-400 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
              {saving ? '...' : 'Save & Send'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-24">
          {/* YOUR BUSINESS */}
          <Section label="Your Business" hi="आपका बिज़नेस">
            <Field label="Business Name / नाम"><input value={sellerName} onChange={e => setSellerName(e.target.value)} placeholder="Sharma Traders" className={inp}/></Field>
            <GSTINInput value={sellerGSTIN} onChange={setSellerGSTIN} label="GSTIN" />
            <Field label="Address / पता"><textarea value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} rows={2} placeholder="Address, City, State, PIN" className={inp}/></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} placeholder="+91 98765 43210" className={inp}/></Field>
              <Field label="Email"><input value={sellerEmail} onChange={e => setSellerEmail(e.target.value)} placeholder="you@email.com" className={inp}/></Field>
            </div>
          </Section>

          {/* INVOICE META */}
          <Section label="Invoice Details" hi="इनवॉइस विवरण">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invoice No."><input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className={`${inp} font-mono`}/></Field>
              <Field label="Date"><input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={inp}/></Field>
              <Field label="Due Date"><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inp}/></Field>
              <Field label="Place of Supply">
                <select value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} className={inp}>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <Field label="GST Type">
              <div className="flex rounded-xl overflow-hidden border border-zinc-700">
                {(['cgst', 'igst'] as const).map(t => (
                  <button key={t} onClick={() => setGstType(t)}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${gstType === t ? 'bg-amber-400 text-black font-bold' : 'text-zinc-400 hover:text-white'}`}>
                    {t === 'cgst' ? 'CGST + SGST' : 'IGST (Interstate)'}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          {/* BILL TO */}
          <Section label="Bill To" hi="ग्राहक">
            <Field label="Customer Name / नाम"><input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Patel Electronics" className={inp}/></Field>
            <GSTINInput value={buyerGSTIN} onChange={setBuyerGSTIN} label="GSTIN (optional)" placeholder="Customer GSTIN" />
            <Field label="Address"><textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} rows={2} placeholder="Customer address, City, State, PIN" className={inp}/></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+91 99999 00000" className={inp}/></Field>
              <Field label="Email"><input value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="customer@email.com" className={inp}/></Field>
            </div>
          </Section>

          {/* ITEMS */}
          <Section label="Items / Services" hi="सामान / सेवाएं">
            <div className="grid grid-cols-[1fr_60px_80px_60px_70px_24px] gap-1.5 mb-2">
              {['Item', 'HSN', 'Rate ₹', 'Qty', 'GST%', ''].map(h => (
                <span key={h} className="text-xs font-mono text-zinc-600 uppercase">{h}</span>
              ))}
            </div>
            {items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-[1fr_60px_80px_60px_70px_24px] gap-1.5 mb-2 items-center">
                <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Item name" className={`${inp} text-xs`}/>
                <input value={item.hsn} onChange={e => updateItem(i, 'hsn', e.target.value)} placeholder="HSN" className={`${inp} text-xs font-mono`}/>
                <input type="number" value={item.rate || ''} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} placeholder="0" min="0" className={`${inp} text-xs`}/>
                <input type="number" value={item.qty || ''} onChange={e => updateItem(i, 'qty', parseFloat(e.target.value) || 1)} placeholder="1" min="0" className={`${inp} text-xs`}/>
                <select value={item.gst_rate} onChange={e => updateItem(i, 'gst_rate', Number(e.target.value))} className={`${inp} text-xs`}>
                  {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
                <button onClick={() => items.length > 1 && setItems(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
            <button onClick={() => setItems(prev => [...prev, emptyItem()])}
              className="w-full border border-dashed border-zinc-700 text-zinc-500 hover:text-amber-400 hover:border-amber-400/50 rounded-xl py-2 text-sm transition-colors mt-2">
              + Add Item / सामान जोड़ें
            </button>
          </Section>

          {/* BANK */}
          <Section label="Bank Details" hi="बैंक विवरण">
            <Field label="Bank Name"><input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="State Bank of India" className={inp}/></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Account No."><input value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="1234567890" className={`${inp} font-mono`}/></Field>
              <Field label="IFSC"><input value={bankIFSC} onChange={e => setBankIFSC(e.target.value)} placeholder="SBIN0001234" className={`${inp} font-mono tracking-widest`}/></Field>
            </div>
            <Field label="Account Holder"><input value={bankHolder} onChange={e => setBankHolder(e.target.value)} placeholder="Name on account" className={inp}/></Field>
          </Section>

          {/* NOTES */}
          <Section label="Notes / Terms" hi="नोट्स">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inp}/>
          </Section>
        </div>
      </div>

      {/* INVOICE PREVIEW */}
      <div className="flex-1 bg-zinc-200 overflow-y-auto p-10 flex flex-col items-center">
        <div className="mb-4 flex gap-3 no-print w-full max-w-3xl justify-end">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-zinc-900 text-white border border-zinc-700 px-5 py-2.5 rounded-xl text-sm hover:border-zinc-500 transition-colors">
            🖨️ Print / Download PDF
          </button>
        </div>

        {/* THE INVOICE */}
        <div id="invoice-print" className="bg-white w-full max-w-3xl shadow-xl rounded-sm p-12 text-zinc-900 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 mb-6 border-b-2 border-zinc-900">
            <div>
              <h1 className="font-syne font-black text-2xl text-zinc-900">{sellerName || 'Your Business'}</h1>
              {sellerGSTIN && <p className="font-mono text-xs text-zinc-500 mt-1">GSTIN: {sellerGSTIN}</p>}
              <p className="text-xs text-zinc-500 mt-1 max-w-xs whitespace-pre-line">{sellerAddress}</p>
              {sellerPhone && <p className="text-xs text-zinc-500">📞 {sellerPhone}</p>}
            </div>
            <div className="text-right">
              <p className="font-syne font-black text-5xl text-amber-400 leading-none">TAX</p>
              <p className="font-syne font-black text-5xl text-zinc-900 leading-none -mt-1">INVOICE</p>
              <div className="mt-3 font-mono text-xs text-zinc-500 space-y-1">
                <p>No: <strong className="text-zinc-800">{invoiceNo}</strong></p>
                <p>Date: {fmtDate(invoiceDate)}</p>
                {dueDate && <p>Due: {fmtDate(dueDate)}</p>}
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">From</p>
              <p className="font-syne font-bold text-base">{sellerName || '—'}</p>
              {sellerGSTIN && <p className="font-mono text-xs text-zinc-500">GSTIN: {sellerGSTIN}</p>}
              <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">{sellerAddress}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">Bill To / बिल प्राप्तकर्ता</p>
              <p className="font-syne font-bold text-base">{buyerName || '—'}</p>
              {buyerGSTIN && <p className="font-mono text-xs text-zinc-500">GSTIN: {buyerGSTIN}</p>}
              <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">{buyerAddress}</p>
              {buyerPhone && <p className="text-xs text-zinc-500">📞 {buyerPhone}</p>}
            </div>
          </div>

          {/* Place of Supply */}
          <div className="bg-zinc-50 border border-zinc-200 rounded px-4 py-2 mb-6 flex gap-6 text-xs font-mono text-zinc-600">
            <span>Place of Supply: <strong className="text-zinc-800">{placeOfSupply}</strong></span>
            <span>GST Type: <strong className="text-zinc-800">{gstType === 'cgst' ? 'CGST + SGST' : 'IGST'}</strong></span>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr className="bg-zinc-900 text-white">
                <th className="text-left px-3 py-2.5 font-mono text-xs tracking-wider">#</th>
                <th className="text-left px-3 py-2.5 font-mono text-xs tracking-wider">Description</th>
                <th className="text-left px-3 py-2.5 font-mono text-xs tracking-wider">HSN</th>
                <th className="text-right px-3 py-2.5 font-mono text-xs tracking-wider">Rate</th>
                <th className="text-right px-3 py-2.5 font-mono text-xs tracking-wider">Qty</th>
                <th className="text-right px-3 py-2.5 font-mono text-xs tracking-wider">Taxable</th>
                <th className="text-right px-3 py-2.5 font-mono text-xs tracking-wider">
                  {gstType === 'cgst' ? 'CGST+SGST' : 'IGST'}
                </th>
                <th className="text-right px-3 py-2.5 font-mono text-xs tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => item.name ? (
                <tr key={item.id} className="border-b border-zinc-100">
                  <td className="px-3 py-2.5 text-zinc-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{item.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">{item.hsn || '—'}</td>
                  <td className="px-3 py-2.5 text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{item.qty}</td>
                  <td className="px-3 py-2.5 text-right font-mono">₹{item.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs">
                    <span className="text-zinc-400">@{item.gst_rate}%</span><br/>
                    ₹{item.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ) : null)}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 border border-zinc-200 rounded overflow-hidden">
              <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {gstType === 'cgst' ? (
                <>
                  <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                    <span className="text-zinc-500">CGST</span>
                    <span className="font-mono">₹{(totalGST / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                    <span className="text-zinc-500">SGST</span>
                    <span className="font-mono">₹{(totalGST / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between px-4 py-2 text-sm border-b border-zinc-100">
                  <span className="text-zinc-500">IGST</span>
                  <span className="font-mono">₹{totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 bg-zinc-900 text-white">
                <span className="font-syne font-bold">Grand Total</span>
                <span className="font-mono font-bold text-amber-400 text-lg">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-2 mb-6 text-xs text-zinc-700 rounded-r">
            <strong>Amount in Words:</strong> {numberToWords(Math.round(grandTotal))} Rupees Only
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-200">
            <div>
              {bankName && (
                <>
                  <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">Bank Details</p>
                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p><strong className="text-zinc-800">{bankName}</strong></p>
                    {bankAccount && <p>A/C: {bankAccount}</p>}
                    {bankIFSC && <p>IFSC: {bankIFSC}</p>}
                    {bankHolder && <p>{bankHolder}</p>}
                  </div>
                </>
              )}
            </div>
            <div>
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-2">Notes & Terms</p>
              <p className="text-xs text-zinc-500">{notes}</p>
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

// Helper components
const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600 resize-none"

function Section({ label, hi, children }: { label: string; hi: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs text-zinc-600">{hi}</span>
        <div className="flex-1 h-px bg-zinc-800"/>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}
