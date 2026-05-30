"use client";

import { ChevronRight } from "lucide-react";
import { bandOf } from "@/lib/data/cohorts";
import type { Student } from "@/lib/types";
import { Card, CardHeader, RiskPill, langScript } from "./ui";

export default function SaveQueue({
  students,
  onSelect,
}: {
  students: Student[];
  onSelect: (s: Student) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Students to save this week"
        subtitle={`${students.length} active students above risk threshold — ranked by churn-risk score`}
      />
      <div className="max-h-[520px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-2 font-medium">Student</th>
              <th className="px-2 py-2 font-medium">Risk</th>
              <th className="px-2 py-2 font-medium">Top reason</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                onClick={() => onSelect(s)}
                className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
              >
                <td className="px-5 py-2.5">
                  <div className="font-medium text-ink">{s.name}</div>
                  <div className="text-[11px] text-ink-faint">
                    {s.college} · {s.year}
                    {s.year === 1 ? "st" : s.year === 2 ? "nd" : "rd"}-yr · {langScript(s.language)}
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tabular-nums text-ink">{s.churnRiskScore}</span>
                    <RiskPill band={bandOf(s.churnRiskScore)} />
                  </div>
                </td>
                <td className="px-2 py-2.5 text-xs text-ink-soft">
                  {s.riskFactors[0]?.label ?? "—"}
                </td>
                <td className="px-2 py-2.5 text-ink-faint">
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
