'use client'
import { useState } from 'react'

type Format = 'excel' | 'tally' | 'csv'

export default function ExportPage() {
  const [format, setFormat] = useState<Format>('excel')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleExport() {
    setLoading(true); setDone(false)
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, from: from || undefined, to: to || undefined }),
    })
    if (!res.ok) { alert('Export failed. Please try again.'); setLoading(false); return }

    const blob = await res.blob()
    const ext = format === 'tally' ? 'xml' : format === 'excel' ? 'xlsx' : 'csv'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BillKaro-Export-${new Date().toISOString().split('T')[0]}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false); setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

  const formats: { id: Format; icon: string; title: string; subtitle: string; desc: string }[] = [
    {
      id: 'excel',
      icon: '📊',
      title: 'Excel (.xlsx)',
      subtitle: 'For accountants & filing',
      desc: '3 sheets: Invoice Summary, Item-wise Detail, GST Summary (GSTR-1 style)',
    },
    {
      id: 'tally',
      icon: '🏦',
      title: 'Tally XML',
      subtitle: 'Direct Tally import',
      desc: 'Import sales vouchers directly into Tally Prime / Tally ERP 9 with one click',
    },
    {
      id: 'csv',
      icon: '📄',
      title: 'CSV',
      subtitle: 'Universal format',
      desc: 'Simple comma-separated file for any software — Google Sheets, Zoho, etc.',
    },
  ]

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-syne font-black text-3xl">Export <span className="text-zinc-600 font-mono text-base ml-2">निर्यात</span></h1>
        <p className="text-zinc-500 text-sm mt-1">Export invoices for your accountant or Tally software</p>
      </div>

      {/* Format Select */}
      <div className="space-y-3 mb-8">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Choose Format</p>
        {formats.map(f => (
          <button key={f.id} onClick={() => setFormat(f.id)}
            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${format === f.id
              ? 'border-amber-400 bg-amber-400/5'
              : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}>
            <span className="text-2xl mt-0.5">{f.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="font-syne font-bold text-base">{f.title}</p>
                <span className="text-xs text-zinc-500 font-mono">{f.subtitle}</span>
                {format === f.id && <span className="ml-auto text-amber-400 text-xs font-mono">✓ SELECTED</span>}
              </div>
              <p className="text-zinc-500 text-sm mt-1">{f.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Date Range */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Date Range (Optional)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-600 mb-1.5">From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inp}/>
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1.5">To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inp}/>
          </div>
        </div>
        <p className="text-xs text-zinc-600 mt-3">Leave blank to export all invoices</p>
      </div>

      {/* Tally Instructions */}
      {format === 'tally' && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-8">
          <p className="font-syne font-bold text-blue-400 mb-3">📋 How to import into Tally</p>
          <ol className="space-y-2 text-sm text-zinc-400">
            <li className="flex gap-2"><span className="text-amber-400 font-mono text-xs">1.</span> Download the XML file below</li>
            <li className="flex gap-2"><span className="text-amber-400 font-mono text-xs">2.</span> Open Tally Prime → Gateway of Tally</li>
            <li className="flex gap-2"><span className="text-amber-400 font-mono text-xs">3.</span> Go to <strong className="text-white">Import → Data → Vouchers</strong></li>
            <li className="flex gap-2"><span className="text-amber-400 font-mono text-xs">4.</span> Select the downloaded XML file</li>
            <li className="flex gap-2"><span className="text-amber-400 font-mono text-xs">5.</span> All sales vouchers will be imported ✓</li>
          </ol>
        </div>
      )}

      {/* Excel Instructions */}
      {format === 'excel' && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-8">
          <p className="font-syne font-bold text-green-400 mb-3">📊 What&apos;s in the Excel file</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex gap-2"><span className="text-amber-400">📋</span> <strong className="text-white">Sheet 1:</strong> Invoice Summary — all invoices with totals</li>
            <li className="flex gap-2"><span className="text-amber-400">📦</span> <strong className="text-white">Sheet 2:</strong> Item Detail — every line item with HSN, GST</li>
            <li className="flex gap-2"><span className="text-amber-400">🏛️</span> <strong className="text-white">Sheet 3:</strong> GST Summary — GSTR-1 ready format for CA</li>
          </ul>
        </div>
      )}

      {/* Export Button */}
      <button onClick={handleExport} disabled={loading}
        className="w-full bg-amber-400 text-black font-syne font-black text-lg py-4 rounded-2xl hover:bg-amber-300 transition-all disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/20">
        {loading ? '⏳ Preparing export...' : done ? '✓ Downloaded!' : `Download ${format === 'excel' ? 'Excel' : format === 'tally' ? 'Tally XML' : 'CSV'} →`}
      </button>

      <p className="text-center text-xs text-zinc-600 mt-4">
        Share this file with your CA or import into your accounting software
      </p>
    </div>
  )
}
