import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

type Tone = "success" | "warning" | "danger" | "info";

const toneConfig: Record<Tone, { wrap: string; icon: string; Icon: typeof CheckCircle2 }> = {
  success: { wrap: "bg-emerald-50 border-emerald-200 text-emerald-900", icon: "text-emerald-600", Icon: CheckCircle2 },
  warning: { wrap: "bg-amber-50 border-amber-200 text-amber-900", icon: "text-amber-600", Icon: AlertTriangle },
  danger: { wrap: "bg-red-50 border-red-200 text-red-900", icon: "text-red-600", Icon: XCircle },
  info: { wrap: "bg-blue-50 border-blue-200 text-blue-900", icon: "text-blue-600", Icon: Info },
};

export function Alert({
  tone = "info",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const { wrap, icon, Icon } = toneConfig[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium ${wrap} ${className}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${icon}`} strokeWidth={2} />
      <span className="flex-1">{children}</span>
    </div>
  );
}
