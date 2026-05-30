"use client";

import { Check } from "lucide-react";

// A WhatsApp-accurate chat bubble for the parent report card.
export default function WhatsAppBubble({
  message,
  senderName = "NxtWave Academy",
  time = "7:02 PM",
}: {
  message: string;
  senderName?: string;
  time?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background:
          "linear-gradient(0deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02)), #e5ddd5",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cg fill='%23d8cfc4' fill-opacity='0.5'%3E%3Ccircle cx='8' cy='8' r='1.5'/%3E%3Ccircle cx='28' cy='22' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
          NW
        </div>
        <span className="rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
          {senderName}
        </span>
      </div>
      <div className="flex justify-start">
        <div className="relative max-w-[88%] rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm">
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
            {message}
          </p>
          <div className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-ink-faint">
            {time}
            <Check size={12} className="text-brand-500" />
            <Check size={12} className="-ml-2 text-brand-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
