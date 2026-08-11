import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function AddPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add</h1>
      <Link
        href="/income/new"
        className="tap-target flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4"
      >
        <ArrowDownCircle className="h-8 w-8 text-accent" />
        <div>
          <p className="font-medium">Record Income</p>
          <p className="text-sm text-ink/50">Allocations calculate automatically</p>
        </div>
      </Link>
      <Link
        href="/expenses/new"
        className="tap-target flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4"
      >
        <ArrowUpCircle className="h-8 w-8 text-danger" />
        <div>
          <p className="font-medium">Log Expense</p>
          <p className="text-sm text-ink/50">Fast entry — a few taps</p>
        </div>
      </Link>
    </div>
  );
}
