import { NextResponse } from "next/server";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";

// Logs each email login to (1) a Google Sheet via an Apps Script webhook if
// SHEETS_WEBHOOK_URL is set, and (2) a best-effort local JSONL file so logging
// works even before the Sheet is wired. Fields captured: timestamp + email.

function isValidEmail(s: unknown): s is string {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = body?.email;
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }
  // IST (Asia/Kolkata) timestamp, e.g. "29/05/2026, 17:27:06 IST"
  const ts =
    new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " IST";
  const record = { ts, email: email.trim() };

  // (1) Google Sheet via Apps Script webhook (the durable, prod path).
  const webhook = process.env.SHEETS_WEBHOOK_URL;
  if (webhook) {
    // fire-and-forget; never block or fail the login on a logging hiccup
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch((e) => console.error("sheets webhook failed:", e));
  }

  // (2) Local JSONL fallback (dev). On serverless, cwd is read-only → use tmp.
  try {
    const file = process.env.VERCEL
      ? path.join(os.tmpdir(), "login-log.jsonl")
      : path.join(process.cwd(), ".login-log.jsonl");
    await appendFile(file, JSON.stringify(record) + "\n");
  } catch (e) {
    console.error("local login-log append failed (non-fatal):", e);
  }

  return NextResponse.json({ ok: true });
}
