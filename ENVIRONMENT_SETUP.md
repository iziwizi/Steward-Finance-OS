# StewardOS — Production Environment Configuration Guide

This document provides complete instructions for configuring and verifying environment variables, Gmail SMTP notifications, automated cron digests, and persistent authentication sessions for StewardOS.

---

## 1. Environment Variables Overview

| Variable Name | Required | Environment | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Production, Preview, Development | Supabase project endpoint URL (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Production, Preview, Development | Supabase public anonymous API key for client & server RLS queries |
| `CRON_SECRET` | **Yes** | Production, Preview, Development | Secret authorization token for automated daily digest cron jobs |
| `GMAIL_USER` | **Yes** | Production, Preview, Development | Owner/sender Gmail address for financial digest emails |
| `GMAIL_APP_PASSWORD` | **Yes** | Production, Preview, Development | 16-character Google App Password (never use personal Gmail login password) |
| `EMAIL_FROM_NAME` | Optional | Production, Preview, Development | Sender display name header (defaults to `"StewardOS"`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`| Optional | Production, Preview, Development | VAPID public key for browser/PWA web push notifications |
| `VAPID_PRIVATE_KEY` | Optional | Production, Preview, Development | VAPID private key for web push encryption |
| `VAPID_SUBJECT` | Optional | Production, Preview, Development | Contact email for push services (e.g. `mailto:notifications@stewardos.app`) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Production, Preview, Development | Custom production domain fallback (e.g. `https://app.stewardos.com`) |

---

## 2. Local Setup (`.env.local`)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the required values from your Supabase Dashboard and Google Account.
3. Verify that `.env.local` is listed in `.gitignore` so secrets are never pushed to GitHub.

---

## 3. Gmail App Password Setup

To enable automated digest emails without third-party transactional email services:

1. Log in to the Google Account designated for sending notifications.
2. Go to **Google Account Management** → **Security** (`https://myaccount.google.com/security`).
3. Ensure **2-Step Verification** is turned **ON**.
4. In the search bar at the top of Google Account, search for **App Passwords** (or visit `https://myaccount.google.com/apppasswords`).
5. Enter an app name: `StewardOS Finance`.
6. Click **Create**.
7. Google will display a **16-character code** (e.g., `abcd efgh ijkl mnop`).
8. Copy this code into `GMAIL_APP_PASSWORD` without spaces (`abcdefghijklmnop`).
9. Set `GMAIL_USER` to your Gmail address (e.g., `your-name@gmail.com`).

> **Security Note**: Never commit the App Password or share it in documentation or logs. It can be revoked instantly at any time from your Google Security page.

---

## 4. Automated Cron Configuration

StewardOS uses a single consolidated daily cron endpoint to deliver daily briefs, weekly summaries, and monthly audits in one efficient run.

- **CRON ENDPOINT**: `/api/cron/digest`
- **CRON SCHEDULE**: `0 6 * * *` (Daily at 06:00 UTC = 07:00 West Africa Time / Africa/Lagos)
- **AUTHENTICATION**: HTTP Header `Authorization: Bearer <CRON_SECRET>`
- **PURPOSE**: Computes financial digests, sends HTML emails via Gmail SMTP, creates in-app notifications, and pushes Web Push alerts.
- **VERCEL CONFIGURATION**: Pre-configured in `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/digest",
        "schedule": "0 6 * * *"
      }
    ]
  }
  ```

---

## 5. Vercel Environment Variables Setup

When deploying on Vercel:

1. Navigate to your project on the [Vercel Dashboard](https://vercel.com).
2. Go to **Settings** → **Environment Variables**.
3. Add the following variables, selecting all three environments (**Production**, **Preview**, **Development**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `EMAIL_FROM_NAME` = `StewardOS`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (if using push)
   - `VAPID_PRIVATE_KEY` (if using push)
4. After saving, trigger a **Redeploy** on the **Deployments** tab so the new build runtime picks up the environment variables.

---

## 6. Verification Procedures

### A. Verify Authentication & Session Persistence
1. Log in on desktop or mobile.
2. Record an income or expense transaction.
3. Refresh the browser page.
4. Navigate through multiple internal tabs: `Dashboard` → `Transactions` → `Allocations` → `Goals` → `Bills` → `Settings`.
5. Verify the user remains securely authenticated without unexpected redirects to `/login`.

### B. Verify Email Sending
To manually trigger and test the email digest endpoint:
```bash
curl -X GET https://your-deployment.vercel.app/api/cron/digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
Response will return a JSON summary with `"email": "sent"`. Check your inbox for the formatted HTML email with the sender `StewardOS <your-gmail@gmail.com>`.

### C. Verify Cron Execution on Vercel
1. In the Vercel Dashboard, go to your project → **Settings** → **Cron Jobs**.
2. Verify `/api/cron/digest` is scheduled for `0 6 * * *`.
3. Click the **Run** button to perform an immediate manual test run and review the execution logs.