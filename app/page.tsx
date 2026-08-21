import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  PieChart,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  Receipt,
  Target,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-paper text-zinc-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">
              Features
            </a>
            <a href="#philosophy" className="hover:text-zinc-900 transition-colors">
              Philosophy
            </a>
            <a href="#decisions" className="hover:text-zinc-900 transition-colors">
              Today's Decisions
            </a>
            <a href="#faq" className="hover:text-zinc-900 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-brand-700 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Faithful · Wise · Prosperous</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:leading-[1.15]">
            The Personal Finance OS for{" "}
            <span className="text-brand-500 underline decoration-brand-200 underline-offset-8">
              Purposeful Stewardship
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-zinc-600 md:text-lg leading-relaxed">
            Move beyond retroactive expense tracking. StewardOS automates percentage-based income allocations, protects your tithe and kingdom giving, tracks obligations, and delivers daily clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg active:scale-95"
            >
              <span>Create Your Financial OS Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50"
            >
              Sign In to Your Workspace
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              <span>100% Free for Personal Use</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-brand-600" />
              <span>Bank-Grade Row Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-600" />
              <span>Installable PWA App</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Dashboard Visual */}
        <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xl md:p-6">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-bold text-zinc-700">StewardOS Financial Console</span>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                Live Overview
              </span>
            </div>

            {/* 4 Mock Metrics preview */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-brand-500 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-100">Available Cash</p>
                <p className="mt-1 text-2xl font-extrabold">₦45,000.00</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Inflow</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">₦350,000.00</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Expenses</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">₦84,600.00</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Net Surplus</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">+₦265,400.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="border-t border-zinc-200/80 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
              Why Traditional Budgeting Apps Fail
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-600">
              Most apps look backward, reminding you of what you overspent after the cash is already gone. StewardOS works forward from the exact moment money arrives.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-zinc-900">Faithful First Fruits</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Prioritize tithe and kingdom partnerships before discretionary spending touches your account. Structured honour built into every paycheck.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-zinc-900">Wise Envelope Allocation</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Automatically partition every deposit into dedicated buckets—Living Expenses, Freedom Reserve, Future Goals, and Family Support.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-zinc-900">Prosperous Freedom</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Know your true Available Cash at all times. Spend with total peace of mind, knowing all bills, goals, and obligations are fully accounted for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Decisions Feature Spotlight */}
      <section id="decisions" className="border-t border-zinc-200/80 bg-zinc-50/60 px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Daily Clarity</span>
              <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
                Today's Decisions: 60 Seconds to Financial Peace
              </h2>
              <p className="text-xs text-zinc-600 max-w-xl">
                A simple 4-question daily check-in built directly into the dashboard. Prevent drift and stay intentional every single day.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-600"
            >
              <span>Try Today's Decisions</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-brand-600">Decision 01</span>
              <h3 className="text-xs font-bold text-zinc-900">Did money come in today?</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Log income immediately so envelope algorithms auto-split funds before you spend.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-rose-600">Decision 02</span>
              <h3 className="text-xs font-bold text-zinc-900">Did money go out today?</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Record outflows with verified receipt statuses to keep your true available cash accurate.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-amber-600">Decision 03</span>
              <h3 className="text-xs font-bold text-zinc-900">Created a new goal?</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Fund capital purchases intentionally or maintain discipline on current active targets.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-blue-600">Decision 04</span>
              <h3 className="text-xs font-bold text-zinc-900">Today's Focus Action</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Set daily financial intention—whether reviewing allocations, auditing bills, or journaling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Feature Grid */}
      <section id="features" className="border-t border-zinc-200/80 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
              Engineered for Complete Financial Mastery
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-600">
              Everything you need to orchestrate personal cash flows with precision and peace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200/80 p-6 space-y-3 shadow-xs">
              <PieChart className="h-6 w-6 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Allocation Engine</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Deterministic kobo-precision splitting across your custom envelopes with zero rounding drift.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 p-6 space-y-3 shadow-xs">
              <Receipt className="h-6 w-6 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Bills & Subscriptions Radar</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Upcoming due date countdowns, renewal warnings, and leakage prevention for active recurring services.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 p-6 space-y-3 shadow-xs">
              <Target className="h-6 w-6 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Goal Milestones</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Visual progress tracking for emergency vaults, investment funds, and capital acquisitions.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 p-6 space-y-3 shadow-xs">
              <BookOpen className="h-6 w-6 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Financial Journal</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Document financial lessons, mistakes, monthly improvements, and spiritual gratitude alongside raw ledgers.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 p-6 space-y-3 shadow-xs">
              <Sparkles className="h-6 w-6 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Live Insights & Celebrations</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                100% database-driven spending pattern detection and milestone rewards as you maintain positive cash flows.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 p-6 space-y-3 shadow-xs">
              <TrendingUp className="h-6 w-6 text-brand-600" />
              <h3 className="text-sm font-bold text-zinc-900">Export & Reporting</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                One-click CSV, Excel (.xlsx), and PDF ledger exports respecting any filtered view or date range.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-zinc-200/80 bg-zinc-50/50 px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-600">
              Clear answers about StewardOS privacy, features, and platform access.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 space-y-1.5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-900">Is StewardOS free to use?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Yes. StewardOS is completely free for individual personal finance management. There are no paywalls or locked features.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 space-y-1.5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-900">How is my financial data secured?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                StewardOS is built on Supabase with PostgreSQL Row-Level Security (RLS). Every single query is cryptographically locked to your authenticated user account.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 space-y-1.5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-900">Can I install StewardOS on my phone?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Yes! StewardOS is a Progressive Web App (PWA). You can tap "Add to Home Screen" in Safari on iOS or Chrome on Android for an instant native app experience.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 space-y-1.5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-900">How does the envelope allocation engine work?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                You configure your percentage envelopes once (e.g. 10% Tithe, 50% Living, 15% Future, 10% Freedom Fund). When income arrives, StewardOS automatically splits the funds with integer kobo precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="border-t border-zinc-200/80 bg-brand-500 px-6 py-16 text-white text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-2xl font-extrabold sm:text-4xl">
            Step into Clarity, Peace, and True Prosperity
          </h2>
          <p className="text-sm text-brand-100 leading-relaxed">
            Begin your journey with the personal finance operating system designed for faithful stewards.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-lg transition-all hover:bg-brand-50 active:scale-95"
            >
              <span>Get Started Now — It's Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white px-6 py-12 text-zinc-500 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo size="sm" />
            <span className="text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
              Faithful · Wise · Prosperous
            </span>
          </div>

          <div className="flex items-center gap-6 text-zinc-600 font-medium">
            <Link href="/login" className="hover:text-zinc-900">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-zinc-900">
              Register
            </Link>
            <a href="https://mujteknify.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
              MUJTEKNIFY
            </a>
          </div>

          <div className="text-center md:text-right text-[11px] text-zinc-400">
            <span>A Product of MUJTEKNIFY · © 2026 MUJTEKNIFY. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
