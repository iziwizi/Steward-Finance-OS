import Link from "next/link";
import {
  Sliders,
  CreditCard,
  ArrowDownLeft,
  PieChart,
  ArrowUpRight,
  Target,
  Bell,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function SettingsInstructions() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-4 space-y-1">
        <h2 className="text-base font-bold text-zinc-900">How StewardOS Works</h2>
        <p className="text-xs text-zinc-500">
          A step-by-step operational guide to purposeful personal finance management.
        </p>
      </div>

      {/* Core Allocation Concepts Explainer Card */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-brand-700">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">The 4 Allocation States</h3>
        </div>
        <p className="text-xs text-zinc-700 leading-relaxed">
          StewardOS divides every income transaction into dedicated envelopes with integer precision:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-2xs">
            <span className="font-bold text-zinc-900">1. Target Percentage (%)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              What percentage of incoming income should be assigned to this specific bucket (e.g. 10% Tithe, 50% Living).
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-2xs">
            <span className="font-bold text-zinc-900">2. Planned Amount (₦)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              The exact mathematical share computed from your received income.
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-2xs">
            <span className="font-bold text-zinc-900">3. Sent Amount (₦)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              How much money you have physically transferred or disbursed to this envelope.
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-2xs">
            <span className="font-bold text-zinc-900">4. Funding Progress (%)</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              The ratio of <code className="text-brand-600 font-bold">Sent / Planned</code>. Mark as Sent when you transfer funds.
            </p>
          </div>
        </div>
      </div>

      {/* 7 Operational Steps */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          7-Step Financial Workflow
        </h3>

        {/* Step 1 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                1
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Set Your Allocation Rules</h4>
            </div>
            <Link
              href="/settings?tab=allocations"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Allocation Settings</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            Configure your percentage envelopes once (e.g. 10% Tithe, 50% Living Expenses, 15% Future Investments, 10% Freedom Fund). Every time you receive income, StewardOS splits it automatically.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                2
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Add Your Accounts</h4>
            </div>
            <Link
              href="/settings?tab=accounts"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Manage Accounts</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            Register your bank accounts, mobile wallets, and cash vaults to accurately track where your balances are held.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                3
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Record Incoming Inflows</h4>
            </div>
            <Link
              href="/income/new"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Record Income</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            When salary, client payments, or dividends land, log the income. The allocation engine calculates the exact split with integer kobo precision.
          </p>
        </div>

        {/* Step 4 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                4
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Review Allocations & Mark as Sent</h4>
            </div>
            <Link
              href="/allocations"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Allocation Center</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            Visit the Allocation Center or Transactions ledger. After transferring money into your physical vault or account, toggle the status to <strong>Sent</strong>.
          </p>
        </div>

        {/* Step 5 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                5
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Record Expenses by Envelope</h4>
            </div>
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Log Expense</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            Tag expenses to the appropriate category envelope so you stay strictly within your designated spending margins.
          </p>
        </div>

        {/* Step 6 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                6
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Create Financial Goals</h4>
            </div>
            <Link
              href="/goals/new"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>New Goal</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            Set savings targets for emergency funds, real estate, vehicles, or freedom funds with visual milestone progress.
          </p>
        </div>

        {/* Step 7 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                7
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Set Up Notifications & Daily Digest</h4>
            </div>
            <Link
              href="/settings?tab=notifications"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Notification Settings</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pl-9.5">
            Enable morning daily financial digests, bill alerts, and celebration milestones so you never miss an obligation.
          </p>
        </div>
      </div>
    </div>
  );
}
