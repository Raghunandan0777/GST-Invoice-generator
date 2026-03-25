'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Invoice, InvoiceStatus } from '@/lib/types'

const STATUSES: (InvoiceStatus | 'all')[] = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('invoices').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setInvoices((data || []) as Invoice[])
    setLoading(false)
  }

  async function markStatus(id: string, status: InvoiceStatus) {
    await supabase.from('invoices').update({ status }).eq('id', id)
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice permanently?')) return
    setDeleting(id)
    await supabase.from('invoices').delete().eq('id', id)
    setInvoices(prev => prev.filter(i => i.id !== id))
    setDeleting(null)
  }

  // Filter + search + sort
  const filtered = invoices
    .filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          inv.invoice_number?.toLowerCase().includes(q) ||
          inv.buyer_name?.toLowerCase().includes(q) ||
          inv.buyer_gstin?.toLowerCase().includes(q) ||
          String(inv.grand_total).includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      let va: any, vb: any
      if (sortBy === 'date') { va = a.invoice_date; vb = b.invoice_date }
      else if (sortBy === 'amount') { va = Number(a.grand_total); vb = Number(b.grand_total) }
      else { va = a.buyer_name || ''; vb = b.buyer_name || '' }
      if (sortDir === 'asc') return va > vb ? 1 : -1
      return va < vb ? 1 : -1
    })

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: typeof sortBy }) =>
    sortBy === field
      ? <span className="text-amber-400 ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>
      : <span className="text-zinc-700 ml-0.5">↕</span>

  const totalShown = filtered.reduce((s, i) => s + Number(i.grand_total), 0)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-black text-3xl">
            Invoices <span className="text-zinc-600 font-mono text-base ml-2">इनवॉइस</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{invoices.length} total · {formatCurrency(totalShown)} shown</p>
        </div>
        <Link href="/invoice/new"
          className="bg-amber-400 text-black font-syne font-bold px-5 py-2.5 rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-2 text-sm">
          <span>+</span> New Invoice
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice no., customer, amount..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-lg">×</button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Status pill counts */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => {
          const count = s === 'all' ? invoices.length : invoices.filter(i => i.status === s).length
          const active = statusFilter === s
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                active ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}>
              {s === 'all' ? 'All' : s} {count > 0 && <span className={active ? 'opacity-70' : 'opacity-50'}>({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-600 animate-pulse">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">{search || statusFilter !== 'all' ? '🔍' : '🧾'}</p>
            <p className="font-syne font-bold text-lg mb-2">
              {search || statusFilter !== 'all' ? 'No invoices match' : 'No invoices yet'}
            </p>
            <p className="text-zinc-500 text-sm mb-6">
              {search || statusFilter !== 'all' ? 'Try a different search or filter' : 'Create your first GST invoice now'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link href="/invoice/new" className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors inline-block">
                Create Invoice →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                  <th className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <button onClick={() => toggleSort('name')} className="flex items-center hover:text-zinc-300">
                      Invoice # / Customer <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <button onClick={() => toggleSort('date')} className="flex items-center hover:text-zinc-300">
                      Date <SortIcon field="date" />
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Due</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    <button onClick={() => toggleSort('amount')} className="flex items-center hover:text-zinc-300">
                      Amount <SortIcon field="amount" />
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider hidden lg:table-cell">GST</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className={`border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors group ${deleting === inv.id ? 'opacity-40' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-sm text-amber-400 font-medium">{inv.invoice_number}</p>
                      <p className="text-sm font-medium truncate max-w-36 mt-0.5">{inv.buyer_name || '—'}</p>
                      {inv.buyer_gstin && <p className="text-xs text-zinc-600 font-mono truncate max-w-36">{inv.buyer_gstin}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400 whitespace-nowrap">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500 whitespace-nowrap hidden sm:table-cell">
                      {inv.due_date ? (
                        <span className={new Date(inv.due_date) < new Date() && inv.status !== 'paid' ? 'text-red-400' : ''}>
                          {formatDate(inv.due_date)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono font-semibold whitespace-nowrap">{formatCurrency(Number(inv.grand_total))}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={inv.status}
                        onChange={e => markStatus(inv.id, e.target.value as InvoiceStatus)}
                        className={`text-xs px-2.5 py-1 rounded-full font-mono uppercase border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 ${getStatusColor(inv.status)}`}
                        style={{ background: 'transparent' }}
                      >
                        {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
                          <option key={s} value={s} className="bg-zinc-900 text-zinc-200">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500 font-mono hidden lg:table-cell">
                      {formatCurrency(Number(inv.total_gst))}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/invoice/${inv.id}`} className="text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2.5 py-1 rounded-lg transition-colors">
                          View
                        </Link>
                        <Link href={`/invoice/${inv.id}/edit`} className="text-xs text-zinc-400 hover:text-amber-400 bg-zinc-800 px-2.5 py-1 rounded-lg transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => deleteInvoice(inv.id)} disabled={deleting === inv.id}
                          className="text-xs text-zinc-600 hover:text-red-400 bg-zinc-800 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer summary */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-800/20">
              <p className="text-xs text-zinc-500 font-mono">
                Showing {filtered.length} of {invoices.length} invoices
              </p>
              <p className="text-xs font-mono text-zinc-400">
                Total: <span className="text-amber-400 font-bold">{formatCurrency(totalShown)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
