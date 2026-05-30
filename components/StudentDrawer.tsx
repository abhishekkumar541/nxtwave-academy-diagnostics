"use client";

import { X, FlaskConical } from "lucide-react";
import { bandOf } from "@/lib/data/cohorts";
import { recommendedAction } from "@/lib/risk";
import type { Student } from "@/lib/types";
import { RiskPill, StatusDot, langScript } from "./ui";

export default function StudentDrawer({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  if (!student) return null;
  const s = student;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-lift">
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <StatusDot status={s.status} />
              <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
            </div>
            <p className="mt-0.5 text-xs text-ink-faint">
              {s.id} · {s.college}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <div>
              <div className="text-3xl font-bold text-ink">{s.churnRiskScore}</div>
              <div className="text-[11px] text-ink-faint">churn-risk score / 100</div>
            </div>
            <RiskPill band={bandOf(s.churnRiskScore)} />
          </div>

          <Field label="Year / Tier / Language">
            {s.year}
            {ordinal(s.year)}-year · {s.collegeTier} · {langScript(s.language)}
          </Field>
          <Field label="College rank">
            #{s.rankInCollege} of {s.collegeCohortSize} · {s.mentorPod}
          </Field>
          <Field label="Acquisition source">{s.acquisition}</Field>
          <Field label="Engagement">
            {s.currentStreak}-day streak · last active {s.daysSinceActive === 0 ? "today" : `${s.daysSinceActive}d ago`} ·{" "}
            {Math.round(s.attendanceRate * 100)}% attendance
          </Field>
          <Field label="Exam window">
            {s.daysToExam <= 14 ? (
              <span className="font-medium text-risk-high">
                Internal exams in {s.daysToExam} days
              </span>
            ) : (
              <>no exam within 2 weeks</>
            )}
          </Field>
          <Field label="Parent">
            {s.parentReportOpened ? "Opens reports" : "Not opening reports"}
            {s.parentReportOpened && (s.parentResponded ? " · responds" : " · never responds")}
          </Field>

          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              Risk factors (why this score)
            </div>
            {s.riskFactors.length === 0 ? (
              <p className="text-sm text-ink-faint">No active risk factors — healthy.</p>
            ) : (
              <ul className="space-y-1">
                {s.riskFactors.map((f) => (
                  <li
                    key={f.label}
                    className="flex items-center justify-between rounded-lg bg-red-50/60 px-3 py-1.5 text-sm"
                  >
                    <span className="text-ink-soft">{f.label}</span>
                    <span className="font-semibold tabular-nums text-risk-high">+{f.points}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-ink-faint ring-1 ring-slate-100">
              <FlaskConical size={13} className="mt-0.5 shrink-0 text-slate-400" />
              <span>
                Weights are a <strong className="text-ink-soft">hypothesis</strong>, not a
                trained model. Day 1: backtest against students who actually churned and
                recalibrate. This is a thinking model — not yet production.
              </span>
            </p>
          </div>

          <div className="rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              Recommended intervention
            </div>
            <p className="text-sm leading-relaxed text-brand-900">{recommendedAction(s)}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <span className="text-sm text-ink-soft">{children}</span>
    </div>
  );
}

function ordinal(n: number) {
  return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
}
