import { createClient } from "@/lib/supabase/server";
import { saveOnboardingPersonal } from "@/lib/actions/onboarding";
import { ProgressHeader } from "../progress-header";
import { User, Globe, DollarSign } from "lucide-react";

const CURRENCIES = [
  { code: "NGN", label: "NGN — Nigerian Naira (₦)" },
  { code: "USD", label: "USD — US Dollar ($)" },
  { code: "GBP", label: "GBP — British Pound (£)" },
  { code: "EUR", label: "EUR — Euro (€)" },
  { code: "GHS", label: "GHS — Ghanaian Cedi (₵)" },
  { code: "KES", label: "KES — Kenyan Shilling (KSh)" },
  { code: "ZAR", label: "ZAR — South African Rand (R)" },
];

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "America/New_York",
  "UTC",
];

export default async function OnboardingPersonalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, currency, timezone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-dvh bg-paper px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl">
        <ProgressHeader step={1} back="/onboarding/welcome" />

        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Personalize Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Tell us your name and regional preferences so StewardOS formats numbers and notification schedules accurately.
            </p>
          </div>

          <form action={saveOnboardingPersonal} className="mt-8 space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                <span>Your Name</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="e.g. Alex Johnson"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="currency" className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Primary Currency</span>
                </label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue={profile?.currency ?? "NGN"}
                  className="tap-target w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-xs sm:text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="timezone" className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Timezone</span>
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  defaultValue={profile?.timezone ?? "Africa/Lagos"}
                  className="tap-target w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-xs sm:text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
              >
                Continue to System Overview
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
