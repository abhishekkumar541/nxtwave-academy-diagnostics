"use client";

import { useState } from "react";
import { Sparkles, Loader2, Languages } from "lucide-react";
import type { ReportCard, Student } from "@/lib/types";
import { Card, CardHeader, langScript } from "./ui";
import WhatsAppBubble from "./WhatsAppBubble";
import ExperimentNote from "./ExperimentNote";

export default function ReportCardGenerator({ students }: { students: Student[] }) {
  // Pre-pick a vivid default student (one with a real project + clear language).
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");
  const [card, setCard] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = students.find((s) => s.id === selectedId);

  async function generate() {
    setLoading(true);
    setError(null);
    setCard(null);
    try {
      const res = await fetch("/api/report-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedId }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: ReportCard = await res.json();
      setCard(data);
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
        title="Maa-Baap Report Card generator"
        subtitle="The play no competitor builds — a weekly parent update in their own language"
        right={
          card && (
            <span
              className={`chip ${
                card.source === "llm"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-slate-100 text-ink-faint"
              }`}
            >
              {card.source === "llm" ? "✦ generated live" : "sample (no API key)"}
            </span>
          )
        }
      />
      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              Student
            </span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.college} ({langScript(s.language)})
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={generate}
            disabled={loading || !selectedId}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Writing…" : "Generate report card"}
          </button>
        </div>

        {selected && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-soft ring-1 ring-slate-100">
            <span>Built this week: <strong className="text-ink">{selected.lastProject}</strong></span>
            <span>Rank: <strong className="text-ink">#{selected.rankInCollege}/{selected.collegeCohortSize}</strong></span>
            <span>Streak: <strong className="text-ink">{selected.currentStreak}d</strong></span>
            <span>Parent: <strong className="text-ink">{selected.parentReportOpened ? "engaged" : "not opening"}</strong></span>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-risk-high">{error}</p>
        )}

        {card && (
          <div className="space-y-2">
            <WhatsAppBubble message={card.message} />
            <button
              onClick={() => setShowTranslation((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Languages size={14} />
              {showTranslation ? "Hide" : "Show"} English translation
            </button>
            {showTranslation && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm italic leading-relaxed text-ink-soft ring-1 ring-slate-100">
                {card.translation}
              </p>
            )}
          </div>
        )}

        {!card && !loading && (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-ink-faint">
            Pick a student and generate a parent report card in {selected ? langScript(selected.language) : "their language"}.
          </div>
        )}

        <ExperimentNote
          hypothesis="Re-activating the parent as accountability partner lifts the student's week-over-week return."
          test="Holdout A/B: report-card cohort vs control, matched by year-of-college + risk band."
          metric="Parent Trust Score → CURR-Academy (D-N→D-N+1)"
        />
      </div>
    </Card>
  );
}
