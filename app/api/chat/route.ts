import { CHAT_SYSTEM } from "@/lib/prompts";
import { buildContext } from "@/lib/chatContext";
import { llmStream, type ChatMessage } from "@/lib/llm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ messages: [] }));
  const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const cleaned = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12); // keep recent turns

  const system = `${CHAT_SYSTEM}\n\n--- LIVE DATA SNAPSHOT (the only source of truth for numbers) ---\n${buildContext()}`;

  // llmStream handles provider selection AND emits the fallback on no-key/error,
  // so the chat never hard-fails.
  const stream = llmStream({
    system,
    messages: cleaned,
    fallback: fallbackAnswer(cleaned),
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

// Sensible canned response so the tab works with no provider / on error. Pulls a
// few real headline themes so even the fallback stays grounded.
function fallbackAnswer(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  return [
    "_(Demo mode — the live model is unavailable right now (no API key or the account is out of credits), so this is a canned grounded answer. Once a provider key has credits, this tab streams live, fully reasoned responses.)_",
    "",
    `You asked: "${last.slice(0, 140)}"`,
    "",
    "From this tool's validated data, the highest-leverage moves are:",
    "",
    "- **Exam Mode** — internal-exam proximity is a validated churn driver; pausing the streak and re-onboarding after exams targets the #1 trigger.",
    "- **Peer-cluster saves** — when ≥2 batchmates pause, the remaining batchmates churn at a sharply higher, statistically-validated rate; mentor outreach this week.",
    "- **Maa-Baap Report Card** — parents not opening reports is a validated risk factor; re-activating the parent as accountability partner.",
    "- Watch **acquisition quality**: counselor-acquired students leave at a higher rate — an upstream leak, not just a retention one.",
    "",
    "Set a `PERPLEXITY_API_KEY` (or other provider key) to chat with the live model.",
  ].join("\n");
}
