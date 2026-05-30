"use client";

import { useState } from "react";
import { Compass, ArrowRight, Activity, Radar, Send, FlaskConical } from "lucide-react";
import { isValidEmail, setUser, type SessionUser } from "@/lib/auth";

export default function LoginScreen({ onSignedIn }: { onSignedIn: (u: SessionUser) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Log the login (timestamp + email) to the Google Sheet / local log.
    // Fire-and-forget — never block sign-in on logging.
    fetch("/api/log-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => {});
    onSignedIn(setUser(email, name));
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-slate-100 md:grid-cols-2">
        {/* Left: brand / value prop */}
        <div className="hidden flex-col justify-between bg-brand-600 p-8 text-white md:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Compass size={20} />
            </div>
            <span className="text-lg font-bold">NxtWave Academy Diagnostics</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-snug">
              Retention, run as a product.
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Diagnose where Academy students leak, detect who to save this week, ship the
              interventions that compound — and validate every observation before you act.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/90">
              <Feat icon={<Activity size={15} />} t="Diagnose — cohort curves & the 7-event dropout calendar" />
              <Feat icon={<Radar size={15} />} t="Detect — churn-risk scoring & peer-cluster signals" />
              <Feat icon={<Send size={15} />} t="Intervene — Exam Mode & regional-language parent cards" />
              <Feat icon={<FlaskConical size={15} />} t="Insights — statistically validated, not asserted" />
            </ul>
          </div>
          <p className="text-[11px] text-white/60">Prototype · illustrative synthetic data</p>
        </div>

        {/* Right: sign-in */}
        <div className="p-8">
          <div className="md:hidden mb-6 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Compass size={18} />
            </div>
            <span className="font-bold text-ink">NxtWave Academy Diagnostics</span>
          </div>

          <h1 className="text-xl font-bold text-ink">Sign in to get started</h1>
          <p className="mt-1 text-sm text-ink-faint">
            Enter your email to open the command center.
          </p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <Field label="Email" required>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 ${
                  error
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
                }`}
              />
            </Field>
            <Field label="Name (optional)">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </Field>

            {error && <p className="text-sm text-risk-high">{error}</p>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
            Demo sign-in — no password. Your email just personalizes the session and is
            stored only in this browser.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feat({ icon, t }: { icon: React.ReactNode; t: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-white/80">{icon}</span>
      <span>{t}</span>
    </li>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {label} {required && <span className="text-risk-high">*</span>}
      </span>
      {children}
    </label>
  );
}
