'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { INDIAN_STATES } from '@/lib/types'

export default function BusinessPage() {console.log('::: ', );
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '', gstin: '', address: '', city: '', state: 'Gujarat', pincode: '',
    phone: '', email: '', bank_name: '', bank_account: '', bank_ifsc: '', bank_holder: ''
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).eq('is_default', true).maybeSingle()
      if (data) setForm({ name: data.name || '', gstin: data.gstin || '', address: data.address || '', city: data.city || '', state: data.state || 'Gujarat', pincode: data.pincode || '', phone: data.phone || '', email: data.email || '', bank_name: data.bank_name || '', bank_account: data.bank_account || '', bank_ifsc: data.bank_ifsc || '', bank_holder: data.bank_holder || '' })
      setLoading(false)
    }
    load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { ...form, user_id: user.id, is_default: true }
    const { data: existing } = await supabase.from('businesses').select('id').eq('user_id', user.id).eq('is_default', true).single()
    if (existing) await supabase.from('businesses').update(payload).eq('id', existing.id)
    else await supabase.from('businesses').insert(payload)
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"

  if (loading) return <div className="p-8 text-zinc-500">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-syne font-black text-3xl">My Business <span className="text-zinc-600 font-mono text-base">मेरा बिज़नेस</span></h1>
        <p className="text-zinc-500 text-sm mt-1">This info auto-fills in every invoice you create</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-syne font-bold text-base text-amber-400">Business Info</h3>
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Business Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="Sharma Traders" required className={inp}/>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">GSTIN</label>
            <input value={form.gstin} onChange={set('gstin')} placeholder="27AAPFU0939F1ZV" maxLength={15} className={`${inp} font-mono tracking-widest`}/>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Address</label>
            <textarea value={form.address} onChange={set('address')} rows={2} className={inp}/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">City</label>
              <input value={form.city} onChange={set('city')} placeholder="Ahmedabad" className={inp}/>
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">State</label>
              <select value={form.state} onChange={set('state')} className={inp}>
                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">PIN Code</label>
              <input value={form.pincode} onChange={set('pincode')} placeholder="380001" className={inp}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className={inp}/>
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email</label>
              <input value={form.email} onChange={set('email')} placeholder="you@business.com" className={inp}/>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-syne font-bold text-base text-amber-400">Bank Details <span className="text-zinc-600 font-mono text-xs">बैंक विवरण</span></h3>
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Bank Name</label>
            <input value={form.bank_name} onChange={set('bank_name')} placeholder="State Bank of India" className={inp}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Account Number</label>
              <input value={form.bank_account} onChange={set('bank_account')} placeholder="1234567890" className={`${inp} font-mono`}/>
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
              <input value={form.bank_ifsc} onChange={set('bank_ifsc')} placeholder="SBIN0001234" className={`${inp} font-mono tracking-widest`}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Account Holder Name</label>
            <input value={form.bank_holder} onChange={set('bank_holder')} placeholder="Name on account" className={inp}/>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-amber-400 text-black font-syne font-bold py-3.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 text-base">
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Business Details'}
        </button>
      </form>
    </div>
  )
}
