import { Fragment, type ReactNode } from "react";

/**
 * Emoji are drawn as Twemoji images (CC-BY 4.0, see CREDITS.md) from
 * `public/emoji` rather than left to the system font. System emoji faces are
 * uneven — older Windows builds have no glyph at all for 🤍 or 🥹 and paint a
 * blank box — so a bubble could lose half its emoji on someone else's phone.
 */
const FILES: Record<string, string> = {
  "😅": "1f605",
  "🥰": "1f970",
  "🥺": "1f97a",
  "😄": "1f604",
  "😭": "1f62d",
  "😌": "1f60c",
  "🙈": "1f648",
  "💛": "1f49b",
  "✨": "2728",
  "❤": "2764",
};

const KEYS = Object.keys(FILES).sort((a, b) => b.length - a.length);
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERN = new RegExp(`(${KEYS.map(escape).join("|")})`, "g");

/** The variation selector is invisible; matching on the bare codepoint is safer. */
const normalize = (text: string) => text.replace(/\uFE0F/g, "");

/** Renders text with every known emoji swapped for its matching glyph. */
export function EmojiText({ children }: { children: string }): ReactNode {
  const parts = normalize(String(children)).split(PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        const file = FILES[part];
        if (!file) return <Fragment key={i}>{part}</Fragment>;
        return (
          <img
            key={i}
            src={`/emoji/${file}.svg`}
            alt={part}
            draggable={false}
            className="inline-block select-none align-[-0.18em]"
            style={{ width: "1.16em", height: "1.16em" }}
          />
        );
      })}
    </>
  );
}
