import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly: your name, email address, and business details (business name, GSTIN, address, bank details). We also collect invoice data you create, including customer names and transaction amounts. We do not collect payment card information — all payments are processed by Razorpay.`,
    },
    {
      title: 'How We Use Your Information',
      content: `Your information is used solely to provide the BillKaro service: generating invoices, exporting data, sending invoice emails, and processing payments. We do not sell your data to third parties. We do not use your invoice data for advertising.`,
    },
    {
      title: 'Data Storage',
      content: `Your data is stored securely on Supabase (PostgreSQL), hosted on servers in the closest available region. All data is encrypted in transit (TLS/SSL) and at rest. Access to your data is restricted by row-level security — only you can access your invoices.`,
    },
    {
      title: 'Third-Party Services',
      content: `We use the following third-party services: Supabase (database and authentication), Razorpay (payment processing), Resend (transactional email), Vercel (hosting). Each service has its own privacy policy. We only share the minimum necessary data with each service.`,
    },
    {
      title: 'Data Retention',
      content: `Your data is retained as long as your account is active. You can delete your account and all associated data at any time by contacting support@billkaro.in. Invoice data is permanently deleted within 30 days of account deletion.`,
    },
    {
      title: 'Your Rights',
      content: `You have the right to access, correct, or delete your personal data. You can export all your invoice data at any time from the Export page. For any data requests, contact us at support@billkaro.in.`,
    },
    {
      title: 'Contact',
      content: `For privacy concerns or data requests, contact us at support@billkaro.in. We respond to all inquiries within 48 hours.`,
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
          <h1 className="font-syne font-black text-4xl mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: March 2026 · Effective immediately</p>
        </div>

        <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 mb-10">
          <p className="text-sm text-zinc-300 leading-relaxed">
            <strong className="text-amber-400">Short version:</strong> We collect only what we need to run BillKaro. We never sell your data. Your invoices are private and only accessible by you. You can delete everything anytime.
          </p>
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
          <Link href="/terms" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors">Terms of Service →</Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">← Home</Link>
        </div>
      </div>
    </div>
  )
}
