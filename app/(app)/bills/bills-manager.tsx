"use client";

import { useState, useTransition } from "react";
import { CreditCard, Plus, Trash2, Edit3, Loader2, X, Check, Calendar, AlertCircle } from "lucide-react";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createBill, updateBill, deleteBill, markBillPaid } from "@/lib/actions/misc";
import { MobilePageHeader } from "@/components/mobile-page-header";

export interface BillRecord {
  id: string;
  name: string;
  category: string | null;
  amount: number;
  frequency: string;
  due_date: string | null;
  next_due: string | null;
  status: string | null;
}

export function BillsManager({
  bills = [],
  accounts = [],
}: {
  bills: BillRecord[];
  accounts: Array<{ id: string; name: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [editingBill, setEditingBill] = useState<BillRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "due_soon" | "upcoming">("all");

  const today = new Date().toISOString().slice(0, 10);

  const totalMonthly = bills.reduce((sum, b) => {
    const cost = Number(b.amount);
    if (b.frequency === "yearly") return sum + cost / 12;
    if (b.frequency === "weekly") return sum + cost * 4.33;
    return sum + cost;
  }, 0);

  const filteredBills = bills.filter((b) => {
    if (filter === "all") return true;
    const daysRemaining = b.next_due
      ? Math.ceil((new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000)
      : null;
    if (filter === "due_soon") return daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
    if (filter === "upcoming") return daysRemaining !== null && daysRemaining > 7;
    return true;
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await createBill(formData);
      setIsAdding(false);
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateBill(formData);
      setEditingBill(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBill(id);
    });
  };

  const handleMarkPaid = (id: string) => {
    startTransition(async () => {
      await markBillPaid(id);
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader
        title="Bills"
        fallbackHref="/dashboard"
        action={
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs"
          >
            {isAdding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            <span>{isAdding ? "Close" : "New"}</span>
          </button>
        }
      />

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Recurring Bills</h1>
          <p className="text-xs text-zinc-500">
            Manage your critical utilities, rent obligations, and recurring household expenses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{isAdding ? "Cancel" : "Register New Bill"}</span>
        </button>
      </div>

      {/* Hero Summary */}
      <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 p-5 md:p-6 shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
          Estimated Monthly Outflow
        </span>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-600 tracking-tight break-words">
          {formatNaira(totalMonthly)}
        </p>
        <p className="text-xs text-zinc-500">
          Across {bills.length} active recurring bill obligation{bills.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm animate-in fade-in duration-fast">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-900">Register New Bill</h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Bill Name</label>
              <input
                name="name"
                placeholder="e.g. Electricity Token, High-Speed Internet, Estate Dues"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                <input
                  name="category"
                  placeholder="e.g. Utilities, Housing, Telecom"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Frequency</label>
                <select
                  name="frequency"
                  defaultValue="monthly"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Amount (₦)</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Due Date</label>
                <input
                  name="due_date"
                  type="date"
                  defaultValue={today}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50 transition-all"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Save Bill</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-fast">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Edit Bill: {editingBill.name}</h2>
              <button
                type="button"
                onClick={() => setEditingBill(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingBill.id} />
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Bill Name</label>
                <input
                  name="name"
                  defaultValue={editingBill.name}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingBill.category || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Frequency</label>
                  <select
                    name="frequency"
                    defaultValue={editingBill.frequency || "monthly"}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Amount (₦)</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingBill.amount}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Due Date</label>
                  <input
                    name="due_date"
                    type="date"
                    defaultValue={editingBill.due_date || editingBill.next_due || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50 transition-all"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-100 pb-3">
        {[
          { id: "all", label: "All Bills" },
          { id: "due_soon", label: "Due Soon (≤7 Days)" },
          { id: "upcoming", label: "Upcoming" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === tab.id
                ? "bg-brand-50 text-brand-700 font-bold shadow-2xs"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.map((b) => {
          const daysRemaining = b.next_due
            ? Math.ceil((new Date(b.next_due).getTime() - new Date(today).getTime()) / 86400000)
            : null;
          const isOverdue = daysRemaining !== null && daysRemaining < 0;
          const isDueSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

          return (
            <div
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-zinc-900 truncate">{b.name}</p>
                    {isOverdue ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                        Overdue
                      </span>
                    ) : isDueSoon ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                        Due Soon
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate mt-0.5">
                    <span>{b.category || "Bill"}</span>
                    <span>•</span>
                    <span className="capitalize">{b.frequency}</span>
                    <span>•</span>
                    <span>{b.next_due ? `Due: ${b.next_due}` : "Recurring"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-50">
                <p className="text-sm font-extrabold text-zinc-900 break-words">
                  {formatNaira(Number(b.amount))}
                </p>

                <button
                  type="button"
                  onClick={() => handleMarkPaid(b.id)}
                  disabled={isPending}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  Pay Now
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingBill(b)}
                    className="p-1.5 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit Bill"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${b.name}"?`)) {
                        handleDelete(b.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Bill"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredBills.length === 0 && !isAdding && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">No bills found</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs mx-auto">
                Track your recurring utilities, rent, and household obligations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register First Bill</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
