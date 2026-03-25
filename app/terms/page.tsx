import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By creating a BillKaro account or using our service, you agree to these Terms of Service. If you do not agree, please do not use BillKaro. These terms apply to all users including free and paid plan subscribers.`,
    },
    {
      title: 'Service Description',
      content: `BillKaro provides a GST invoice generation and management platform for Indian businesses. Features include creating GST-compliant invoices, exporting to Tally/Excel, managing customers, recurring invoices, and payment collection via Razorpay. We reserve the right to modify features with reasonable notice.`,
    },
    {
      title: 'Free and Paid Plans',
      content: `The Free plan allows 5 invoices per month and 1 business. Paid plans (Pro at ₹199/month, Business at ₹499/month) offer additional features as described on our pricing page. Paid plans are billed monthly. You can cancel at any time — no refunds for partial months.`,
    },
    {
      title: 'Acceptable Use',
      content: `You may not use BillKaro to create fraudulent invoices, impersonate other businesses, or violate Indian tax laws. You are responsible for the accuracy of GST information on your invoices. BillKaro is a tool — compliance with GST regulations is your responsibility.`,
    },
    {
      title: 'Data Ownership',
      content: `You own all invoice data and business information you create on BillKaro. We do not claim ownership of your data. You grant us a limited license to store and process your data to provide the service.`,
    },
    {
      title: 'Disclaimers',
      content: `BillKaro is provided "as is." We are not a chartered accountant or legal advisor. Invoice templates are for general use — consult your CA for specific compliance requirements. We are not liable for GST filing errors arising from BillKaro-generated invoices.`,
    },
    {
      title: 'Limitation of Liability',
      content: `BillKaro's liability is limited to the amount you paid for the service in the last 3 months. We are not liable for indirect, incidental, or consequential damages including loss of business or data.`,
    },
    {
      title: 'Governing Law',
      content: `These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Ahmedabad, Gujarat, India.`,
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <Link href="/" className="font-syne font-black text-xl">
          Bill<span className="text-amber-400">Karo</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Dashboard →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16">
        <div className="mb-12">
          <p className="font-mono text-xs text-amber-400 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-syne font-black text-4xl mb-3">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: March 2026 · Effective immediately</p>
        </div>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <div key={s.title}>
              <h2 className="font-syne font-bold text-lg mb-3 flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-600 w-6">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm pl-9">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between items-center">
          <Link href="/privacy" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors">Privacy Policy →</Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">← Home</Link>
        </div>
      </div>
    </div>
  )
}
