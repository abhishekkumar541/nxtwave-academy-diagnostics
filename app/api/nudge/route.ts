import { NextResponse } from "next/server";
import { getStudent } from "@/lib/data/students";
import { MOMENTS, NUDGE_SYSTEM, buildNudgeUser } from "@/lib/prompts";
import { fallbackNudge } from "@/lib/fallbacks";
import { hasLLM, llmComplete } from "@/lib/llm";
import type { NudgeMoment, NudgeResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const studentId = body?.studentId as string | undefined;
  const moment = body?.moment as NudgeMoment | undefined;
  const student = studentId ? getStudent(studentId) : undefined;

  if (!student || !moment || !MOMENTS[moment]) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!hasLLM()) {
    return NextResponse.json(fallbackNudge(student, moment));
  }

  try {
    const text = await llmComplete({
      system: NUDGE_SYSTEM,
      user: buildNudgeUser(student, moment),
      maxTokens: 2048, // room for Gemini 2.5 "thinking" tokens + the short JSON
    });
    const parsed = safeParse(text);
    if (!parsed) return NextResponse.json(fallbackNudge(student, moment));

    const result: NudgeResult = {
      audience: MOMENTS[moment].audience,
      message: parsed.message,
      translation: parsed.translation,
      source: "llm",
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("nudge generation failed, using fallback:", err);
    return NextResponse.json(fallbackNudge(student, moment));
  }
}

function safeParse(text: string): { message: string; translation: string } | null {
  try {
    let cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    if (!cleaned.startsWith("{")) {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) cleaned = m[0];
    }
    const obj = JSON.parse(cleaned);
    if (typeof obj.message === "string" && typeof obj.translation === "string") return obj;
    return null;
  } catch {
    return null;
  }
}
