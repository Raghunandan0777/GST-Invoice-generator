'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Customer } from '@/lib/types'
import { INDIAN_STATES } from '@/lib/types'

export default function CustomersPage() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', gstin: '', address: '', city: '', state: 'Gujarat',
    pincode: '', phone: '', email: ''
  })

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('customers').select('*')
      .eq('user_id', user.id).order('name')
    setCustomers(data || [])
    setLoading(false)
  }

  function resetForm() {
    setForm({ name: '', gstin: '', address: '', city: '', state: 'Gujarat', pincode: '', phone: '', email: '' })
    setEditId(null)
  }

  async function saveCustomer(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (editId) {
      await supabase.from('customers').update(form).eq('id', editId)
    } else {
      await supabase.from('customers').insert({ ...form, user_id: user.id })
    }
    await loadCustomers()
    setSaving(false); setShowForm(false); resetForm()
  }

  async function deleteCustomer(id: string) {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id)
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  function editCustomer(c: Customer) {
    setForm({ name: c.name, gstin: c.gstin || '', address: c.address || '', city: c.city || '', state: c.state || 'Gujarat', pincode: c.pincode || '', phone: c.phone || '', email: c.email || '' })
    setEditId(c.id); setShowForm(true)
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.gstin || '').toLowerCase().includes(search.toLowerCase())
  )

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-black text-3xl">Customers <span className="text-zinc-600 font-mono text-base ml-2">ग्राहक</span></h1>
          <p className="text-zinc-500 text-sm mt-1">{customers.length} customers saved</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-2">
          <span>+</span> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, or GSTIN..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"/>
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="text-zinc-500 text-center py-20">Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-5xl mb-4">👥</p>
          <p className="font-syne font-bold text-xl mb-2">
            {search ? 'No customers found' : 'No customers yet'}
          </p>
          <p className="text-zinc-500 text-sm mb-6">
            {search ? 'Try a different search' : 'Save customer details to auto-fill future invoices'}
          </p>
          {!search && (
            <button onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors">
              Add First Customer →
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center font-syne font-black text-amber-400 text-lg">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editCustomer(c)} className="text-xs text-zinc-500 hover:text-amber-400 transition-colors bg-zinc-800 px-2 py-1 rounded">Edit</button>
                  <button onClick={() => deleteCustomer(c.id)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors bg-zinc-800 px-2 py-1 rounded">Delete</button>
                </div>
              </div>
              <h3 className="font-syne font-bold text-base mb-1">{c.name}</h3>
              {c.gstin && <p className="font-mono text-xs text-amber-400/70 mb-2">{c.gstin}</p>}
              {(c.city || c.state) && <p className="text-xs text-zinc-500 mb-1">📍 {[c.city, c.state].filter(Boolean).join(', ')}</p>}
              {c.phone && <p className="text-xs text-zinc-500 mb-1">📞 {c.phone}</p>}
              {c.email && <p className="text-xs text-zinc-500 truncate">✉ {c.email}</p>}
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <Link href={`/invoice/new?customer=${c.id}`}
                  className="text-xs text-amber-400 hover:underline">
                  + Create Invoice for {c.name.split(' ')[0]} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); resetForm() } }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
              <h2 className="font-syne font-bold text-lg">
                {editId ? 'Edit Customer' : 'Add Customer'} <span className="text-zinc-600 font-mono text-xs ml-1">{editId ? 'संपादित करें' : 'नया ग्राहक'}</span>
              </h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="text-zinc-500 hover:text-white text-xl">×</button>
            </div>
            <form onSubmit={saveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Customer Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Patel Electronics" required className={inp}/>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">GSTIN (optional)</label>
                <input value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} placeholder="29AABCU9603R1ZX" maxLength={15} className={`${inp} font-mono tracking-widest`}/>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Address</label>
                <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} placeholder="Shop address..." className={`${inp} resize-none`}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">City</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" className={inp}/>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">State</label>
                  <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className={inp}>
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">PIN</label>
                  <input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} placeholder="400001" className={inp}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99999 00000" className={inp}/>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="customer@email.com" className={inp}/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                  className="flex-1 border border-zinc-700 text-zinc-400 py-2.5 rounded-xl hover:border-zinc-500 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-amber-400 text-black font-syne font-bold py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 text-sm">
                  {saving ? 'Saving...' : editId ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
