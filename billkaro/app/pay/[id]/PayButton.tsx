'use client'
import { useState } from 'react'

declare global { interface Window { Razorpay: any } }

export default function PayButton({
  invoiceId, amount, invoiceNumber, buyerName
}: {
  invoiceId: string
  amount: number
  invoiceNumber: string
  buyerName: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)

  async function handlePay() {
    setLoading(true)
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      await new Promise(r => { script.onload = r })
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'BillKaro Payment',
      description: `Invoice ${invoiceNumber}`,
      handler: async (response: any) => {
        // Mark invoice as paid
        await fetch('/api/update-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: invoiceId, status: 'paid' }),
        })
        setPaid(true)
        setLoading(false)
      },
      prefill: { name: buyerName || '' },
      theme: { color: '#f5a623' },
      modal: { ondismiss: () => setLoading(false) },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (paid) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
        <p className="text-4xl mb-3">🎉</p>
        <p className="font-syne font-black text-xl text-green-400">Payment Successful!</p>
        <p className="text-zinc-500 text-sm mt-2">Your payment has been received. Thank you!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-amber-400 text-black font-syne font-black text-xl py-5 rounded-2xl hover:bg-amber-300 transition-all disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/20"
      >
        {loading ? '⏳ Opening payment...' : `Pay Now →`}
      </button>
      <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1">🔒 256-bit SSL</span>
        <span>·</span>
        <span className="flex items-center gap-1">✓ Razorpay Secured</span>
        <span>·</span>
        <span className="flex items-center gap-1">🇮🇳 RBI Compliant</span>
      </div>
    </div>
  )
}
