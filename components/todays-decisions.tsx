"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CalendarCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
} from "lucide-react";
import { saveDailyDecision, type DailyDecisionRecord } from "@/lib/actions/daily-decisions";
import { Button } from "./ui/button";

export function TodaysDecisions({
  existingDecision,
  hasIncomeToday,
  hasExpensesToday,
}: {
  existingDecision: DailyDecisionRecord | null;
  hasIncomeToday: boolean;
  hasExpensesToday: boolean;
}) {
  const isInitiallyCompleted = !!existingDecision?.completed_at;
  const [isExpanded, setIsExpanded] = useState(!isInitiallyCompleted);
  const [isPending, startTransition] = useTransition();

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

  const handleSave = () => {
    startTransition(async () => {
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
            <h3 className="text-xs font-bold text-zinc-900">Today's Decisions</h3>
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
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
          >
            {isExpanded ? (
              <>
                <span>Collapse</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span>{isSaved ? "Review / Edit" : "Start Check-in"}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-in fade-in duration-fast">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Question 1: Money in */}
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 1</p>
                <p className="text-xs font-semibold text-zinc-900 mt-1">Did money come in today?</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHadIncome(true)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                      hadIncome ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHadIncome(false)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                      !hadIncome ? "bg-zinc-700 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    No
                  </button>
                </div>
                {hadIncome && (
                  <Link
                    href="/income/new"
                    className="text-[10px] font-bold text-brand-600 hover:underline"
                  >
                    + Log Income
                  </Link>
                )}
              </div>
            </div>

            {/* Question 2: Money out */}
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 2</p>
                <p className="text-xs font-semibold text-zinc-900 mt-1">Did money go out today?</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHadExpenses(true)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                      hadExpenses ? "bg-rose-500 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHadExpenses(false)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                      !hadExpenses ? "bg-zinc-700 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    No
                  </button>
                </div>
                {hadExpenses && (
                  <Link
                    href="/expenses/new"
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    + Log Expense
                  </Link>
                )}
              </div>
            </div>

            {/* Question 3: Goal creation */}
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 3</p>
                <p className="text-xs font-semibold text-zinc-900 mt-1">Created a new goal?</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCreatedGoal(true)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                      createdGoal ? "bg-brand-500 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatedGoal(false)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                      !createdGoal ? "bg-zinc-700 text-white" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    No
                  </button>
                </div>
                {createdGoal ? (
                  <Link href="/goals/new" className="text-[10px] font-bold text-brand-600 hover:underline">
                    + New Goal
                  </Link>
                ) : (
                  <span className="text-[9px] text-zinc-400">Stay focused</span>
                )}
              </div>
            </div>

            {/* Question 4: Primary intent */}
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Decision 4</p>
                <p className="text-xs font-semibold text-zinc-900 mt-1">Today's Focus Action</p>
              </div>
              <div className="mt-2">
                <select
                  value={primaryAction}
                  onChange={(e) => setPrimaryAction(e.target.value)}
                  className="w-full rounded border border-zinc-200 bg-white py-1 px-1.5 text-[11px] text-zinc-700 focus:outline-none"
                >
                  <option value="log_expense">Log Daily Expenses</option>
                  <option value="allocations">Manage Allocations</option>
                  <option value="goals">Contribute to Goals</option>
                  <option value="journal">Write Financial Journal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              onClick={handleSave}
              variant="primary"
              disabled={isPending}
              className="h-8 px-4 text-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Save Today's Check-in
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
