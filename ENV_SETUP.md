# StewardOS — Environment Variable Reference

No secret values appear in this file. Real values live in `.env.local` (gitignored, not committed) and in `VERCEL_ENV_VARS.txt` (also not committed — shared with you directly, outside Git).

| Variable | Public/Secret | Purpose | Used in | Manual action needed? | Add to Vercel? |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL | `lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `background.ts` | No — retrieved from your connected Supabase project | Yes, all environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase publishable key (RLS enforces real access control, so this is safe client-side) | Same as above | No — retrieved from your connected Supabase project | Yes, all environments |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public | Web Push subscription key, sent to the browser | `app/(app)/notifications/push-subscribe-button.tsx`, `lib/push/send.ts` | No — generated for you | Yes, all environments |
| `VAPID_PRIVATE_KEY` | **Secret** | Signs outgoing push notifications | `lib/push/send.ts` (server only) | No — generated for you | Yes, Production only |
| `VAPID_SUBJECT` | Public-ish | Contact `mailto:` required by the push spec | `lib/push/send.ts` | Yes — replace the placeholder email with a real one you control | Yes, all environments |
| `GMAIL_USER` | Secret-ish (your email) | Sender address for report emails | `lib/email/send.ts` (server only) | **Yes — your Gmail address** | Yes, Production only |
| `GMAIL_APP_PASSWORD` | **Secret** | Authenticates SMTP send via your Gmail account | `lib/email/send.ts` (server only) | **Yes — generate at** [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (needs 2-Step Verification on first) | Yes, Production only |
| `CRON_SECRET` | **Secret** | Authenticates Vercel's daily cron call to `/api/cron/digest` | `app/api/cron/digest/route.ts` | No — generated for you | Yes, Production only |

## Never required (by design)
- **Supabase service-role/secret key** — deliberately never used anywhere in this app. Every cross-user operation (the cron digest job) goes through narrowly-scoped `SECURITY DEFINER` Postgres functions instead, so the most powerful Supabase credential never has to exist as an environment variable at all.

## Where these get set
- **Local development**: `.env.local` in the project root (already created for you, gitignored, never committed).
- **Production**: Vercel dashboard → Project Settings → Environment Variables. See `VERCEL_ENV_VARS.txt` for the exact values to paste.
