"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Radar, Send, Compass, FlaskConical, LogOut, Sparkles } from "lucide-react";
import { STUDENTS } from "@/lib/data/students";
import {
  getKpis,
  getPeerClusters,
  getSaveQueue,
} from "@/lib/data/cohorts";
import type { Student } from "@/lib/types";

import KpiBar from "@/components/KpiBar";
import RetentionCurve from "@/components/RetentionCurve";
import DropoutCalendar from "@/components/DropoutCalendar";
import StakeholderAttribution from "@/components/StakeholderAttribution";
import SaveQueue from "@/components/SaveQueue";
import PeerClusterSignal from "@/components/PeerClusterSignal";
import StudentDrawer from "@/components/StudentDrawer";
import ReportCardGenerator from "@/components/ReportCardGenerator";
import ExamModePanel from "@/components/ExamModePanel";
import InsightsTab from "@/components/InsightsTab";
import ChatTab from "@/components/ChatTab";
import AuthGate, { useAuth } from "@/components/AuthGate";
import { initials } from "@/lib/auth";

type Tab = "diagnose" | "detect" | "intervene" | "insights" | "ask";

const TABS: { key: Tab; label: string; icon: React.ReactNode; tagline: string }[] = [
  { key: "diagnose", label: "Diagnose", icon: <Activity size={16} />, tagline: "Retention isn't a blob" },
  { key: "detect", label: "Detect", icon: <Radar size={16} />, tagline: "Who do we save this week" },
  { key: "intervene", label: "Intervene", icon: <Send size={16} />, tagline: "The plays no competitor builds" },
  { key: "insights", label: "Insights", icon: <FlaskConical size={16} />, tagline: "Validated, not asserted" },
  { key: "ask", label: "Ask", icon: <Sparkles size={16} />, tagline: "Chat with your retention data" },
];

export default function Home() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("diagnose");
  const [selected, setSelected] = useState<Student | null>(null);

  // Hash-based deep-linking (#detect / #intervene) so a specific view is shareable.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "diagnose" || h === "detect" || h === "intervene" || h === "insights" || h === "ask")
        setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const selectTab = (t: Tab) => {
    setTab(t);
    if (typeof window !== "undefined") window.location.hash = t;
  };

  const kpis = useMemo(() => getKpis(), []);
  const queue = useMemo(() => getSaveQueue(), []);
  const clusters = useMemo(() => getPeerClusters(), []);
  // Students whose parents are good demo subjects (have a project + real language).
  const reportTargets = useMemo(
    () => STUDENTS.filter((s) => s.projectsCompleted > 0).slice(0, 60),
    []
  );

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {/* Header */}
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Compass size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              NxtWave Academy <span className="font-normal text-ink-faint">Diagnostics</span>
            </h1>
            <p className="text-xs text-ink-faint">
              Diagnose → Detect → Intervene · synthetic data · NxtWave Academy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="chip bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            prototype — illustrative data
          </span>
          <div className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-2 shadow-card ring-1 ring-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
              {initials(user)}
            </span>
            <span className="hidden text-xs text-ink-soft sm:inline">
              Signed in as <strong className="text-ink">{user.email}</strong>
            </span>
            <button
              onClick={signOut}
              title="Sign out"
              className="ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-faint hover:bg-slate-100 hover:text-ink"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => selectTab(t.key)}
            className={`group flex flex-1 items-center gap-2.5 rounded-xl px-4 py-2.5 text-left transition sm:flex-none ${
              tab === t.key
                ? "bg-white shadow-card ring-1 ring-brand-100"
                : "bg-white/50 hover:bg-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                tab === t.key ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-faint"
              }`}
            >
              {t.icon}
            </span>
            <span className="hidden sm:block">
              <span className={`block text-sm font-semibold ${tab === t.key ? "text-ink" : "text-ink-soft"}`}>
                {t.label}
              </span>
              <span className="block text-[11px] text-ink-faint">{t.tagline}</span>
            </span>
            <span className="sm:hidden text-sm font-semibold text-ink-soft">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* DIAGNOSE */}
      {tab === "diagnose" && (
        <div className="space-y-4">
          <KpiBar kpis={kpis} />
          <RetentionCurve />
          <div className="grid gap-4 lg:grid-cols-2">
            <DropoutCalendar />
            <StakeholderAttribution />
          </div>
        </div>
      )}

      {/* DETECT */}
      {tab === "detect" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SaveQueue students={queue} onSelect={setSelected} />
          <PeerClusterSignal clusters={clusters} onSelect={setSelected} />
        </div>
      )}

      {/* INTERVENE */}
      {tab === "intervene" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportCardGenerator students={reportTargets} />
          <ExamModePanel />
        </div>
      )}

      {/* INSIGHTS / EVALS */}
      {tab === "insights" && <InsightsTab />}

      {/* ASK / CHAT */}
      {tab === "ask" && <ChatTab />}

      <StudentDrawer student={selected} onClose={() => setSelected(null)} />

      <footer className="mt-10 text-center text-[11px] text-ink-faint">
        A retention operating loop for a long-horizon edtech program
        (7-event dropout calendar · 4-stakeholder decision unit · Exam Mode · Maa-Baap Report Card) · synthetic data.
      </footer>
    </div>
  );
}
