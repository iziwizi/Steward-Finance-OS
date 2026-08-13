import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "tap-target inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-all duration-fast ease-out-motion active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600",
  secondary: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-brand-500 hover:bg-brand-50",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ variant = "primary", className = "", ...props }, ref) => (
  <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
));
Button.displayName = "Button";
