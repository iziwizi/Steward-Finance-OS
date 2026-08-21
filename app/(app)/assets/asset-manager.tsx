"use client";

import { useState, useTransition } from "react";
import { Gem, Plus, Trash2, Edit3, Loader2, X, Check, Landmark, MapPin } from "lucide-react";
import { formatNaira, formatCompactNaira } from "@/lib/finance/allocation-engine";
import { createAsset, updateAsset, deleteAsset } from "@/lib/actions/misc";
import { MobilePageHeader } from "@/components/mobile-page-header";

export interface AssetRecord {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  current_value: number | null;
  quantity: number | null;
}

export function AssetManager({
  assets = [],
}: {
  assets: AssetRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalValue = assets.reduce(
    (s, a) => s + Number(a.current_value ?? 0) * Number(a.quantity ?? 1),
    0
  );

  const totalCost = assets.reduce(
    (s, a) => s + Number(a.purchase_price ?? 0) * Number(a.quantity ?? 1),
    0
  );

  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await createAsset(formData);
      setIsAdding(false);
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateAsset(formData);
      setEditingAsset(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAsset(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader
        title="Assets"
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
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Asset Portfolio</h1>
          <p className="text-xs text-zinc-500">
            Track and manage your tangible, real estate, vehicle, capital, and liquid wealth holdings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{isAdding ? "Cancel" : "Add New Asset"}</span>
        </button>
      </div>

      {/* Hero Summary Card — Responsive & Non-overflowing */}
      <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 p-5 md:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
            Total Asset Valuation
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              totalGain >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {totalGain >= 0 ? "+" : ""}{totalGainPct.toFixed(1)}% Return
          </span>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-600 tracking-tight break-words">
            {formatNaira(totalValue)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Across {assets.length} registered asset item{assets.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Add Asset Form Panel */}
      {isAdding && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm animate-in fade-in duration-fast">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-900">Record New Asset</h2>
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
              <label className="block text-xs font-bold text-zinc-700 mb-1">Asset Name</label>
              <input
                name="name"
                placeholder="e.g. Lekki Phase 1 Land, MacBook Pro M3, 2022 Lexus RX"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                <input
                  name="category"
                  placeholder="e.g. Real Estate, Vehicle, Technology, Metals"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Location / Custodian</label>
                <input
                  name="location"
                  placeholder="e.g. Lagos, Vault, Home Office"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Purchase Price (₦)</label>
                <input
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Current Valuation (₦)</label>
                <input
                  name="current_value"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
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
                <span>Save Asset</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-fast">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Edit Asset: {editingAsset.name}</h2>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingAsset.id} />
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Asset Name</label>
                <input
                  name="name"
                  defaultValue={editingAsset.name}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingAsset.category || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Location / Custodian</label>
                  <input
                    name="location"
                    defaultValue={editingAsset.location || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Purchase Price (₦)</label>
                  <input
                    name="purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingAsset.purchase_price ?? ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Current Valuation (₦)</label>
                  <input
                    name="current_value"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingAsset.current_value ?? ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
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

      {/* Asset Items List */}
      <div className="space-y-3">
        {assets.map((a) => {
          const val = Number(a.current_value ?? 0);
          const cost = Number(a.purchase_price ?? 0);
          const gain = val - cost;
          const gainPct = cost > 0 ? (gain / cost) * 100 : 0;

          return (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{a.name}</p>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                    <span>{a.category || "Asset"}</span>
                    {a.location ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" /> {a.location}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-50">
                <div className="text-left sm:text-right">
                  <p className="text-sm font-extrabold text-zinc-900 break-words">{formatNaira(val)}</p>
                  <p
                    className={`text-[10px] font-bold ${
                      gain >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {gain >= 0 ? "+" : ""}{formatNaira(gain)} ({gainPct.toFixed(1)}%)
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingAsset(a)}
                    className="p-1.5 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit Asset"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete asset "${a.name}"?`)) {
                        handleDelete(a.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {assets.length === 0 && !isAdding && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">No assets tracked yet</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs mx-auto">
                Add your real estate properties, vehicles, stocks, or high-value physical capital to track your overall net worth.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record First Asset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
