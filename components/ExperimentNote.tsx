import { FlaskConical } from "lucide-react";

// Every intervention ships with its experiment framing — hypothesis, how we'd
// test it, and the metric that moves. Signals "test, don't assert" to the
// growth/data panelists; turns a feature demo into a discovery plan.
export default function ExperimentNote({
  hypothesis,
  test,
  metric,
}: {
  hypothesis: string;
  test: string;
  metric: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        <FlaskConical size={13} className="text-slate-400" />
        How we&rsquo;d test it
      </div>
      <dl className="space-y-1 text-xs leading-relaxed">
        <Row k="Hypothesis" v={hypothesis} />
        <Row k="Test" v={test} />
        <Row k="Metric that moves" v={metric} />
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 font-medium text-ink-faint">{k}</dt>
      <dd className="text-ink-soft">{v}</dd>
    </div>
  );
}
