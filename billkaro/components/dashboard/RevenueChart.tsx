'use client'
import { useEffect, useRef } from 'react'
import { formatCurrency } from '@/lib/utils'

interface MonthData {
  month: string
  revenue: number
  invoices: number
}

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const max = Math.max(...data.map(d => d.revenue), 1)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-syne font-bold text-base">Revenue Overview</h3>
          <p className="text-zinc-500 text-xs font-mono mt-0.5">राजस्व अवलोकन — Last 6 months</p>
        </div>
        <div className="text-right">
          <p className="font-syne font-black text-xl text-amber-400">
            {formatCurrency(data.reduce((s, d) => s + d.revenue, 0))}
          </p>
          <p className="text-zinc-500 text-xs">Total collected</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-36 mb-3">
        {data.map((d, i) => {
          const height = max > 0 ? Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 0) : 0
          const isLast = i === data.length - 1
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-syne font-bold">{formatCurrency(d.revenue)}</p>
                <p className="text-zinc-500">{d.invoices} invoice{d.invoices !== 1 ? 's' : ''}</p>
              </div>
              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: '100%' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${isLast ? 'bg-amber-400' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}
                  style={{ height: `${height}%`, minHeight: d.revenue > 0 ? 4 : 0 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Month labels */}
      <div className="flex gap-2">
        {data.map(d => (
          <div key={d.month} className="flex-1 text-center text-xs font-mono text-zinc-600 truncate">{d.month}</div>
        ))}
      </div>
    </div>
  )
}
