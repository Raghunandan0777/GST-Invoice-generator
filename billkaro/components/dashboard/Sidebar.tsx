'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV = [
  { href: '/dashboard', label: 'Overview', hi: 'सारांश', icon: '📊', exact: true },
  { href: '/dashboard/invoices', label: 'Invoices', hi: 'इनवॉइस', icon: '🧾' },
  { href: '/dashboard/recurring', label: 'Recurring', hi: 'आवर्ती', icon: '🔄' },
  { href: '/dashboard/customers', label: 'Customers', hi: 'ग्राहक', icon: '👥' },
  { href: '/dashboard/export', label: 'Export / Tally', hi: 'निर्यात', icon: '📤' },
  { href: '/dashboard/business', label: 'My Business', hi: 'बिज़नेस', icon: '🏢' },
  { href: '/dashboard/settings', label: 'Settings', hi: 'सेटिंग', icon: '⚙️' },
]

export default function DashboardSidebar({ user, profile }: { user: User; profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const planColors: Record<string, string> = {
    free: 'bg-zinc-700 text-zinc-300',
    pro: 'bg-amber-400/20 text-amber-400',
    business: 'bg-purple-400/20 text-purple-400',
  }
  const plan = profile?.plan || 'free'

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col z-40">
      <div className="px-6 py-5 border-b border-zinc-800">
        <Link href="/" className="font-syne font-black text-2xl tracking-tight">
          Bill<span className="text-amber-400">Karo</span>
        </Link>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-mono uppercase ${planColors[plan]}`}>{plan}</span>
      </div>

      <div className="px-4 py-4 border-b border-zinc-800">
        <Link href="/invoice/new" className="flex items-center justify-center gap-2 w-full bg-amber-400 text-black font-syne font-bold text-sm py-2.5 rounded-xl hover:bg-amber-300 transition-colors">
          <span className="text-lg leading-none">+</span> New Invoice
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active
                ? 'bg-amber-400/10 text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <span className="text-xs opacity-40">{item.hi}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-sm shrink-0">
            {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        {plan === 'free' && (
          <Link href="/dashboard/upgrade" className="block text-center text-xs bg-gradient-to-r from-amber-400/10 to-amber-400/5 border border-amber-400/20 hover:border-amber-400/40 text-amber-400 py-2 rounded-lg transition-colors mb-2">
            ✨ Upgrade to Pro — ₹199/mo
          </Link>
        )}
        <button onClick={logout} className="w-full text-left text-xs text-zinc-600 hover:text-red-400 transition-colors px-1 py-1">
          Sign out / लॉगआउट →
        </button>
      </div>
    </aside>
  )
}
