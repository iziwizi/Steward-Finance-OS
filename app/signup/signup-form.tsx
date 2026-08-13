"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResendConfirmation } from "./resend-confirmation";

function passwordStrength(password: string): { label: string; tone: string } | null {
  if (!password) return null;
  const hasSymbolOrNumber = /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  if (password.length >= 10 && hasSymbolOrNumber) return { label: "Strong", tone: "text-income" };
  if (password.length >= 8) return { label: "Weak • Needs symbols & numbers", tone: "text-amber-600" };
  return { label: "Too short", tone: "text-expense" };
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialAuthState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const strength = passwordStrength(password);

  if (state.success) {
    return (
      <div className="mt-8 space-y-3 animate-fade-in-up">
        <p role="status" className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {state.success}
        </p>
        {email && <ResendConfirmation email={email} />}
        <p className="text-center text-sm text-zinc-500">
          <Link href="/login" className="font-semibold text-brand-500">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5 animate-fade-in-up">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Input id="name" name="name" type="text" label="Full Name" required autoComplete="name" />
      <Input
        id="email"
        name="email"
        type="email"
        label="Email Address"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            required
            minLength={8}
            autoComplete="new-password"
            className="pr-16"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute bottom-2.5 right-3 text-zinc-500"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {strength && <p className={`mt-1 text-xs ${strength.tone}`}>{strength.label}</p>}
      </div>
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        label="Confirm Password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <label className="flex items-start gap-2.5 text-sm text-zinc-600">
        <input
          type="checkbox"
          required
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] rounded border-zinc-300"
        />
        I agree to the Terms of Service and Privacy Policy
      </label>
      <Button type="submit" disabled={pending || !agreed} className="w-full">
        {pending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
