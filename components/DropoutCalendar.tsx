"use client";

import { useState } from "react";
import { DROPOUT_CALENDAR } from "@/lib/data/cohorts";
import { Card, CardHeader } from "./ui";

export default function DropoutCalendar() {
  const [active, setActive] = useState<number>(2); // default-highlight Internal exams
  const ev = DROPOUT_CALENDAR[active];

  return (
    <Card>
      <CardHeader
        title="The 7-event dropout calendar"
        subtitle="Academy churn is calendar-driven and predictable — not a single number"
      />
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-end gap-2">
          {DROPOUT_CALENDAR.map((e, i) => {
            const isActive = i === active;
            const hot = e.churnRate >= 70;
            return (
              <button
                key={e.event}
                onClick={() => setActive(i)}
                className="group flex flex-1 flex-col items-center gap-1.5"
                title={e.event}
              >
                <span className="text-[11px] font-semibold tabular-nums text-ink-faint">
                  {e.churnRate}
                </span>
                <div className="flex h-36 w-full items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isActive
                        ? hot
                          ? "bg-risk-high"
                          : "bg-brand-500"
                        : hot
                        ? "bg-red-200 group-hover:bg-red-300"
                        : "bg-brand-200 group-hover:bg-brand-300"
                    }`}
                    style={{ height: `${e.churnRate}%` }}
                  />
                </div>
                <span
                  className={`text-center text-[10px] leading-tight ${
                    isActive ? "font-semibold text-ink" : "text-ink-faint"
                  }`}
                >
                  {e.event}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">{ev.event}</span>
            <span className="text-xs text-ink-faint">~month {ev.month} · churn intensity {ev.churnRate}/100</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{ev.note}</p>
        </div>
      </div>
    </Card>
  );
}
