'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let current = 0
    const target = 63
    const timer = setInterval(() => {
      current = Math.min(current + 1, target)
      setCount(current)
      if (current >= target) clearInterval(timer)
    }, 25)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">

      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #f5a623, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #f5a623, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="font-syne font-black text-[22px] tracking-tight leading-none">
            Bill<span className="text-amber-400">Karo</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-mono text-zinc-400 tracking-wide">GST Compliant</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[14px] text-zinc-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing"  className="text-[14px] text-zinc-400 hover:text-white transition-colors">Pricing</a>
          <a href="#how"      className="text-[14px] text-zinc-400 hover:text-white transition-colors">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-[14px] text-zinc-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup"
            className="font-syne font-bold text-[14px] bg-amber-400 text-black px-5 py-2 rounded-xl hover:bg-amber-300 transition-colors leading-none">
            Free शुरू करें →
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
        <div className="inline-flex items-center gap-2 border border-amber-400/25 bg-amber-400/[0.06] rounded-full px-4 py-1.5 mb-10">
          <span className="text-[11px] text-amber-400 font-mono tracking-widest uppercase">🇮🇳 Made for Indian Small Businesses</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <h1 className="font-syne font-black leading-[1.0] tracking-[-0.03em] mb-5"
              style={{ fontSize: 'clamp(40px, 5.5vw, 68px)' }}>
              GST Invoice<br />
              <span className="text-amber-400">1 Minute</span> में
            </h1>
            <p className="text-zinc-400 text-[17px] leading-relaxed mb-2 max-w-md">
              Professional GST invoices with CGST/SGST/IGST, PDF download, customer book, and Tally export.
            </p>
            <p className="text-zinc-600 text-[14px] font-mono mb-10">
              छोटे व्यापारियों के लिए · Free to start
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/signup"
                className="font-syne font-black text-[16px] bg-amber-400 text-black px-8 py-3.5 rounded-2xl hover:bg-amber-300 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/20 text-center leading-normal">
                मुफ़्त खाता बनाएं →
              </Link>
              <Link href="/invoice/new"
                className="font-syne font-semibold text-[15px] border border-white/10 text-zinc-300 px-8 py-3.5 rounded-2xl hover:border-white/25 hover:text-white transition-all text-center leading-normal">
                Try without login
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['S','R','P','A','M'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[11px] font-black text-black"
                    style={{ background: i % 2 === 0 ? '#f5a623' : '#d4920f' }}>{l}</div>
                ))}
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-tight">1,200+ businesses</p>
                <p className="text-[12px] text-zinc-500 leading-tight">already using BillKaro</p>
              </div>
            </div>
          </div>

          {/* Right — invoice mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-3xl opacity-15"
              style={{ background: 'radial-gradient(circle, #f5a623, transparent 65%)' }} />
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl text-zinc-900">
              {/* Mockup header */}
              <div className="flex justify-between items-start pb-5 mb-5 border-b-2 border-zinc-900">
                <div>
                  <p className="font-syne font-black text-[18px] text-zinc-900 leading-tight">Sharma Traders</p>
                  <p className="font-mono text-[11px] text-zinc-400 mt-0.5">GSTIN: 24AAPFS1234F1Z5</p>
                  <p className="text-[11px] text-zinc-400">Ahmedabad, Gujarat</p>
                </div>
                <div className="text-right">
                  <p className="font-syne font-black text-[28px] text-amber-400 leading-none">TAX</p>
                  <p className="font-syne font-black text-[28px] text-zinc-900 leading-none -mt-1">INVOICE</p>
                  <p className="font-mono text-[11px] text-zinc-400 mt-1.5">No: INV-0042</p>
                </div>
              </div>
              {/* Mockup bill to */}
              <div className="mb-4">
                <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Bill To</p>
                <p className="font-syne font-bold text-[13px] text-zinc-900">Patel Electronics Pvt Ltd</p>
                <p className="font-mono text-[11px] text-zinc-400">GSTIN: 27AABCP0939R1ZV</p>
              </div>
              {/* Mockup items */}
              <table className="w-full text-[12px] mb-4">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="text-left p-2 font-mono text-[10px] rounded-l">Item</th>
                    <th className="text-right p-2 font-mono text-[10px]">Qty</th>
                    <th className="text-right p-2 font-mono text-[10px]">Rate</th>
                    <th className="text-right p-2 font-mono text-[10px] rounded-r">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100">
                    <td className="p-2">Electronic Components</td>
                    <td className="p-2 text-right font-mono">10</td>
                    <td className="p-2 text-right font-mono">₹5,000</td>
                    <td className="p-2 text-right font-mono font-semibold">₹50,000</td>
                  </tr>
                  <tr>
                    <td className="p-2">Installation Service</td>
                    <td className="p-2 text-right font-mono">1</td>
                    <td className="p-2 text-right font-mono">₹8,000</td>
                    <td className="p-2 text-right font-mono font-semibold">₹8,000</td>
                  </tr>
                </tbody>
              </table>
              {/* Grand total */}
              <div className="bg-zinc-900 text-white rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="font-syne font-bold text-[14px]">Grand Total</span>
                <span className="font-mono font-bold text-[18px] text-amber-400">₹68,616</span>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="bg-green-50 text-green-700 text-[11px] font-mono px-2 py-1 rounded">CGST ₹5,220</span>
                <span className="bg-blue-50 text-blue-700 text-[11px] font-mono px-2 py-1 rounded">SGST ₹5,220</span>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">PDF Ready ✓</div>
            <div className="absolute -bottom-3 -left-3 bg-zinc-800 border border-zinc-700 text-white text-[11px] font-mono px-3 py-1.5 rounded-full shadow-lg">Tally Export</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 pt-10 border-t border-white/[0.06]">
          {[
            { num: `${count}L+`, label: 'GST Businesses in India', sub: 'potential customers' },
            { num: '₹0',         label: 'to start, forever',       sub: 'No credit card needed' },
            { num: '60s',        label: 'to create an invoice',    sub: '1 मिनट में इनवॉइस' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-syne font-black text-amber-400 leading-none mb-1"
                style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>{s.num}</p>
              <p className="text-zinc-400 text-[13px] leading-tight">{s.label}</p>
              <p className="text-zinc-600 font-mono text-[11px] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how" className="max-w-5xl mx-auto px-6 md:px-10 py-20">
        <div className="text-center mb-14">
          <p className="font-mono text-[11px] text-amber-400 uppercase tracking-widest mb-3">How it works · कैसे काम करता है</p>
          <h2 className="font-syne font-black tracking-tight leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>3 steps to your first invoice</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Add your business', hi: 'बिज़नेस जोड़ें', desc: 'Enter your GSTIN, address, bank details once. They auto-fill in every invoice you create.' },
            { step: '02', title: 'Fill invoice details', hi: 'इनवॉइस भरें',   desc: 'Add customer, items with HSN codes. GST auto-calculates. Live preview updates as you type.' },
            { step: '03', title: 'Download & share',    hi: 'डाउनलोड करें',  desc: 'Print PDF, share via WhatsApp, email to customer, or export to Tally/Excel for your CA.' },
          ].map(s => (
            <div key={s.step} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-400/25 transition-colors relative overflow-hidden">
              <div className="absolute -top-4 -right-2 font-syne font-black text-[80px] text-white/[0.03] select-none leading-none">{s.step}</div>
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center font-mono text-amber-400 font-bold text-[13px] mb-4">{s.step}</div>
              <h3 className="font-syne font-bold text-[17px] mb-1 leading-tight">{s.title}</h3>
              <p className="text-amber-400/60 font-mono text-[11px] mb-3">{s.hi}</p>
              <p className="text-zinc-500 text-[14px] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
        <div className="text-center mb-14">
          <p className="font-mono text-[11px] text-amber-400 uppercase tracking-widest mb-3">Features · विशेषताएं</p>
          <h2 className="font-syne font-black tracking-tight leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>Everything you need</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🧾', title: 'GST Compliant',       hi: 'GST अनुपालक',   desc: 'CGST+SGST for intrastate, IGST for interstate. All GST rates: 0%, 5%, 12%, 18%, 28%.' },
            { icon: '📊', title: 'Tally & Excel Export', hi: 'Tally निर्यात',  desc: 'Export to Tally XML or Excel with 3 sheets — Summary, Item Detail, GSTR-1 style.' },
            { icon: '🔄', title: 'Recurring Invoices',  hi: 'आवर्ती इनवॉइस', desc: 'Auto-generate monthly invoices for retainer clients. Never miss a billing cycle.' },
            { icon: '💳', title: 'Payment Links',       hi: 'भुगतान लिंक',    desc: 'Generate Razorpay payment links. Customer pays directly from their phone.' },
            { icon: '👥', title: 'Customer Book',       hi: 'ग्राहक पुस्तक',  desc: 'Save customer GSTIN, address once. Auto-fill in future invoices.' },
            { icon: '📤', title: 'WhatsApp & Email',    hi: 'शेयर करें',       desc: 'Share invoice via WhatsApp or email directly from the invoice view page.' },
            { icon: '🖨️', title: 'PDF Download',        hi: 'PDF डाउनलोड',   desc: 'Print-ready PDF with your logo, bank details, and digital signature block.' },
            { icon: '📈', title: 'Revenue Dashboard',   hi: 'डैशबोर्ड',       desc: 'Track paid, pending, and overdue. Revenue chart for last 6 months.' },
            { icon: '🔒', title: 'Secure & Private',    hi: 'सुरक्षित',        desc: 'Encrypted storage. Row-level security — only you can access your data.' },
          ].map(f => (
            <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
              <div className="text-[24px] mb-3">{f.icon}</div>
              <h3 className="font-syne font-bold text-[15px] leading-tight mb-0.5">{f.title}</h3>
              <p className="text-amber-400/50 font-mono text-[11px] mb-2">{f.hi}</p>
              <p className="text-zinc-500 text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 md:px-10 py-20">
        <div className="text-center mb-14">
          <p className="font-mono text-[11px] text-amber-400 uppercase tracking-widest mb-3">Pricing · मूल्य</p>
          <h2 className="font-syne font-black tracking-tight leading-tight mb-2"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>Start free, scale as you grow</h2>
          <p className="text-zinc-500 text-[14px]">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free', price: '₹0', period: 'forever',
              features: ['5 invoices/month', '1 business', 'PDF download', 'GST compliant', 'Export to Excel'],
              cta: 'Get Started Free', href: '/signup',
              card: 'bg-zinc-900 border-zinc-800',
              btn: 'bg-zinc-800 text-white hover:bg-zinc-700',
            },
            {
              name: 'Pro', price: '₹199', period: '/month',
              features: ['Unlimited invoices', '3 businesses', 'Custom branding', 'Payment reminders', 'Recurring invoices', 'Payment links'],
              cta: 'Start Pro Plan', href: '/signup?plan=pro', badge: 'POPULAR',
              card: 'bg-zinc-900 border-amber-400/50',
              btn: 'bg-amber-400 text-black hover:bg-amber-300',
            },
            {
              name: 'Business', price: '₹499', period: '/month',
              features: ['Everything in Pro', '10 businesses', 'CA partner access', 'Tally export', 'Team access'],
              cta: 'Start Business', href: '/signup?plan=business',
              card: 'bg-zinc-900 border-zinc-800',
              btn: 'bg-zinc-800 text-white hover:bg-zinc-700',
            },
          ].map(p => (
            <div key={p.name} className={`relative rounded-2xl p-7 border-2 ${p.card}`}>
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-syne font-black text-[11px] px-4 py-1 rounded-full tracking-wide">
                  {p.badge}
                </div>
              )}
              <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest mb-2">{p.name}</p>
              <p className="font-syne font-black text-amber-400 leading-none mb-0.5"
                style={{ fontSize: 'clamp(36px, 5vw, 48px)' }}>{p.price}</p>
              <p className="text-zinc-500 text-[13px] mb-6">{p.period}</p>
              <ul className="space-y-2.5 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-zinc-300">
                    <span className="text-amber-400 text-[12px] shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href}
                className={`block text-center font-syne font-bold text-[14px] py-3 rounded-xl transition-colors ${p.btn}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 py-20 text-center">
        <div className="bg-zinc-900 border border-amber-400/15 rounded-3xl p-12 md:p-16">
          <p className="font-mono text-[11px] text-amber-400 uppercase tracking-widest mb-4">Ready? · शुरू करें</p>
          <h2 className="font-syne font-black tracking-tight leading-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            अपना पहला<br /><span className="text-amber-400">GST Invoice</span> बनाएं
          </h2>
          <p className="text-zinc-500 text-[15px] mb-8">Free to start. No credit card needed.</p>
          <Link href="/signup"
            className="inline-flex items-center gap-3 font-syne font-black text-[17px] bg-amber-400 text-black px-10 py-4 rounded-2xl hover:bg-amber-300 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-amber-400/20 leading-normal">
            मुफ़्त शुरू करें — Free forever →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 md:px-10 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-syne font-black text-[20px]">Bill<span className="text-amber-400">Karo</span></span>
            <p className="text-zinc-600 text-[12px] mt-1">Made with ❤️ for Indian small businesses</p>
          </div>
          <div className="flex gap-6 text-[14px] text-zinc-600">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:support@billkaro.in" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-zinc-700 text-[12px] font-mono">© 2026 BillKaro</p>
        </div>
      </footer>
    </div>
  )
}
