"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
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
  const curves = getCurves(dim);

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
                onClick={() => setDim(d.key)}
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
      <div className="px-3 pb-4 pt-3">
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
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
            {curves.map((c) => (
              <Line
                key={c.label}
                type="monotone"
                dataKey={c.label}
                stroke={c.color}
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="px-2 pt-1 text-xs text-ink-faint">
          {dim === "year" &&
            "1st-years bleed in the first 8 weeks (onboarding + drift); 3rd-years drop later, in the pre-placement stretch. Different problems."}
          {dim === "tier" &&
            "Tier-3 cohorts retain ~25pts below NIT/IIIT — interventions must differ by baseline commitment."}
          {dim === "language" &&
            "Language cohorts diverge — a signal for where regional-language parent comms matter most."}
          {dim === "acquisition" &&
            "Student-led signups retain best (intrinsic motivation); counselor-led are the most fragile. Acquisition quality is upstream of retention — worth flagging to whoever owns it."}
        </p>
      </div>
    </Card>
  );
}
