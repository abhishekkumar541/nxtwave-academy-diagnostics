"use client";

import { Users, AlertTriangle } from "lucide-react";
import type { PeerCluster, Student } from "@/lib/types";
import { Card, CardHeader } from "./ui";

export default function PeerClusterSignal({
  clusters,
  onSelect,
}: {
  clusters: PeerCluster[];
  onSelect: (s: Student) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Peer-cluster churn signal"
        subtitle="Colleges where ≥2 batchmates paused — collectivist contagion. The signature no other playbook detects."
      />
      <div className="max-h-[520px] space-y-3 overflow-y-auto px-5 py-4">
        {clusters.length === 0 && (
          <p className="text-sm text-ink-faint">No active clusters this week.</p>
        )}
        {clusters.map((c) => (
          <div
            key={c.college}
            className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <div>
                  <div className="text-sm font-semibold text-ink">{c.college}</div>
                  <div className="text-[11px] text-ink-faint">{c.state}</div>
                </div>
              </div>
              <span className="chip bg-amber-100 text-amber-800">
                <Users size={12} /> {c.pausedCount} paused
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {c.atRiskStudents.length} batchmate{c.atRiskStudents.length > 1 ? "s" : ""} now at
              risk → mentor should reach out individually today.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.atRiskStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="chip bg-white text-ink-soft ring-1 ring-slate-200 hover:ring-brand-300"
                >
                  {s.name.split(" ")[0]} · {s.churnRiskScore}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
