import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { DM_Sans, Syne, DM_Mono } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'BillKaro – Free GST Invoice Generator India',
    template: '%s | BillKaro',
  },
  description: 'Create professional GST invoices in seconds. Free CGST/SGST/IGST invoice generator for Indian small businesses. Tally export, payment links, recurring invoices.',
  keywords: ['GST invoice', 'GST invoice generator', 'free GST invoice', 'CGST SGST', 'Indian business invoice'],
  authors: [{ name: 'BillKaro' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'BillKaro – Free GST Invoice Generator',
    description: 'Professional GST invoices in seconds. Made for Indian businesses.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'BillKaro',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#f5a623',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BillKaro" />
      </head>
      <body className={`antialiased ${dmSans.variable} ${syne.variable} ${dmMono.variable}`} suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
