import { NextResponse } from "next/server";
import { getStudent } from "@/lib/data/students";
import { REPORT_CARD_SYSTEM, buildReportCardUser } from "@/lib/prompts";
import { fallbackReportCard } from "@/lib/fallbacks";
import { hasLLM, llmComplete } from "@/lib/llm";
import type { ReportCard } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { studentId } = await req.json().catch(() => ({ studentId: null }));
  const student = studentId ? getStudent(studentId) : undefined;

  if (!student) {
    return NextResponse.json({ error: "Unknown student" }, { status: 400 });
  }

  // No provider configured → graceful fallback. Demo never breaks.
  if (!hasLLM()) {
    return NextResponse.json(fallbackReportCard(student));
  }

  try {
    const text = await llmComplete({
      system: REPORT_CARD_SYSTEM,
      user: buildReportCardUser(student),
      maxTokens: 700,
    });

    const parsed = safeParse(text);
    if (!parsed) {
      return NextResponse.json(fallbackReportCard(student));
    }

    const card: ReportCard = {
      language: student.language,
      message: parsed.message,
      translation: parsed.translation,
      source: "llm",
    };
    return NextResponse.json(card);
  } catch (err) {
    // Any API/network error → fallback. Never let the demo die on stage.
    console.error("report-card generation failed, using fallback:", err);
    return NextResponse.json(fallbackReportCard(student));
  }
}

function safeParse(text: string): { message: string; translation: string } | null {
  try {
    // Strip accidental markdown fences if present.
    let cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    // Some models prepend prose — grab the first {...} block if needed.
    if (!cleaned.startsWith("{")) {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) cleaned = m[0];
    }
    const obj = JSON.parse(cleaned);
    if (typeof obj.message === "string" && typeof obj.translation === "string") {
      return obj;
    }
    return null;
  } catch {
    return null;
  }
}
