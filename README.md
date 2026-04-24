# BillKaro

A free, no-hassle invoice generator for Indian businesses. Built to make GST invoicing less painful.

## What is this?

BillKaro lets you create professional GST invoices in seconds. It's focused on making the mundane task of invoicing actually... bearable. Generate invoices, send them to customers, collect payments, and even automate recurring billing. All without breaking the bank.

## Features

- Create & manage GST invoices (CGST/SGST/IGST)
- Store multiple businesses and customer profiles
- Generate payment links via Razorpay
- Auto-generate recurring invoices
- Export to Excel, PDF, or Tally format
- Email invoices directly to customers
- Track revenue and invoice status from your dashboard
- Works on mobile and desktop

## Tech Behind It

**Frontend:**

- Next.js 16.2 with React 19
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI components
- React Hook Form + Zod for forms

**Backend:**

- Supabase (PostgreSQL + Auth)
- Server-side rendering with SSR
- Row-level security for data isolation

**External stuff:**

- Razorpay for payments
- Resend for emails
- Nodemailer for notifications

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works fine)
- Razorpay account for payment links
- Resend account for emails

### Setup

1. Clone & install:

```bash
git clone <repo-url>
cd billkaro
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up the database:
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Run `supabase-schema.sql`

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you're good to go.

LIVE URL : https://gst-invoice-generator-three.vercel.app

## How It's Organized

```
app/
├── api/              → Backend endpoints
├── dashboard/        → Your private area
├── invoice/          → Invoice management
├── auth/             → Login & signup
├── pay/              → Payment page
└── public-pages/     → Terms, privacy, etc.

lib/
├── supabase/         → Database clients
└── types.ts          → TypeScript types

components/
├── dashboard/        → Dashboard UI
└── ui/               → Reusable components
```

## Database

We use a few tables:

- **profiles** - User accounts
- **businesses** - Company info (GSTIN, address, bank details)
- **customers** - People you invoice
- **invoices** - Your invoices
- **recurring_invoices** - Automated billing setup

Everything has row-level security, so you can only see your own data.

## Authentication

Uses Supabase Auth. Sign up with email/password, stay logged in via secure cookies.

Protected routes:

- `/dashboard/*` - You need to be logged in
- `/invoice/*/edit` - Only invoice owner can edit

Public routes:

- `/` - Anyone can see the homepage
- `/invoice/:id` - Anyone can view a published invoice
- `/login`, `/signup` - Sign up or log in

## Payments

Razorpay handles everything. Generate a payment link, customer pays, webhook confirms it. Simple.

## Emails

Resend sends your invoice notifications. Customer gets an email with the invoice attached.

## Testing

```bash
npm test                  # Run tests
npm run test:ui          # Interactive testing
npm run test:report      # View results
```

Uses Playwright for end-to-end testing.

## Deploy

### Vercel (easiest)

```bash
vercel deploy
```

### Manual

```bash
npm run build
npm start
```

Set environment variables in your hosting platform and you're done.

## Common Issues

**Getting a hydration error?**
That's usually a browser extension messing with the DOM. We've got `suppressHydrationWarning` on the body tag to handle it.

**Database queries returning 404?**
Make sure you ran the SQL schema. Check your Supabase -> SQL Editor -> Run `supabase-schema.sql`.

**Invoices not sending?**
Verify your Resend API key and check the Resend logs.

**Payment links if not  working?**
Double-check your Razorpay test/live mode and webhook URL. 

## Contributing

Found a bug or have an idea? Open an issue. Want to help out? Fork it, make your changes, and send a pull request.

## License

MIT - use it however you want.

---

Made for Indian businesses who have better things to do than mess with invoice generation.
