This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PhonePe + Supabase Setup

Add these env vars in `.env.local` before trying checkout:

```bash
# site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# phonepe
PHONEPE_ENV=UAT
PHONEPE_CLIENT_ID=
PHONEPE_CLIENT_SECRET=
PHONEPE_CLIENT_VERSION=1
PHONEPE_WEBHOOK_USERNAME=
PHONEPE_WEBHOOK_PASSWORD=

# optional overrides (usually keep default)
# PHONEPE_AUTH_URL=
# PHONEPE_CREATE_PAYMENT_URL=
# PHONEPE_ORDER_STATUS_BASE_URL=
# PHONEPE_REFUND_CREATE_URL=
# PHONEPE_REFUND_STATUS_BASE_URL=
# PHONEPE_REDIRECT_BASE_URL=

# optional UAT-only checkout override, amount in paise (100 = ₹1)
# PHONEPE_TEST_AMOUNT_PAISE=

# supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

```

Run these SQL files in Supabase SQL editor, in order:

- `supabase/migrations/20260228170000_phonepe_orders.sql`
- `supabase/migrations/20260228193000_phonepe_refunds.sql`
- `supabase/migrations/20260405170000_popup_leads.sql`
- `supabase/migrations/20260416123000_enable_rls_on_backend_tables.sql`

Implemented endpoints:

- `POST /api/payments/phonepe/create`
- `GET /api/payments/phonepe/status?merchantOrderId=...`
- `POST /api/payments/phonepe/webhook`
- `POST /api/payments/phonepe/refund`
- `GET /api/payments/phonepe/refund-status?merchantRefundId=...`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
