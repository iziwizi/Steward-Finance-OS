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
  Sparkles,
} from "lucide-react";

export function SettingsInstructions() {
  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-4 space-y-1">
        <h2 className="text-base font-bold text-zinc-900">How StewardOS Works</h2>
        <p className="text-xs text-zinc-500">
          A step-by-step operational guide to purposeful personal finance management.
        </p>
      </div>

      {/* Core Allocation Concepts Explainer Card */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 sm:p-6 space-y-3.5 shadow-xs">
        <div className="flex items-center gap-2 text-brand-700">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">The 4 Allocation States</h3>
        </div>
        <p className="text-xs text-zinc-700 leading-relaxed">
          StewardOS divides every income transaction into dedicated envelopes with integer kobo precision:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="rounded-xl bg-white p-3.5 border border-brand-100 shadow-2xs space-y-1">
            <span className="font-bold text-zinc-900">1. Target Percentage (%)</span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Determines what percentage of incoming income should be assigned to a bucket (e.g. 10% Tithe, 50% Living).
            </p>
          </div>
          <div className="rounded-xl bg-white p-3.5 border border-brand-100 shadow-2xs space-y-1">
            <span className="font-bold text-zinc-900">2. Planned Amount (₦)</span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              The exact mathematical share computed from your received income.
            </p>
          </div>
          <div className="rounded-xl bg-white p-3.5 border border-brand-100 shadow-2xs space-y-1">
            <span className="font-bold text-zinc-900">3. Sent Amount (₦)</span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              How much money you have physically transferred or disbursed to this envelope.
            </p>
          </div>
          <div className="rounded-xl bg-white p-3.5 border border-brand-100 shadow-2xs space-y-1">
            <span className="font-bold text-zinc-900">4. Funding Progress (%)</span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
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
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                1
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Set Your Allocation Rules</h4>
            </div>
            <Link
              href="/settings?tab=allocations"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>Allocation Settings</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            Configure your percentage envelopes once (e.g. 10% Tithe, 50% Living Expenses, 15% Future Investments, 10% Freedom Fund). Target percentages dictate how incoming money is divided.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                2
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Add Your Accounts</h4>
            </div>
            <Link
              href="/settings?tab=accounts"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>Manage Accounts</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            Register your bank accounts, mobile wallets, and cash vaults to accurately track where your liquid balances are stored.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                3
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Record Incoming Inflows</h4>
            </div>
            <Link
              href="/income/new"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>Record Income</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            When salary, client payments, or dividends land, log the income transaction. The allocation engine immediately calculates the exact split across your active envelopes.
          </p>
        </div>

        {/* Step 4 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                4
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Review Allocations & Mark as Sent</h4>
            </div>
            <Link
              href="/allocations"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>Allocation Center</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            Visit the Allocation Center or Transactions ledger. After you physically transfer money into your dedicated accounts or giving envelopes, mark the allocation as <strong>Sent</strong>.
          </p>
        </div>

        {/* Step 5 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                5
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Record Expenses by Envelope</h4>
            </div>
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>Log Expense</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            Tag expenses to the appropriate category envelope so you stay strictly within your designated spending margins.
          </p>
        </div>

        {/* Step 6 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                6
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Create Financial Goals</h4>
            </div>
            <Link
              href="/goals/new"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>New Goal</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            Set savings targets for emergency funds, real estate, vehicles, or freedom funds with visual milestone progress bars.
          </p>
        </div>

        {/* Step 7 */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                7
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Set Up Notifications & Daily Digest</h4>
            </div>
            <Link
              href="/settings?tab=notifications"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 self-start sm:self-auto"
            >
              <span>Notification Settings</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            Enable morning daily financial digests, bill alerts, and celebration milestones so you never miss an obligation.
          </p>
        </div>
      </div>
    </div>
  );
}
