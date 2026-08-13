import { AlertTriangle } from "lucide-react";
import { DeleteAccountForm } from "./delete-account-form";

const ERASED_ITEMS = [
  "Transactions & ledger history",
  "All financial goals & records",
  "Tithe & giving tracks",
  "All recurring bills & subscriptions",
  "Steward journal entries",
];

export default function DeleteAccountPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">Delete Account</h1>

      <div className="space-y-4 rounded-lg border border-red-700/40 bg-red-700/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-700">
            <AlertTriangle className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <p className="text-sm font-bold text-red-700">This action is permanent</p>
        </div>
        <p className="text-[13px] leading-5 text-red-700">
          Deleting your account will permanently remove all your financial data, transaction
          history, allocations, goals, and settings. This cannot be undone.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          What will be erased
        </p>
        <div className="space-y-2.5 rounded-lg border border-zinc-200 bg-white p-4">
          {ERASED_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2 text-[13px] text-zinc-900">
              <span className="text-red-700">✕</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <DeleteAccountForm />
    </div>
  );
}
