export function ProgressBar({
  percent,
  tone = "brand",
  className = "",
}: {
  percent: number;
  tone?: "brand" | "danger" | "income" | "warning";
  className?: string;
}) {
  const fillClass =
    tone === "danger"
      ? "bg-expense"
      : tone === "income"
      ? "bg-income"
      : tone === "warning"
      ? "bg-pending"
      : "bg-brand-500";
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 ${className}`}>
      <div
        className={`h-full rounded-full ${fillClass} transition-[width] duration-slow ease-out-motion`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
