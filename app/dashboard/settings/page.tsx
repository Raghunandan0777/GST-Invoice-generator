'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) { setName(data.full_name || ''); setPlan(data.plan || 'free') }
    }
    load()
  }, [])

  async function saveName(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const planInfo = {
    free: { label: 'Free Plan', color: 'text-zinc-400', desc: '5 invoices/month, 1 business', limit: '5 invoices/month' },
    pro: { label: 'Pro Plan ✨', color: 'text-amber-400', desc: 'Unlimited invoices, 3 businesses', limit: 'Unlimited' },
    business: { label: 'Business Plan 🚀', color: 'text-purple-400', desc: 'Everything in Pro + more', limit: 'Unlimited' },
  }

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-syne font-black text-3xl">Settings <span className="text-zinc-600 font-mono text-base ml-2">सेटिंग</span></h1>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-base mb-4">Profile</h3>
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" className={inp}/>
            </div>
            <button type="submit" disabled={saving}
              className="bg-amber-400 text-black font-syne font-bold px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 text-sm">
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Name'}
            </button>
          </form>
        </div>

        {/* Plan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-base mb-4">Your Plan</h3>
          <div className={`font-syne font-bold text-xl mb-1 ${planInfo[plan as keyof typeof planInfo]?.color}`}>
            {planInfo[plan as keyof typeof planInfo]?.label}
          </div>
          <p className="text-zinc-500 text-sm mb-4">{planInfo[plan as keyof typeof planInfo]?.desc}</p>
          {plan === 'free' && (
            <div className="bg-gradient-to-r from-amber-400/10 to-transparent border border-amber-400/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-syne font-bold text-amber-400 text-sm">Upgrade to Pro</p>
                <p className="text-zinc-500 text-xs">Unlimited invoices for ₹199/month</p>
              </div>
              <button className="bg-amber-400 text-black font-syne font-bold text-xs px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors">
                Upgrade →
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-base mb-4 text-red-400">Account</h3>
          <button onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors">
            Sign out / साइन आउट
          </button>
        </div>
      </div>
    </div>
  )
}
