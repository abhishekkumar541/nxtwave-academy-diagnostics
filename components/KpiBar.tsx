import type { Kpi } from "@/lib/types";

const toneMap = {
  good: "text-risk-low",
  warn: "text-amber-600",
  bad: "text-risk-high",
  neutral: "text-brand-600",
};

export default function KpiBar({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((k) => (
        <div key={k.label} className="card px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            {k.label}
          </div>
          <div className={`mt-1 text-2xl font-bold ${toneMap[k.tone]}`}>
            {k.value}
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-ink-faint">
            {k.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
