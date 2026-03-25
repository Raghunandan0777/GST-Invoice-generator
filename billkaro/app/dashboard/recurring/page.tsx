'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { INDIAN_STATES, GST_RATES } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { v4 as uuid } from 'uuid'

type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

interface RecurringItem {
  id: string; name: string; hsn: string; rate: number; qty: number; gst_rate: number
}

interface RecurringInvoice {
  id: string
  buyer_name: string; buyer_gstin: string; buyer_address: string
  buyer_phone: string; buyer_email: string
  items: RecurringItem[]
  gst_type: string; place_of_supply: string; notes: string
  frequency: Frequency; start_date: string; next_run_date: string
  end_date: string; is_active: boolean; auto_send: boolean; prefix: string
  total_generated: number; last_generated_at: string | null
}

const FREQ_LABELS: Record<Frequency, string> = {
  weekly: 'Every Week', monthly: 'Every Month', quarterly: 'Every 3 Months', yearly: 'Every Year'
}

const FREQ_BADGE_COLOR: Record<Frequency, string> = {
  weekly: 'bg-blue-500/20 text-blue-400',
  monthly: 'bg-amber-500/20 text-amber-400',
  quarterly: 'bg-purple-500/20 text-purple-400',
  yearly: 'bg-green-500/20 text-green-400',
}

