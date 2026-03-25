'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Home', exact: true },
  { href: '/dashboard/invoices', icon: '🧾', label: 'Invoices' },
  { href: '/invoice/new', icon: '+', label: 'New', cta: true },
  { href: '/dashboard/customers', icon: '👥', label: 'Customers' },
  { href: '/dashboard/export', icon: '📤', label: 'Export' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {NAV.map(item => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          if (item.cta) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-12 h-12 bg-amber-400 rounded-2xl -mt-4 shadow-lg shadow-amber-400/30"
              >
                <span className="text-black font-black text-2xl leading-none">+</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                active ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-xs font-mono">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
