import OpenAI from "openai";

// Provider-agnostic LLM layer (OpenAI-compatible). Auto-detects the provider
// from env so the app can run on Perplexity or OpenAI by just setting a key —
// and falls back gracefully ("none") so the demo never hard-fails.
//
// Priority: explicit LLM_PROVIDER > perplexity > openai > none.

export type Provider = "perplexity" | "openai" | "none";

interface ProviderConfig {
  provider: Provider;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export function getProviderConfig(): ProviderConfig {
  const forced = process.env.LLM_PROVIDER as Provider | undefined;

  const has = {
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };

  const pick: Provider =
    forced && forced !== "none"
      ? forced
      : has.perplexity
      ? "perplexity"
      : has.openai
      ? "openai"
      : "none";

  switch (pick) {
    case "perplexity":
      return {
        provider: "perplexity",
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: "https://api.perplexity.ai",
        model: process.env.PERPLEXITY_MODEL || "sonar",
      };
    case "openai":
      return {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      };
    default:
      return { provider: "none" };
  }
}

export function hasLLM(): boolean {
  return getProviderConfig().provider !== "none";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Non-streaming completion (used by the report card). Returns plain text.
export async function llmComplete(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const cfg = getProviderConfig();
  if (cfg.provider === "none") throw new Error("no LLM provider configured");

  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
  const resp = await client.chat.completions.create({
    model: cfg.model!,
    max_tokens: opts.maxTokens ?? 700,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });
  return (resp.choices[0]?.message?.content || "").trim();
}

// Streaming chat (used by the Ask tab). Returns a ReadableStream of text chunks.
// On any error (or no provider), emits `fallback` so the chat never shows a raw
// error and the demo never hard-fails.
export function llmStream(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  fallback: string;
}): ReadableStream<Uint8Array> {
  const cfg = getProviderConfig();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let emittedAny = false;
      try {
        if (cfg.provider === "none") {
          throw new Error("no LLM provider configured");
        }

        const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
        const ai = await client.chat.completions.create({
          model: cfg.model!,
          max_tokens: opts.maxTokens ?? 900,
          stream: true,
          messages: [
            { role: "system", content: opts.system },
            ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        });
        for await (const chunk of ai) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            emittedAny = true;
            controller.enqueue(encoder.encode(text));
          }
        }
        if (!emittedAny) controller.enqueue(encoder.encode(opts.fallback));
      } catch (err) {
        console.error("llmStream error, emitting fallback:", err);
        if (!emittedAny) controller.enqueue(encoder.encode(opts.fallback));
      } finally {
        controller.close();
      }
    },
  });
}
