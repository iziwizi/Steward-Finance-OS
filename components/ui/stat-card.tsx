const toneClasses = {
  income: "text-income",
  expense: "text-expense",
  neutral: "text-zinc-900",
} as const;

export function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
  className = "",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-5 ${className}`}>
      <p className="text-caption uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`text-financial-md ${toneClasses[tone]}`}>{value}</p>
      {delta && <p className="text-financial-caption text-income">{delta}</p>}
    </div>
  );
}
