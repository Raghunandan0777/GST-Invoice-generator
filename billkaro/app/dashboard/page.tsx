import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import RevenueChart from '@/components/dashboard/RevenueChart'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [invoicesRes, profileRes] = await Promise.all([
    supabase.from('invoices').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
  ])

  const invoices = invoicesRes.data || []
  const profile = profileRes.data

  const paid = invoices.filter(i => i.status === 'paid')
  const totalRevenue = paid.reduce((s, i) => s + Number(i.grand_total), 0)
  const totalGSTCollected = paid.reduce((s, i) => s + Number(i.total_gst), 0)
  const pending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.grand_total), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  const now = new Date()
  const thisMonthInvoices = invoices.filter(i => {
    const d = new Date(i.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthRevenue = thisMonthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.grand_total), 0)

  // Build last 6 months chart data
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth(),
    }
  })

  const chartData = months.map(m => {
    const monthInvs = invoices.filter(i => {
      const d = new Date(i.invoice_date)
      return d.getMonth() === m.monthNum && d.getFullYear() === m.year && i.status === 'paid'
    })
    return {
      month: m.month,
      revenue: monthInvs.reduce((s, i) => s + Number(i.grand_total), 0),
      invoices: monthInvs.length,
    }
  })

  const stats = [
    { label: 'Total Revenue', hi: 'कुल आमदनी', value: formatCurrency(totalRevenue), icon: '💰', color: 'text-green-400', sub: `${paid.length} paid invoices` },
    { label: 'This Month', hi: 'इस महीने', value: formatCurrency(thisMonthRevenue), icon: '📅', color: 'text-amber-400', sub: `${thisMonthInvoices.length} invoices created` },
    { label: 'Pending', hi: 'बकाया', value: formatCurrency(pending), icon: '⏳', color: 'text-blue-400', sub: `${invoices.filter(i => i.status === 'sent').length} awaiting payment` },
    { label: 'GST Collected', hi: 'GST संग्रह', value: formatCurrency(totalGSTCollected), icon: '🏛️', color: 'text-purple-400', sub: 'From paid invoices' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-black text-3xl">
            नमस्ते, {profile?.full_name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/invoice/new"
          className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20 flex items-center gap-2 hidden sm:flex">
          <span className="text-lg leading-none">+</span> New Invoice
        </Link>
      </div>

      {/* Free plan banner */}
      {profile?.plan === 'free' && invoices.length >= 3 && (
        <div className="bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-transparent border border-amber-400/20 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-syne font-bold text-amber-400 text-sm">
                {5 - Math.min(invoices.filter(i => {
                  const d = new Date(i.created_at)
                  return d.getMonth() === now.getMonth()
                }).length, 5)} free invoices left this month
              </p>
              <p className="text-zinc-500 text-xs">Upgrade to Pro for unlimited at ₹199/month</p>
            </div>
          </div>
          <Link href="/dashboard/upgrade" className="bg-amber-400 text-black font-syne font-bold px-4 py-2 rounded-xl hover:bg-amber-300 transition-colors text-sm whitespace-nowrap shrink-0">
            Upgrade →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className="text-xs font-mono text-zinc-700">{s.hi}</span>
            </div>
            <p className={`font-syne font-black text-xl lg:text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
            <p className="text-zinc-700 text-xs mt-0.5 font-mono">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-base mb-4">Quick Actions <span className="text-zinc-600 font-mono text-xs">त्वरित कार्य</span></h3>
          <div className="space-y-2">
            {[
              { href: '/invoice/new', icon: '🧾', label: 'New Invoice', sub: 'नया इनवॉइस बनाएं' },
              { href: '/dashboard/recurring', icon: '🔄', label: 'Recurring Setup', sub: 'Auto-generate invoices' },
              { href: '/dashboard/customers', icon: '👥', label: 'Add Customer', sub: 'ग्राहक जोड़ें' },
              { href: '/dashboard/export', icon: '📊', label: 'Export to Tally', sub: 'Tally/Excel export' },
              { href: '/dashboard/business', icon: '🏢', label: 'Business Profile', sub: 'Update your details' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-colors group">
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-amber-400 transition-colors">{a.label}</p>
                  <p className="text-xs text-zinc-600 truncate">{a.sub}</p>
                </div>
                <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Status Summary */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Draft', count: invoices.filter(i => i.status === 'draft').length, color: 'bg-zinc-700/30 text-zinc-400 border-zinc-700' },
          { label: 'Sent', count: invoices.filter(i => i.status === 'sent').length, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'Paid', count: invoices.filter(i => i.status === 'paid').length, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
          { label: 'Overdue', count: overdueCount, color: overdueCount > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-700/30 text-zinc-500 border-zinc-700' },
        ].map(s => (
          <Link href="/dashboard/invoices" key={s.label} className={`border rounded-xl p-4 text-center hover:opacity-80 transition-opacity ${s.color}`}>
            <p className="font-syne font-black text-2xl">{s.count}</p>
            <p className="text-xs font-mono uppercase tracking-wider mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-syne font-bold text-base">Recent Invoices <span className="text-zinc-600 font-mono text-xs ml-2">हाल के इनवॉइस</span></h2>
          <Link href="/dashboard/invoices" className="text-sm text-amber-400 hover:underline">View all →</Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🧾</p>
            <p className="font-syne font-bold text-lg mb-2">No invoices yet</p>
            <p className="text-zinc-500 text-sm mb-6">अभी तक कोई इनवॉइस नहीं बना</p>
            <Link href="/invoice/new" className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors inline-block">
              Create First Invoice →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/20">
                  {['Invoice #', 'Customer', 'Date', 'Amount', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-mono text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 8).map(inv => (
                  <tr key={inv.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm text-amber-400 font-medium">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium truncate max-w-32">{inv.buyer_name || '—'}</p>
                      {inv.buyer_gstin && <p className="text-xs text-zinc-600 font-mono">{inv.buyer_gstin.substring(0, 10)}…</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400 whitespace-nowrap">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-sm font-mono font-semibold whitespace-nowrap">{formatCurrency(inv.grand_total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-mono uppercase ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/invoice/${inv.id}`} className="text-xs text-zinc-500 hover:text-white transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
