import OpenAI from "openai";

// Provider-agnostic LLM layer (OpenAI-compatible) with a FALLBACK CHAIN.
// Every configured provider is tried in order until one succeeds; only if the
// whole chain fails do callers use their canned fallback. Stacking free tiers
// (Gemini → Groq → …) raises the effective rate/token ceiling and resilience.
//
// Order: explicit LLM_PROVIDER pins one; otherwise gemini → groq → openai →
// perplexity (each included only if its key is set).

export type Provider = "gemini" | "groq" | "openai" | "perplexity";

interface ProviderConfig {
  provider: Provider;
  apiKey: string;
  baseURL?: string;
  model: string;
}

function configFor(p: Provider): ProviderConfig | null {
  switch (p) {
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      return apiKey
        ? {
            provider: "gemini",
            apiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          }
        : null;
    }
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY;
      return apiKey
        ? {
            provider: "groq",
            apiKey,
            baseURL: "https://api.groq.com/openai/v1",
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          }
        : null;
    }
    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY;
      return apiKey
        ? { provider: "openai", apiKey, model: process.env.OPENAI_MODEL || "gpt-4o-mini" }
        : null;
    }
    case "perplexity": {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      return apiKey
        ? {
            provider: "perplexity",
            apiKey,
            baseURL: "https://api.perplexity.ai",
            model: process.env.PERPLEXITY_MODEL || "sonar",
          }
        : null;
    }
  }
}

// Ordered list of every configured provider — the fallback chain.
export function getProviderChain(): ProviderConfig[] {
  const forced = process.env.LLM_PROVIDER as Provider | undefined;
  const order: Provider[] =
    forced && ["gemini", "groq", "openai", "perplexity"].includes(forced)
      ? [forced]
      : ["gemini", "groq", "openai", "perplexity"];
  return order.map(configFor).filter((c): c is ProviderConfig => c !== null);
}

export function hasLLM(): boolean {
  return getProviderChain().length > 0;
}

// Names of the active chain, for logging/telemetry.
export function providerChainLabel(): string {
  return getProviderChain().map((c) => c.provider).join(" → ") || "none";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Non-streaming completion (report card / nudge). Tries each provider in the
// chain until one returns non-empty text; throws only if the whole chain fails.
export async function llmComplete(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const chain = getProviderChain();
  if (chain.length === 0) throw new Error("no LLM provider configured");

  let lastErr: unknown;
  for (const cfg of chain) {
    try {
      const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
      const resp = await client.chat.completions.create({
        model: cfg.model,
        max_tokens: opts.maxTokens ?? 2048,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      });
      const text = (resp.choices[0]?.message?.content || "").trim();
      if (text) return text;
      lastErr = new Error(`${cfg.provider} returned empty`);
    } catch (err) {
      console.error(`llmComplete: ${cfg.provider} failed, trying next →`, err instanceof Error ? err.message : err);
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("all providers failed");
}

// Streaming chat (Ask tab). Tries each provider in order; if one fails BEFORE
// emitting any text, falls through to the next. Emits `fallback` only if the
// entire chain produces nothing.
export function llmStream(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  fallback: string;
}): ReadableStream<Uint8Array> {
  const chain = getProviderChain();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let emittedAny = false;
      for (const cfg of chain) {
        if (emittedAny) break;
        try {
          const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
          const ai = await client.chat.completions.create({
            model: cfg.model,
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
        } catch (err) {
          console.error(`llmStream: ${cfg.provider} failed, trying next →`, err instanceof Error ? err.message : err);
          // try next provider in the chain
        }
      }
      if (!emittedAny) controller.enqueue(encoder.encode(opts.fallback));
      controller.close();
    },
  });
}
