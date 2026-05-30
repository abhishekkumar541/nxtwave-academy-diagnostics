"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCurves } from "@/lib/data/cohorts";
import type { SegmentDimension } from "@/lib/types";
import { Card, CardHeader } from "./ui";

const DIMS: { key: SegmentDimension; label: string }[] = [
  { key: "year", label: "Year of college" },
  { key: "tier", label: "College tier" },
  { key: "language", label: "Language" },
  { key: "acquisition", label: "Acquisition source" },
];

export default function RetentionCurve() {
  const [dim, setDim] = useState<SegmentDimension>("year");
  // Series hidden by the user (cleared whenever the dimension changes).
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const curves = useMemo(() => getCurves(dim), [dim]);

  const selectDim = (d: SegmentDimension) => {
    setDim(d);
    setHidden(new Set()); // show all when switching segments
  };

  const toggle = (label: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const visibleCount = curves.length - hidden.size;

  // Merge into a single dataset keyed by week for Recharts.
  const weeks = curves[0].data.map((d) => d.week);
  const merged = weeks.map((w, i) => {
    const row: Record<string, number> = { week: w };
    curves.forEach((c) => {
      row[c.label] = c.data[i].retained;
    });
    return row;
  });

  return (
    <Card>
      <CardHeader
        title="Retention curves — never read blended"
        subtitle="Cohort survival % over weeks since enrollment"
        right={
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {DIMS.map((d) => (
              <button
                key={d.key}
                onClick={() => selectDim(d.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  dim === d.key
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Clickable legend — toggle any series; All/None for quick focus */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 pt-3">
        {curves.map((c) => {
          const off = hidden.has(c.label);
          return (
            <button
              key={c.label}
              onClick={() => toggle(c.label)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                off
                  ? "border-slate-200 bg-white text-ink-faint opacity-60"
                  : "border-slate-200 bg-slate-50 text-ink-soft hover:bg-slate-100"
              }`}
              title={off ? "Show" : "Hide"}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: c.color, opacity: off ? 0.3 : 1 }}
              />
              <span className={off ? "line-through" : ""}>{c.label}</span>
            </button>
          );
        })}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button
          onClick={() => setHidden(new Set())}
          className="rounded-full px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
        >
          All
        </button>
        <button
          onClick={() => setHidden(new Set(curves.map((c) => c.label)))}
          className="rounded-full px-2 py-1 text-xs font-medium text-ink-faint hover:bg-slate-100"
        >
          None
        </button>
      </div>

      <div className="px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height={264}>
          <LineChart data={merged} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              label={{ value: "weeks", position: "insideBottomRight", offset: -2, fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
              }}
              formatter={(v: number) => [`${v}%`, ""]}
              labelFormatter={(w) => `Week ${w}`}
            />
            {curves.map((c) => (
              <Line
                key={c.label}
                type="monotone"
                dataKey={c.label}
                stroke={c.color}
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                hide={hidden.has(c.label)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {visibleCount === 0 && (
          <p className="px-2 pt-1 text-center text-xs text-ink-faint">
            All series hidden — click a chip or <strong>All</strong> to show curves.
          </p>
        )}
        <p className="px-2 pt-1 text-xs text-ink-faint">
          {dim === "year" &&
            "1st-years bleed in the first 8 weeks (onboarding + drift); final-years (4th) hold highest as placement nears. Each year is a different problem."}
          {dim === "tier" &&
            "Tier-3 cohorts retain ~25pts below NIT/IIIT — interventions must differ by baseline commitment."}
          {dim === "language" &&
            "Language cohorts diverge — a signal for where regional-language parent comms matter most."}
          {dim === "acquisition" &&
            "Tip: with many sources, click the chips above to focus on a few. Student-led/organic/referral retain best; broad paid (Instagram, InMobi) and counselor are the most fragile — acquisition quality is upstream of retention."}
        </p>
      </div>
    </Card>
  );
}
