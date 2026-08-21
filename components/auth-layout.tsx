import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { ShieldCheck, CheckCircle2, Sparkles, Lock } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footerLink,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLink: { text: string; linkText: string; href: string };
}) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-white selection:bg-brand-500 selection:text-white">
      {/* Left Brand Showcase Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Logo variant="full" />
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-brand-200 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>FAITHFUL · WISE · PROSPEROUS</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
            The Personal Finance OS for Purposeful Stewardship
          </h2>

          <p className="text-sm text-brand-100/90 leading-relaxed">
            Move beyond retroactive expense tracking. Intentionally allocate income, protect your kingdom giving, manage goals, and build lasting financial discipline.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-brand-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700/80 text-brand-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Automated percentage-based envelope distributions</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-brand-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700/80 text-brand-300">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span>Dedicated tithe and kingdom giving protection</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-brand-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700/80 text-brand-300">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <span>Bank-grade isolated sandbox storage</span>
            </div>
          </div>

          {/* Desktop Preview Card */}
          <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
            <div className="relative h-44 w-full overflow-hidden rounded-lg">
              <Image
                src="/brand/desktop-preview.png"
                alt="StewardOS Dashboard Preview"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-brand-200/70 border-t border-white/10 pt-4">
          <span>StewardOS Personal Finance OS</span>
          <span>A Product of MUJTEKNIFY · © 2026</span>
        </div>
      </div>

      {/* Right Form Panel (Full width on Mobile, 50% on Desktop) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-paper">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Top Bar with Logo on mobile and Back to Home link */}
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <Link href="/" className="inline-block">
                <Logo variant="full" />
              </Link>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors ml-auto flex items-center gap-1"
            >
              <span aria-hidden="true">←</span>
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{title}</h1>
            <p className="text-xs sm:text-sm text-zinc-500">{subtitle}</p>
          </div>

          {/* Auth Form Children */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm">
            {children}
          </div>

          {/* Footer toggle link */}
          <p className="text-center text-xs sm:text-sm text-zinc-500">
            {footerLink.text}{" "}
            <Link href={footerLink.href} className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4">
              {footerLink.linkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
