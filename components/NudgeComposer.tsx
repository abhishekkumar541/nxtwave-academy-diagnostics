"use client";

import { useState } from "react";
import { Wand2, Loader2, Languages } from "lucide-react";
import type { NudgeMoment, NudgeResult, Student } from "@/lib/types";
import { Card, CardHeader, langScript, RiskPill } from "./ui";
import { bandOf } from "@/lib/data/cohorts";
import WhatsAppBubble from "./WhatsAppBubble";

const MOMENT_OPTIONS: { key: NudgeMoment; label: string; mechanic: string }[] = [
  { key: "stuck-midnight", label: "Stuck at midnight", mechanic: "Hot-state hint" },
  { key: "drifting", label: "Drifting / inactive", mechanic: "Behavioral activation" },
  { key: "exam-approaching", label: "Exam approaching", mechanic: "Exam-Mode pact" },
  { key: "friend-dropped", label: "A batchmate dropped", mechanic: "Peer-contagion save" },
  { key: "post-mock-failure", label: "After a mock failure", mechanic: "Loss-reframe" },
  { key: "parent-disengaged", label: "Parent disengaged", mechanic: "Maa-Baap green report" },
];

export default function NudgeComposer({ students }: { students: Student[] }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [moment, setMoment] = useState<NudgeMoment>("stuck-midnight");
  const [result, setResult] = useState<NudgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const student = students.find((s) => s.id === studentId);
  const sel = MOMENT_OPTIONS.find((m) => m.key === moment)!;

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, moment }),
      });
      if (!res.ok) throw new Error("failed");
      const data: NudgeResult = await res.json();
      setResult(data);
      setShowTranslation(false);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Nudge Composer"
        subtitle="Pick an at-risk student + a moment → an AI coach drafts the actual nudge in their language, grounded in their data"
        right={
          result && (
            <span
              className={`chip ${
                result.source === "llm" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-ink-faint"
              }`}
            >
              {result.source === "llm" ? "✦ generated live" : "sample (no key)"}
            </span>
          )
        }
      />
      <div className="space-y-4 px-5 py-4">
        {/* Student */}
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            At-risk student
          </span>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.college} ({langScript(s.language)}) · risk {s.churnRiskScore}
              </option>
            ))}
          </select>
        </label>

        {student && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-soft ring-1 ring-slate-100">
            <RiskPill band={bandOf(student.churnRiskScore)} />
            <span>top factor: <strong className="text-ink">{student.riskFactors[0]?.label ?? "—"}</strong></span>
            <span>· last built: <strong className="text-ink">{student.lastProject}</strong></span>
            <span>· streak: <strong className="text-ink">{student.currentStreak}d</strong></span>
          </div>
        )}

        {/* Moment chips */}
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            Trigger moment
          </span>
          <div className="flex flex-wrap gap-1.5">
            {MOMENT_OPTIONS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMoment(m.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  moment === m.key
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-ink-soft hover:bg-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            Mechanic: <strong className="text-ink-soft">{sel.mechanic}</strong> · drafts to the{" "}
            {moment === "parent-disengaged" ? "parent" : "student"}
          </p>
        </div>

        <button
          onClick={generate}
          disabled={loading || !studentId}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {loading ? "Composing…" : "Compose nudge"}
        </button>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>}

        {result && (
          <div className="space-y-2">
            <WhatsAppBubble
              message={result.message}
              senderName={result.audience === "parent" ? "NxtWave (to parent)" : "Apna Mentor"}
            />
            <button
              onClick={() => setShowTranslation((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Languages size={14} /> {showTranslation ? "Hide" : "Show"} English translation
            </button>
            {showTranslation && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm italic leading-relaxed text-ink-soft ring-1 ring-slate-100">
                {result.translation}
              </p>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-ink-faint">
            Pick a student + moment, then compose the exact message to send.
          </div>
        )}
      </div>
    </Card>
  );
}
