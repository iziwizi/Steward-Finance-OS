import Link from "next/link";
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
  Sliders,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { LandingFaq } from "@/components/landing-faq";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-zinc-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" />
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
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Subtle Financial Grid Background */}
      <section className="relative overflow-hidden px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:leading-[1.12]">
            The Personal Finance OS for{" "}
            <span className="text-brand-500 underline decoration-brand-200 decoration-wavy underline-offset-8">
              Purposeful Stewardship
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-zinc-600 md:text-lg leading-relaxed">
            Move beyond retroactive expense tracking. StewardOS automates percentage-based income allocations, protects your tithe and kingdom giving, tracks obligations, and delivers daily financial clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg active:scale-95"
            >
              <span>Create Your Financial OS Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-8 py-4 text-sm font-semibold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50"
            >
              Sign In to Your Workspace
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-zinc-500">
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

        {/* Hero Interactive Product Visualization Demo */}
        <div className="relative mx-auto mt-16 max-w-5xl rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3 shadow-2xl md:p-5">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 md:p-7 space-y-6 shadow-xs">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-bold text-zinc-700 ml-1">StewardOS Console</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
                  Live Preview
                </span>
              </div>
            </div>

            {/* 4 Financial Metric Cards */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-brand-500 p-4 text-white shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-100">Retained Surplus</p>
                <p className="mt-1 text-2xl font-extrabold">₦245,000.00</p>
                <p className="mt-1 text-[10px] text-brand-100">70% Monthly Savings Rate</p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Inflow</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">₦350,000.00</p>
                <p className="mt-1 text-[10px] text-emerald-600 font-semibold">+100% Allocated</p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kingdom Giving</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">₦35,000.00</p>
                <p className="mt-1 text-[10px] text-zinc-400">10% Dedicated Tithe</p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Outflow</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">₦105,000.00</p>
                <p className="mt-1 text-[10px] text-zinc-400">30% Within Budget</p>
              </div>
            </div>

            {/* Quick Interactive Mock Row */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Recent Inflow: Website Retainer (₦350,000)</p>
                    <p className="text-[11px] text-zinc-500">Auto-split across 5 stewardship envelopes with integer kobo precision</p>
                  </div>
                </div>
                <span className="self-start sm:self-auto rounded-md bg-white border border-zinc-200 px-2.5 py-1 text-[10px] font-bold text-zinc-700">
                  Automated Split
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="border-t border-zinc-200/80 bg-zinc-50/50 px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
              Complete Financial Operating Architecture
            </h2>
            <p className="text-sm text-zinc-600">
              StewardOS unites automated budgeting, kingdom giving protection, goal tracking, and daily accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <PieChart className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Automated Envelope Splits</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                When income lands, StewardOS automatically divides it into your predefined envelopes with zero guesswork.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Protected Kingdom Giving</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Never accidentally spend your tithe or partnership commitments. Dedicated tracking keeps giving pure and prioritized.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Milestone Goals & Emergency Fund</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Track freedom funds, vehicle savings, and real estate targets with visual progress and automated milestone celebrations.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Today's Decisions Daily Check-in</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                A 30-second daily reflection right on your dashboard to log inflows, record expenses, and keep intentions aligned.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Strategic Financial Journal</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Record your financial lessons, gratitude, and monthly commitments alongside your mathematical records.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">One-Click Multi-Format Export</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Export verified CSV, Excel spreadsheets, and executive PDF summaries with custom date filtering anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Interactive Accordion */}
      <section id="faq" className="border-t border-zinc-200/80 bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-600">
              Clear answers about StewardOS privacy, features, and platform access.
            </p>
          </div>

          <LandingFaq />
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
