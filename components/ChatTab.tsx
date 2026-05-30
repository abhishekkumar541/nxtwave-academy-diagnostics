"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Compass } from "lucide-react";
import { Card } from "./ui";
import MarkdownLite from "./MarkdownLite";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Which cohort should I prioritize this quarter?",
  "Explain the peer-cluster signal.",
  "What's my highest-ROI first bet?",
  "Is the counselor-acquisition insight trustworthy?",
];

export default function ChatTab() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    // Placeholder assistant message we stream into.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry — something went wrong reaching the assistant. Try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <Card className="flex h-[600px] flex-col overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Sparkles size={15} />
        </span>
        <div>
          <h3 className="text-[14px] font-semibold text-ink">Ask the data</h3>
          <p className="text-[11px] text-ink-faint">
            Grounded in this tool&rsquo;s live numbers · powered by Perplexity
          </p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {empty && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Compass size={24} />
            </span>
            <p className="max-w-sm text-sm text-ink-soft">
              Ask anything about this tool&rsquo;s retention data — cohorts, the validated
              insights, who to save, which bet to ship first.
            </p>
            <div className="mt-4 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-ink-soft transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <span className="mr-2 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles size={14} />
              </span>
            )}
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm text-white"
                  : "max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-2.5 ring-1 ring-slate-100"
              }
            >
              {m.role === "user" ? (
                <span className="whitespace-pre-wrap">{m.content}</span>
              ) : m.content === "" && streaming ? (
                <TypingDots />
              ) : (
                <MarkdownLite text={m.content} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-100 px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about cohorts, insights, who to save…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </Card>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
