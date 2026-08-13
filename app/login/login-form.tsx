"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { logIn } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logIn, initialAuthState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5 animate-fade-in-up">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Input id="email" name="email" type="email" label="Email Address" required autoComplete="email" />
      <div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            required
            autoComplete="current-password"
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute bottom-2.5 right-3 flex items-center gap-1 text-xs font-medium text-zinc-500"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-1.5 text-right">
          <Link href="/forgot-password" className="text-sm text-zinc-500 underline">
            Forgot password?
          </Link>
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
