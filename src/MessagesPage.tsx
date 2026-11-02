import { ChevronLeft, ChevronRight, Mic, Plus, Video } from "lucide-react";
import styles from "./messages.module.css";

const SF_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

// Emoji fonts are listed explicitly after the UI font. Without them the
// numeric-less fallback chain can land on a monochrome symbol face, which is
// how emoji end up looking like faint line art (or nothing) in the bubbles.
const EMOJI_STACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla"';

const TEXT_STACK = `${SF_STACK}, ${EMOJI_STACK}`;

type Entry =
  | { kind: "date"; text: string }
  | { kind: "text"; side: "sent" | "received"; text: string; tapback?: string };

// "sent" = Ekansh, "received" = Neha. Sample conversation — swap in your own.
const THREAD: Entry[] = [
  { kind: "date", text: "Today 9:41" },
  { kind: "text", side: "received", text: "Heyyy, is the invitation done yet? 👀" },
  { kind: "text", side: "sent", text: "Just finished it. Look 🥰" },
  { kind: "text", side: "received", text: "Wait… it opens like an actual iPhone 😳" },
  { kind: "text", side: "sent", text: "That's the whole idea. Swipe up ✨" },
  {
    kind: "text",
    side: "received",
    text: "The photos are so cute, I keep scrolling 😭",
    tapback: "❤️",
  },
  { kind: "text", side: "sent", text: "Every corner of it is ours 🤍" },
  { kind: "text", side: "received", text: "Okay that's actually so sweet 🥺" },
  { kind: "text", side: "sent", text: "Only for you 💛" },
  {
    kind: "text",
    side: "received",
    text: "Three weeks left and I still get butterflies 🙈",
    tapback: "❤️",
  },
  { kind: "text", side: "sent", text: "Same. 15th January, 5 o'clock. Don't be late 😌" },
  { kind: "text", side: "received", text: "I'll be the one crying at the mandap 🥹" },
];

// iOS contact monogram: initials on the system gray gradient (no photo).
const MONOGRAM_BG = "linear-gradient(#a5abb9, #858b98)";

const glassCircle =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-black shadow-[0_2px_10px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-transform active:scale-95";

function TextBubble({
  side,
  text,
  tapback,
}: {
  side: "sent" | "received";
  text: string;
  tapback?: string;
}) {
  const sent = side === "sent";
  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className="relative max-w-[75%]">
        <div
          className={`relative rounded-[20px] px-3.5 py-2 text-[16px] leading-[20px] ${
            sent
              ? `bg-[#0088ff] text-white ${styles.sentTail}`
              : `bg-[#cfd1d4] text-[#333] ${styles.recvTail}`
          }`}
          style={{ fontFamily: TEXT_STACK }}
        >
          <span className="relative z-10 block">{text}</span>
        </div>
        {tapback && (
          <span
            className="absolute -top-3 -right-1 z-20 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[13px] leading-none shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
            style={{ fontFamily: TEXT_STACK }}
            aria-label={`Reacted ${tapback}`}
          >
            {tapback}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="flex h-full w-full flex-col bg-white"
      style={{ fontFamily: TEXT_STACK }}
    >
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col">
        {/* Header */}
        <header
          className="relative z-10 shrink-0 border-b border-black/5 bg-white/70 backdrop-blur-xl"
          style={{ paddingTop: "calc(var(--safe-top) + 10px)" }}
        >
          <div className="relative flex items-start justify-between px-3 pb-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className={glassCircle}
              >
                <ChevronLeft size={24} strokeWidth={2.25} />
              </button>
            ) : (
              <div className="h-11 w-11" aria-hidden />
            )}

            {/* Centered avatar + name */}
            <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
              <div
                aria-hidden
                className="flex h-14 w-14 items-center justify-center rounded-full text-[24px] font-semibold text-white select-none shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                style={{ background: MONOGRAM_BG }}
              >
                N
              </div>
              <div className="mt-1 flex items-center gap-0.5 text-[13px] font-medium text-black">
                <span>Neha</span>
                <ChevronRight size={13} strokeWidth={2.5} className="text-[#bcbcbc]" />
              </div>
            </div>

            <button type="button" aria-label="Video call" className={glassCircle}>
              <Video size={22} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
          {THREAD.map((e, i) => {
            if (e.kind === "date") {
              return (
                <div
                  key={i}
                  className="my-2.5 text-center text-[12px] font-medium text-[#8e8e93]"
                >
                  {e.text}
                </div>
              );
            }
            return (
              <TextBubble
                key={i}
                side={e.side}
                text={e.text}
                tapback={e.tapback}
              />
            );
          })}
        </main>

        {/* Input bar */}
        <footer
          className="shrink-0 px-3 pt-2"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 10px)" }}
        >
          <div className="flex items-center gap-2">
            <button type="button" aria-label="More" className={glassCircle}>
              <Plus size={24} strokeWidth={2.25} />
            </button>
            <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 backdrop-blur-xl">
              <span className="flex-1 text-[16px] text-[#bcbcbc]">iMessage</span>
              <Mic size={20} strokeWidth={2} className="text-[#cccccc]" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
