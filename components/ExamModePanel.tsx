"use client";

import { useState } from "react";
import { BookOpen, Pause, Calendar, Sparkles } from "lucide-react";
import { Card, CardHeader } from "./ui";
import ExperimentNote from "./ExperimentNote";

export default function ExamModePanel() {
  const [on, setOn] = useState(true);

  return (
    <Card>
      <CardHeader
        title="Exam Mode — the highest-ROI Academy feature"
        subtitle="Internal exams are the #1 predictable dropout trigger. Most who pause never resume."
        right={
          <button
            onClick={() => setOn((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition ${
              on ? "bg-brand-600" : "bg-slate-300"
            }`}
            aria-label="Toggle Exam Mode"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                on ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        }
      />
      <div className="px-5 py-4">
        {on ? (
          <div className="space-y-3">
            <Step
              icon={<Pause size={16} />}
              title="Streak paused, not broken"
              body="The 18-day streak is frozen for exam week. No loss-aversion penalty for studying for college."
            />
            <Step
              icon={<BookOpen size={16} />}
              title="Switch to 10-min/day revision"
              body="Daily load drops to short revision videos that complement their college subjects — stay in the habit without competing."
            />
            <Step
              icon={<Calendar size={16} />}
              title="Re-onboarding scheduled"
              body="The day after exams end: a gentle re-entry sequence — '1 problem today, 2 tomorrow. Your streak is preserved.'"
            />
            <div className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-900 ring-1 ring-brand-100">
              <strong>Target metric:</strong> lift &ldquo;% resumed after internal exams&rdquo;
              from <strong>31% → 60%+</strong>. Almost no edtech dashboard even tracks this.
            </div>
            <ExperimentNote
              hypothesis="Pre-committing exam dates + pausing the streak removes the 'I'll catch up later' exit, so more students resume after internals."
              test="Eligible students randomized to Exam Mode vs control; measure resume rate in the 14 days post-exam."
              metric="% resumed after internal exams (leading) → W4 retention by cohort (lagging)"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-ink-faint">
            <Sparkles size={18} className="mx-auto mb-2 text-slate-300" />
            Exam Mode off — student faces full daily load during college internals.
            This is when the silent churn happens.
          </div>
        )}
      </div>
    </Card>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <p className="text-xs leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
