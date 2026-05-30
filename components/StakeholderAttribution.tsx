"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getStakeholderSlices } from "@/lib/data/cohorts";
import { Card, CardHeader } from "./ui";

const COLORS: Record<string, string> = {
  student: "#3366ff",
  parents: "#dc2626",
  "family WhatsApp": "#16a34a",
  "college peers": "#8b5cf6",
};

export default function StakeholderAttribution() {
  const slices = getStakeholderSlices();
  const data = slices.map((s) => ({ name: s.stakeholder, value: s.count, pct: s.pct }));
  const collectivist = slices
    .filter((s) => s.stakeholder !== "student")
    .reduce((a, b) => a + b.pct, 0);

  return (
    <Card>
      <CardHeader
        title="Who really decided the dropout?"
        subtitle="The 4-stakeholder decision unit — most dashboards collapse this into one churn number"
      />
      <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-3 sm:flex-row">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={72}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: number, n: string) => [`${v} students`, n]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1">
          <ul className="space-y-1.5">
            {slices.map((s) => (
              <li key={s.stakeholder} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: COLORS[s.stakeholder] }}
                />
                <span className="capitalize text-ink-soft">{s.stakeholder}</span>
                <span className="ml-auto font-semibold tabular-nums text-ink">{s.pct}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-800">
            <strong>{collectivist}%</strong> of dropouts originate with someone other than the
            student. No Western retention playbook addresses 3 of these 4.
          </p>
        </div>
      </div>
    </Card>
  );
}
