'use client'
import { useState } from 'react'

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    period: 'month',
    features: [
      'Unlimited invoices',
      '3 businesses',
      'Custom logo & branding',
      'Payment reminders',
      'Customer book (unlimited)',
      'Priority support',
    ],
    color: 'border-amber-400',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 499,
    period: 'month',
    features: [
      'Everything in Pro',
      '10 businesses',
      'CA partner access',
      'Excel / Tally export',
      'Recurring invoices',
      'Team member access',
    ],
    color: 'border-purple-400',
    highlight: false,
  },
]

declare global {
  interface Window { Razorpay: any }
}

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planId: string, amount: number) {
    setLoading(planId)
    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      await new Promise(r => script.onload = r)
    }

    // In production: call your API to create Razorpay order
    // const { orderId } = await fetch('/api/razorpay/create-order', { method: 'POST', body: JSON.stringify({ planId, amount }) }).then(r => r.json())

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxx',
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'BillKaro',
      description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - Monthly`,
      image: '/logo.png',
      // order_id: orderId,  // uncomment in production
      handler: async (response: any) => {
        // Verify payment on server and update plan
        // await fetch('/api/razorpay/verify', { method: 'POST', body: JSON.stringify(response) })
        alert('Payment successful! Your plan has been upgraded. 🎉')
        window.location.href = '/dashboard'
      },
      prefill: { name: '', email: '', contact: '' },
      theme: { color: '#f5a623' },
      modal: { ondismiss: () => setLoading(null) },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
    setLoading(null)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-10">
        <h1 className="font-syne font-black text-3xl mb-2">Upgrade Your Plan <span className="text-amber-400">✨</span></h1>
        <p className="text-zinc-500">अपग्रेड करें और unlimited invoices बनाएं</p>
      </div>

      {/* Free vs Paid comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="font-syne font-bold text-base">You&apos;re on <span className="text-zinc-400">Free Plan</span></p>
          <p className="text-zinc-500 text-sm mt-1">5 invoices/month · 1 business · Basic features</p>
        </div>
        <span className="bg-zinc-800 text-zinc-400 font-mono text-xs px-3 py-1.5 rounded-full">CURRENT</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-zinc-900 border-2 ${plan.color} rounded-2xl p-7 relative`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-syne font-bold text-xs px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">{plan.name}</div>
            <div className="font-syne font-black text-5xl mb-1">₹{plan.price}</div>
            <div className="text-zinc-500 text-sm mb-6">per {plan.period}</div>

            <ul className="space-y-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="text-amber-400 text-xs">✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id, plan.price)}
              disabled={loading === plan.id}
              className={`w-full font-syne font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 ${
                plan.highlight
                  ? 'bg-amber-400 text-black hover:bg-amber-300'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
              }`}>
              {loading === plan.id ? 'Opening payment...' : `Upgrade to ${plan.name} → ₹${plan.price}/mo`}
            </button>

            <p className="text-center text-xs text-zinc-600 mt-3">Secure payment via Razorpay</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
        <p className="text-zinc-400 text-sm mb-2">💬 Need help choosing? Have questions?</p>
        <p className="text-zinc-500 text-xs">Email us at <span className="text-amber-400">support@billkaro.in</span> or WhatsApp us</p>
      </div>
    </div>
  )
}
