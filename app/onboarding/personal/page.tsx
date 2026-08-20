import { createClient } from "@/lib/supabase/server";
import { saveOnboardingPersonal } from "@/lib/actions/onboarding";
import { ProgressHeader } from "../progress-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <main className="min-h-dvh bg-paper px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <ProgressHeader step={1} back="/onboarding/welcome" />
        <h1 className="mt-8 text-display-md text-zinc-900">Let&apos;s set things up</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Tell us a bit about yourself to personalize StewardOS.
        </p>

        <form action={saveOnboardingPersonal} className="mt-8 space-y-5">
          <Input
            id="full_name"
            name="full_name"
            label="Full Name"
            defaultValue={profile?.full_name ?? ""}
            autoComplete="name"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currency" className="text-sm font-medium text-zinc-900">
              Primary Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={profile?.currency ?? "NGN"}
              className="tap-target w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="timezone" className="text-sm font-medium text-zinc-900">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={profile?.timezone ?? "Africa/Lagos"}
              className="tap-target w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}
