import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="card-h flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function RiskPill({ band }: { band: "high" | "med" | "low" }) {
  const map = {
    high: "bg-red-50 text-risk-high ring-1 ring-red-100",
    med: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    low: "bg-green-50 text-risk-low ring-1 ring-green-100",
  };
  const label = { high: "High", med: "Medium", low: "Low" };
  return <span className={`chip ${map[band]}`}>{label[band]} risk</span>;
}

export function StatusDot({ status }: { status: string }) {
  const color =
    status === "active"
      ? "bg-green-500"
      : status === "at-risk"
      ? "bg-red-500"
      : status === "paused"
      ? "bg-amber-500"
      : "bg-slate-400";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function langScript(lang: string) {
  return (
    {
      Telugu: "తెలుగు",
      Hindi: "हिन्दी",
      Tamil: "தமிழ்",
      Malayalam: "മലയാളം",
    } as Record<string, string>
  )[lang] || lang;
}