function nextRunDate(from: string, freq: Frequency): string {
  const d = new Date(from)
  if (freq === 'weekly') d.setDate(d.getDate() + 7)
  else if (freq === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (freq === 'quarterly') d.setMonth(d.getMonth() + 3)
  else d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export default function RecurringPage() {
  const supabase = createClient()
  const [list, setList] = useState<RecurringInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    buyer_name: '', buyer_gstin: '', buyer_address: '', buyer_phone: '', buyer_email: '',
    gst_type: 'cgst', place_of_supply: 'Gujarat', notes: 'Thank you for your business!',
    frequency: 'monthly' as Frequency, start_date: today, end_date: '', prefix: 'INV',
    auto_send: false,
    items: [{ id: uuid(), name: '', hsn: '', rate: 0, qty: 1, gst_rate: 18 }] as RecurringItem[],
  })

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('recurring_invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setList((data || []) as RecurringInvoice[])
    setLoading(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      ...form,
      user_id: user.id,
      next_run_date: nextRunDate(form.start_date, form.frequency),
      total_generated: 0,
    }
    await supabase.from('recurring_invoices').insert(payload)
    await load()
    setShowForm(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('recurring_invoices').update({ is_active: !current }).eq('id', id)
    setList(p => p.map(r => r.id === id ? { ...r, is_active: !current } : r))
  }

  async function generateNow(rec: RecurringInvoice) {
    setGenerating(rec.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Compute totals
    const items = rec.items.map(item => {
      const taxable = item.rate * item.qty
      const gst_amount = taxable * item.gst_rate / 100
      return { ...item, taxable, gst_amount, total: taxable + gst_amount }
    })
    const subtotal = items.reduce((s, i) => s + i.taxable, 0)
    const total_gst = items.reduce((s, i) => s + i.gst_amount, 0)

    // Get next invoice number
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const invoice_number = `${rec.prefix}-${String((count || 0) + 1).padStart(4, '0')}`

    const { error } = await supabase.from('invoices').insert({
      user_id: user.id,
      invoice_number,
      invoice_date: today,
      due_date: nextRunDate(today, 'monthly'),
      place_of_supply: rec.place_of_supply,
      status: 'draft',
      gst_type: rec.gst_type,
      buyer_name: rec.buyer_name,
      buyer_gstin: rec.buyer_gstin,
      buyer_address: rec.buyer_address,
      buyer_phone: rec.buyer_phone,
      buyer_email: rec.buyer_email,
      items,
      subtotal,
      total_gst,
      grand_total: subtotal + total_gst,
      bank_name: null, notes: rec.notes,
    })

    if (!error) {
      // Update next run date and count
      await supabase.from('recurring_invoices').update({
        next_run_date: nextRunDate(today, rec.frequency),
        total_generated: rec.total_generated + 1,
        last_generated_at: new Date().toISOString(),
      }).eq('id', rec.id)
      await load()
      setSavedMsg(`Invoice ${invoice_number} generated!`)
      setTimeout(() => setSavedMsg(''), 3000)
    }
    setGenerating(null)
  }

  async function deleteRec(id: string) {
    if (!confirm('Delete this recurring invoice?')) return
    await supabase.from('recurring_invoices').delete().eq('id', id)
    setList(p => p.filter(r => r.id !== id))
  }

  function updateItem(idx: number, field: string, val: string | number) {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: val } : item)
    }))
  }

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

  // Estimate monthly amount from items
  const estimateTotal = (items: RecurringItem[]) => {
    const sub = items.reduce((s, i) => s + (i.rate || 0) * (i.qty || 1), 0)
    const gst = items.reduce((s, i) => s + (i.rate || 0) * (i.qty || 1) * (i.gst_rate || 0) / 100, 0)
    return sub + gst
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-black text-3xl">Recurring Invoices <span className="text-zinc-600 font-mono text-base ml-2">आवर्ती इनवॉइस</span></h1>
          <p className="text-zinc-500 text-sm mt-1">Auto-generate invoices for regular clients</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-2">
          <span>+</span> New Recurring
        </button>
      </div>

      {savedMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
          ✓ {savedMsg}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center text-zinc-500 py-20">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-5xl mb-4">🔄</p>
          <p className="font-syne font-bold text-xl mb-2">No recurring invoices yet</p>
          <p className="text-zinc-500 text-sm mb-6">Set up auto-invoicing for monthly retainers, subscriptions, rent</p>
          <button onClick={() => setShowForm(true)} className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors">
            Create First Recurring Invoice →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(rec => (
            <div key={rec.id} className={`bg-zinc-900 border rounded-2xl p-6 transition-all ${rec.is_active ? 'border-zinc-700' : 'border-zinc-800 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-syne font-bold text-lg">{rec.buyer_name || 'Unnamed Customer'}</h3>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${FREQ_BADGE_COLOR[rec.frequency]}`}>
                      {FREQ_LABELS[rec.frequency]}
                    </span>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${rec.is_active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-500'}`}>
                      {rec.is_active ? '● ACTIVE' : '○ PAUSED'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-zinc-600 font-mono uppercase">Invoice Value</p>
                      <p className="font-syne font-bold text-amber-400">{formatCurrency(estimateTotal(rec.items))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 font-mono uppercase">Next Run</p>
                      <p className="text-sm font-medium">{rec.next_run_date ? new Date(rec.next_run_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 font-mono uppercase">Generated</p>
                      <p className="text-sm font-medium">{rec.total_generated} invoices</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => generateNow(rec)} disabled={generating === rec.id}
                    className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1.5 rounded-lg hover:bg-amber-400/20 transition-colors disabled:opacity-50">
                    {generating === rec.id ? '⏳ Generating...' : '▶ Generate Now'}
                  </button>
                  <button onClick={() => toggleActive(rec.id, rec.is_active)}
                    className="text-xs border border-zinc-700 text-zinc-400 px-3 py-1.5 rounded-lg hover:border-zinc-500 transition-colors">
                    {rec.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => deleteRec(rec.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 rounded-t-2xl z-10">
              <h2 className="font-syne font-bold text-lg">New Recurring Invoice <span className="text-zinc-600 font-mono text-xs">नया आवर्ती इनवॉइस</span></h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <form onSubmit={save} className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">Customer Details</p>
                <div className="space-y-3">
                  <div><label className="block text-xs text-zinc-500 mb-1.5">Customer Name *</label>
                    <input value={form.buyer_name} onChange={e => setForm(p => ({ ...p, buyer_name: e.target.value }))} placeholder="Patel Enterprises" required className={inp}/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-zinc-500 mb-1.5">Phone</label>
                      <input value={form.buyer_phone} onChange={e => setForm(p => ({ ...p, buyer_phone: e.target.value }))} placeholder="+91 99999 00000" className={inp}/></div>
                    <div><label className="block text-xs text-zinc-500 mb-1.5">Email</label>
                      <input value={form.buyer_email} onChange={e => setForm(p => ({ ...p, buyer_email: e.target.value }))} placeholder="client@email.com" className={inp}/></div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">Items / Services</p>
                <div className="grid grid-cols-[1fr_70px_80px_60px_70px_24px] gap-1.5 mb-2">
                  {['Item', 'HSN', 'Rate ₹', 'Qty', 'GST%', ''].map(h => (
                    <span key={h} className="text-xs text-zinc-600 font-mono">{h}</span>
                  ))}
                </div>
                {form.items.map((item, i) => (
                  <div key={item.id} className="grid grid-cols-[1fr_70px_80px_60px_70px_24px] gap-1.5 mb-2 items-center">
                    <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Service name" className={`${inp} text-xs`}/>
                    <input value={item.hsn} onChange={e => updateItem(i, 'hsn', e.target.value)} placeholder="HSN" className={`${inp} text-xs font-mono`}/>
                    <input type="number" value={item.rate || ''} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} className={`${inp} text-xs`}/>
                    <input type="number" value={item.qty || ''} onChange={e => updateItem(i, 'qty', parseFloat(e.target.value) || 1)} className={`${inp} text-xs`}/>
                    <select value={item.gst_rate} onChange={e => updateItem(i, 'gst_rate', Number(e.target.value))} className={`${inp} text-xs`}>
                      {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <button type="button" onClick={() => form.items.length > 1 && setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))}
                      className="text-zinc-600 hover:text-red-400 text-lg leading-none">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm(p => ({ ...p, items: [...p.items, { id: uuid(), name: '', hsn: '', rate: 0, qty: 1, gst_rate: 18 }] }))}
                  className="w-full border border-dashed border-zinc-700 text-zinc-500 hover:text-amber-400 hover:border-amber-400/50 rounded-xl py-2 text-sm transition-colors mt-1">
                  + Add Item
                </button>
              </div>

              {/* Schedule */}
              <div>
                <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Frequency</label>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value as Frequency }))} className={inp}>
                      {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">End Date (optional)</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Invoice Prefix</label>
                    <input value={form.prefix} onChange={e => setForm(p => ({ ...p, prefix: e.target.value }))} placeholder="INV" className={`${inp} font-mono`}/>
                  </div>
                </div>
              </div>

              {/* Estimated value */}
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex items-center justify-between">
                <p className="text-sm text-zinc-400">Estimated invoice value</p>
                <p className="font-syne font-black text-xl text-amber-400">{formatCurrency(estimateTotal(form.items))}</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-zinc-700 text-zinc-400 py-3 rounded-xl hover:border-zinc-500 transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-amber-400 text-black font-syne font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors">
                  Create Recurring Invoice →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
