'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { INDIAN_STATES } from '@/lib/types'
import GSTINInput from '@/components/ui/GSTINInput'

const STEPS = ['Welcome', 'Business Info', 'Bank Details', 'Done']

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [biz, setBiz] = useState({
    name: '', gstin: '', address: '', city: '', state: 'Gujarat',
    pincode: '', phone: '', email: '',
  })
  const [bank, setBank] = useState({
    bank_name: '', bank_account: '', bank_ifsc: '', bank_holder: '',
  })

  const setB = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setBiz(p => ({ ...p, [k]: e.target.value }))
  const setBnk = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBank(p => ({ ...p, [k]: e.target.value }))

  async function finish() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    if (biz.name) {
      await supabase.from('businesses').insert({
        user_id: user.id, is_default: true,
        ...biz, ...bank,
      })
    }

    // Mark onboarding complete in profile
    await supabase.from('profiles').update({ onboarded: true } as any).eq('id', user.id)
    router.push('/dashboard')
  }

  const inp = "w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-syne font-black text-3xl mb-1">
            Bill<span className="text-amber-400">Karo</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-amber-400 text-black' :
                'bg-zinc-800 text-zinc-600'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-mono hidden sm:block ${i === step ? 'text-amber-400' : 'text-zinc-600'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-500/40' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="font-syne font-black text-2xl mb-3">Welcome to BillKaro!</h2>
              <p className="text-zinc-400 mb-2">Let&apos;s set up your business in 2 minutes.</p>
              <p className="text-zinc-600 font-mono text-sm mb-8">2 मिनट में अपना बिज़नेस सेटअप करें</p>
              <div className="space-y-3 text-left bg-zinc-800/40 rounded-xl p-5 mb-8">
                {[
                  { icon: '🧾', text: 'Create unlimited GST invoices' },
                  { icon: '📊', text: 'Export to Tally & Excel' },
                  { icon: '💳', text: 'Collect payments via Razorpay' },
                  { icon: '🔄', text: 'Auto-generate recurring invoices' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span>{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="w-full bg-amber-400 text-black font-syne font-bold py-3.5 rounded-xl hover:bg-amber-300 transition-colors text-base">
                Let&apos;s Set Up →
              </button>
              <button onClick={() => router.push('/dashboard')} className="w-full text-zinc-600 hover:text-zinc-400 text-sm mt-3 transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="font-syne font-black text-xl mb-1">Business Details</h2>
              <p className="text-zinc-500 text-sm mb-6">This auto-fills in every invoice. व्यापार की जानकारी</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Business Name <span className="text-amber-400">*</span></label>
                  <input value={biz.name} onChange={setB('name')} placeholder="e.g. Sharma Traders" className={inp} />
                </div>
                <GSTINInput value={biz.gstin} onChange={v => setBiz(p => ({ ...p, gstin: v }))} />
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Address</label>
                  <textarea value={biz.address} onChange={setB('address')} rows={2} placeholder="Shop/Office address" className={`${inp} resize-none`} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">City</label>
                    <input value={biz.city} onChange={setB('city')} placeholder="Ahmedabad" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">State</label>
                    <select value={biz.state} onChange={setB('state')} className={inp}>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">PIN</label>
                    <input value={biz.pincode} onChange={setB('pincode')} placeholder="380001" className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Phone</label>
                    <input value={biz.phone} onChange={setB('phone')} placeholder="+91 98765 43210" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input value={biz.email} onChange={setB('email')} placeholder="you@business.com" className={inp} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="px-4 py-3 border border-zinc-700 rounded-xl text-zinc-400 hover:border-zinc-500 transition-colors text-sm">← Back</button>
                <button onClick={() => setStep(2)} disabled={!biz.name}
                  className="flex-1 bg-amber-400 text-black font-syne font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-40">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="font-syne font-black text-xl mb-1">Bank Details</h2>
              <p className="text-zinc-500 text-sm mb-6">Shown on every invoice for payment. बैंक विवरण</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Bank Name</label>
                  <input value={bank.bank_name} onChange={setBnk('bank_name')} placeholder="State Bank of India" className={inp} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Account Number</label>
                    <input value={bank.bank_account} onChange={setBnk('bank_account')} placeholder="1234567890" className={`${inp} font-mono`} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
                    <input value={bank.bank_ifsc} onChange={e => setBnk('bank_ifsc')({ ...e, target: { ...e.target, value: e.target.value.toUpperCase() } })} placeholder="SBIN0001234" className={`${inp} font-mono tracking-widest`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Account Holder Name</label>
                  <input value={bank.bank_holder} onChange={setBnk('bank_holder')} placeholder="Name on account" className={inp} />
                </div>
              </div>
              <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-4 mt-5 text-xs text-zinc-500">
                <p className="font-mono text-amber-400/70 mb-1">💡 Optional but recommended</p>
                Bank details help customers pay you directly via NEFT/UPI. You can add/change this later too.
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-3 border border-zinc-700 rounded-xl text-zinc-400 hover:border-zinc-500 transition-colors text-sm">← Back</button>
                <button onClick={finish} disabled={saving}
                  className="flex-1 bg-amber-400 text-black font-syne font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Finish Setup →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
