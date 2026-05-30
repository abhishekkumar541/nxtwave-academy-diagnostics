import { Fragment } from "react";

// Tiny, dependency-free markdown renderer — handles the subset the model returns in
// short chat answers: paragraphs, bullet lists, **bold**, `inline code`, _italic_.
// Deliberately minimal and safe (no raw HTML injection).

function renderInline(text: string, keyBase: string) {
  // Split on **bold**, `code`, and _italic_ while keeping delimiters.
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g).filter(Boolean);
  return tokens.map((t, i) => {
    const key = `${keyBase}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(t))
      return (
        <strong key={key} className="font-semibold text-ink">
          {t.slice(2, -2)}
        </strong>
      );
    if (/^`[^`]+`$/.test(t))
      return (
        <code key={key} className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-ink-soft">
          {t.slice(1, -1)}
        </code>
      );
    if (/^_[^_]+_$/.test(t))
      return (
        <em key={key} className="text-ink-soft">
          {t.slice(1, -1)}
        </em>
      );
    return <Fragment key={key}>{t}</Fragment>;
  });
}

export default function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-1.5 ml-1 list-disc space-y-1 pl-4">
        {bullets.map((b, i) => (
          <li key={i}>{renderInline(b, `li-${blocks.length}-${i}`)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flushBullets();
    if (line.trim() === "") return;
    blocks.push(
      <p key={`p-${idx}`} className="my-1 leading-relaxed">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });
  flushBullets();

  return <div className="text-sm text-ink-soft">{blocks}</div>;
}
