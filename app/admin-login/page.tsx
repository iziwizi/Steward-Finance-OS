"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccessDenied(false);

    startTransition(async () => {
      try {
        const supabase = createClient();

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (authError || !data.user) {
          setError(authError?.message || "Invalid administrator credentials.");
          return;
        }

        // Server-side role check via profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError || profile?.role !== "admin") {
          // Immediately sign out non-admin users to prevent normal session contamination
          await supabase.auth.signOut();
          setAccessDenied(true);
          return;
        }

        // Verified Administrator — proceed to Super Admin Console
        router.push("/admin");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "An unexpected authentication error occurred.");
      }
    });
  };

  if (accessDenied) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white mb-2">Administrator Access Required</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This portal is strictly restricted to StewardOS platform administrators. Your account does not have administrative privileges.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white text-center hover:bg-brand-500 transition-colors"
            >
              Return to StewardOS Dashboard
            </Link>
            <button
              onClick={() => {
                setAccessDenied(false);
                setEmail("");
                setPassword("");
              }}
              className="block w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 text-center hover:border-zinc-600 hover:text-white transition-colors"
            >
              Try Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Subtle ambient gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:28px_28px] opacity-[0.04] pointer-events-none" />

      {/* Back to StewardOS link */}
      <div className="relative px-6 pt-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to StewardOS</span>
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-700">
          <Lock className="h-2.5 w-2.5 text-brand-400" />
          Internal Portal
        </span>
      </div>

      {/* Main login card */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-900/30 mx-auto border border-brand-400/30">
              <ShieldCheck className="h-7 w-7 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 mb-0.5">StewardOS</p>
              <h1 className="text-2xl font-extrabold text-white">Administrator Portal</h1>
              <p className="text-xs text-zinc-500 mt-1">
                Restricted access — authorized engineering & operations personnel only
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-7 shadow-2xl backdrop-blur-sm">
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 px-3.5 py-3">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-300 leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Administrator Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@stewardos.app"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/70 px-4 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || !email || !password}
                className="w-full rounded-xl bg-brand-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating Super Admin...
                  </span>
                ) : (
                  "Sign In to Administrator Console"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-zinc-600 mt-6">
            StewardOS Administrator Portal · A Product of MUJTEKNIFY · © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
