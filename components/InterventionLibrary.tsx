"use client";

import { useMemo, useState } from "react";
import { Sparkles, Brain, Smartphone, Users, Heart, Trophy, Zap } from "lucide-react";
import { INTERVENTIONS, LAYERS, type Intervention, type InterventionLayer } from "@/lib/interventions";
import { Card, CardHeader } from "./ui";

const LAYER_ICON: Record<InterventionLayer, React.ReactNode> = {
  Habit: <Zap size={13} />,
  Product: <Smartphone size={13} />,
  "AI Coach": <Brain size={13} />,
  Peer: <Users size={13} />,
  Parent: <Heart size={13} />,
  Identity: <Trophy size={13} />,
};

const LAYER_COLOR: Record<InterventionLayer, string> = {
  Habit: "bg-brand-50 text-brand-700 ring-brand-100",
  Product: "bg-slate-100 text-ink-soft ring-slate-200",
  "AI Coach": "bg-violet-50 text-violet-700 ring-violet-100",
  Peer: "bg-amber-50 text-amber-700 ring-amber-100",
  Parent: "bg-rose-50 text-rose-700 ring-rose-100",
  Identity: "bg-green-50 text-green-700 ring-green-100",
};

const EFFORT_COLOR = { Low: "text-risk-low", Medium: "text-amber-600", High: "text-risk-high" };

export default function InterventionLibrary() {
  const [layer, setLayer] = useState<InterventionLayer | "All">("All");

  const items = useMemo(
    () => (layer === "All" ? INTERVENTIONS : INTERVENTIONS.filter((i) => i.layer === layer)),
    [layer]
  );

  return (
    <Card>
      <CardHeader
        title="Intervention playbook"
        subtitle={`${INTERVENTIONS.length} plays synthesized from a 5-expert panel (Berman · Eyal · Shah · Shuttleworth · Gridley) — each mapped to a behavioral mechanic and a dropout moment`}
        right={
          <div className="flex flex-wrap gap-1">
            {(["All", ...LAYERS] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayer(l)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  layer === l
                    ? "bg-ink text-white"
                    : "bg-slate-100 text-ink-faint hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        }
      />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <PlayCard key={i.id} i={i} />
        ))}
      </div>
    </Card>
  );
}

function PlayCard({ i }: { i: Intervention }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span className={`chip ring-1 ${LAYER_COLOR[i.layer]}`}>
          {LAYER_ICON[i.layer]} {i.layer}
        </span>
        {i.novel ? (
          <span className="chip bg-violet-600 text-white">
            <Sparkles size={11} /> Novel
          </span>
        ) : (
          <span className="chip bg-slate-100 text-ink-faint">Sharpened</span>
        )}
      </div>

      <div>
        <h4 className="text-[14px] font-semibold leading-snug text-ink">{i.name}</h4>
        <p className="mt-0.5 text-xs italic text-ink-faint">{i.tagline}</p>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">{i.insight}</p>

      <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] text-ink-soft ring-1 ring-slate-100">
        <span className="font-semibold text-ink">Mechanic:</span> {i.mechanic}
      </div>

      <div className="text-[11px] leading-relaxed text-ink-soft">
        <span className="font-semibold text-ink">In-product:</span> {i.inProduct}
      </div>

      <div className="mt-auto flex flex-wrap gap-1 pt-1">
        {i.targets.map((t) => (
          <span key={t} className="chip bg-red-50 text-risk-high ring-1 ring-red-100">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
        <span className="text-ink-faint">
          Effort <strong className={EFFORT_COLOR[i.effort]}>{i.effort}</strong>
        </span>
        <span className="text-ink-faint">via {i.expert}</span>
      </div>
      <p className="rounded-md bg-brand-50/60 px-2 py-1 text-[11px] leading-snug text-brand-800">
        ↑ {i.expectedImpact}
      </p>
    </div>
  );
}
