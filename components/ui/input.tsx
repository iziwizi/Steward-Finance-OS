import { type InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ label, id, className = "", ...props }, ref) => (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-900">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`tap-target w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";
