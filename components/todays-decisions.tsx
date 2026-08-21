"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  Sparkles,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  saveDailyDecision,
  quickRecordIncome,
  quickRecordExpense,
  quickCreateGoal,
  type DailyDecisionRecord,
} from "@/lib/actions/daily-decisions";
import { IncomeSuccessDialog } from "@/components/income-success-dialog";

interface BucketOption {
  id: string;
  name: string;
  targetPercent?: number;
}

interface AccountOption {
  id: string;
  name: string;
}

interface TodaysDecisionsProps {
  existingDecision: DailyDecisionRecord | null;
  hasIncomeToday: boolean;
  hasExpensesToday: boolean;
  accounts: AccountOption[];
  buckets: BucketOption[];
}

export function TodaysDecisions({
  existingDecision,
  hasIncomeToday,
  hasExpensesToday,
  accounts,
  buckets,
}: TodaysDecisionsProps) {
  const isInitiallyCompleted = Boolean(existingDecision?.completed_at);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSavingCheckIn, startCheckInTransition] = useTransition();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Core 3 Decision states
  const [hadIncome, setHadIncome] = useState(
    existingDecision ? existingDecision.had_income : hasIncomeToday
  );
  const [hadExpenses, setHadExpenses] = useState(
    existingDecision ? existingDecision.had_expenses : hasExpensesToday
  );
  const [createdGoal, setCreatedGoal] = useState(
    existingDecision ? existingDecision.created_goal : false
  );
  const [primaryAction, setPrimaryAction] = useState(
    existingDecision?.primary_action || "log_expense"
  );
  const [isSaved, setIsSaved] = useState(isInitiallyCompleted);

  // Active quick action panel: null | "income" | "expense" | "goal"
  const [activePanel, setActivePanel] = useState<"income" | "expense" | "goal" | null>(null);
  const [showIncomeSuccess, setShowIncomeSuccess] = useState(false);
  const [lastRecordedIncome, setLastRecordedIncome] = useState(0);

  // Canonical Form States
  // 1. Income Form
  const [incomeDate, setIncomeDate] = useState(todayStr);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("");
  const [incomeAccount, setIncomeAccount] = useState(accounts[0]?.id || "");
  const [isSavingIncome, startIncomeTransition] = useTransition();
  const [incomeSavedStatus, setIncomeSavedStatus] = useState(hasIncomeToday ? "recorded" : "");

  // 2. Expense Form
  const [expenseDate, setExpenseDate] = useState(todayStr);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseReason, setExpenseReason] = useState("");
  const [expenseVendor, setExpenseVendor] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseBucket, setExpenseBucket] = useState(buckets[0]?.id || "");
  const [expenseAccount, setExpenseAccount] = useState(accounts[0]?.id || "");
  const [expenseReceiptStatus, setExpenseReceiptStatus] = useState("paid");
  const [isSavingExpense, startExpenseTransition] = useTransition();
  const [expenseSavedStatus, setExpenseSavedStatus] = useState(hasExpensesToday ? "recorded" : "");

  // 3. Goal Form
  const [goalName, setGoalName] = useState("");
  const [goalCategory, setGoalCategory] = useState("Savings");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalCurrentAmount, setGoalCurrentAmount] = useState("0");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [isSavingGoal, startGoalTransition] = useTransition();
  const [goalSavedStatus, setGoalSavedStatus] = useState("");

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(incomeAmount);
    if (!incomeAmount || num <= 0) return;

    startIncomeTransition(async () => {
      const res = await quickRecordIncome({
        amount: num,
        source: incomeSource || "Income Deposit",
        description: incomeDesc || incomeSource || "Income Deposit",
        account_id: incomeAccount || null,
        txn_date: incomeDate || todayStr,
      });

      if (res.success) {
        setLastRecordedIncome(num);
        setIncomeSavedStatus("recorded");
        setHadIncome(true);
        setActivePanel(null);
        setIncomeAmount("");
        setIncomeSource("");
        setIncomeDesc("");
        setShowIncomeSuccess(true);
      }
    });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(expenseAmount);
    if (!expenseAmount || num <= 0) return;

    startExpenseTransition(async () => {
      const res = await quickRecordExpense({
        amount: num,
        reason: expenseReason || "Daily Expense",
        vendor: expenseVendor || "",
        description: expenseDesc || expenseReason || "Daily Expense",
        bucket_id: expenseBucket || null,
        payment_account_id: expenseAccount || null,
        txn_date: expenseDate || todayStr,
        receipt_status: expenseReceiptStatus || "paid",
      });

      if (res.success) {
        setExpenseSavedStatus("recorded");
        setHadExpenses(true);
        setActivePanel(null);
        setExpenseAmount("");
        setExpenseReason("");
        setExpenseVendor("");
        setExpenseDesc("");
      }
    });
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(goalTargetAmount);
    if (!goalName || !goalTargetAmount || targetNum <= 0) return;

    startGoalTransition(async () => {
      const res = await quickCreateGoal({
        name: goalName.trim(),
        category: goalCategory || "Savings",
        target_amount: targetNum,
        current_amount: Number(goalCurrentAmount || 0),
        target_date: goalTargetDate || null,
      });

      if (res.success) {
        setGoalSavedStatus("created");
        setCreatedGoal(true);
        setActivePanel(null);
        setGoalName("");
        setGoalTargetAmount("");
        setGoalCurrentAmount("0");
        setGoalTargetDate("");
      }
    });
  };

  const handleSaveCheckIn = () => {
    startCheckInTransition(async () => {
      const res = await saveDailyDecision({
        had_income: hadIncome,
        had_expenses: hadExpenses,
        created_goal: createdGoal,
        primary_action: primaryAction,
      });
      if (res.success) {
        setIsSaved(true);
        setIsExpanded(false);
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-zinc-50/70 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Today&apos;s Decisions</h3>
            <p className="text-[10px] text-zinc-400">Daily intentional financial stewardship check-in</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && !isExpanded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? "Collapse" : "Open Check-in"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Interactive Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-fast">
          {/* 3 Core Daily Stewardship Questions Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* DECISION 1: Money In */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 1</p>
                <p className="text-xs font-bold text-zinc-900 mt-1">Did money come in today?</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHadIncome(true);
                      setActivePanel("income");
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      hadIncome ? "bg-emerald-600 text-white shadow-xs" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHadIncome(false);
                      if (activePanel === "income") setActivePanel(null);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      !hadIncome ? "bg-zinc-700 text-white shadow-xs" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                    }`}
                  >
                    No
                  </button>
                </div>

                {incomeSavedStatus === "recorded" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <Check className="h-3 w-3" /> Recorded
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setHadIncome(true);
                      setActivePanel(activePanel === "income" ? null : "income");
                    }}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    + Log Income
                  </button>
                )}
              </div>
            </div>

            {/* DECISION 2: Money Out */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 2</p>
                <p className="text-xs font-bold text-zinc-900 mt-1">Did money go out today?</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHadExpenses(true);
                      setActivePanel("expense");
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      hadExpenses ? "bg-rose-600 text-white shadow-xs" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHadExpenses(false);
                      if (activePanel === "expense") setActivePanel(null);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      !hadExpenses ? "bg-zinc-700 text-white shadow-xs" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                    }`}
                  >
                    No
                  </button>
                </div>

                {expenseSavedStatus === "recorded" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <Check className="h-3 w-3" /> Recorded
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setHadExpenses(true);
                      setActivePanel(activePanel === "expense" ? null : "expense");
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700"
                  >
                    + Log Expense
                  </button>
                )}
              </div>
            </div>

            {/* DECISION 3: New Goal */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 3</p>
                <p className="text-xs font-bold text-zinc-900 mt-1">Created a new goal?</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedGoal(true);
                      setActivePanel("goal");
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      createdGoal ? "bg-brand-600 text-white shadow-xs" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedGoal(false);
                      if (activePanel === "goal") setActivePanel(null);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      !createdGoal ? "bg-zinc-700 text-white shadow-xs" : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                    }`}
                  >
                    No
                  </button>
                </div>

                {goalSavedStatus === "created" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <Check className="h-3 w-3" /> Created
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedGoal(true);
                      setActivePanel(activePanel === "goal" ? null : "goal");
                    }}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    + New Goal
                  </button>
                )}
              </div>
            </div>

            {/* DECISION 4: Focus Action */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 4</p>
                <p className="text-xs font-bold text-zinc-900 mt-1">Today&apos;s Focus Action</p>
              </div>
              <div>
                <select
                  value={primaryAction}
                  onChange={(e) => setPrimaryAction(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-1 px-2 text-[11px] font-semibold text-zinc-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="log_expense">Log Daily Expenses</option>
                  <option value="allocate_income">Allocate Inflows</option>
                  <option value="review_bills">Review Upcoming Bills</option>
                  <option value="fund_goal">Fund Financial Goal</option>
                  <option value="tithe_check">Confirm Kingdom Giving</option>
                </select>
              </div>
            </div>
          </div>

          {/* DESKTOP INLINE QUICK ACTION PANELS */}
          <div className="hidden sm:block">
            {/* 1. Quick Income Panel */}
            {activePanel === "income" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 animate-in fade-in zoom-in-95 duration-fast">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-zinc-900">Log Income (Canonical)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="text-zinc-400 hover:text-zinc-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <form onSubmit={handleIncomeSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Date</label>
                    <input
                      type="date"
                      required
                      value={incomeDate}
                      onChange={(e) => setIncomeDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Source</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salary, Client payment"
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Receiving Account</label>
                    <select
                      value={incomeAccount}
                      onChange={(e) => setIncomeAccount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Amount (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="e.g. 50000"
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. August retainer fee"
                      value={incomeDesc}
                      onChange={(e) => setIncomeDesc(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingIncome}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                    >
                      {isSavingIncome ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Save Income
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Quick Expense Panel */}
            {activePanel === "expense" && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 animate-in fade-in zoom-in-95 duration-fast">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-rose-600" />
                    <span className="text-xs font-bold text-zinc-900">Log Expense (Canonical)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="text-zinc-400 hover:text-zinc-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Date</label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Category Envelope</label>
                    <select
                      value={expenseBucket}
                      onChange={(e) => setExpenseBucket(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-rose-500 focus:outline-none"
                    >
                      {buckets.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Reason / Category</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Groceries, Data, Fuel"
                      value={expenseReason}
                      onChange={(e) => setExpenseReason(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Vendor</label>
                    <input
                      type="text"
                      placeholder="e.g. Spar, MTN, Uber"
                      value={expenseVendor}
                      onChange={(e) => setExpenseVendor(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Payment Account</label>
                    <select
                      value={expenseAccount}
                      onChange={(e) => setExpenseAccount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-rose-500 focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Amount (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="e.g. 3500"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Receipt Status</label>
                    <select
                      value={expenseReceiptStatus}
                      onChange={(e) => setExpenseReceiptStatus(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="na">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Office lunch"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingExpense}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                    >
                      {isSavingExpense ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Save Expense
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. Quick Goal Panel */}
            {activePanel === "goal" && (
              <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 animate-in fade-in zoom-in-95 duration-fast">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-bold text-zinc-900">Create Goal (Canonical)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    className="text-zinc-400 hover:text-zinc-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <form onSubmit={handleGoalSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Goal Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rent Fund, Emergency 2027"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Category</label>
                    <select
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Education">Education</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Target (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="e.g. 1500000"
                      value={goalTargetAmount}
                      onChange={(e) => setGoalTargetAmount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Initial Saved (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={goalCurrentAmount}
                      onChange={(e) => setGoalCurrentAmount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Target Date (Optional)</label>
                    <input
                      type="date"
                      value={goalTargetDate}
                      onChange={(e) => setGoalTargetDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-5 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePanel(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingGoal}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 active:scale-95 disabled:opacity-50"
                    >
                      {isSavingGoal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Create Goal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* MOBILE MODAL QUICK ACTION DIALOG */}
          {activePanel && (
            <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-fast">
              <div className="w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 space-y-4 shadow-2xl border border-zinc-200">
                {activePanel === "income" && (
                  <>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-zinc-900">Log Income</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePanel(null)}
                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleIncomeSubmit} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Date</label>
                        <input
                          type="date"
                          required
                          value={incomeDate}
                          onChange={(e) => setIncomeDate(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Source</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Salary, Client payment"
                          value={incomeSource}
                          onChange={(e) => setIncomeSource(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Receiving Account</label>
                        <select
                          value={incomeAccount}
                          onChange={(e) => setIncomeAccount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Amount (₦)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="e.g. 50000"
                          value={incomeAmount}
                          onChange={(e) => setIncomeAmount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-bold text-zinc-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. August retainer"
                          value={incomeDesc}
                          onChange={(e) => setIncomeDesc(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActivePanel(null)}
                          className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingIncome}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {isSavingIncome ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Save Income
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {activePanel === "expense" && (
                  <>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-rose-600" />
                        <h3 className="text-sm font-bold text-zinc-900">Log Expense</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePanel(null)}
                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleExpenseSubmit} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Date</label>
                        <input
                          type="date"
                          required
                          value={expenseDate}
                          onChange={(e) => setExpenseDate(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Category Envelope</label>
                        <select
                          value={expenseBucket}
                          onChange={(e) => setExpenseBucket(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-800 focus:bg-white focus:border-rose-500 focus:outline-none"
                        >
                          {buckets.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Reason / Category</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Groceries, Data, Fuel"
                          value={expenseReason}
                          onChange={(e) => setExpenseReason(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Vendor</label>
                        <input
                          type="text"
                          placeholder="e.g. Spar, MTN"
                          value={expenseVendor}
                          onChange={(e) => setExpenseVendor(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Payment Account</label>
                        <select
                          value={expenseAccount}
                          onChange={(e) => setExpenseAccount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-800 focus:bg-white focus:border-rose-500 focus:outline-none"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Amount (₦)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="e.g. 3500"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-bold text-zinc-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Receipt Status</label>
                        <select
                          value={expenseReceiptStatus}
                          onChange={(e) => setExpenseReceiptStatus(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-800 focus:bg-white focus:border-rose-500 focus:outline-none"
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                          <option value="na">N/A</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActivePanel(null)}
                          className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingExpense}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50"
                        >
                          {isSavingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Save Expense
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {activePanel === "goal" && (
                  <>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-brand-600" />
                        <h3 className="text-sm font-bold text-zinc-900">Create Goal</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePanel(null)}
                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleGoalSubmit} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Goal Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Emergency Fund, Laptop"
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Category</label>
                        <select
                          value={goalCategory}
                          onChange={(e) => setGoalCategory(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                        >
                          <option value="Savings">Savings</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Vehicle">Vehicle</option>
                          <option value="Education">Education</option>
                          <option value="Investment">Investment</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Target Amount (₦)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          required
                          placeholder="e.g. 500000"
                          value={goalTargetAmount}
                          onChange={(e) => setGoalTargetAmount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-bold text-zinc-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Initial Saved Amount (₦)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          value={goalCurrentAmount}
                          onChange={(e) => setGoalCurrentAmount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-500">Target Date (Optional)</label>
                        <input
                          type="date"
                          value={goalTargetDate}
                          onChange={(e) => setGoalTargetDate(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActivePanel(null)}
                          className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingGoal}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-600 disabled:opacity-50"
                        >
                          {isSavingGoal ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Create Goal
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              {isSaved ? "Completed for today" : "Complete check-in to align your daily financial choices"}
            </p>
            <button
              type="button"
              onClick={handleSaveCheckIn}
              disabled={isSavingCheckIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSavingCheckIn ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>{isSaved ? "Update Today's Check-in" : "✓ Save Today's Check-in"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Post-Income Next-Step Success Modal */}
      <IncomeSuccessDialog
        amount={lastRecordedIncome}
        isOpen={showIncomeSuccess}
        onClose={() => setShowIncomeSuccess(false)}
        onRecordExpense={() => {
          setIsExpanded(true);
          setActivePanel("expense");
        }}
      />
    </div>
  );
}
