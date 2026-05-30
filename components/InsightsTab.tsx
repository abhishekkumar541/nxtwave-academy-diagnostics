"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, TriangleAlert, ChevronDown, AlertCircle } from "lucide-react";
import { getInsights, GATE_DESCRIPTION, type Observation } from "@/lib/insights";
import { fmtP } from "@/lib/stats";
import { Card } from "./ui";

export default function InsightsTab() {
  const report = useMemo(() => getInsights(), []);
  const [showMethod, setShowMethod] = useState(false);

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">
              Auto-mined {report.totalTested} candidate patterns ·{" "}
              <span className="text-risk-low">{report.validatedCount} validated</span> ·{" "}
              <span className="text-amber-600">{report.directionalCount} directional</span>
            </h3>
            <p className="mt-0.5 text-xs text-ink-faint">
              Every observation is gated against the <strong>independent</strong> churn
              outcome — never against our own risk score. Validated, not asserted.
            </p>
          </div>
          <button
            onClick={() => setShowMethod((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-slate-200"
          >
            Methodology
            <ChevronDown
              size={14}
              className={`transition ${showMethod ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        {showMethod && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-ink-soft ring-1 ring-slate-100">
            <p>
              <strong>Gate:</strong> {GATE_DESCRIPTION}. An observation is{" "}
              <strong>validated</strong> only if it clears all three; otherwise it&rsquo;s
              labelled <strong>directional</strong> (real-looking but underpowered or weak).
            </p>
            <p>
              <strong>Outcome:</strong> the independent <code>left</code> label (paused or
              churned) — set by upstream behavior, not by our churn-risk score, so this
              isn&rsquo;t circular. We don&rsquo;t mine the variables that <em>define</em>{" "}
              the label (inactivity, streak).
            </p>
            <p>
              <strong>Validation ≠ causation.</strong> A significant result can still be
              confounded (watch the ⚠ flags) — the stat narrows where a human should look;
              it doesn&rsquo;t replace the judgment call.
            </p>
          </div>
        )}
      </Card>

      {/* Observation cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        {report.observations.map((o) => (
          <InsightCard key={o.id} o={o} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ o }: { o: Observation }) {
  const validated = o.verdict === "validated";
  const s = o.stat;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="chip bg-slate-100 text-ink-faint">{o.dimension}</span>
        {validated ? (
          <span className="chip bg-green-50 text-risk-low ring-1 ring-green-100">
            <BadgeCheck size={13} /> Validated · {Math.round(s.confidence)}% conf
          </span>
        ) : (
          <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            <TriangleAlert size={13} /> Directional
            {s.nSubgroup < 30 ? ` · underpowered (n=${s.nSubgroup})` : ""}
          </span>
        )}
      </div>

      <p className="text-sm font-medium leading-snug text-ink">{o.statement}</p>

      {/* Two-bar comparison */}
      <div className="space-y-1.5">
        <Bar label="Subgroup" value={s.pSubgroup} tone={validated ? "bad" : "warn"} n={s.nSubgroup} />
        <Bar label="Baseline" value={s.pBaseline} tone="neutral" n={s.nBaseline} />
      </div>

      {/* Stat row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faint">
        <span>
          lift{" "}
          <strong className={s.relLift >= 0 ? "text-risk-high" : "text-risk-low"}>
            {s.relLift >= 0 ? "+" : ""}
            {Math.round(s.relLift * 100)}%
          </strong>
        </span>
        <span>·</span>
        <span>{fmtP(s.pValue)}</span>
        <span>·</span>
        <span>n = {s.nSubgroup} vs {s.nBaseline}</span>
      </div>

      {o.confound && (
        <p className="flex items-start gap-1.5 rounded-lg bg-amber-50/70 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{o.confound}</span>
        </p>
      )}

      <div className="mt-auto rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-900 ring-1 ring-brand-100">
        <span className="font-semibold">Action: </span>
        {o.action}
      </div>
    </Card>
  );
}

function Bar({
  label,
  value,
  tone,
  n,
}: {
  label: string;
  value: number;
  tone: "bad" | "warn" | "neutral";
  n: number;
}) {
  const color =
    tone === "bad" ? "bg-risk-high" : tone === "warn" ? "bg-amber-500" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-ink-faint">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right text-[11px] tabular-nums text-ink-soft">
        {Math.round(value * 100)}% <span className="text-ink-faint">·n={n}</span>
      </span>
    </div>
  );
}
