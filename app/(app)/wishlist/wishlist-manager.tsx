"use client";

import { useState, useTransition } from "react";
import { Heart, Plus, Trash2, Edit3, Loader2, X, Check } from "lucide-react";
import { formatNaira } from "@/lib/finance/allocation-engine";
import { createWishlistItem, updateWishlistItem, deleteWishlistItem } from "@/lib/actions/misc";
import { MobilePageHeader } from "@/components/mobile-page-header";

export interface WishlistItemRecord {
  id: string;
  item_name: string;
  category: string | null;
  estimated_cost: number | null;
  priority: string | null;
  status: string | null;
}

export function WishlistManager({
  items = [],
}: {
  items: WishlistItemRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItemRecord | null>(null);

  const totalCost = items.reduce((s, i) => s + Number(i.estimated_cost ?? 0), 0);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await createWishlistItem(formData);
      setIsAdding(false);
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateWishlistItem(formData);
      setEditingItem(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteWishlistItem(id);
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* App-like Mobile Back Header */}
      <MobilePageHeader
        title="Wishlist"
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
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Wish List</h1>
          <p className="text-xs text-zinc-500">
            Curate and prioritize upcoming acquisitions before allocating discretionary capital.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
        >
          {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{isAdding ? "Cancel" : "Add Wishlist Item"}</span>
        </button>
      </div>

      {/* Hero Summary */}
      <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 md:p-6 shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
          Total Estimated Wishlist Value
        </span>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-rose-600 tracking-tight break-words">
          {formatNaira(totalCost)}
        </p>
        <p className="text-xs text-zinc-500">
          Across {items.length} planned acquisition{items.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm animate-in fade-in duration-fast">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-900">Add Wishlist Item</h2>
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
              <label className="block text-xs font-bold text-zinc-700 mb-1">Item Name</label>
              <input
                name="item_name"
                placeholder="e.g. Ergonomic Office Chair, Standing Desk"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                <input
                  name="category"
                  placeholder="e.g. Work, Tech, Home"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Estimated Cost (₦)</label>
                <input
                  name="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Priority</label>
              <select
                name="priority"
                defaultValue="Medium"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
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
                <span>Save to Wishlist</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-fast">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-fast">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">Edit Wishlist Item</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingItem.id} />
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Item Name</label>
                <input
                  name="item_name"
                  defaultValue={editingItem.item_name}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingItem.category || ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Estimated Cost (₦)</label>
                  <input
                    name="estimated_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingItem.estimated_cost ?? ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Priority</label>
                <select
                  name="priority"
                  defaultValue={editingItem.priority || "Medium"}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

      {/* Wishlist Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Heart className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 truncate">{item.item_name}</p>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span>{item.category || "General"}</span>
                  <span>•</span>
                  <span
                    className={`font-semibold ${
                      item.priority?.toLowerCase() === "high"
                        ? "text-rose-600"
                        : item.priority?.toLowerCase() === "low"
                        ? "text-zinc-500"
                        : "text-amber-600"
                    }`}
                  >
                    {item.priority || "Medium"} Priority
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-50">
              <p className="text-sm font-extrabold text-zinc-900 break-words">
                {formatNaira(Number(item.estimated_cost ?? 0))}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="p-1.5 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title="Edit Item"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${item.item_name}" from wishlist?`)) {
                      handleDelete(item.id);
                    }
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && !isAdding && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800">Your wishlist is empty</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs mx-auto">
                Add gadgets, travel goals, or lifestyle upgrades you want to intentionally plan for.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Wishlist Item</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
