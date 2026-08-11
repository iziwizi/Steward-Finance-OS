# StewardOS Personal Finance

A mobile-first personal finance app built from an existing StewardOS Google Sheets
system — Next.js 16 (App Router) + TypeScript + Tailwind + Supabase (Postgres,
Auth, RLS) + Vercel (hosting + Cron).

## Stack
- **Next.js 16.2.11** (App Router, Turbopack, Server Actions)
- **React 19.2**
- **Supabase**: `@supabase/ssr` 0.12.4, `@supabase/supabase-js` 2.112.2 (current publishable/secret key model)
- **Tailwind CSS 3**
- **Vitest** for unit tests
- **web-push** for Web Push notifications, **nodemailer** for Gmail SMTP email

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values — see ENV_SETUP.md
npm run dev
```

Run the test suite:
```bash
npm test
```

Build for production:
```bash
npm run build
```

## Database

All schema changes live in `supabase/migrations/`, in the order they were
applied (numbered by timestamp). To recreate the schema on a fresh Supabase
project, run each file in order against the project's SQL editor, or via the
Supabase CLI:

```bash
supabase db push
```

Key design points:
- Every table has `user_id` + Row Level Security scoping every row to its owner.
- No Supabase **service-role key** is used anywhere in this app. Cross-user
  operations (the daily/weekly/monthly digest cron) go through narrowly-scoped
  `SECURITY DEFINER` Postgres functions instead (see migration `...08`), so the
  most powerful Supabase credential never has to exist as an app secret.
- New users are auto-provisioned (via a trigger) with the real StewardOS bucket
  structure (Tithe, Living Expenses, Future Martins, Freedom Fund, Kingdom
  Giving, Mother, Lifestyle, Miscellaneous, Rent Fund) and six accounts — all
  fully editable afterward in Settings, nothing hardcoded to one person.

## Environment variables

See `ENV_SETUP.md` for the full reference (purpose, public/secret, where
used) and `.env.example` for the template. Real values for the deployed
project are provided separately, outside Git.

## Architecture

- `lib/finance/allocation-engine.ts` — the single source of truth for all
  money math (income allocation split, planned/sent/pending summaries,
  available-cash calculation, budget health, goal progress, period
  resolution). Pure functions, unit tested, no I/O. UI and server actions
  call into this rather than computing anything themselves.
- `lib/data/dashboard.ts` — the one data-fetching layer for dashboard/reports;
  composes Supabase reads with the calculation engine.
- `lib/actions/*.ts` — Server Actions (income, expenses, goals, misc CRUD,
  notifications, migration, celebrations).
- `lib/celebrations/evaluate.ts` — the Celebration Engine: idempotent,
  deduped-by-unique-index award functions for first income/expense, goal
  milestones (25/50/75/100%), tithe paid, positive monthly cash flow.
- `lib/insights/generate.ts` — period-over-period insight strings, derived
  only from real fetched aggregates (no fabricated claims).
- `lib/notifications/digest.ts` + `lib/email/send.ts` + `lib/push/send.ts` +
  `app/api/cron/digest/route.ts` — the daily/weekly/monthly report pipeline.
  A single Vercel Cron entry (`vercel.json`, 06:00 UTC = 07:00 Africa/Lagos)
  handles all three cadences, rolling weekly (Sundays) and monthly (1st of
  month) into the same run, each independently idempotent via
  `notification_log`.
- `app/(app)/` — the authenticated app shell (bottom nav, notification bell,
  offline banner) and every screen: dashboard, transactions, income/expense
  entry, goals, bills, subscriptions, assets, wishlist, journal, reports,
  monthly review, today's decisions, celebrations, settings.
- `app/api/export/route.ts` — CSV/JSON data export, RLS-scoped automatically.
- `public/sw.js` — service worker (push notifications + minimal offline shell
  caching; no full offline transaction sync).

## Known manual steps (cannot be automated from this environment)
1. **Vercel environment variables** — no tool in this build environment can
   set them; add them via the Vercel dashboard using `ENV_SETUP.md` /
   `VERCEL_ENV_VARS.txt`, then redeploy.
2. **Gmail App Password** — generate at
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   (requires 2-Step Verification), needed only for email sending.
3. **GitHub push** — this environment has no GitHub connector/credentials;
   push this repo yourself with your own GitHub login.
