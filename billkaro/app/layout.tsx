import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

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
        {/* Preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/*
          Font loading strategy:
          - DM Sans: variable font, normal stretch, no condensed/extended axes
          - Syne: display font for headings only — specific weights to avoid FOUT
          - DM Mono: monospace for numbers and code
          - font-display=swap prevents invisible text during load
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BillKaro" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
