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
  Heart,
  TrendingUp,
  Layers,
  Smartphone,
  Laptop,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { LandingFaq } from "@/components/landing-faq";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-zinc-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#positioning" className="hover:text-zinc-900 transition-colors">
              Philosophy
            </a>
            <a href="#decisions" className="hover:text-zinc-900 transition-colors">
              Today&apos;s Decisions
            </a>
            <a href="#features" className="hover:text-zinc-900 transition-colors">
              Core System
            </a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">
              How It Works
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
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/80 px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase text-brand-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>FAITHFUL · WISE · PROSPEROUS</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:leading-[1.12]">
            The Personal Finance OS for{" "}
            <span className="text-brand-500 underline decoration-brand-200 decoration-wavy underline-offset-8">
              Purposeful Stewardship
            </span>
          </h1>

          {/* Supporting copy */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-zinc-600 md:text-lg leading-relaxed">
            StewardOS helps you intentionally allocate income, track commitments, manage goals, understand cash flow, and build disciplined financial habits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50"
            >
              Sign In
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              <span>100% Free Personal OS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-brand-600" />
              <span>PostgreSQL Row-Level Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-600" />
              <span>Installable PWA App</span>
            </div>
          </div>
        </div>

        {/* Real Product Screenshot in Browser Frame */}
        <div className="relative mx-auto mt-14 max-w-5xl rounded-2xl border border-zinc-300/80 bg-zinc-100 p-2 sm:p-3 shadow-2xl">
          <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-xs">
            {/* Browser Header Bar */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 ml-2">app.stewardos.com/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  Live OS
                </span>
              </div>
            </div>

            {/* Product Screenshot Image */}
            <div className="relative aspect-[16/10] w-full bg-zinc-50">
              <Image
                src="/brand/desktop-preview.png"
                alt="StewardOS Dashboard Interface"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 1. POSITIONING SECTION */}
      <section id="positioning" className="border-t border-zinc-200/80 bg-zinc-50/60 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-4xl leading-tight">
              Traditional Budgeting Looks Back. <br />
              <span className="text-brand-600">StewardOS Helps You Decide Forward.</span>
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Most budgeting tools are merely post-mortem trackers — recording what you already spent. StewardOS is an intentional operating system that structures every income deposit before you spend a single Naira.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Way */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs">✕</div>
                <span>Traditional Expense Trackers</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0 font-bold">•</span>
                  <span>Retroactively categorizes money after it has already left your account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0 font-bold">•</span>
                  <span>Kingdom giving and tithes get mixed with ordinary spending balances.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 shrink-0 font-bold">•</span>
                  <span>Creates anxiety at month-end when reviewing overspent categories.</span>
                </li>
              </ul>
            </div>

            {/* StewardOS Way */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs">✓</div>
                <span>The StewardOS Operating System</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0 font-bold">•</span>
                  <span>Instantly divides every new income deposit across your intentional percentage rules.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0 font-bold">•</span>
                  <span>Kingdom giving is protected and tracked as a dedicated disbursement obligation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0 font-bold">•</span>
                  <span>Gives total peace with a 60-second daily decision rhythm.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TODAY'S DECISIONS SECTION */}
      <section id="decisions" className="border-t border-zinc-200/80 bg-white px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Daily Rhythm</span>
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-4xl">
              Today&apos;s Decisions. 60 Seconds to Financial Clarity.
            </h2>
            <p className="text-sm text-zinc-600">
              A lightweight, intentional daily check-in built directly into your dashboard to keep your financial intentions grounded every morning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Decision 1</span>
              <h3 className="text-xs font-bold text-zinc-900">Did money come in?</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Quickly log salary, client retainers, or sales with automatic envelope splits.</p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Decision 2</span>
              <h3 className="text-xs font-bold text-zinc-900">Did money go out?</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Capture daily outflows tagged to your living expenses, fuel, or groceries envelopes.</p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Decision 3</span>
              <h3 className="text-xs font-bold text-zinc-900">Created a new goal?</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Set emergency funds, rent targets, or asset milestones with automated progress tracking.</p>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Decision 4</span>
              <h3 className="text-xs font-bold text-zinc-900">Focus Action</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">Confirm kingdom giving, review upcoming bills, or fund intentional goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SYSTEM (9 PILLARS) */}
      <section id="features" className="border-t border-zinc-200/80 bg-zinc-50/50 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-4xl">
              Everything You Need for Financial Stewardship
            </h2>
            <p className="text-sm text-zinc-600">
              A comprehensive personal finance operating system engineered with precision, security, and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <PieChart className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Allocation Engine</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Automated percentage-based distribution across customizable vaults (Tithe, Living, Future, Freedom).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Goals & Milestones</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Track savings targets, emergency reserves, and real estate funds with progress indicators and celebration triggers.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Recurring Bills</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Stay ahead of rent, utilities, and debt obligations with automated due-day tracking and digest reminders.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Active Subscriptions</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Audit monthly software and lifestyle subscriptions to eliminate hidden financial leaks.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Assets & Holdings</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Keep a live inventory of physical, liquid, and digital assets to monitor your overall wealth trajectory.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Wishlist & Intentional Purchases</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Practice delayed gratification by queueing planned desires and funding them intentionally over time.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Financial Journal</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Record your stewardship reflections, gratitude, and financial lessons alongside your numbers.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Reports & Analytics</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Visual cash flow trends, category distributions, and multi-format exports (CSV, Excel, PDF).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Insights & Celebrations</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Earn milestone badges when tithes are paid, savings records broken, and cash flow stays positive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-zinc-200/80 bg-white px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-4xl">
              The 4-Step Stewardship Rhythm
            </h2>
            <p className="text-sm text-zinc-600">
              Income → Allocation → Action → Review
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <span className="text-3xl font-black text-brand-500">01</span>
              <h3 className="text-sm font-bold text-zinc-900">Set Allocation Rules</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Configure your target percentages once in Settings (e.g. 10% Tithe, 50% Living, 15% Savings).
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-black text-brand-500">02</span>
              <h3 className="text-sm font-bold text-zinc-900">Record Income</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                When external money arrives, StewardOS calculates exact envelope shares with integer kobo precision.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-black text-brand-500">03</span>
              <h3 className="text-sm font-bold text-zinc-900">Review & Send</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Review your generated obligations in Allocation Center and mark them Sent as you move the funds.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-black text-brand-500">04</span>
              <h3 className="text-sm font-bold text-zinc-900">Track Progress</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Enjoy complete peace with real-time available cash calculations and monthly review audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINANCIAL CLARITY SECTION */}
      <section className="border-t border-zinc-200/80 bg-zinc-50/60 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-4xl">
              Complete Financial Clarity at a Glance
            </h2>
            <p className="text-sm text-zinc-600">
              The four authoritative financial metrics that govern your daily cash position.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-brand-500 p-5 text-white shadow-sm space-y-2">
              <p className="text-[11px] font-semibold uppercase text-brand-100">Available Cash</p>
              <p className="text-2xl font-extrabold text-white">₦192,800.00</p>
              <p className="text-[11px] text-brand-100/80">Real uncommitted spending money</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <p className="text-[11px] font-semibold uppercase text-zinc-400">Total Income</p>
              <p className="text-2xl font-bold text-zinc-900">₦240,000.00</p>
              <p className="text-[11px] text-emerald-600 font-semibold">+100% Inflow Allocated</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <p className="text-[11px] font-semibold uppercase text-zinc-400">Total Expenses</p>
              <p className="text-2xl font-bold text-zinc-900">₦23,200.00</p>
              <p className="text-[11px] text-zinc-400">Tracked against envelopes</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
              <p className="text-[11px] font-semibold uppercase text-zinc-400">Net Cash Flow</p>
              <p className="text-2xl font-bold text-emerald-600">+₦216,800.00</p>
              <p className="text-[11px] text-emerald-700 font-semibold">Positive Stewardship</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. JOURNAL + INSIGHTS */}
      <section className="border-t border-zinc-200/80 bg-white px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Behavioral Reflection</span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-4xl max-w-2xl mx-auto">
            More Than A Tracker. A Reflection of Your Growth.
          </h2>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            True prosperity is behavioral and spiritual, not merely numerical. StewardOS pairs quantitative ledger records with thoughtful journaling prompts and celebration milestones.
          </p>
        </div>
      </section>

      {/* 7. INSTALLABLE PWA */}
      <section className="border-t border-zinc-200/80 bg-zinc-50/60 px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700">
                <Smartphone className="h-3.5 w-3.5" />
                <span>PWA Ready</span>
              </div>
              <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
                Works on Desktop, Tablet & Mobile. Zero App Store Friction.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                StewardOS is engineered as an installable Progressive Web App. Install it to your home screen or desktop dock with offline cache support and instant startup speed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center space-y-1 flex-1 sm:w-40">
                <Laptop className="h-6 w-6 mx-auto text-brand-600" />
                <p className="text-xs font-bold text-zinc-900">Desktop Dock</p>
                <p className="text-[10px] text-zinc-400">Chrome / Edge / Safari</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center space-y-1 flex-1 sm:w-40">
                <Smartphone className="h-6 w-6 mx-auto text-brand-600" />
                <p className="text-xs font-bold text-zinc-900">Mobile Home Screen</p>
                <p className="text-[10px] text-zinc-400">iOS & Android</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="border-t border-zinc-200/80 bg-white px-4 sm:px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-600">
              Clear answers about StewardOS security, envelope allocations, and platform access.
            </p>
          </div>

          <LandingFaq />
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="border-t border-zinc-200/80 bg-brand-500 px-4 sm:px-6 py-20 text-white text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-400/30 px-3 py-1 text-[11px] font-bold text-brand-100">
            <span>START TODAY</span>
          </div>
          <h2 className="text-3xl font-extrabold sm:text-5xl leading-tight">
            Step into Clarity, Peace, and True Prosperity.
          </h2>
          <p className="text-sm sm:text-base text-brand-100 leading-relaxed max-w-xl mx-auto">
            Take command of your financial rhythm with the operating system designed for purposeful stewards.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-brand-800 shadow-xl transition-all hover:bg-brand-50 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-zinc-200/80 bg-white px-4 sm:px-6 py-12 text-zinc-500 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo variant="full" />
          </div>

          <div className="flex items-center gap-6 text-zinc-600 font-medium">
            <Link href="/login" className="hover:text-zinc-900">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-zinc-900">
              Register
            </Link>
            <a
              href="https://mujteknify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-600"
            >
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