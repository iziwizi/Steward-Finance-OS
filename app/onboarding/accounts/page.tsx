import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAccount } from "@/lib/actions/accounts";
import { ProgressHeader } from "../progress-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function OnboardingAccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, institution")
    .eq("user_id", user.id)
    .order("name");

  return (
    <main className="min-h-dvh bg-paper px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <ProgressHeader step={4} back="/onboarding/allocations" />
        <h1 className="mt-8 text-display-md text-zinc-900">Your accounts</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Add the accounts you use to fund allocations and track spending.
        </p>

        {accounts && accounts.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Your accounts
            </p>
            {accounts.map((a) => (
              <div
                key={a.id}
                className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900"
              >
                {a.name}
                {a.institution && <span className="text-zinc-400"> · {a.institution}</span>}
              </div>
            ))}
          </div>
        )}

        <form action={createAccount} className="mt-6 space-y-3 border-t border-zinc-100 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Add another account
          </p>
          <Input name="name" placeholder="Account name" required />
          <Input name="institution" placeholder="Institution (optional)" />
          <Button type="submit" variant="secondary" className="w-full">
            Add Account
          </Button>
        </form>

        <Link
          href="/onboarding/first-action"
          className="tap-target mt-6 flex w-full items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
