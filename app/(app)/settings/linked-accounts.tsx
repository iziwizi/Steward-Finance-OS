"use client";

import { useState, useTransition } from "react";
import { createAccount, updateAccount, deleteAccountAction } from "@/lib/actions/accounts";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Trash2, Edit2, Check, AlertCircle, Loader2, Building } from "lucide-react";

export function LinkedAccountsManager({ accounts }: { accounts: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createAccount(formData);
      if (res.success) {
        form.reset();
        setFeedback({ type: "success", text: "Account linked successfully." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to link account." });
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    formData.append("id", id);

    startTransition(async () => {
      const res = await updateAccount(formData);
      if (res.success) {
        setEditingId(null);
        setFeedback({ type: "success", text: "Account updated successfully." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update account." });
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    setFeedback(null);
    const formData = new FormData();
    formData.append("id", id);

    startTransition(async () => {
      const res = await deleteAccountAction(formData);
      if (res.success) {
        setFeedback({ type: "success", text: "Account removed." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to remove account." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Linked Accounts</h2>
          <p className="text-xs text-zinc-400">
            Manage funding accounts tied to your StewardOS envelope allocations.
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          {accounts.length} Linked
        </span>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Account List */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400">
            <CreditCard className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
            <p className="font-semibold text-zinc-700">No linked bank accounts yet</p>
            <p className="mt-1">Add your primary bank, fintech wallet, or savings account below.</p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
            >
              {editingId === acc.id ? (
                <form
                  onSubmit={(e) => handleUpdate(e, acc.id)}
                  className="flex flex-1 flex-wrap items-center gap-2"
                >
                  <input
                    type="text"
                    name="name"
                    defaultValue={acc.name}
                    required
                    placeholder="Account Name"
                    className="tap-target min-w-[140px] flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="institution"
                    defaultValue={acc.institution || ""}
                    placeholder="Bank / Institution (e.g. GTBank)"
                    className="tap-target min-w-[140px] flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <Button type="submit" variant="primary" disabled={isPending} className="px-3 py-1.5 text-xs">
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{acc.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {acc.institution ? acc.institution : "Personal Funding Account"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(acc.id)}
                      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      title="Edit account"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(acc.id, acc.name)}
                      disabled={isPending}
                      className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      title="Delete account"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Account Form */}
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-4">
        <h3 className="text-xs font-bold text-zinc-900 mb-2">Link New Account</h3>
        <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="name"
            placeholder="Account Name (e.g. GTBank Salary, PiggyVest)"
            required
            className="tap-target min-w-[160px] flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
          <input
            type="text"
            name="institution"
            placeholder="Institution (e.g. GTBank, Kuda)"
            className="tap-target min-w-[140px] flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
          />
          <Button type="submit" variant="primary" disabled={isPending} className="px-4 py-1.5 text-xs">
            {isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="mr-1 h-3.5 w-3.5" />
            )}
            Link Account
          </Button>
        </form>
      </div>
    </div>
  );
}
